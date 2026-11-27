import { Colors } from '@/constants/Colors';
import { getSession } from '@/utils/session';
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
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/config/api';


type AlumnoApi = {
  id: string;
  first_name: string;
  last_name: string;
  dni: number;
  username: string;
  curso_division: string;
  fecha_nacimiento: string;
  role: string;
};

const PALETA_AVATARES = ['#6750A4', '#B3261E', '#386A20', '#625B71', '#E65100'];

/** Formatea un DNI numérico con puntos de miles, ej: 34825255 -> '34.825.255' */
function formatearDni(dni: number): string {
  return dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function colorPorIndice(index: number): string {
  return PALETA_AVATARES[index % PALETA_AVATARES.length];
}

export default function ListadoAlumnosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [busqueda, setBusqueda] = useState('');
  const [alumnos, setAlumnos] = useState<AlumnoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarAlumnos = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const session = await getSession();

      if (!session?.token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/alumnos`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (response.status === 401) {
        router.replace('/login');
        return;
      }

      if (!response.ok) {
        setError('No se pudo cargar el listado de alumnos.');
        return;
      }

      const data: AlumnoApi[] = await response.json();
      setAlumnos(data);
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Se recarga cada vez que la pantalla vuelve a estar en foco (ej. después de
  // crear/editar un alumno en 'cargar-alumno' y volver con router.back()).
  useFocusEffect(
    useCallback(() => {
      cargarAlumnos();
    }, [cargarAlumnos])
  );

  const filtrados = alumnos.filter((a) => {
    const nombreCompleto = `${a.first_name} ${a.last_name}`.toLowerCase();
    const busquedaLower = busqueda.toLowerCase();

    return (
      nombreCompleto.includes(busquedaLower) ||
      a.dni.toString().includes(busqueda) ||
      a.curso_division.toLowerCase().includes(busquedaLower)
    );
  });

  const confirmarEliminacion = (id: string, nombre: string) => {
    Alert.alert(
      'Eliminar Alumno',
      `¿Estás seguro de que deseas eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Eliminar',
          onPress: () => eliminarAlumno(id),
          style: 'destructive',
        },
      ]
    );
  };

  const eliminarAlumno = async (id: string) => {
    // Optimistic UI: sacamos al alumno de la lista ya mismo...
    const alumnosPrevios = alumnos;
    setAlumnos((prev) => prev.filter((alumno) => alumno.id !== id));

    try {
      const session = await getSession();

      if (!session?.token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/alumnos/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (response.status === 401) {
        router.replace('/login');
        return;
      }

      if (!response.ok) {
        // ...y si falla, la restauramos y avisamos.
        setAlumnos(alumnosPrevios);
        Alert.alert('Error', 'No se pudo eliminar el alumno. Intenta nuevamente.');
      }
    } catch (err) {
      setAlumnos(alumnosPrevios);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  const renderRightActions = (id: string, nombre: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => confirmarEliminacion(id, nombre)}
      >
        <MaterialIcons name="delete-outline" size={28} color={Colors.white} />
        <Text style={styles.deleteActionText}>Eliminar</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listado de Alumnos</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, DNI o curso..."
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

        {/* Lista */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={40} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={cargarAlumnos}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
            refreshing={loading}
            onRefresh={cargarAlumnos}
            renderItem={({ item, index }) => {
              const nombreCompleto = `${item.first_name} ${item.last_name}`;

              return (
                <Swipeable renderRightActions={() => renderRightActions(item.id, nombreCompleto)}>
                  <TouchableOpacity
                    style={styles.card}
                    activeOpacity={1}
                    onPress={() => router.push({
                      pathname: '/(admin)/cargar-alumno',
                      params: { edit: 'true', id: item.id },
                    })}
                  >
                    <View style={[styles.avatar, { backgroundColor: colorPorIndice(index) }]}>
                      <Text style={styles.avatarText}>{item.first_name.charAt(0)}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.name}>{nombreCompleto}</Text>
                      <Text style={styles.details}>DNI: {formatearDni(item.dni)}</Text>
                      <View style={styles.cursoChip}>
                        <Text style={styles.cursoChipText}>{item.curso_division}</Text>
                      </View>
                    </View>
                    <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="person-off" size={48} color={Colors.surfaceVariant} />
                <Text style={styles.emptyText}>No se encontraron alumnos</Text>
              </View>
            }
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 16 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/cargar-alumno' as any)}
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
  cardInfo: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.neutral, marginBottom: 4 },
  details: { fontSize: 13, color: Colors.secondary, marginBottom: 6 },
  cursoChip: {
    backgroundColor: `${Colors.primary}15`, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, alignSelf: 'flex-start',
  },
  cursoChipText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: Colors.secondary },
  fab: {
    position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
    shadowRadius: 4, elevation: 6,
  },
  deleteAction: {
    backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center',
    width: 80, borderRadius: 12, marginLeft: 12,
  },
  deleteActionText: { color: Colors.white, fontSize: 11, fontWeight: '600', marginTop: 4 },
});