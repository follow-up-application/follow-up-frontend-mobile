import { Colors } from '@/constants/Colors';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveSession, Session, UserRole } from '@/utils/session';
import { API_BASE_URL } from '@/config/api';

// TODO: mover a variable de entorno (.env / app.config.ts) antes de producción.
// En emulador Android usar 'http://10.0.2.2:8000' en vez de 'localhost'.

type LoginResponse = {
  token: string;
  rol: UserRole;
  first_name: string;
  last_name: string;
  username: string;
};

// Mapea el rol devuelto por el backend a la ruta correspondiente del grupo de Expo Router.
// Ajustar los nombres de ruta según cómo estén nombradas tus carpetas (admin)/(docente)/etc.
const RUTA_POR_ROL: Record<string, string> = {
  administrador: '/(admin)',
  docente: '/(docente)',
  alumno: '/(alumno)',
  tutor: '/(tutor)',
};

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({ username: '', password: '' });
  const [errorGeneral, setErrorGeneral] = useState('');
  const [loading, setLoading] = useState(false);

  const validarCampos = () => {
    let valid = true;
    const nuevosErrores = { username: '', password: '' };

    if (!username.trim()) {
      nuevosErrores.username = 'El usuario es requerido';
      valid = false;
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es requerida';
      valid = false;
    }

    setErrores(nuevosErrores);
    return valid;
  };

  const handleAcceder = async () => {
    if (loading) return; // evita doble submit si el botón no soporta `disabled`

    setErrorGeneral('');

    if (!validarCampos()) {
      return;
    }

    setLoading(true);

    try {
      const body = JSON.stringify({ username: username.trim(), password });

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 422) {
          setErrorGeneral('Usuario o contraseña incorrectos');
        } else {
          setErrorGeneral('Ocurrió un error al iniciar sesión. Intenta nuevamente.');
        }
        return;
      }

      const data: LoginResponse = await response.json();

      const session: Session = {
        token: data.token,
        rol: data.rol,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
      };

      await saveSession(session);

      const ruta = RUTA_POR_ROL[data.rol];

      if (!ruta) {
        setErrorGeneral('Rol de usuario no reconocido');
        return;
      }

      router.replace(ruta as any);
    } catch (error) {
      setErrorGeneral('No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo-sf.png')}
              style={styles.logoImage}
              contentFit="contain"
              placeholder={{ blurhash: 'L00000fQfQfQfQfQfQfQfQfQfQfQ' }}
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>

            {errorGeneral ? (
              <View style={styles.errorGeneralContainer}>
                <MaterialIcons name="error-outline" size={16} color={Colors.error ?? '#D32F2F'} />
                <Text style={styles.errorGeneralText}>{errorGeneral}</Text>
              </View>
            ) : null}

            <FormField label="Usuario" errorMessage={errores.username}>
              <Input
                iconName="person-outline"
                placeholder="tu nombre de usuario"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading}
              />
            </FormField>

            <FormField label="Contraseña" errorMessage={errores.password}>
              <Input
                iconName="lock-outline"
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                isPassword
                editable={!loading}
              />
            </FormField>
            <View style={styles.accederRow}>
              <PrimaryButton
                title={loading ? 'Ingresando...' : 'Acceder'}
                onPress={handleAcceder}
                style={styles.accederButton}
              />
            </View>
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => router.push('/recuperar-password')}
              activeOpacity={0.7}
              disabled={loading}
            >
              <MaterialIcons name="help-outline" size={16} color={Colors.primary} />
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.registerContainer}>
            <OutlinedButton
              title="Soy Tutor"
              onPress={() => router.push('/validar-codigo' as any)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: 32,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 24,
  },
  errorGeneralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.error ?? '#D32F2F'}15`,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorGeneralText: {
    color: Colors.error ?? '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  rolCardActivo: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  rolCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.secondary,
  },
  rolCardTextActivo: {
    color: Colors.primary,
    fontWeight: '700',
  },
  accederRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  accederButton: {
    minWidth: 120,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  registerContainer: {
    marginTop: 24,
  },
});