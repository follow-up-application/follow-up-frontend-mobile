import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';

interface DocenteBase {
  id: string;
  nombre: string;
  dni: string;
  materias: string;
  avatarColor: string;
}

const mockDocentesInicial: DocenteBase[] = [
  { id: '1', nombre: 'Prof. Adrián López', dni: '32.123.456', materias: 'Matemáticas Avanzadas', avatarColor: '#6750A4' },
  { id: '2', nombre: 'Prof. Beatriz Torres', dni: '34.234.567', materias: 'Literatura, Prácticas del Lenguaje', avatarColor: '#B3261E' },
  { id: '3', nombre: 'Prof. Carlos Gómez', dni: '30.345.678', materias: 'Física, Química', avatarColor: '#386A20' },
  { id: '4', nombre: 'Prof. Daniela Ruiz', dni: '28.567.890', materias: 'Inglés I, Inglés II', avatarColor: '#625B71' },
];

export default function ListadoDocentesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [busqueda, setBusqueda] = useState('');
  const [docentes, setDocentes] = useState(mockDocentesInicial);

  const filtrados = docentes.filter(
    (d) =>
      d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.dni.includes(busqueda) ||
      d.materias.toLowerCase().includes(busqueda.toLowerCase())
  );

  const confirmarEliminacion = (id: string, nombre: string) => {
    Alert.alert(
      "Eliminar Docente",
      `¿Estás seguro de que deseas eliminar al ${nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Eliminar",
          onPress: () => setDocentes((prev) => prev.filter(docente => docente.id !== id)),
          style: "destructive"
        }
      ]
    );
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
          <Text style={styles.headerTitle}>Listado de Docentes</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, DNI o materia..."
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
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item.id, item.nombre)}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={1}
                onPress={() => router.push({
                  pathname: '/(admin)/cargar-docente',
                  params: { edit: 'true', id: item.id }
                })}
              >
                <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                  <Text style={styles.avatarText}>{item.nombre.split(' ')[1]?.charAt(0) || item.nombre.charAt(0)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.name}>{item.nombre}</Text>
                  <Text style={styles.details}>DNI: {item.dni}</Text>
                  <View style={styles.materiaChip}>
                    <Text style={styles.materiaChipText} numberOfLines={1}>{item.materias}</Text>
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
              <Text style={styles.emptyText}>No se encontraron docentes</Text>
            </View>
          }
        />

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 16 }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/cargar-docente' as any)}
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
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.surfaceVariant,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  cardInfo: { flex: 1, justifyContent: 'center', paddingRight: 8 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.neutral, marginBottom: 4 },
  details: { fontSize: 13, color: Colors.secondary, marginBottom: 6 },
  materiaChip: {
    backgroundColor: `${Colors.primary}15`, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, alignSelf: 'flex-start',
  },
  materiaChipText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
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