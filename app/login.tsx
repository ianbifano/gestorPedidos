import { AuthMessageModal } from '@/components/AuthMessageModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DialogState = {
  visible: boolean;
  message: string;
  title?: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({ visible: false, message: '' });

  const { signIn } = useAuth();
  const router = useRouter();

  const showError = (message: string, title = 'Advertencia') => {
    setDialog({ visible: true, title, message });
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      showError('Complete su correo electrónico y contraseña.');
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      showError('Ingrese un correo electrónico válido.');
      return;
    }

    try {
      setLoading(true);
      await signIn(normalizedEmail, password);
      router.replace('/(tabs)' as any);
    } catch (error) {
      showError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <View style={styles.logoCircle}>
            <IconSymbol pack="ant" name="dropbox" size={96} color="#2F5CF6" />
          </View>

          <Text style={styles.appTitle}>App de Gestión de Pedidos para{`\n`}Emprendedores</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
              textContentType="password"
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>}
            </TouchableOpacity>

            <Text style={styles.linkText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.link} onPress={() => router.push('/register' as any)}>
                Registrate
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AuthMessageModal
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog({ visible: false, message: '' })}
      />
    </SafeAreaView>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.toLowerCase().includes('invalid login')) {
    return 'Correo electrónico o contraseña inválidos.';
  }

  return error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F5CF6',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 34,
    paddingTop: 78,
    paddingBottom: 42,
  },
  logoCircle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  appTitle: {
    marginTop: 26,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 26,
  },
  form: {
    width: '100%',
    maxWidth: 520,
    marginTop: 74,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderColor: '#111111',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 14,
    color: '#111111',
    fontSize: 18,
    marginBottom: 36,
  },
  primaryButton: {
    alignSelf: 'center',
    minWidth: 214,
    height: 46,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#111111',
    fontSize: 25,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
