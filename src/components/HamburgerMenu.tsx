import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  TouchableWithoutFeedback,
  Platform,
  Alert
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { 
  Home, 
  MapPin, 
  MessageSquare, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Wallet,
  ShieldCheck,
  X
} from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/routes';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useProfile();
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Animate open
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate close
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isOpen]);

  const handleNavigation = (route: string) => {
    onClose();
    // Delay slightly to allow drawer to close before transition
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: async () => {
            onClose();
            await supabase.auth.signOut();
            router.replace('/');
          }
        }
      ]
    );
  };

  if (!isOpen) return null;

  // Define navigation items based on role
  const isAgentPV = profile?.role === 'agent_police_verte';
  const isOrg = profile?.role === 'organisation_admin' || profile?.role === 'mairie';

  const menuItems = [
    ...(!isAgentPV ? [{
      label: 'Accueil / Bourse',
      icon: Home,
      route: '/marketplace',
      active: pathname.includes('marketplace') && !pathname.includes('publish')
    }] : []),
    {
      label: 'Carte Live / Map',
      icon: MapPin,
      route: ROUTES.MAP,
      active: pathname.includes('map')
    },
    {
      label: isOrg ? 'Tableau de bord' : 'Mon Espace',
      icon: LayoutDashboard,
      route: ROUTES.ESPACE,
      active: pathname.includes('espace')
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      route: '/chat',
      active: pathname.includes('chat')
    },
    {
      label: 'Portefeuille',
      icon: Wallet,
      route: ROUTES.WALLET,
      active: pathname.includes('wallet')
    },
    {
      label: 'Mon Profil',
      icon: User,
      route: ROUTES.SETTINGS,
      active: pathname.includes('profile') || pathname.includes('settings')
    }
  ];

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 5000 }]}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.backdrop,
            { opacity: fadeAnim }
          ]} 
        />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View 
        style={[
          styles.drawer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {profile?.full_name || 'Utilisateur'}
              </Text>
              <View style={styles.roleContainer}>
                <ShieldCheck size={10} color="#2A9D8F" />
                <Text style={styles.profileRole}>
                  {profile?.role === 'agent_police_verte' ? 'Police Verte' :
                   profile?.role === 'collecteur' ? 'Collecteur' :
                   profile?.role === 'agent_collecteur' ? 'Agent Terrain' :
                   profile?.role === 'organisation_admin' ? 'Organisation' :
                   profile?.role === 'mairie' ? 'Mairie' :
                   (profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'business') ? 'Producteur Pro' : 'Citoyen'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  item.active && styles.activeMenuItem
                ]}
                onPress={() => handleNavigation(item.route)}
              >
                <Icon 
                  size={20} 
                  color={item.active ? '#2A9D8F' : '#64748b'} 
                  strokeWidth={2.5}
                />
                <Text 
                  style={[
                    styles.menuItemText,
                    item.active && styles.activeMenuItemText
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" strokeWidth={2.5} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>RecyCla v2.1.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  profileRole: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
  },
  menuList: {
    flex: 1,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeMenuItem: {
    backgroundColor: '#f0fdfa',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 16,
  },
  activeMenuItemText: {
    color: '#2A9D8F',
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
    marginLeft: 16,
  },
  versionText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});
