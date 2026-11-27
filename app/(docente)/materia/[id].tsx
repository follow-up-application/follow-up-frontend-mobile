import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#4A6FA5';

interface AlumnoInscripto {
  id: string;
  nombre: string;
  legajo: string;
  avatarColor: string;
}

const mockAlumnos: AlumnoInscripto[] = [
  { id: '1', nombre: 'Alonso, Mateo', legajo: '#29402', avatarColor: '#6750A4' },
  { id: '2', nombre: 'Benítez, Rosa', legajo: '#29405', avatarColor: '#B3261E' },
  { id: '3', nombre: 'Castillo, Juan', legajo: '#29410', avatarColor: '#386A20' },
  { id: '4', nombre: 'Díaz, Martina', legajo: '#29412', avatarColor: '#625B71' },
  { id: '5', nombre: 'Estrada, Lucas', legajo: '#29415', avatarColor: '#E65100' },
  { id: '6', nombre: 'Fernández, Ana', legajo: '#29420', avatarColor: PRIMARY },
];

export default function MateriaDetalleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Params passed from materias list
  const nombreMateria = params.nombre || 'Detalle de Materia';
  const cursoMateria = params.curso || '';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>{nombreMateria}</Text>
            {cursoMateria ? <Text style={styles.headerSubtitle}>{cursoMateria}</Text> : null}
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Quick Actions (Hub) */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => router.push('/(docente)/asistencia')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: `${PRIMARY}15` }]}>
              <MaterialIcons name="fact-check" size={28} color={PRIMARY} />
            </View>
            <Text style={styles.actionText}>Asistencia</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => router.push('/(docente)/notas')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: `#13733315` }]}>
              <MaterialIcons name="grading" size={28} color="#137333" />
            </View>
            <Text style={styles.actionText}>Calificar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => router.push('/(docente)/crear-aviso')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: `${Colors.error}15` }]}>
              <MaterialIcons name="campaign" size={28} color={Colors.error} />
            </View>
            <Text style={styles.actionText}>Avisos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Lista de Alumnos */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Alumnos Inscriptos</Text>
          <Text style={styles.listCount}>{mockAlumnos.length} alumnos</Text>
        </View>

        <FlatList
          data={mockAlumnos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.alumnoCard} activeOpacity={0.7}>
              <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.avatarText}>{item.nombre.charAt(0)}</Text>
              </View>
              <View style={styles.alumnoInfo}>
                <Text style={styles.alumnoName}>{item.nombre}</Text>
                <Text style={styles.alumnoLegajo}>Legajo: {item.legajo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.obsButton}
                onPress={() => router.push('/(docente)/observacion')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="add-comment" size={20} color={PRIMARY} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 24,
    backgroundColor: Colors.white,
  },
  actionButton: {
    alignItems: 'center',
    width: 80,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
    textAlign: 'center',
  },
  divider: {
    height: 8,
    backgroundColor: Colors.surface,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral,
  },
  listCount: {
    fontSize: 14,
    color: Colors.secondary,
  },
  listContent: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  alumnoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  alumnoInfo: {
    flex: 1,
  },
  alumnoName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral,
    marginBottom: 2,
  },
  alumnoLegajo: {
    fontSize: 13,
    color: Colors.secondary,
  },
  obsButton: {
    padding: 8,
    backgroundColor: `${PRIMARY}10`,
    borderRadius: 8,
  },
});
