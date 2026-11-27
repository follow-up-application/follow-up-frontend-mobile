import { Colors } from '@/constants/Colors';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveSession, Session, UserRole } from '@/utils/session';
import { API_BASE_URL } from '@/config/api';

// Mismo mapeo que en login.tsx.
const RUTA_POR_ROL: Record<string, string> = {
  administrador: '/(admin)',
  docente: '/(docente)',
  alumno: '/(alumno)',
  tutor: '/(tutor)',
};

type LoginResponse = {
  token: string;
  rol: UserRole;
  first_name: string;
  last_name: string;
  username: string;
};

/** Formatea un DNI numérico con puntos de miles, ej: 34825255 -> '34.825.255' */
function formatearDni(dni: string): string {
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function CompletarRegistroTutorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    codigoInstitucional?: string;
    alumnoId?: string;
    alumnoNombre?: string;
    alumnoDni?: string;
    alumnoCursoDivision?: string;
    alumnoFechaNacimiento?: string;
  }>();

  const codigoInstitucional = params.codigoInstitucional ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [errores, setErrores] = useState({ email: '', password: '', confirmarPassword: '' });

  const validarCampos = () => {
    let valid = true;
    const nuevosErrores = { email: '', password: '', confirmarPassword: '' };

    if (!email.trim()) {
      nuevosErrores.email = 'El correo electrónico es requerido';
      valid = false;
    } else if (!email.includes('@')) {
      nuevosErrores.email = 'El formato del correo es inválido';
      valid = false;
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es requerida';
      valid = false;
    } else if (password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      valid = false;
    }

    if (password && confirmarPassword !== password) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
      valid = false;
    }

    setErrores(nuevosErrores);
    return valid;
  };

  const handleRegister = async () => {
    setErrorGeneral('');

    if (!codigoInstitucional) {
      setErrorGeneral('Falta el código institucional. Volvé al paso anterior.');
      return;
    }

    if (!validarCampos()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/tutores/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          codigo_institucional: codigoInstitucional,
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 422 || response.status === 409) {
          setErrorGeneral('El código ya fue utilizado, o el correo ya está registrado.');
        } else if (response.status === 404) {
          setErrorGeneral('El código institucional ya no es válido. Volvé a validarlo.');
        } else {
          setErrorGeneral('Ocurrió un error al registrarte. Intenta nuevamente.');
        }
        return;
      }

      // Registro OK -> auto-login con las mismas credenciales para no pedirle
      // al tutor que las vuelva a tipear.
      // NOTA: el login usa el campo 'username', igual que en login.tsx. Si el
      // backend espera 'email' para tutores en vez de 'username', cambiar acá.
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username: email.trim(), password }),
      });

      if (!loginResponse.ok) {
        // El registro sí funcionó; si el auto-login falla, mandamos al login manual
        // en vez de dejar al usuario colgado con un error confuso.
        router.replace('/login');
        return;
      }

      const loginData: LoginResponse = await loginResponse.json();

      const session: Session = {
        token: loginData.token,
        rol: loginData.rol,
        first_name: loginData.first_name,
        last_name: loginData.last_name,
        username: loginData.username,
      };

      await saveSession(session);

      const ruta = RUTA_POR_ROL[loginData.rol] ?? '/login';
      router.replace(ruta as any);
    } catch (error) {
      setErrorGeneral('No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.neutral} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
        </View>

        <Text style={styles.subtitle}>Creá tus credenciales para acceder como tutor en FollowUp</Text>

        {params.alumnoNombre ? (
          <View style={styles.alumnoCard}>
            <View style={styles.alumnoCardHeader}>
              <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
              <Text style={styles.alumnoCardTitle}>Vas a registrarte como tutor de:</Text>
            </View>
            <Text style={styles.alumnoCardNombre}>{params.alumnoNombre}</Text>
            <View style={styles.alumnoCardDetalleRow}>
              {params.alumnoDni ? (
                <Text style={styles.alumnoCardDetalle}>DNI: {formatearDni(params.alumnoDni)}</Text>
              ) : null}
              {params.alumnoCursoDivision ? (
                <Text style={styles.alumnoCardDetalle}>{params.alumnoCursoDivision}</Text>
              ) : null}
            </View>
            {params.alumnoFechaNacimiento ? (
              <Text style={styles.alumnoCardDetalle}>Nacimiento: {params.alumnoFechaNacimiento}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          {errorGeneral ? (
            <View style={styles.errorGeneralContainer}>
              <MaterialIcons name="error-outline" size={16} color={Colors.error ?? '#D32F2F'} />
              <Text style={styles.errorGeneralText}>{errorGeneral}</Text>
            </View>
          ) : null}

          <FormField label="Correo Electrónico" errorMessage={errores.email}>
            <Input
              iconName="mail-outline"
              placeholder="email@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </FormField>

          <FormField label="Contraseña" errorMessage={errores.password}>
            <Input
              iconName="lock-outline"
              placeholder="*********"
              value={password}
              onChangeText={setPassword}
              isPassword
              editable={!loading}
            />
          </FormField>

          <FormField label="Confirmar contraseña" errorMessage={errores.confirmarPassword}>
            <Input
              iconName="lock-outline"
              placeholder="*********"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              isPassword
              editable={!loading}
            />
          </FormField>

          <PrimaryButton
            title={loading ? 'Registrando...' : 'Registrarse'}
            onPress={handleRegister}
            style={styles.registerButton}
          />
        </View>

        <TouchableOpacity
          style={styles.loginLinkContainer}
          onPress={() => router.replace('/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLinkText}>
            ¿Ya tienes cuenta? <Text style={styles.loginLinkHighlight}>Iniciar sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  alumnoCard: {
    backgroundColor: `${Colors.primary}0D`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  alumnoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  alumnoCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  alumnoCardNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 4,
  },
  alumnoCardDetalleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 2,
  },
  alumnoCardDetalle: {
    fontSize: 13,
    color: Colors.secondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  registerButton: {
    marginTop: 32,
  },
  loginLinkContainer: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '700',
  },
  loginLinkHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
});