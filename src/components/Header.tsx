import { View, Text, StyleSheet, StyleProp, ViewStyle, Platform, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export function Header({ title, subtitle, style, rightAction, onBack }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[
        styles.container, 
        { paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) },
        style
    ]}>
      {onBack && (
        <TouchableOpacity 
          onPress={onBack} 
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitleText}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && (
        <View style={styles.rightActionContainer}>
          {rightAction}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  textContainer: { flex: 1 },
  titleText: { fontSize: 22, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3, lineHeight: 28, marginBottom: 2 },
  subtitleText: { fontSize: 12, fontWeight: '500', color: '#64748b' },
  rightActionContainer: { marginLeft: 12 },
  backBtn: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#e2e8f0' },
});
