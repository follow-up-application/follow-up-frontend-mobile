import { Input } from '@/components/atoms/Input';
import { Colors } from '@/constants/Colors';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { getAlumnosByTutor, getTutor } from '@/services/tutorService';
import type { Alumno } from '@/types/alumno';
import { getSession } from '@/utils/session';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORES_AVATAR = ['#6750A4', '#B3261E', '#386A20', '#625B71', '#E65100', Colors.primary];

function colorPorIndice(indice: number) {
  return COLORES_AVATAR[indice % COLORES_AVATAR.length];
}

function formatearDni(dni: number) {
  return String(dni).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function AlumnosTutorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [tutorNombre, setTutorNombre] = useState('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async (esRefresh = false) => {
    if (!id) {
      setError('No se indicó el tutor.');
      setLoading(false);
      return;
    }

    if (esRefresh) setRefrescando(true);
    else setLoading(true);
    setError('');

    try {
      const session = await getSession();

      if (!session || (session.rol !== 'administrador' && session.rol !== 'tutor')) {
        router.replace('/login');
        return;
      }

      const [tutor, data] = await Promise.all([
        getTutor(id),
        getAlumnosByTutor(id),
      ]);

      setTutorNombre(`${tutor.first_name} ${tutor.last_name}`.trim());
      setAlumnos(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err.status === 403) {
          setError('No tenés permisos para ver los alumnos de este tutor.');
          return;
        }
        if (err.status === 404) {
          setError('Tutor no encontrado.');
          return;
        }
      }

      setError(mensajeDeError(err, 'No se pudo cargar la lista de alumnos.'));
    } finally {
      setLoading(false);
      setRefrescando(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const alumnosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase();

    if (!consulta) return alumnos;

    return alumnos.filter((alumno) => {
      const nombre = `${alumno.first_name} ${alumno.last_name}`.toLowerCase();
      const dni = String(alumno.dni);
      const curso = (alumno.curso_division ?? '').toLowerCase();
      const username = (alumno.username ?? '').toLowerCase();

      return nombre.includes(consulta) || dni.includes(consulta)
        || curso.includes(consulta) || username.includes(consulta);
    });
  }, [alumnos, busqueda]);

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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>Alumnos del Tutor</Text>
            {tutorNombre ? <Text style={styles.headerSubtitle} numberOfLines={1}>{tutorNombre}</Text> : null}
          </View>
          <View style={{ width: 24 }} />
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
          <>
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.listTitle}>Alumnos a cargo</Text>
                <Text style={styles.listCount}>
                  {alumnosFiltrados.length} de {alumnos.length} alumnos
                </Text>
              </View>
              <MaterialIcons name="groups" size={24} color={Colors.primary} />
            </View>

            <View style={styles.searchContainer}>
              <Input
                iconName="search"
                placeholder="Buscar por nombre, DNI, curso o usuario"
                value={busqueda}
                onChangeText={setBusqueda}
                autoCapitalize="none"
              />
            </View>

            <FlatList
              data={alumnosFiltrados}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom + 24 },
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={refrescando}
                  onRefresh={() => cargar(true)}
                  colors={[Colors.primary]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons
                    name={busqueda.trim() ? 'search-off' : 'groups'}
                    size={36}
                    color={Colors.secondary}
                  />
                  <Text style={styles.emptyText}>
                    {busqueda.trim()
                      ? 'No se encontraron alumnos con esa búsqueda.'
                      : 'Este tutor no tiene alumnos asignados.'}
                  </Text>
                </View>
              }
              renderItem={({ item, index }) => (
                <View style={styles.alumnoCard}>
                  <View style={[styles.avatar, { backgroundColor: colorPorIndice(index) }]}>
                    <Text style={styles.avatarText}>
                      {item.first_name.charAt(0).toUpperCase()}
                      {item.last_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.alumnoInfo}>
                    <Text style={styles.alumnoName}>
                      {item.first_name} {item.last_name}
                    </Text>
                    <View style={styles.datoRow}>
                      <MaterialIcons name="badge" size={13} color={Colors.secondary} />
                      <Text style={styles.alumnoDato}>DNI {formatearDni(item.dni)}</Text>
                    </View>
                    {item.curso_division ? (
                      <View style={styles.datoRow}>
                        <MaterialIcons name="class" size={13} color={Colors.secondary} />
                        <Text style={styles.alumnoDato}>{item.curso_division}</Text>
                      </View>
                    ) : null}
                    {item.username ? (
                      <View style={styles.datoRow}>
                        <MaterialIcons name="alternate-email" size={13} color={Colors.secondary} />
                        <Text style={styles.alumnoDato}>{item.username}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}
            />
          </>
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
  headerTextContainer: { flex: 1, alignItems: 'center', marginHorizontal: 16 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.neutral },
  headerSubtitle: { fontSize: 12, color: Colors.secondary, marginTop: 2 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  errorText: { fontSize: 14, color: Colors.secondary, textAlign: 'center' },
  retryButton: {
    marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 8,
  },
  retryButtonText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant,
  },
  listTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral },
  listCount: { fontSize: 12, color: Colors.secondary, marginTop: 2 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white },
  listContent: { padding: 16, backgroundColor: Colors.white, flexGrow: 1 },
  alumnoCard: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant, gap: 12,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  alumnoInfo: { flex: 1 },
  alumnoName: { fontSize: 15, fontWeight: '700', color: Colors.neutral, marginBottom: 4 },
  datoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  alumnoDato: { fontSize: 12, color: Colors.secondary, flexShrink: 1 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 13, color: Colors.secondary, textAlign: 'center' },
});
