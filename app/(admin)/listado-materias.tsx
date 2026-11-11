import { getCursosDivisionTurno } from '@/services/cursoDivisionTurnoService';
import { getDocentes } from '@/services/docenteService';
import { deleteMateria, getMaterias } from '@/services/materiaService';
import type { CursoDivisionTurno } from '@/types/cursoDivisionTurno';
import type { Docente } from '@/types/docente';
import type { Materia } from '@/types/materia';
import { Colors } from '@/constants/Colors';
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
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PALETA = ['#6750A4', '#B3261E', '#386A20', '#625B71', '#E65100'];

function colorPorIndice(index: number): string {
  return PALETA[index % PALETA.length];
}

export default function ListadoMateriasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [busqueda, setBusqueda] = useState('');
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [cursos, setCursos] = useState<CursoDivisionTurno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // /docentes y /cursoDivisionTurno no incluyen nombre de docente ni "1° A - Mañana"
  // en cada materia, así que los cruzamos en el cliente para no mostrar UUIDs.
  const nombreDocente = useMemo(() => {
    const mapa = new Map<string, string>();

    for (const docente of docentes) {
      mapa.set(docente.id, `${docente.first_name} ${docente.last_name}`);
    }

    return (id: string) => mapa.get(id) ?? 'Docente no asignado';
  }, [docentes]);

  const etiquetaCurso = useMemo(() => {
    const mapa = new Map<number, string>();

    for (const curso of cursos) {
      mapa.set(curso.id, `${curso.curso}° ${curso.division} - ${curso.turno}`);
    }

    return (id: number) => mapa.get(id) ?? `Curso ${id}`;
  }, [cursos]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Las listas de apoyo son opcionales: si fallan, el listado igual se muestra.
      const [listaMaterias, listaDocentes, listaCursos] = await Promise.all([
        getMaterias(),
        getDocentes().catch(() => [] as Docente[]),
        getCursosDivisionTurno().catch(() => [] as CursoDivisionTurno[]),
      ]);

      setMaterias(listaMaterias);
      setDocentes(listaDocentes);
      setCursos(listaCursos);
    } catch {
      setError('No se pudo cargar el listado de materias.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Se recarga al volver a la pantalla (ej. después de crear o editar en
  // 'cargar-materia' y volver con router.back()).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return materias;
    }

    return materias.filter((materia) => {
      const docente = nombreDocente(materia.docente_id).toLowerCase();

      return (
        materia.nombre.toLowerCase().includes(texto) ||
        materia.descripcion.toLowerCase().includes(texto) ||
        docente.includes(texto) ||
        etiquetaCurso(materia.curso_division_turno_id).toLowerCase().includes(texto)
      );
    });
  }, [busqueda, materias, nombreDocente, etiquetaCurso]);

  const eliminarMateria = async (materia: Materia) => {
    // UI optimista: la sacamos de la lista y, si el DELETE falla, la restauramos.
    const previas = materias;
    setMaterias((prev) => prev.filter((item) => item.id !== materia.id));

    try {
      await deleteMateria(materia.id);
    } catch {
      setMaterias(previas);
      Alert.alert('Error', `No se pudo eliminar "${materia.nombre}". Intenta nuevamente.`);
    }
  };

  const confirmarEliminacion = (materia: Materia) => {
    Alert.alert(
      'Eliminar Materia',
      `¿Estás seguro de que deseas eliminar "${materia.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Eliminar',
          onPress: () => eliminarMateria(materia),
          style: 'destructive',
        },
      ]
    );
  };

  const renderRightActions = (materia: Materia) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => confirmarEliminacion(materia)}
    >
      <MaterialIcons name="delete-outline" size={28} color={Colors.white} />
      <Text style={styles.deleteActionText}>Eliminar</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listado de Materias</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, docente o curso..."
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
            <TouchableOpacity style={styles.retryButton} onPress={cargar}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtradas}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
            refreshing={loading}
            onRefresh={cargar}
            renderItem={({ item, index }) => (
              <Swipeable renderRightActions={() => renderRightActions(item)}>
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={1}
                  onPress={() =>
                    router.push({
                      pathname: '/(admin)/cargar-materia',
                      params: { edit: 'true', id: item.id.toString() },
                    })
                  }
                >
                  <View style={[styles.avatar, { backgroundColor: colorPorIndice(index) }]}>
                    <MaterialIcons name="menu-book" size={22} color={Colors.white} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.nombre}
                    </Text>
                    <Text style={styles.details} numberOfLines={1}>
                      {nombreDocente(item.docente_id)}
                    </Text>
                    <View style={styles.cursoChip}>
                      <Text style={styles.cursoChipText}>
                        {etiquetaCurso(item.curso_division_turno_id)}
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
                <MaterialIcons name="menu-book" size={48} color={Colors.surfaceVariant} />
                <Text style={styles.emptyText}>
                  {busqueda ? 'No se encontraron materias' : 'Todavía no hay materias cargadas'}
                </Text>
              </View>
            }
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 16 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/cargar-materia')}
        >
          <MaterialIcons name="add" size={28} color={Colors.white} />
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
    borderBottomWidth: 1, borderColor: Colors.surfaceVariant,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral },
  searchContainer: {
    padding: 16, backgroundColor: Colors.surface, borderBottomWidth: 1,
    borderColor: Colors.surfaceVariant,
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
  cardInfo: { flex: 1 },
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