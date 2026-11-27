import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import ValidationCard from '@/components/molecules/ValidationCard';
import { Colors } from '@/constants/Colors';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { crearTutor } from '@/services/tutorService';
import type { CreateTutorRequest } from '@/types/tutor';
import { getSession } from '@/utils/session';
import {
  esDniValido,
  esEmailValido,
  esNombreValido,
  esTelefonoValido,
} from '@/utils/validations';
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

type Errores = {
  firstName?: string;
  lastName?: string;
  dni?: string;
  telephone?: string;
  email?: string;
  password?: string;
};

export default function CargarTutorScreen() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<Errores>({});

  useEffect(() => {
    let activo = true;

    (async () => {
      const session = await getSession();

      if (!activo) return;

      if (!session || session.rol !== 'administrador') {
        router.replace('/login');
        return;
      }

      setVerificando(false);
    })();

    return () => {
      activo = false;
    };
  }, [router]);

  const obtenerErrores = () => {
    const campos: Errores = {};

    if (!firstName.trim()) campos.firstName = 'El nombre es requerido';
    else if (!esNombreValido(firstName)) campos.firstName = 'El nombre solo puede contener letras';

    if (!lastName.trim()) campos.lastName = 'El apellido es requerido';
    else if (!esNombreValido(lastName)) campos.lastName = 'El apellido solo puede contener letras';

    if (!dni.trim()) campos.dni = 'El DNI es requerido';
    else if (!esDniValido(dni)) campos.dni = 'El DNI debe tener entre 7 y 8 números';

    if (!telephone.trim()) campos.telephone = 'El teléfono es requerido';
    else if (!esTelefonoValido(telephone)) campos.telephone = 'El teléfono tiene un formato inválido';

    if (!email.trim()) campos.email = 'El email es requerido';
    else if (!esEmailValido(email)) campos.email = 'El email tiene un formato inválido';

    if (password.trim() && password.trim().length < 8) {
      campos.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    return {
      campos,
      lista: Object.values(campos).filter((mensaje): mensaje is string => Boolean(mensaje)),
    };
  };

  const validacion = obtenerErrores();

  const handleGuardar = async () => {
    if (verificando || saving) return;

    setErrorGeneral('');
    setErrores(validacion.campos);

    if (validacion.lista.length > 0) return;

    const request: CreateTutorRequest = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      dni: Number(dni.trim()),
      telephone: telephone.trim(),
      email: email.trim().toLowerCase(),
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    setSaving(true);

    try {
      await crearTutor(request);

      Alert.alert('Tutor creado', 'El tutor se registró correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }

        const erroresApi = err.errors
          ? Object.values(err.errors).flat().join(' ')
          : '';

        setErrorGeneral(
          erroresApi ||
            (err.status === 403
              ? 'No tenés permisos para crear tutores.'
              : mensajeDeError(err, 'No se pudo crear el tutor.'))
        );
        return;
      }

      setErrorGeneral(mensajeDeError(err, 'No se pudo crear el tutor.'));
    } finally {
      setSaving(false);
    }
  };

  if (verificando) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.neutral} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cargar Tutor</Text>
        <View style={styles.avatarSmall}>
          <MaterialIcons name="supervisor-account" size={18} color={Colors.onPrimary} />
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
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Alta directa: no requiere código institucional. Si no cargás contraseña, el tutor
              usará su DNI.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person-outline" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>DATOS PERSONALES</Text>
            </View>

            <FormField label="Nombre" errorMessage={errores.firstName}>
              <Input
                iconName="person-outline"
                placeholder="Ej: Luis"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!saving}
              />
            </FormField>

            <FormField label="Apellido" errorMessage={errores.lastName}>
              <Input
                iconName="person-outline"
                placeholder="Ej: Martínez"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!saving}
              />
            </FormField>

            <FormField label="DNI" errorMessage={errores.dni}>
              <Input
                iconName="badge"
                placeholder="Ej: 33445566"
                value={dni}
                onChangeText={setDni}
                keyboardType="numeric"
                editable={!saving}
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-mail" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>CONTACTO Y ACCESO</Text>
            </View>

            <FormField label="Teléfono" errorMessage={errores.telephone}>
              <Input
                iconName="phone"
                placeholder="Ej: 3513334444"
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
                editable={!saving}
              />
            </FormField>

            <FormField label="Email" errorMessage={errores.email}>
              <Input
                iconName="email"
                placeholder="Ej: luis@mail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
            </FormField>

            <FormField label="Contraseña (opcional)" errorMessage={errores.password}>
              <Input
                iconName="lock"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChangeText={setPassword}
                isPassword
                editable={!saving}
              />
            </FormField>
          </View>

          {errorGeneral ? (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={20} color={Colors.error} />
              <Text style={styles.errorCardText}>{errorGeneral}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <ValidationCard errors={validacion.lista} />
            <PrimaryButton
              title="Guardar Tutor"
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
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.background,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral, flex: 1, marginLeft: 12 },
  avatarSmall: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: `${Colors.primary}12`,
    borderRadius: 12, padding: 12, marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.secondary, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.secondary, letterSpacing: 0.8 },
  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${Colors.error}12`,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorCardText: { flex: 1, fontSize: 13, color: Colors.error, fontWeight: '500' },
  actions: { gap: 12, marginTop: 8 },
  primaryBtn: { borderRadius: 24 },
  outlinedBtn: { borderRadius: 24 },
});
