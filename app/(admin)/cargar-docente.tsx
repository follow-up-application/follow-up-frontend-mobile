import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { DateInput } from '@/components/atoms/DateInput';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import SelectInput, { SelectOption } from '@/components/atoms/SelectInput';
import { Colors } from '@/constants/Colors';
import { getCursosDivisionTurno } from '@/services/cursoDivisionTurnoService';
import { crearDocente } from '@/services/docenteService';
import type { CreateDocenteRequest } from '@/types/docente';
import { esNombreValido, esDniValido, esTelefonoValido, esFormatoFechaValido } from '@/utils/validations';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ValidationCard from '@/components/molecules/ValidationCard';

function fechaHoy(): string {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${hoy.getFullYear()}`;
}

export default function CargarDocenteScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === 'true';

  const [apellido, setApellido] = useState('');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState(fechaHoy());

  const [cursoDivisionTurnoId, setCursoDivisionTurnoId] = useState<number | null>(null);
  const [cursoOptions, setCursoOptions] = useState<SelectOption[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [errorCursos, setErrorCursos] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    let vigente = true;

    (async () => {
      try {
        const cursos = await getCursosDivisionTurno();

        if (!vigente) return;

        setCursoOptions(
          cursos.map((curso) => ({
            label: `${curso.curso}° ${curso.division} - ${curso.turno}`,
            value: curso.id,
          }))
        );
      } catch {
        if (vigente) {
          setErrorCursos('No se pudieron cargar los cursos.');
        }
      } finally {
        if (vigente) {
          setLoadingCursos(false);
        }
      }
    })();

    return () => {
      vigente = false;
    };
  }, []);

  const obtenerErrores = () => {
    const errs: string[] = [];

    if (!apellido || !nombre || !dni || !telefono || !fechaIngreso || cursoDivisionTurnoId === null) {
      errs.push('Faltan completar campos obligatorios');
    }

    if (apellido && !esNombreValido(apellido)) errs.push('El apellido solo puede contener letras');
    if (nombre && !esNombreValido(nombre)) errs.push('El nombre solo puede contener letras');
    if (dni && !esDniValido(dni)) errs.push('El DNI debe tener entre 7 y 8 números');
    if (telefono && !esTelefonoValido(telefono)) errs.push('El teléfono tiene un formato inválido');
    if (fechaIngreso && !esFormatoFechaValido(fechaIngreso)) {
      errs.push('La fecha de ingreso debe tener formato DD/MM/AAAA');
    }
    if (errorCursos) errs.push(errorCursos);

    return errs;
  };

  const erroresFormulario = obtenerErrores();

  const handleGuardar = async () => {
    if (erroresFormulario.length > 0 || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorGeneral('');

    const request: CreateDocenteRequest = {
      first_name: nombre.trim(),
      last_name: apellido.trim(),
      dni: Number(dni.trim()),
      telephone: telefono.trim(),
      fecha_ingreso: fechaIngreso.trim(),
      curso_division_turno_id: cursoDivisionTurnoId as number,
    };

    try {
      await crearDocente(request);

      Alert.alert('Docente cargado', 'El docente se registró correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el docente.';

      setErrorGeneral(mensaje);
      Alert.alert('Error', mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCursos) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.neutral} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Docente' : 'Cargar Docente'}
        </Text>
        <View style={styles.avatarSmall}>
          <MaterialIcons name="person" size={18} color={Colors.onPrimary} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person-outline" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>INFORMACIÓN PERSONAL</Text>
            </View>
            <FormField label="Apellido">
              <Input
                iconName="person-outline"
                placeholder="Ej: González"
                value={apellido}
                onChangeText={setApellido}
                autoCapitalize="words"
              />
            </FormField>

            <FormField label="Nombre">
              <Input
                iconName="person-outline"
                placeholder="Ej: María"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </FormField>

            <FormField label="DNI / Identificación">
              <Input
                iconName="badge"
                placeholder="Ej: 30123456"
                value={dni}
                onChangeText={setDni}
                keyboardType="numeric"
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-mail" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>CONTACTO</Text>
            </View>

            <FormField label="Teléfono">
              <Input
                iconName="phone"
                placeholder="Ej: +54 9 11 1234-5678"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="school" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>ASIGNACIÓN ACADÉMICA</Text>
            </View>

            <FormField label="Fecha de ingreso">
              <DateInput value={fechaIngreso} onChange={setFechaIngreso} />
            </FormField>

            <SelectInput
              label="Curso / División / Turno"
              iconName="school"
              placeholder="Seleccionar curso..."
              value={cursoDivisionTurnoId}
              options={cursoOptions}
              onChange={(value) => setCursoDivisionTurnoId(Number(value))}
            />
          </View>

          {(errorGeneral || errorCursos).length > 0 && (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={20} color={Colors.error} />
              <Text style={styles.errorCardText}>{errorGeneral || errorCursos}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <ValidationCard errors={erroresFormulario} />
            <PrimaryButton
              title={isEditing ? 'Guardar Cambios' : 'Guardar Docente'}
              onPress={handleGuardar}
              isLoading={isLoading}
              style={styles.primaryBtn}
            />
            <OutlinedButton
              title="Cancelar"
              onPress={() => router.back()}
              style={styles.outlinedBtn}
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
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
    flex: 1,
    marginLeft: 12,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.8,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.error}12`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorCardText: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    borderRadius: 24,
  },
  outlinedBtn: {
    borderRadius: 24,
  },
});
