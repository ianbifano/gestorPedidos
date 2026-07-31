import { AuthMessageModal } from '@/components/AuthMessageModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
  const scheme = useColorScheme();
  const C = Colors[scheme];
  const S = useMemo(() => styles(C), [C]);

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
        onClose: result.needsEmailConfirmation ? () => router.replace('/login' as any) : undefined,
      });
    } catch (error) {
      showError(getRegisterErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={S.safeArea}>
      <View style={S.toggleContainer}>
        <ThemeToggle />
      </View>
      <KeyboardAvoidingView
        style={S.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={S.content}>
          <View style={S.logoCircle}>
            <IconSymbol pack="ant" name="dropbox" size={96} color={C.tint} />
          </View>

          <Text style={S.appTitle}>Crear tu cuenta</Text>

          <View style={S.form}>
            <Text style={S.label}>Nombre de Usuario</Text>
            <TextInput
              style={S.input}
              value={username}
              onChangeText={setUsername}
              editable={!loading}
              autoCapitalize="words"
              textContentType="username"
              placeholder="Tu nombre"
              placeholderTextColor={C.textSecondary}
            />

            <Text style={S.label}>Correo Electrónico</Text>
            <TextInput
              style={S.input}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              placeholder="ejemplo@correo.com"
              placeholderTextColor={C.textSecondary}
            />

            <Text style={S.label}>Contraseña</Text>
            <TextInput
              style={S.input}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
              textContentType="newPassword"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={C.textSecondary}
            />

            <Text style={S.label}>Confirmar Contraseña</Text>
            <TextInput
              style={S.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              secureTextEntry
              textContentType="newPassword"
              placeholder="Repetir contraseña"
              placeholderTextColor={C.textSecondary}
            />

            <TouchableOpacity
              style={[S.primaryButton, loading && S.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={S.primaryButtonText}>Registrarse</Text>}
            </TouchableOpacity>

            <Text style={S.linkText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={S.link} onPress={() => router.push('/login' as any)}>
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

const styles = (C: typeof Colors.light) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  toggleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 8 : 16,
    right: 12,
    zIndex: 10,
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
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  appTitle: {
    marginTop: 24,
    color: C.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    marginTop: 36,
    backgroundColor: C.card,
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: C.background,
    borderColor: C.border,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 16,
    marginBottom: 20,
  },
  primaryButton: {
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 10,
    backgroundColor: C.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  linkText: {
    color: C.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: C.tint,
    fontWeight: '600',
  },
});
