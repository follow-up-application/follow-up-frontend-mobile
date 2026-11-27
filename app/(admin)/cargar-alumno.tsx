import { Input } from '@/components/atoms/Input';
import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import SelectInput, { SelectOption } from '@/components/atoms/SelectInput';
import { FormField } from '@/components/molecules/FormField';
import { Colors } from '@/constants/Colors';
import {
  buscarTutorPorDni,
  crearAlumno,
  getCursosDivisionTurno,
} from '@/services/alumnoService';
import { CreateAlumnoRequest, TutorAlumnoRelation } from '@/types/alumno';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const OPCIONES_PARENTESCO: SelectOption[] = [
  { label: 'Padre', value: 'padre' },
  { label: 'Madre', value: 'madre' },
  { label: 'Otra', value: 'otra' },
];

const FECHA_REGEX = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;

/** Convierte 'dd/mm/yyyy' o 'dd-mm-yyyy' -> 'yyyy-mm-dd' (formato ISO que espera el backend). */
function fechaAIso(fecha: string): string {
  const [, dd, mm, yyyy] = fecha.match(FECHA_REGEX) ?? [];
  return `${dd}/${mm}/${yyyy}`; // Retorna en formato ISO: yyyy-mm-dd
}

/** Valida que la fecha ingresada sea una fecha real (no solo el formato). */
function esFechaValida(fecha: string): boolean {
  const match = fecha.match(FECHA_REGEX);
  if (!match) return false;

  const [, dd, mm, yyyy] = match;
  const dia = Number(dd);
  const mes = Number(mm);
  const anio = Number(yyyy);

  const fechaObj = new Date(anio, mes - 1, dia);
  return (
    fechaObj.getFullYear() === anio &&
    fechaObj.getMonth() === mes - 1 &&
    fechaObj.getDate() === dia
  );
}

type Errores = {
  firstName?: string;
  lastName?: string;
  dni?: string;
  fechaNacimiento?: string;
  curso?: string;
  tutorDni?: string;
  tutorFirstName?: string;
  tutorLastName?: string;
  relationship?: string;
  otraRelacion?: string;
};

