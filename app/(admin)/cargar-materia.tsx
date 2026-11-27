import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import SelectInput from '@/components/atoms/SelectInput';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { esNombreValido, esDniValido, esEmailValido, esTelefonoValido } from '@/utils/validations'; import {
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
const MATERIAS = [
  { label: 'Matemáticas', value: 'Matemáticas' },
  { label: 'Prácticas del Lenguaje', value: 'Prácticas del Lenguaje' },
  { label: 'Ciencias Naturales', value: 'Ciencias Naturales' },
  { label: 'Ciencias Sociales', value: 'Ciencias Sociales' },
  { label: 'Educación Física', value: 'Educación Física' },
  { label: 'Inglés', value: 'Inglés' },
  { label: 'Arte', value: 'Arte' },
];

const GRADOS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
];

const DIVISIONES = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' },
  { label: 'E', value: 'E' },
];

const TURNOS = [
  { label: 'Mañana', value: 'Mañana' },
  { label: 'Tarde', value: 'Tarde' },
];
export default function CargarDocenteScreen() {
  const router = useRouter();
  // Extraemos la señal para saber si estamos editando
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === 'true';
  // Datos Personales
  const [apellido, setApellido] = useState('');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');

  // Contacto y Asignaciones
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [materia, setMateria] = useState(''); // Ahora es un texto simple
  const [grado, setGrado] = useState('');
  const [division, setDivision] = useState('');
  const [turno, setTurno] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de validación dinámica
  // Lógica de validación dinámica detallada
  const obtenerErrores = () => {
    const errs: string[] = [];

    // 1. Revisamos campos vacíos
    if (!apellido || !nombre || !dni || !email || !telefono || !materia || !grado || !division || !turno) {
      errs.push('Faltan completar campos obligatorios');
    }

    // 2. Revisamos formatos incorrectos (solo si están escritos)
    if (apellido && !esNombreValido(apellido)) errs.push('El apellido solo puede contener letras');
    if (nombre && !esNombreValido(nombre)) errs.push('El nombre solo puede contener letras');
    if (dni && !esDniValido(dni)) errs.push('El DNI debe tener entre 7 y 8 números');
    if (email && !esEmailValido(email)) errs.push('El correo no tiene un formato válido');
    if (telefono && !esTelefonoValido(telefono)) errs.push('El teléfono tiene un formato inválido');

    return errs;
  };

  const erroresFormulario = obtenerErrores();

  const handleGuardar = () => {
    if (erroresFormulario.length > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.back();
    }, 1500);
  };
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

            <FormField label="Email docente">
              <Input
                iconName="mail-outline"
                placeholder="docente@escuela.edu.ar"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </FormField>

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

            <SelectInput label="Materia que dicta" iconName="menu-book" placeholder="Seleccionar materia..." value={materia} options={MATERIAS} onChange={(value) => setMateria(String(value))} />
            <SelectInput label="Grado / Año asignado" iconName="school" placeholder="Seleccionar grado..." value={grado} options={GRADOS} onChange={(value) => setGrado(String(value))} />
            <SelectInput label="División" iconName="class" placeholder="Seleccionar división..." value={division} options={DIVISIONES} onChange={(value) => setDivision(String(value))} />
            <SelectInput label="Turno" iconName="schedule" placeholder="Seleccionar turno..." value={turno} options={TURNOS} onChange={(value) => setTurno(String(value))} />
          </View>
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
  heroBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: `${Colors.white}CC`,
    lineHeight: 18,
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
