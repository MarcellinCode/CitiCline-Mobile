import { View, Text, StyleSheet, Image as RNImage } from 'react-native';
import { CITICLINE_LOGO_BASE64 } from './logoBase64';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'dark' | 'light';
}

export default function Logo({ size = 'medium', color = 'dark' }: LogoProps) {
  const isLight = color === 'light';
  const textColor = isLight ? '#ffffff' : '#020617';
  
  let fontSize = 24;
  let iconSize = 24;
  
  if (size === 'small') {
    fontSize = 18;
    iconSize = 20;
  } else if (size === 'large') {
    fontSize = 32;
    iconSize = 36;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { width: iconSize * 1.5, height: iconSize * 1.5, borderRadius: iconSize * 0.75 }]}>
        <RNImage 
          source={{ uri: CITICLINE_LOGO_BASE64 }} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.text, { fontSize, color: textColor }]}>
        CITI<Text style={{ color: '#10b981' }}>CLINE</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  text: {
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -1,
  }
});
