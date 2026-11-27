import { Colors } from '@/constants/Colors';
import { getDocentes, inhabilitarDocente } from '@/services/docenteService';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { docenteUsername } from '@/types/docente';
import type { Docente } from '@/types/docente';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

interface DocenteBase {
  id: string;
  nombre: string;
  dni: string;
  materias: string;
  avatarColor: string;
}

function nombreCompleto(docente: Docente): string {
  return `${docente.first_name} ${docente.last_name}`;
}

export default function ListadoDocentesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [busqueda, setBusqueda] = useState('');
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inhabilitandoId, setInhabilitandoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setDocentes(await getDocentes());
    } catch {
      setError('No se pudo cargar el listado de docentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return docentes;
    }

    return docentes.filter((docente) => {
      const usuario = docente.username || docenteUsername(docente);

      return (
        nombreCompleto(docente).toLowerCase().includes(texto) ||
        String(docente.dni).includes(texto) ||
        usuario.toLowerCase().includes(texto) ||
        (docente.telephone ?? '').includes(texto)
      );
    });
  }, [busqueda, docentes]);

  const inhabilitar = async (docente: Docente) => {
    setInhabilitandoId(docente.id);

    try {
      await inhabilitarDocente(docente.id);
      setDocentes((prev) => prev.filter((item) => item.id !== docente.id));
      Alert.alert(
        'Docente inhabilitado',
        `${nombreCompleto(docente)} ya no podrá iniciar sesión.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err.status === 403) {
          Alert.alert('Error', 'No tenés permisos para inhabilitar docentes.');
          return;
        }
      }

      Alert.alert('Error', mensajeDeError(err, 'No se pudo inhabilitar el docente.'));
    } finally {
      setInhabilitandoId(null);
    }
  };

  const confirmarInhabilitacion = (docente: Docente) => {
    Alert.alert(
      'Inhabilitar docente',
      `¿Estás seguro de que deseas inhabilitar a ${nombreCompleto(docente)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Inhabilitar', style: 'destructive', onPress: () => inhabilitar(docente) },
      ]
    );
  };

  const renderRightActions = (docente: Docente) => (
    <TouchableOpacity
      style={styles.inhabilitarAction}
      disabled={inhabilitandoId === docente.id}
      onPress={() => confirmarInhabilitacion(docente)}
    >
      {inhabilitandoId === docente.id ? (
        <ActivityIndicator size="small" color={Colors.white} />
      ) : (
        <MaterialIcons name="block" size={28} color={Colors.white} />
      )}
      <Text style={styles.inhabilitarActionText}>Inhabilitar</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listado de Docentes</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, DNI o usuario..."
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
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={40} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={cargar}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
            refreshing={loading}
            onRefresh={cargar}
            renderItem={({ item, index }) => (
              <Swipeable renderRightActions={() => renderRightActions(item)}>
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={1}
                  onPress={() => router.push({
                    pathname: '/(admin)/docente/[id]' as any,
                    params: { id: item.id },
                  })}
                >
                  <View style={[styles.avatar, { backgroundColor: colorPorIndice(index) }]}>
                    <Text style={styles.avatarText}>
                      {item.first_name.charAt(0)}{item.last_name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.name} numberOfLines={1}>
                      {nombreCompleto(item)}
                    </Text>
                    <Text style={styles.details} numberOfLines={1}>
                      DNI: {item.dni}
                    </Text>
                    <View style={styles.usuarioChip}>
                      <Text style={styles.usuarioChipText} numberOfLines={1}>
                        {item.username || docenteUsername(item)}
                      </Text>
                    </View>
                  </View>
                  <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
                  </View>
                </TouchableOpacity>
              </Swipeable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="person-off" size={48} color={Colors.surfaceVariant} />
                <Text style={styles.emptyText}>
                  {busqueda ? 'No se encontraron docentes' : 'Todavía no hay docentes cargados'}
                </Text>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 16 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/cargar-docente')}
        >
          <MaterialIcons name="person-add" size={24} color={Colors.white} />
        </TouchableOpacity>
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
  listContent: { padding: 16, gap: 12 },
  centerContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 12,
  },
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
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  cardInfo: { flex: 1, justifyContent: 'center', paddingRight: 8 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.neutral, marginBottom: 4 },
  details: { fontSize: 13, color: Colors.secondary, marginBottom: 6 },
  usuarioChip: {
    backgroundColor: `${Colors.primary}15`, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, alignSelf: 'flex-start',
  },
  usuarioChipText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: Colors.secondary },
  fab: {
    position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
    shadowRadius: 4, elevation: 6,
  },
  inhabilitarAction: {
    backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center',
    width: 80, borderRadius: 12, marginLeft: 12,
  },
  inhabilitarActionText: { color: Colors.white, fontSize: 11, fontWeight: '600', marginTop: 4 },
});
