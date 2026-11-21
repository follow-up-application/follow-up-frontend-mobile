import { Colors } from '@/constants/Colors';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import {
  getUsuarios,
  getUsuariosInhabilitados,
  habilitarUsuario,
} from '@/services/userService';
import type { ApiUser } from '@/types/auth';
import { getSession } from '@/utils/session';
import { colorPorRol, etiquetaRol } from '@/utils/usuarios';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type EstadoUsuarios = 'activos' | 'inhabilitados';

export default function ListadoUsuariosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [estado, setEstado] = useState<EstadoUsuarios>('activos');
  const [busqueda, setBusqueda] = useState('');
  const [activos, setActivos] = useState<ApiUser[]>([]);
  const [inhabilitados, setInhabilitados] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [habilitandoId, setHabilitandoId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const cargarUsuarios = useCallback(async (modo: 'initial' | 'refresh' = 'initial') => {
    if (modo === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const session = await getSession();

      if (!session || session.rol !== 'administrador') {
        router.replace('/login');
        return;
      }

      const [activosData, inhabilitadosData] = await Promise.all([
        getUsuarios(),
        getUsuariosInhabilitados(),
      ]);

      setActivos(activosData);
      setInhabilitados(inhabilitadosData);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.replace('/login');
        return;
      }

      setError(mensajeDeError(err, 'No se pudo cargar el listado de usuarios.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, [cargarUsuarios])
  );

  const verInhabilitados = estado === 'inhabilitados';
  const usuarios = verInhabilitados ? inhabilitados : activos;
  const filtrados = usuarios.filter((usuario) => {
    const texto = `${usuario.firstName} ${usuario.lastName} ${etiquetaRol(usuario.role)}`.toLowerCase();

    return texto.includes(busqueda.trim().toLowerCase());
  });

  const habilitar = async (usuario: ApiUser) => {
    setHabilitandoId(usuario.id);

    try {
      await habilitarUsuario(usuario.id);
      setInhabilitados((prev) => prev.filter((u) => u.id !== usuario.id));
      setActivos((prev) => (prev.some((u) => u.id === usuario.id) ? prev : [...prev, usuario]));
      setEstado('activos');
      Alert.alert('Usuario habilitado', 'El usuario puede volver a iniciar sesión.');
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.replace('/login');
        return;
      }

      Alert.alert('Error', mensajeDeError(err, 'No se pudo habilitar el usuario.'));
    } finally {
      setHabilitandoId(null);
    }
  };

  const confirmarHabilitacion = (usuario: ApiUser) => {
    const nombre = `${usuario.firstName} ${usuario.lastName}`.trim();

    Alert.alert(
      'Habilitar usuario',
      `¿Querés volver a habilitar a ${nombre}? El usuario podrá iniciar sesión nuevamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Habilitar', onPress: () => habilitar(usuario) },
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
          <Text style={styles.headerTitle}>Listado de Usuarios</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o rol..."
              placeholderTextColor={Colors.outline}
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <MaterialIcons name="close" size={20} color={Colors.outline} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, !verInhabilitados && styles.tabActivo]}
              onPress={() => setEstado('activos')}
            >
              <Text style={[styles.tabText, !verInhabilitados && styles.tabTextActivo]}>
                Activos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, verInhabilitados && styles.tabActivo]}
              onPress={() => setEstado('inhabilitados')}
            >
              <Text style={[styles.tabText, verInhabilitados && styles.tabTextActivo]}>
                Inhabilitados
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.contador}>
            {filtrados.length} {filtrados.length === 1 ? 'usuario' : 'usuarios'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={40} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => cargarUsuarios()}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
            refreshing={refreshing}
            onRefresh={() => cargarUsuarios('refresh')}
            renderItem={({ item }) => {
              const nombreCompleto = `${item.firstName} ${item.lastName}`.trim();
              const contenido = (
                <>
                  <View style={[styles.avatar, { backgroundColor: colorPorRol(item.role) }]}>
                    <Text style={styles.avatarText}>{item.firstName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.name}>{nombreCompleto}</Text>
                    <View style={styles.rolChip}>
                      <Text style={styles.rolChipText}>{etiquetaRol(item.role)}</Text>
                    </View>
                  </View>
                </>
              );

              if (verInhabilitados) {
                return (
                  <View style={styles.card}>
                    {contenido}
                    <TouchableOpacity
                      style={styles.habilitarButton}
                      activeOpacity={0.8}
                      disabled={habilitandoId === item.id}
                      onPress={() => confirmarHabilitacion(item)}
                    >
                      {habilitandoId === item.id ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Text style={styles.habilitarButtonText}>Habilitar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/(admin)/usuario/[id]' as any,
                    params: { id: item.id },
                  })}
                >
                  {contenido}
                  <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="person-off" size={48} color={Colors.surfaceVariant} />
                <Text style={styles.emptyText}>
                  {verInhabilitados
                    ? 'No hay usuarios inhabilitados'
                    : 'No se encontraron usuarios'}
                </Text>
              </View>
            }
          />
        )}
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
  searchContainer: {
    padding: 16, backgroundColor: Colors.surface, borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceVariant,
    borderRadius: 8, paddingHorizontal: 12, height: 40,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: Colors.neutral },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.surfaceVariant,
    borderRadius: 8, padding: 3, marginTop: 12, gap: 4,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  tabActivo: { backgroundColor: Colors.white },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.secondary },
  tabTextActivo: { color: Colors.primary },
  contador: { marginTop: 8, fontSize: 12, color: Colors.secondary },
  listContent: { padding: 16, gap: 12 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  errorText: { fontSize: 14, color: Colors.secondary, textAlign: 'center' },
  retryButton: {
    marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 8,
  },
  retryButtonText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.surfaceVariant,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  cardInfo: { flex: 1, justifyContent: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.neutral },
  rolChip: {
    backgroundColor: `${Colors.primary}15`, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, alignSelf: 'flex-start',
  },
  rolChipText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  habilitarButton: {
    backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 8, minWidth: 80, alignItems: 'center',
    justifyContent: 'center',
  },
  habilitarButtonText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: Colors.secondary },
});
