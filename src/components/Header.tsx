import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  rightAction?: React.ReactNode;
}

export function Header({ title, subtitle, style, rightAction }: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
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
  container: { paddingHorizontal: 32, paddingTop: 64, paddingBottom: 24, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textContainer: { flex: 1 },
  titleText: { fontSize: 30, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, lineHeight: 30, marginBottom: 4 },
  subtitleText: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 },
  rightActionContainer: { marginLeft: 16 }
});
