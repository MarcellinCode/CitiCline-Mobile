import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export const LOCATION_TASK_NAME = 'AGENT_LOCATION_TRACKING';

/**
 * Définit la tâche de fond pour le suivi GPS des agents.
 * Cette fonction doit être appelée à la racine de l'application (ex: app/_layout.tsx).
 */
export const defineBackgroundLocationTask = () => {
    TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
        if (error) {
            console.error('Background location task error:', error);
            return;
        }

        if (data) {
            const { locations } = data as { locations: Location.LocationObject[] };
            const location = locations[0];

            if (location) {
                try {
                    // 1. Récupérer la session actuelle
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

                    // 2. Récupérer l'organization_id du profil
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('organization_id, role')
                        .eq('id', session.user.id)
                        .single();

                    // On ne track que si c'est un agent ou collecteur lié à une organisation
                    if (!profile?.organization_id) return;

                    // 3. Insérer la position
                    const { error: insertError } = await supabase
                        .from('agent_live_positions')
                        .insert({
                            agent_id: session.user.id,
                            organization_id: profile.organization_id,
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            status: 'en_mouvement',
                            timestamp: new Date().toISOString()
                        });

                    if (insertError) {
                        console.error('Error inserting live position:', insertError.message);
                    }
                } catch (err) {
                    console.error('Background task logical error:', err);
                }
            }
        }
    });
};

/**
 * Démarre le suivi GPS en arrière-plan.
 */
export const startBackgroundTracking = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) return;

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // Toutes les minutes
        distanceInterval: 100, // Tous les 100 mètres
        foregroundService: {
            notificationTitle: "Suivi RecyCla Actif",
            notificationBody: "Votre position est partagée avec votre organisation.",
            notificationColor: "#10b981",
        },
        pausesLocationUpdatesAutomatically: true,
    });
};

/**
 * Arrête le suivi GPS en arrière-plan.
 */
export const stopBackgroundTracking = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
};
