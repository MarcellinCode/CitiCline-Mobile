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
  container: { paddingHorizontal: 32, paddingBottom: 24, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textContainer: { flex: 1 },
  titleText: { fontSize: 24, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, lineHeight: 26, marginBottom: 2 },
  subtitleText: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 },
  rightActionContainer: { marginLeft: 16 },
  backBtn: { width: 44, height: 44, backgroundColor: '#f8fafc', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: '#f1f5f9' },
});
