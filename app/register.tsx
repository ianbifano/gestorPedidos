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
  type: 'error' | 'success';
  onClose?: () => void;
};

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    message: '',
    type: 'error',
  });

  const { signUp } = useAuth();
  const router = useRouter();

  const showError = (message: string) => {
    setDialog({ visible: true, title: 'Advertencia', message, type: 'error' });
  };

  const closeDialog = () => {
    const onClose = dialog.onClose;
    setDialog({ visible: false, message: '', type: 'error' });
    onClose?.();
  };

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (username.trim().length < 2) {
      showError('El nombre de usuario debe tener al menos 2 caracteres.');
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      showError('Ingrese un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const result = await signUp(username, normalizedEmail, password);

      setDialog({
        visible: true,
        title: 'Cuenta creada',
        message: result.needsEmailConfirmation
          ? 'Revise su correo electrónico para confirmar la cuenta antes de iniciar sesión.'
          : 'Su cuenta fue creada correctamente.',
        type: 'success',
        onClose: () => router.replace((result.needsEmailConfirmation ? '/login' : '/(tabs)') as any),
      });
    } catch (error) {
      showError(getRegisterErrorMessage(error));
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
            <Text style={styles.label}>Nombre de Usuario</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              editable={!loading}
              autoCapitalize="words"
              textContentType="username"
            />

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
              textContentType="newPassword"
            />

            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              secureTextEntry
              textContentType="newPassword"
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Registrarse</Text>}
            </TouchableOpacity>

            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.link} onPress={() => router.push('/login' as any)}>
                Iniciar Sesión
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AuthMessageModal
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={closeDialog}
      />
    </SafeAreaView>
  );
}

function getRegisterErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('already registered') || message.includes('already exists')) {
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    }

    return error.message;
  }

  return 'No se pudo crear la cuenta.';
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
    paddingTop: 72,
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
    marginTop: 64,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 25,
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
    marginBottom: 28,
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
    marginTop: 22,
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
