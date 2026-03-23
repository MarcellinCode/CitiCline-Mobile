import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { logError } from '../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    logError('🔥 Global ErrorBoundary Catch:', { error, info });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', marginBottom: 12 }}>
            Une erreur est survenue ! 😥
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 32 }}>
            Notre équipe a été notifiée. Veuillez relancer l'application.
          </Text>

          <TouchableOpacity
            onPress={this.reset}
            style={{ backgroundColor: '#020617', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 }}
          >
            <Text style={{ color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 }}>
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
