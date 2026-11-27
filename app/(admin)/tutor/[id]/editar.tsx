import { Input } from '@/components/atoms/Input';
import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { FormField } from '@/components/molecules/FormField';
import ValidationCard from '@/components/molecules/ValidationCard';
import { Colors } from '@/constants/Colors';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { getTutor, updateTutor } from '@/services/tutorService';
import type { UpdateTutorRequest } from '@/types/tutor';
import { getSession } from '@/utils/session';
import {
  esDniValido,
  esEmailValido,
  esNombreValido,
  esTelefonoValido,
} from '@/utils/validations';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Errores = {
  firstName?: string;
  lastName?: string;
  dni?: string;
  telephone?: string;
  email?: string;
  password?: string;
};

export default function EditarTutorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [erroresServidor, setErroresServidor] = useState<Errores>({});

  const cargarTutor = useCallback(async () => {
    if (!id) {
      setErrorGeneral('No se indicó el tutor.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorGeneral('');

    try {
      const session = await getSession();

      if (!session || session.rol !== 'administrador') {
        router.replace('/login');
        return;
      }

      const tutor = await getTutor(id);
      setFirstName(tutor.first_name);
      setLastName(tutor.last_name);
      setDni(String(tutor.dni));
      setTelephone(tutor.telephone);
      setEmail(tutor.email);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err.status === 403) {
          setErrorGeneral('No tenés permisos para editar este tutor.');
          return;
        }
        if (err.status === 404) {
          setErrorGeneral('Tutor no encontrado.');
          return;
        }
      }

      setErrorGeneral(mensajeDeError(err, 'No se pudo cargar el tutor a editar.'));
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      cargarTutor();
    }, [cargarTutor])
  );

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
    if (!id || validacion.lista.length > 0 || saving) return;

    setSaving(true);
    setErrorGeneral('');
    setErroresServidor({});

    const payload: UpdateTutorRequest = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      dni: Number(dni.trim()),
      telephone: telephone.trim(),
      email: email.trim().toLowerCase(),
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    try {
      await updateTutor(id, payload);

      Alert.alert('Tutor actualizado', 'Los cambios se guardaron correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err.status === 403) {
          setErrorGeneral('No tenés permisos para editar este tutor.');
          return;
        }
        if (err.errors) {
          const campos: Errores = {};

          Object.entries(err.errors).forEach(([campo, mensajes]) => {
            const clave = campo === 'first_name'
              ? 'firstName'
              : campo === 'last_name'
                ? 'lastName'
                : campo;

            campos[clave as keyof Errores] = mensajes[0];
          });

          setErroresServidor(campos);
        }
      }

      setErrorGeneral(mensajeDeError(err, 'No se pudo actualizar el tutor.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.neutral} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Tutor</Text>
        <View style={styles.avatarSmall}>
          <MaterialIcons name="edit" size={18} color={Colors.onPrimary} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Datos del tutor</Text>
          <Text style={styles.sectionSubtitle}>
            Modificá los campos que necesites y guardá los cambios.
          </Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>INFORMACIÓN PERSONAL</Text>
            </View>

            <FormField label="Nombre" errorMessage={erroresServidor.firstName}>
              <Input
                iconName="person-outline"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </FormField>

            <FormField label="Apellido" errorMessage={erroresServidor.lastName}>
              <Input
                iconName="person-outline"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </FormField>

            <FormField label="DNI" errorMessage={erroresServidor.dni}>
              <Input
                iconName="badge"
                value={dni}
                onChangeText={setDni}
                keyboardType="numeric"
                maxLength={8}
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-mail" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>CONTACTO Y ACCESO</Text>
            </View>

            <FormField label="Teléfono" errorMessage={erroresServidor.telephone}>
              <Input
                iconName="phone"
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
              />
            </FormField>

            <FormField label="Email" errorMessage={erroresServidor.email}>
              <Input
                iconName="email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.helperText}>El email es el usuario del tutor.</Text>
            </FormField>

            <FormField label="Contraseña (opcional)" errorMessage={erroresServidor.password}>
              <Input
                iconName="lock"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
              <Text style={styles.helperText}>Dejalo vacío para conservar la contraseña actual.</Text>
            </FormField>
          </View>

          {errorGeneral.length > 0 && (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={20} color={Colors.error} />
              <Text style={styles.errorCardText}>{errorGeneral}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <ValidationCard errors={validacion.lista} />
            <PrimaryButton
              title="Guardar Cambios"
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral, flex: 1, marginLeft: 12 },
  avatarSmall: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.neutral, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: Colors.secondary, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.secondary, letterSpacing: 0.8 },
  helperText: { fontSize: 12, color: Colors.secondary, marginTop: 6, marginLeft: 4 },
  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${Colors.error}12`,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorCardText: { flex: 1, fontSize: 13, color: Colors.error, fontWeight: '500' },
  actions: { gap: 12, marginTop: 8 },
  primaryBtn: { borderRadius: 24 },
  outlinedBtn: { borderRadius: 24 },
});
