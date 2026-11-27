import { Colors } from '@/constants/Colors';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { getTutores } from '@/services/tutorService';
import type { Tutor } from '@/types/tutor';
import { getSession } from '@/utils/session';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PALETA_AVATARES = ['#6750A4', '#B3261E', '#386A20', '#625B71', '#E65100'];

function colorPorIndice(index: number): string {
  return PALETA_AVATARES[index % PALETA_AVATARES.length];
}

function formatearDni(dni: number): string {
  return dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function ListadoTutoresScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async (modo: 'initial' | 'refresh' = 'initial') => {
    if (modo === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const session = await getSession();

      if (!session || session.rol !== 'administrador') {
        router.replace('/login');
        return;
      }

      setTutores(await getTutores());
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.replace('/login');
        return;
      }

      setError(mensajeDeError(err, 'No se pudo cargar el listado de tutores.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const filtrados = tutores.filter((tutor) => {
    const texto = `${tutor.first_name} ${tutor.last_name} ${tutor.dni} ${tutor.email} ${tutor.telephone}`.toLowerCase();

    return texto.includes(busqueda.trim().toLowerCase());
  });

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
          <Text style={styles.headerTitle}>Listado de Tutores</Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/cargar-tutor' as any)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="person-add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, DNI o email..."
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
          <Text style={styles.contador}>
            {filtrados.length} {filtrados.length === 1 ? 'tutor' : 'tutores'}
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
            <TouchableOpacity style={styles.retryButton} onPress={() => cargar()}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
            refreshing={refreshing}
            onRefresh={() => cargar('refresh')}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push({
                  pathname: '/(admin)/tutor/[id]' as any,
                  params: { id: item.id },
                })}
              >
                <View style={[styles.avatar, { backgroundColor: colorPorIndice(index) }]}>
                  <Text style={styles.avatarText}>
                    {item.first_name.charAt(0).toUpperCase()}
                    {item.last_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.name}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <View style={styles.datosRow}>
                    <MaterialIcons name="badge" size={14} color={Colors.secondary} />
                    <Text style={styles.dato}>DNI {formatearDni(item.dni)}</Text>
                  </View>
                  <View style={styles.datosRow}>
                    <MaterialIcons name="email" size={14} color={Colors.secondary} />
                    <Text style={styles.dato} numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                  <View style={styles.datosRow}>
                    <MaterialIcons name="phone" size={14} color={Colors.secondary} />
                    <Text style={styles.dato}>{item.telephone}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="supervisor-account" size={48} color={Colors.surfaceVariant} />
                <Text style={styles.emptyText}>
                  {busqueda ? 'No se encontraron tutores' : 'No hay tutores registrados'}
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
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  cardInfo: { flex: 1, gap: 4 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.neutral, marginBottom: 2 },
  datosRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dato: { flex: 1, fontSize: 12, color: Colors.secondary },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: Colors.secondary },
});
