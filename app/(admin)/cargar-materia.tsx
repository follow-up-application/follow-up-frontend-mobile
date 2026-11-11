import { Input } from '@/components/atoms/Input';
import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import SelectInput, { SelectOption } from '@/components/atoms/SelectInput';
import { FormField } from '@/components/molecules/FormField';
import ValidationCard from '@/components/molecules/ValidationCard';
import { Colors } from '@/constants/Colors';
import { getCursosDivisionTurno } from '@/services/cursoDivisionTurnoService';
import { getDocentes } from '@/services/docenteService';
import { crearMateria, getMateria, updateMateria } from '@/services/materiaService';
import type { Materia } from '@/types/materia';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const NOMBRE_MAX = 150;
const DESCRIPCION_MAX = 1000;

export default function CargarMateriaScreen() {
  const router = useRouter();
  const { id, edit } = useLocalSearchParams<{ id?: string; edit?: string }>();

  const materiaId = id ? Number(id) : null;
  const isEditing = edit === 'true' && Number.isFinite(materiaId);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [docenteId, setDocenteId] = useState<string | null>(null);

  const [cursoOptions, setCursoOptions] = useState<SelectOption[]>([]);
  const [docenteOptions, setDocenteOptions] = useState<SelectOption[]>([]);

  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [loadingMateria, setLoadingMateria] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  // Los selectores de curso y docente vienen de la API: no hay catálogo local.
  useEffect(() => {
    let vigente = true;

    (async () => {
      try {
        const [cursos, docentes] = await Promise.all([getCursosDivisionTurno(), getDocentes()]);

        if (!vigente) return;

        setCursoOptions(
          cursos.map((curso) => ({
            label: `${curso.curso}° ${curso.division} - ${curso.turno}`,
            value: curso.id,
          }))
        );

        setDocenteOptions(
          docentes.map((docente) => ({
            label: `${docente.first_name} ${docente.last_name}`,
            value: docente.id,
          }))
        );
      } catch {
        if (vigente) {
          setErrorGeneral('No se pudieron cargar los cursos y docentes.');
        }
      } finally {
        if (vigente) {
          setLoadingCatalogos(false);
        }
      }
    })();

    return () => {
      vigente = false;
    };
  }, []);

  // En modo edición precargamos la materia existente.
  useEffect(() => {
    if (!isEditing || !Number.isFinite(materiaId)) {
      return;
    }

    let vigente = true;

    (async () => {
      try {
        const materia: Materia = await getMateria(materiaId as number);

        if (!vigente) return;

        setNombre(materia.nombre);
        setDescripcion(materia.descripcion);
        setCursoId(materia.curso_division_turno_id);
        setDocenteId(materia.docente_id);
      } catch {
        if (vigente) {
          setErrorGeneral('No se pudo cargar la materia a editar.');
        }
      } finally {
        if (vigente) {
          setLoadingMateria(false);
        }
      }
    })();

    return () => {
      vigente = false;
    };
  }, [isEditing, materiaId]);

  const errores: string[] = [];

  if (!nombre.trim()) {
    errores.push('El nombre de la materia es obligatorio');
  } else if (nombre.trim().length > NOMBRE_MAX) {
    errores.push(`El nombre no puede superar los ${NOMBRE_MAX} caracteres`);
  }

  if (!descripcion.trim()) {
    errores.push('La descripción es obligatoria');
  } else if (descripcion.trim().length > DESCRIPCION_MAX) {
    errores.push(`La descripción no puede superar los ${DESCRIPCION_MAX} caracteres`);
  }

  if (cursoId === null) {
    errores.push('Seleccioná el curso, división y turno');
  }

  if (!docenteId) {
    errores.push('Seleccioná el docente a cargo');
  }

  const handleGuardar = async () => {
    if (errores.length > 0) {
      return;
    }

    setSaving(true);
    setErrorGeneral('');

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      curso_division_turno_id: cursoId as number,
      docente_id: docenteId as string,
    };

    try {
      if (isEditing) {
        await updateMateria(materiaId as number, payload);
      } else {
        await crearMateria(payload);
      }

      router.back();
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'No se pudo guardar la materia.';

      setErrorGeneral(mensaje);
      Alert.alert('Error', mensaje);
    } finally {
      setSaving(false);
    }
  };

  if (loadingCatalogos || loadingMateria) {
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
          {isEditing ? 'Editar Materia' : 'Cargar Materia'}
        </Text>
        <View style={styles.avatarSmall}>
          <MaterialIcons name="menu-book" size={18} color={Colors.onPrimary} />
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
          <Text style={styles.sectionTitle}>Datos de la Materia</Text>
          <Text style={styles.sectionSubtitle}>
            {isEditing
              ? 'Modificá los datos de la materia y guardá los cambios.'
              : 'Completá los detalles para registrar una nueva materia.'}
          </Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="menu-book" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>INFORMACIÓN</Text>
            </View>

            <FormField label="Nombre">
              <Input
                iconName="menu-book"
                placeholder="Ej: Matemática"
                value={nombre}
                onChangeText={setNombre}
                maxLength={NOMBRE_MAX}
              />
            </FormField>

            <FormField label="Descripción">
              <Input
                iconName="notes"
                placeholder="Ej: Álgebra y análisis matemático."
                value={descripcion}
                onChangeText={setDescripcion}
                maxLength={DESCRIPCION_MAX}
                multiline
                numberOfLines={4}
                style={{ minHeight: 96, textAlignVertical: 'top' }}
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="school" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>ASIGNACIÓN ACADÉMICA</Text>
            </View>

            <SelectInput
              label="Curso / División / Turno"
              iconName="school"
              placeholder="Seleccionar curso..."
              value={cursoId}
              options={cursoOptions}
              onChange={(value) => setCursoId(Number(value))}
            />

            <SelectInput
              label="Docente a cargo"
              iconName="person"
              placeholder="Seleccionar docente..."
              value={docenteId}
              options={docenteOptions}
              onChange={(value) => setDocenteId(String(value))}
            />
          </View>

          {errorGeneral.length > 0 && (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={20} color={Colors.error} />
              <Text style={styles.errorCardText}>{errorGeneral}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <ValidationCard errors={errores} />
            <PrimaryButton
              title={isEditing ? 'Guardar Cambios' : 'Guardar Materia'}
              onPress={handleGuardar}
              isLoading={saving}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    marginBottom: 24,
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