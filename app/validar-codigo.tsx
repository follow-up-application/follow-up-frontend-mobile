import { Colors } from '@/constants/Colors';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/config/api';

// TODO: mover a variable de entorno (.env / app.config.ts) antes de producción.

type AlumnoValidado = {
  id: string;
  first_name: string;
  last_name: string;
  dni: number;
  username: string;
  curso_division: string;
  fecha_nacimiento: string;
  role: string;
};

export default function ValidarCodigoScreen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [loading, setLoading] = useState(false);
  const [alumno, setAlumno] = useState<AlumnoValidado | null>(null);

  const handleValidar = async () => {
    setErrorGeneral('');
    setAlumno(null);

    if (!codigo.trim()) {
      setErrorCodigo('El código institucional es requerido');
      return;
    }

    setErrorCodigo('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/tutores/validarCodigo/${codigo.trim()}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      if (response.status === 404) {
        setErrorGeneral('El código institucional no es válido. Verificalo con la institución.');
        return;
      }

      if (!response.ok) {
        setErrorGeneral('Ocurrió un error al validar el código. Intenta nuevamente.');
        return;
      }

      const data: AlumnoValidado = await response.json();
      setAlumno(data);
    } catch (error) {
      setErrorGeneral('No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinuar = () => {
    if (!alumno) return;

    router.push({
      pathname: '/register',
      params: {
        codigoInstitucional: codigo.trim(),
        alumnoId: alumno.id,
        alumnoNombre: `${alumno.first_name} ${alumno.last_name}`,
        alumnoDni: String(alumno.dni),
        alumnoCursoDivision: alumno.curso_division,
        alumnoFechaNacimiento: alumno.fecha_nacimiento,
      },
    } as any);
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
          <Text style={styles.headerTitle}>Validar Código</Text>
        </View>

        <Text style={styles.subtitle}>
          Ingresá el código institucional que te entregó la escuela para vincularte con el alumno.
        </Text>

        <View style={styles.card}>
          {errorGeneral ? (
            <View style={styles.errorGeneralContainer}>
              <MaterialIcons name="error-outline" size={16} color={Colors.error ?? '#D32F2F'} />
              <Text style={styles.errorGeneralText}>{errorGeneral}</Text>
            </View>
          ) : null}

          <FormField label="Código institucional" errorMessage={errorCodigo}>
            <Input
              iconName="qr-code-2"
              placeholder="Ej: A1B2C3"
              value={codigo}
              onChangeText={(value) => {
                setCodigo(value);
                setAlumno(null);
              }}
              autoCapitalize="characters"
              editable={!loading}
            />
          </FormField>

          <PrimaryButton
            title={loading ? 'Validando...' : 'Validar'}
            onPress={handleValidar}
            style={styles.validarButton}
          />

          {alumno ? (
            <View style={styles.alumnoCard}>
              <View style={styles.alumnoCardHeader}>
                <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                <Text style={styles.alumnoCardTitle}>Alumno encontrado</Text>
              </View>
              <Text style={styles.alumnoNombre}>
                {alumno.first_name} {alumno.last_name}
              </Text>
              <Text style={styles.alumnoDetalle}>{alumno.curso_division}</Text>

              <PrimaryButton
                title="Continuar"
                onPress={handleContinuar}
                style={styles.continuarButton}
              />
            </View>
          ) : null}
        </View>
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
    marginBottom: 32,
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
  validarButton: {
    marginTop: 8,
  },
  alumnoCard: {
    marginTop: 24,
    backgroundColor: `${Colors.primary}0D`,
    borderRadius: 12,
    padding: 16,
  },
  alumnoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  alumnoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  alumnoNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 2,
  },
  alumnoDetalle: {
    fontSize: 14,
    color: Colors.secondary,
  },
  continuarButton: {
    marginTop: 16,
  },
});