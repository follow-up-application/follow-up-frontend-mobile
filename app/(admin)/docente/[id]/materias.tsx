import { Colors } from '@/constants/Colors';
import { getCursosDivisionTurno } from '@/services/cursoDivisionTurnoService';
import { getDocente, getMateriasByDocente } from '@/services/docenteService';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import type { CursoDivisionTurno } from '@/types/cursoDivisionTurno';
import { docenteUsername } from '@/types/docente';
import type { Docente } from '@/types/docente';
import type { Materia } from '@/types/materia';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MateriasDocenteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cursos, setCursos] = useState<CursoDivisionTurno[]>([]);
  const [docente, setDocente] = useState<Docente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    if (!id) {
      setError('No se indicó el docente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [listaMaterias, listaCursos, datosDocente] = await Promise.all([
        getMateriasByDocente(id),
        getCursosDivisionTurno().catch(() => [] as CursoDivisionTurno[]),
        getDocente(id).catch(() => null),
      ]);

      setMaterias(listaMaterias);
      setCursos(listaCursos);
      setDocente(datosDocente);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err.status === 403) {
          setError('No tenés permisos para ver las materias de este docente.');
          return;
        }
        if (err.status === 404) {
          setError('Docente no encontrado.');
          return;
        }
      }

      setError(mensajeDeError(err, 'No se pudo cargar las materias del docente.'));
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const etiquetaCurso = useMemo(() => {
    const mapa = new Map<number, string>();

    for (const curso of cursos) {
      mapa.set(curso.id, `${curso.curso}° ${curso.division} - ${curso.turno}`);
    }

    return (cursoId: number) => mapa.get(cursoId) ?? `Curso ${cursoId}`;
  }, [cursos]);

  const nombreDocente = docente
    ? `${docente.first_name} ${docente.last_name}`.trim()
    : '';
  const usernameDocente = docente ? docente.username || docenteUsername(docente) : '';

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
          <Text style={styles.headerTitle}>Materias del Docente</Text>
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
            <TouchableOpacity style={styles.retryButton} onPress={cargar}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={materias}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
            refreshing={loading}
            onRefresh={cargar}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {docente ? (
                  <View style={styles.docenteHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {docente.first_name.charAt(0).toUpperCase()}
                        {docente.last_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.docenteInfo}>
                      <Text style={styles.docenteNombre}>{nombreDocente}</Text>
                      <Text style={styles.docenteUsuario}>{usernameDocente}</Text>
                    </View>
                  </View>
                ) : null}
                <Text style={styles.contador}>
                  {materias.length} {materias.length === 1 ? 'materia asignada' : 'materias asignadas'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="menu-book" size={24} color={Colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.nombre} numberOfLines={1}>
                    {item.nombre}
                  </Text>
                  <Text style={styles.descripcion} numberOfLines={2}>
                    {item.descripcion}
                  </Text>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {etiquetaCurso(item.curso_division_turno_id)} · {item.turno}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="menu-book" size={48} color={Colors.surfaceVariant} />
                <Text style={styles.emptyText}>El docente no tiene materias asignadas</Text>
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
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  errorText: { fontSize: 14, color: Colors.secondary, textAlign: 'center' },
  retryButton: {
    marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 8,
  },
  retryButtonText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  listContent: { padding: 16, gap: 12 },
  listHeader: { gap: 12, marginBottom: 4 },
  docenteHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.surfaceVariant,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center',
    justifyContent: 'center', marginRight: 12, backgroundColor: Colors.primary,
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  docenteInfo: { flex: 1 },
  docenteNombre: { fontSize: 16, fontWeight: '700', color: Colors.neutral },
  docenteUsuario: { fontSize: 12, color: Colors.secondary, marginTop: 2 },
  contador: { fontSize: 13, color: Colors.secondary },
  card: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: Colors.surfaceVariant,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 8, alignItems: 'center',
    justifyContent: 'center', marginRight: 12, backgroundColor: `${Colors.primary}15`,
  },
  cardInfo: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: '700', color: Colors.neutral, marginBottom: 4 },
  descripcion: { fontSize: 13, color: Colors.secondary, marginBottom: 8 },
  chip: {
    backgroundColor: `${Colors.primary}15`, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, alignSelf: 'flex-start',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: Colors.secondary },
});
