import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#6750A4';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

type ScheduleItem = {
  id: string;
  type: 'class' | 'break';
  materia?: string;
  aula?: string;
  profesor?: string;
  horaInicio: string;
  horaFin: string;
  activo?: boolean;
  title?: string;
};

const mockSchedule: ScheduleItem[] = [
  {
    id: '1',
    type: 'class',
    materia: 'Matemáticas Avanzadas',
    aula: 'Aula 102 - Edificio B',
    profesor: 'Prof. Alejandro Vargas',
    horaInicio: '08:00',
    horaFin: '09:30',
    activo: true,
  },
  {
    id: '2',
    type: 'class',
    materia: 'Física Aplicada',
    aula: 'Laboratorio 3',
    profesor: 'Dra. Elena Martínez',
    horaInicio: '10:00',
    horaFin: '11:30',
  },
  {
    id: '3',
    type: 'class',
    materia: 'Historia Universal',
    aula: 'Aula 205',
    profesor: 'Lic. Ricardo Solís',
    horaInicio: '11:45',
    horaFin: '13:15',
  },
  {
    id: '4',
    type: 'break',
    title: 'Receso de Almuerzo',
    horaInicio: '13:15',
    horaFin: '14:15',
  },
  {
    id: '5',
    type: 'class',
    materia: 'Programación I',
    aula: 'Sala de Cómputo A',
    profesor: 'Ing. Claudia Ruiz',
    horaInicio: '14:15',
    horaFin: '15:45',
  },
];

export default function HorariosAlumnoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeDia, setActiveDia] = useState('Lunes');

  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => {
    if (item.type === 'break') {
      return (
        <View style={styles.breakCard}>
          <MaterialIcons name="local-cafe" size={20} color={Colors.secondary} />
          <Text style={styles.breakText}>
            {item.title} ({item.horaInicio} - {item.horaFin})
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.classCard, item.activo && styles.classCardActive]}>
        {item.activo && <View style={styles.activeIndicator} />}
        
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.horaInicio}</Text>
          <View style={styles.timeLine} />
          <Text style={styles.timeText}>{item.horaFin}</Text>
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.materiaText}>{item.materia}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="meeting-room" size={16} color={Colors.secondary} />
            <Text style={styles.infoText}>{item.aula}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="person-outline" size={16} color={Colors.secondary} />
            <Text style={styles.infoText}>{item.profesor}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ── Header ────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Horarios</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(alumno)/perfil')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>LE</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Tabs de Días ──────────────────────────────── */}
        <View style={styles.tabsWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.tabsContainer}
          >
            {diasSemana.map((dia) => (
              <TouchableOpacity
                key={dia}
                style={[styles.tab, activeDia === dia && styles.tabActive]}
                onPress={() => setActiveDia(dia)}
              >
                <Text style={[styles.tabText, activeDia === dia && styles.tabTextActive]}>
                  {dia}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Lista de Horarios ─────────────────────────── */}
        <FlatList
          data={mockSchedule}
          keyExtractor={(item) => item.id}
          renderItem={renderScheduleItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
          showsVerticalScrollIndicator={false}
        />

        {/* ── FAB (Floating Action Button) ──────────────── */}
        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(insets.bottom, 4) + 68 }]}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>

        {/* ── Bottom Bar ───────────────────────────────── */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(alumno)/index')} activeOpacity={0.7}>
            <MaterialIcons name="space-dashboard" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} activeOpacity={0.7}>
            <MaterialIcons name="calendar-today" size={24} color={PRIMARY} />
            <Text style={[styles.bottomBarText, { color: PRIMARY }]}>Horarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(alumno)/notas')} activeOpacity={0.7}>
            <MaterialIcons name="grade" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Notas</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
    flex: 1,
    marginLeft: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8DDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 32,
  },
  tab: {
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  tabTextActive: {
    color: PRIMARY,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: '#FDFBFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden', // to keep active indicator within bounds
  },
  classCardActive: {
    backgroundColor: '#F6F2FF',
    borderColor: '#E8DDFF',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: PRIMARY,
  },
  timeColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 50,
    marginRight: 16,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A4B26', // Brownish color from mockup
  },
  timeLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  infoColumn: {
    flex: 1,
    gap: 6,
    paddingVertical: 2,
  },
  materiaText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.secondary,
  },
  breakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBFF',
    borderRadius: 30,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8DDFF',
    borderStyle: 'dashed',
    gap: 10,
    marginVertical: 4,
  },
  breakText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.secondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  bottomBarItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  bottomBarText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.outline,
  },
});
