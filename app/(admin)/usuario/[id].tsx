import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { Colors } from '@/constants/Colors';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { getUsuario, inhabilitarUsuario } from '@/services/userService';
import type { ApiUser } from '@/types/auth';
import { getSession } from '@/utils/session';
import { colorPorRol, etiquetaRol } from '@/utils/usuarios';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UsuarioDetalleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [usuario, setUsuario] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [inhabilitando, setInhabilitando] = useState(false);
  const [error, setError] = useState('');

  const cargarUsuario = useCallback(async () => {
    if (!id) {
      setError('No se indicó el usuario.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await getSession();

      if (!session || session.rol !== 'administrador') {
        router.replace('/login');
        return;
      }

      const data = await getUsuario(id);
      setUsuario(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err.status === 403) {
          setError('No tenés permisos para ver este usuario.');
          return;
        }
        if (err.status === 404) {
          setError('Usuario no encontrado.');
          return;
        }
      }

      setError(mensajeDeError(err, 'No se pudo cargar el detalle del usuario.'));
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      cargarUsuario();
    }, [cargarUsuario])
  );

  const inhabilitar = async () => {
    if (!id) {
      return;
    }

    setInhabilitando(true);

    try {
      await inhabilitarUsuario(id);

      Alert.alert('Usuario inhabilitado', 'El usuario no podrá iniciar sesión.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.replace('/login');
        return;
      }

      Alert.alert('Error', mensajeDeError(err, 'No se pudo inhabilitar el usuario.'));
    } finally {
      setInhabilitando(false);
    }
  };

  const confirmarInhabilitacion = () => {
    if (!usuario) {
      return;
    }

    const nombre = `${usuario.firstName} ${usuario.lastName}`.trim();

    Alert.alert(
      'Inhabilitar usuario',
      `¿Estás seguro de que deseas inhabilitar a ${nombre}? Esta acción no se puede deshacer desde la app.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Inhabilitar', style: 'destructive', onPress: inhabilitar },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Usuario</Text>
          {id ? (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/(admin)/usuario/[id]/editar' as any,
                params: { id },
              })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="edit" size={22} color={Colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={40} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={cargarUsuario}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : usuario ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.perfil}>
              <View style={[styles.avatar, { backgroundColor: colorPorRol(usuario.role) }]}>
                <Text style={styles.avatarText}>
                  {usuario.firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.nombre}>
                {`${usuario.firstName} ${usuario.lastName}`.trim()}
              </Text>
              <View style={styles.rolChip}>
                <Text style={styles.rolChipText}>{etiquetaRol(usuario.role)}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Información del usuario</Text>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Nombre</Text>
                <Text style={styles.filaValue}>{usuario.firstName}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Apellido</Text>
                <Text style={styles.filaValue}>{usuario.lastName}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Rol</Text>
                <Text style={styles.filaValue}>{etiquetaRol(usuario.role)}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>ID</Text>
                <Text style={[styles.filaValue, styles.idValue]} selectable>
                  {usuario.id}
                </Text>
              </View>
            </View>

            {id ? (
              <PrimaryButton
                title="Editar usuario"
                onPress={() => router.push({
                  pathname: '/(admin)/usuario/[id]/editar' as any,
                  params: { id },
                })}
              />
            ) : null}

            <TouchableOpacity
              style={styles.destructiveButton}
              activeOpacity={0.8}
              disabled={inhabilitando}
              onPress={confirmarInhabilitacion}
            >
              {inhabilitando ? (
                <ActivityIndicator color={Colors.error} />
              ) : (
                <>
                  <MaterialIcons name="block" size={20} color={Colors.error} />
                  <Text style={styles.destructiveButtonText}>Inhabilitar usuario</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  errorText: { fontSize: 14, color: Colors.secondary, textAlign: 'center' },
  retryButton: {
    marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 8,
  },
  retryButtonText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  scrollContent: { padding: 16, gap: 16 },
  perfil: { alignItems: 'center', paddingVertical: 16 },
  avatar: {
    width: 88, height: 88, borderRadius: 44, alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: Colors.white, fontSize: 36, fontWeight: '700' },
  nombre: { fontSize: 20, fontWeight: '700', color: Colors.neutral, textAlign: 'center' },
  rolChip: {
    marginTop: 8, backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  rolChipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  infoCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceVariant, gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral, marginBottom: 4 },
  fila: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceVariant, paddingTop: 12,
  },
  filaLabel: { fontSize: 14, color: Colors.secondary },
  filaValue: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.neutral, textAlign: 'right' },
  idValue: { fontSize: 12 },
  destructiveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16, paddingVertical: 14, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.error, backgroundColor: `${Colors.error}10`,
  },
  destructiveButtonText: { fontSize: 15, fontWeight: '600', color: Colors.error },
});