export default function CargarAlumnoScreen() {
  const router = useRouter();

  // Datos del alumno
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [cursoDivisionTurnoId, setCursoDivisionTurnoId] = useState<number | null>(null);

  // Curso / División / Turno
  const [cursoOptions, setCursoOptions] = useState<SelectOption[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [errorCursos, setErrorCursos] = useState('');

  // Tutor
  const [tutorDni, setTutorDni] = useState('');
  const [tutorFirstName, setTutorFirstName] = useState('');
  const [tutorLastName, setTutorLastName] = useState('');
  const [tutorTelephone, setTutorTelephone] = useState('');
  const [tutorEncontrado, setTutorEncontrado] = useState(false);
  const [tutorBuscado, setTutorBuscado] = useState(false);
  const [loadingTutor, setLoadingTutor] = useState(false);
  const [errorTutor, setErrorTutor] = useState('');

  // Relación
  const [relationship, setRelationship] = useState<TutorAlumnoRelation | null>(null);
  const [otraRelacion, setOtraRelacion] = useState('');

  // Envío
  const [saving, setSaving] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [errores, setErrores] = useState<Errores>({});

  useEffect(() => {
    (async () => {
      setLoadingCursos(true);
      setErrorCursos('');

      try {
        const cursos = await getCursosDivisionTurno();
        setCursoOptions(
          cursos.map((c) => ({
            label: `${c.curso}° ${c.division} - ${c.turno}`,
            value: c.id,
          }))
        );
      } catch (error) {
        setErrorCursos('No se pudieron cargar los cursos');
      } finally {
        setLoadingCursos(false);
      }
    })();
  }, []);

  const limpiarDatosTutor = () => {
    setTutorFirstName('');
    setTutorLastName('');
    setTutorTelephone('');
    setTutorEncontrado(false);
  };

  const handleBuscarTutor = async () => {
    setErrorTutor('');

    if (!tutorDni.trim()) {
      setErrores((prev) => ({ ...prev, tutorDni: 'Ingresá el DNI del tutor' }));
      return;
    }

    setErrores((prev) => ({ ...prev, tutorDni: undefined }));
    setLoadingTutor(true);
    setTutorBuscado(false);

    try {
      const tutor = await buscarTutorPorDni(tutorDni.trim());

      if (tutor) {
        setTutorFirstName(tutor.first_name);
        setTutorLastName(tutor.last_name);
        setTutorTelephone(tutor.telephone);
        setTutorEncontrado(true);
      } else {
        limpiarDatosTutor();
        setTutorEncontrado(false);
      }

      setTutorBuscado(true);
    } catch (error) {
      setErrorTutor('Error al buscar el tutor. Intenta nuevamente.');
      limpiarDatosTutor();
    } finally {
      setLoadingTutor(false);
    }
  };

  // Si cambia el DNI del tutor después de haber buscado, invalidamos el resultado
  // anterior para que no se pueda enviar con datos de un tutor distinto sin re-buscar.
  const handleChangeTutorDni = (value: string) => {
    setTutorDni(value);
    if (tutorBuscado) {
      setTutorBuscado(false);
      setTutorEncontrado(false);
      limpiarDatosTutor();
    }
  };

  const validarCampos = (): boolean => {
    const nuevosErrores: Errores = {};

    if (!firstName.trim()) nuevosErrores.firstName = 'El nombre es requerido';
    if (!lastName.trim()) nuevosErrores.lastName = 'El apellido es requerido';

    if (!dni.trim()) {
      nuevosErrores.dni = 'El DNI es requerido';
    } else if (!/^\d+$/.test(dni.trim())) {
      nuevosErrores.dni = 'El DNI debe ser numérico';
    }

    if (!fechaNacimiento.trim()) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else if (!esFechaValida(fechaNacimiento.trim())) {
      nuevosErrores.fechaNacimiento = 'Formato esperado: DD/MM/AAAA';
    }

    if (!cursoDivisionTurnoId) {
      nuevosErrores.curso = 'Seleccioná un curso';
    }

    if (!tutorDni.trim()) {
      nuevosErrores.tutorDni = 'El DNI del tutor es requerido';
    } else if (!/^\d+$/.test(tutorDni.trim())) {
      nuevosErrores.tutorDni = 'El DNI del tutor debe ser numérico';
    }

    // Si el tutor no existía en el sistema, los datos se cargan a mano y son obligatorios.
    if (!tutorEncontrado) {
      if (!tutorFirstName.trim()) nuevosErrores.tutorFirstName = 'El nombre del tutor es requerido';
      if (!tutorLastName.trim()) nuevosErrores.tutorLastName = 'El apellido del tutor es requerido';
    }

    if (!relationship) {
      nuevosErrores.relationship = 'Seleccioná el parentesco';
    } else if (relationship === 'otra' && !otraRelacion.trim()) {
      nuevosErrores.otraRelacion = 'Especificá la relación';
    }

    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((v) => !v);
  };

  const handleGuardar = async () => {
    setErrorGeneral('');

    if (!validarCampos()) {
      return;
    }

    const request: CreateAlumnoRequest = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      dni: Number(dni.trim()),
      fecha_nacimiento: fechaAIso(fechaNacimiento.trim()),
      curso_division_turno_id: cursoDivisionTurnoId as number,
      relationship: relationship as TutorAlumnoRelation,
      otra_relacion: relationship === 'otra' ? otraRelacion.trim() : null,
      tutor_dni: Number(tutorDni.trim()),
      // Si el tutor ya existe, el backend decide la rama por tutor_first_name === null:
      // mandar el nombre acá (aunque sea el mismo) haría que intente crear un tutor nuevo.
      tutor_first_name: tutorEncontrado ? null : tutorFirstName.trim(),
      tutor_last_name: tutorEncontrado ? null : tutorLastName.trim(),
      tutor_telephone: tutorEncontrado ? null : tutorTelephone.trim() || null,
    };

    setSaving(true);

    try {
      await crearAlumno(request);
      Alert.alert('Alumno cargado', 'El alumno se registró correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      setErrorGeneral(error?.message ?? 'No fue posible crear el alumno.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.neutral} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cargar Alumno</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {errorGeneral ? (
            <View style={styles.errorGeneralContainer}>
              <MaterialIcons name="error-outline" size={16} color={Colors.error ?? '#D32F2F'} />
              <Text style={styles.errorGeneralText}>{errorGeneral}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Datos del alumno</Text>

          <FormField label="Nombre" errorMessage={errores.firstName}>
            <Input
              iconName="person-outline"
              placeholder="Nombre"
              value={firstName}
              onChangeText={setFirstName}
              editable={!saving}
            />
          </FormField>

          <FormField label="Apellido" errorMessage={errores.lastName}>
            <Input
              iconName="person-outline"
              placeholder="Apellido"
              value={lastName}
              onChangeText={setLastName}
              editable={!saving}
            />
          </FormField>

          <FormField label="DNI" errorMessage={errores.dni}>
            <Input
              iconName="badge"
              placeholder="DNI"
              value={dni}
              onChangeText={setDni}
              keyboardType="number-pad"
              editable={!saving}
            />
          </FormField>

          <FormField label="Fecha de nacimiento" errorMessage={errores.fechaNacimiento}>
            <Input
              iconName="calendar-today"
              placeholder="DD/MM/AAAA"
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />
          </FormField>

          {loadingCursos ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.inlineLoadingText}>Cargando cursos...</Text>
            </View>
          ) : errorCursos ? (
            <Text style={styles.errorGeneralText}>{errorCursos}</Text>
          ) : (
            <>
              <SelectInput
                label="Curso / División / Turno"
                iconName="domain"
                options={cursoOptions}
                value={cursoDivisionTurnoId}
                onChange={(value) => setCursoDivisionTurnoId(value as number)}
              />
              {errores.curso ? <Text style={styles.fieldError}>{errores.curso}</Text> : null}
            </>
          )}

          <Text style={styles.sectionTitle}>Datos del tutor</Text>

          <FormField label="DNI del tutor" errorMessage={errores.tutorDni}>
            <View style={styles.tutorDniRow}>
              <View style={styles.tutorDniInput}>
                <Input
                  iconName="badge"
                  placeholder="DNI del tutor"
                  value={tutorDni}
                  onChangeText={handleChangeTutorDni}
                  keyboardType="number-pad"
                  editable={!saving && !loadingTutor}
                />
              </View>
              <TouchableOpacity
                style={[styles.buscarButton, (saving || loadingTutor) && styles.buscarButtonDisabled]}
                onPress={handleBuscarTutor}
                disabled={saving || loadingTutor}
                activeOpacity={0.8}
              >
                {loadingTutor ? (
                  <ActivityIndicator size="small" color={Colors.white ?? '#FFF'} />
                ) : (
                  <Text style={styles.buscarButtonText}>Buscar</Text>
                )}
              </TouchableOpacity>
            </View>
          </FormField>

          {errorTutor ? <Text style={styles.fieldError}>{errorTutor}</Text> : null}

          {tutorBuscado && !tutorEncontrado && !errorTutor ? (
            <View style={styles.infoBanner}>
              <MaterialIcons name="info-outline" size={16} color={Colors.secondary} />
              <Text style={styles.infoBannerText}>
                No se encontró un tutor con ese DNI. Completá sus datos manualmente.
              </Text>
            </View>
          ) : null}

          {tutorEncontrado ? (
            <View style={styles.infoBanner}>
              <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.infoBannerText}>Tutor encontrado. Datos autocompletados.</Text>
            </View>
          ) : null}

          <FormField label="Nombre del tutor" errorMessage={errores.tutorFirstName}>
            <Input
              iconName="person-outline"
              placeholder="Nombre del tutor"
              value={tutorFirstName}
              onChangeText={setTutorFirstName}
              editable={!saving && !tutorEncontrado}
            />
          </FormField>

          <FormField label="Apellido del tutor" errorMessage={errores.tutorLastName}>
            <Input
              iconName="person-outline"
              placeholder="Apellido del tutor"
              value={tutorLastName}
              onChangeText={setTutorLastName}
              editable={!saving && !tutorEncontrado}
            />
          </FormField>

          <FormField label="Teléfono del tutor">
            <Input
              iconName="phone"
              placeholder="Teléfono del tutor"
              value={tutorTelephone}
              onChangeText={setTutorTelephone}
              keyboardType="phone-pad"
              editable={!saving && !tutorEncontrado}
            />
          </FormField>

          <SelectInput
            label="Parentesco"
            iconName="diversity-1"
            options={OPCIONES_PARENTESCO}
            value={relationship}
            onChange={(value) => setRelationship(value as TutorAlumnoRelation)}
          />
          {errores.relationship ? <Text style={styles.fieldError}>{errores.relationship}</Text> : null}

          {relationship === 'otra' ? (
            <FormField label="Otra relación" errorMessage={errores.otraRelacion}>
              <Input
                iconName="edit"
                placeholder="Especificar relación"
                value={otraRelacion}
                onChangeText={setOtraRelacion}
                editable={!saving}
              />
            </FormField>
          ) : null}

          <View style={styles.actionsRow}>
            <OutlinedButton title="Cancelar" onPress={() => router.back()} />
            <PrimaryButton
              title={saving ? 'Guardando...' : 'Guardar'}
              onPress={handleGuardar}
              style={styles.guardarButton}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral,
    marginTop: 8,
    marginBottom: 8,
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
  fieldError: {
    color: Colors.error ?? '#D32F2F',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  inlineLoadingText: {
    fontSize: 13,
    color: Colors.secondary,
  },
  tutorDniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tutorDniInput: {
    flex: 1,
  },
  buscarButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buscarButtonDisabled: {
    opacity: 0.6,
  },
  buscarButtonText: {
    color: Colors.white ?? '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: `${Colors.primary}0D`,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  infoBannerText: {
    fontSize: 12,
    color: Colors.secondary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  guardarButton: {
    minWidth: 140,
  },
});