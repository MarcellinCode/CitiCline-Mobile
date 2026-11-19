import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

/**
 * Notifications push mobile (Expo).
 * - Le jeton est (ré)enregistré À CHAQUE connexion (avant : une seule tentative
 *   3 s après le démarrage, donc jamais si l'utilisateur se connectait ensuite).
 * - Un appareil appartient au dernier compte connecté (fn_register_push_token).
 * - Au toucher d'une notification, l'écran concerné s'ouvre.
 * L'envoi est fait par la base (trigger sur notifications / messages).
 */

let currentToken: string | null = null;

// Affichage au premier plan : bannière + son (le chat ouvert a sa propre alerte)
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const type = (notification.request.content.data as { type?: string } | undefined)?.type;
    const showBanner = type !== 'message';
    return {
      shouldShowBanner: showBanner,
      shouldShowList: true,
      shouldPlaySound: showBanner,
      shouldSetBadge: true,
    };
  },
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Notifications CleanZone',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2A9D8F',
  });
}

async function getExpoToken(): Promise<string | null> {
  if (!Device.isDevice) return null; // les simulateurs ne reçoivent pas de push

  // Android 13+ : le canal doit exister AVANT la demande d'autorisation
  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token || null;
}

/** Associe l'appareil au compte connecté. */
export async function registerPushToken(): Promise<string | null> {
  try {
    const token = await getExpoToken();
    if (!token) return null;
    const { error } = await supabase.rpc('fn_register_push_token', {
      p_token: token,
      p_kind: 'expo',
      p_keys: null,
      p_user_agent: `${Platform.OS} ${Platform.Version}`,
    });
    if (error) console.warn('Enregistrement push impossible :', error.message);
    currentToken = token;
    return token;
  } catch (e) {
    console.warn('Push setup error:', e);
    return null;
  }
}

/** À appeler AVANT supabase.auth.signOut() : l'appareil ne reçoit plus les push du compte. */
export async function unregisterPushToken(): Promise<void> {
  try {
    if (!currentToken) {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
      const perm = await Notifications.getPermissionsAsync();
      if (perm.status !== 'granted' || !Device.isDevice) return;
      currentToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    }
    if (currentToken) await supabase.rpc('fn_unregister_push_token', { p_token: currentToken });
  } catch {
    /* sans conséquence */
  } finally {
    await Notifications.setBadgeCountAsync(0).catch(() => null);
  }
}

/** Écran à ouvrir selon la notification touchée. */
function routeFor(data: Record<string, unknown> | undefined): string {
  const d = data || {};
  switch (d.type) {
    case 'message':
      return d.sender_id ? `/chat/${d.sender_id}` : '/chat';
    case 'mission':
      return d.waste_id ? `/missions/${d.waste_id}` : '/missions';
    case 'offer':
      if (d.tender_id) return '/espace/offres';
      return d.waste_id ? `/marketplace/${d.waste_id}` : '/marketplace';
    case 'collection':
      return '/mes-dechets';
    case 'payment':
      return '/wallet';
    case 'alert':
    case 'sanction':
      return d.infraction_id ? '/police' : '/notifications';
    default:
      return '/notifications';
  }
}

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: string;
}

/**
 * @param userId identifiant de l'utilisateur connecté (null = déconnecté)
 */
export const usePushNotifications = (userId: string | null | undefined): PushNotificationState => {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const handledResponseId = useRef<string | null>(null);

  // (Ré)enregistrement à chaque connexion / changement de compte
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    registerPushToken().then((token) => {
      if (!cancelled && token) setExpoPushToken(token);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const open = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const id = response.notification.request.identifier;
      if (handledResponseId.current === id) return;
      handledResponseId.current = id;
      const target = routeFor(response.notification.request.content.data as Record<string, unknown>);
      // Laisse la navigation se monter (ouverture depuis l'app fermée)
      setTimeout(() => router.push(target as never), 400);
    };

    const received = Notifications.addNotificationReceivedListener(setNotification);
    const tapped = Notifications.addNotificationResponseReceivedListener(open);
    // App ouverte en touchant une notification alors qu'elle était fermée
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => null);

    return () => {
      received.remove();
      tapped.remove();
    };
  }, [router]);

  return { expoPushToken, notification };
};
