import { Input } from '@/components/atoms/Input';
import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { FormField } from '@/components/molecules/FormField';
import ValidationCard from '@/components/molecules/ValidationCard';
import { Colors } from '@/constants/Colors';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { getUsuario, updateUsuario } from '@/services/userService';
import type { UpdateUserRequest, UserRole } from '@/types/auth';
import { getSession } from '@/utils/session';
import { etiquetaRol } from '@/utils/usuarios';
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

const NOMBRE_MAX = 100;
const USERNAME_MAX = 255;

export default function EditarUsuarioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [username, setUsername] = useState('');
  const [rol, setRol] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [erroresServidor, setErroresServidor] = useState<Record<string, string>>({});

  const cargarUsuario = useCallback(async () => {
    if (!id) {
      setErrorGeneral('No se indicó el usuario.');
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

      const usuario = await getUsuario(id);
      setNombre(usuario.firstName);
      setApellido(usuario.lastName);
      setRol(usuario.role);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.replace('/login');
        return;
      }

      setErrorGeneral(mensajeDeError(err, 'No se pudo cargar el usuario a editar.'));
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      cargarUsuario();
    }, [cargarUsuario])
  );

  const errores: string[] = [];

  if (!nombre.trim()) {
    errores.push('El nombre es obligatorio');
  } else if (nombre.trim().length > NOMBRE_MAX) {
    errores.push(`El nombre no puede superar los ${NOMBRE_MAX} caracteres`);
  }

  if (!apellido.trim()) {
    errores.push('El apellido es obligatorio');
  } else if (apellido.trim().length > NOMBRE_MAX) {
    errores.push(`El apellido no puede superar los ${NOMBRE_MAX} caracteres`);
  }

  if (dni.trim() && !/^\d{7,8}$/.test(dni.trim())) {
    errores.push('El DNI debe tener entre 7 y 8 números');
  }

  const handleGuardar = async () => {
    if (!id || errores.length > 0) {
      return;
    }

    setSaving(true);
    setErrorGeneral('');
    setErroresServidor({});

    const payload: UpdateUserRequest = {
      first_name: nombre.trim(),
      last_name: apellido.trim(),
    };

    if (dni.trim()) {
      payload.dni = Number(dni.trim());
    }
    if (username.trim()) {
      payload.username = username.trim();
    }

    try {
      await updateUsuario(id, payload);

      Alert.alert('Usuario actualizado', 'Los cambios se guardaron correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.replace('/login');
        return;
      }

      setErrorGeneral(mensajeDeError(err, 'No se pudo actualizar el usuario.'));

      if (err instanceof ApiRequestError && err.errors) {
        const campos: Record<string, string> = {};

        Object.entries(err.errors).forEach(([campo, mensajes]) => {
          campos[campo] = mensajes[0];
        });

        setErroresServidor(campos);
      }
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
        <Text style={styles.headerTitle}>Editar Usuario</Text>
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
          <Text style={styles.sectionTitle}>Datos del usuario</Text>
          <Text style={styles.sectionSubtitle}>
            Modificá los campos que necesites y guardá los cambios.
          </Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>INFORMACIÓN PERSONAL</Text>
            </View>

            <FormField label="Nombre" errorMessage={erroresServidor.first_name}>
              <Input
                iconName="person"
                placeholder="Nombre del usuario"
                value={nombre}
                onChangeText={setNombre}
                maxLength={NOMBRE_MAX}
                autoCapitalize="words"
              />
            </FormField>

            <FormField label="Apellido" errorMessage={erroresServidor.last_name}>
              <Input
                iconName="person-outline"
                placeholder="Apellido del usuario"
                value={apellido}
                onChangeText={setApellido}
                maxLength={NOMBRE_MAX}
                autoCapitalize="words"
              />
            </FormField>

            <FormField label="DNI (opcional)" errorMessage={erroresServidor.dni}>
              <Input
                iconName="fingerprint"
                placeholder="7 u 8 números"
                value={dni}
                onChangeText={setDni}
                keyboardType="numeric"
                maxLength={8}
              />
              <Text style={styles.helperText}>Dejalo vacío para conservar el DNI actual.</Text>
            </FormField>

            <FormField label="Usuario (opcional)" errorMessage={erroresServidor.username}>
              <Input
                iconName="account-circle"
                placeholder="Nuevo nombre de usuario"
                value={username}
                onChangeText={setUsername}
                maxLength={USERNAME_MAX}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.helperText}>Dejalo vacío para conservar el usuario actual.</Text>
            </FormField>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="shield" size={16} color={Colors.secondary} />
              <Text style={styles.sectionLabel}>ROL</Text>
            </View>
            <View style={styles.rolCard}>
              <Text style={styles.rolLabel}>Rol asignado</Text>
              <Text style={styles.rolValue}>{rol ? etiquetaRol(rol) : '-'}</Text>
            </View>
            <Text style={styles.helperText}>El rol no se puede modificar desde esta pantalla.</Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 4,
    marginBottom: 12,
  },
  section: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 12,
    color: Colors.outline,
    marginTop: 6,
    marginLeft: 4,
  },
  rolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 52,
    marginTop: 8,
  },
  rolLabel: {
    fontSize: 14,
    color: Colors.secondary,
  },
  rolValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: `${Colors.error}10`,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  errorCardText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
  },
  actions: {
    marginTop: 8,
  },
  primaryBtn: {
    alignSelf: 'stretch',
  },
  outlinedBtn: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
});
