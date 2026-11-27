import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#6750A4';
const SUCCESS = '#137333';
const ERROR = '#B3261E';
const NEUTRAL = '#5F6368';

type ObsType = 'positiva' | 'alerta' | 'neutral';

type ObservacionItem = {
  id: string;
  tipo: ObsType;
  etiqueta: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  profesor: string;
};

const mockObservaciones: ObservacionItem[] = [
  {
    id: '1',
    tipo: 'positiva',
    etiqueta: 'Felicitación',
    fecha: '15 Oct, 2023',
    titulo: 'Excelente Participación',
    descripcion: 'El estudiante demostró un liderazgo excepcional durante el proyecto de ciencias, ayudando a sus compañeros a integrar los conceptos de energía renovable de manera creativa.',
    profesor: 'Prof. Maria González',
  },
  {
    id: '2',
    tipo: 'alerta',
    etiqueta: 'Llamado de atención',
    fecha: '12 Oct, 2023',
    titulo: 'Uso de Celular en Clase',
    descripcion: 'Se retiró el dispositivo móvil por uso reiterado durante la explicación de matemáticas. Es el segundo aviso en el mes respecto a este comportamiento.',
    profesor: 'Prof. Ricardo Méndez',
  },
  {
    id: '3',
    tipo: 'neutral',
    etiqueta: 'Observación',
    fecha: '08 Oct, 2023',
    titulo: 'Entrega de Material',
    descripcion: 'El alumno olvidó su libro de texto por tercera vez consecutiva. Se le permitió trabajar con copias, pero se sugiere revisión en casa.',
    profesor: 'Prof. Elena Soto',
  },
];

export default function ObservacionesAlumnoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<'Todas' | 'Positivas' | 'Llamados'>('Todas');

  const filteredData = mockObservaciones.filter(obs => {
    if (activeFilter === 'Positivas') return obs.tipo === 'positiva';
    if (activeFilter === 'Llamados') return obs.tipo === 'alerta';
    return true;
  });

  const getIconForType = (tipo: ObsType) => {
    switch (tipo) {
      case 'positiva': return 'thumb-up-off-alt';
      case 'alerta': return 'warning-amber';
      case 'neutral': return 'info-outline';
    }
  };

  const getColorForType = (tipo: ObsType) => {
    switch (tipo) {
      case 'positiva': return SUCCESS;
      case 'alerta': return ERROR;
      case 'neutral': return NEUTRAL;
    }
  };

  const renderObservacionItem = ({ item }: { item: ObservacionItem }) => {
    const color = getColorForType(item.tipo);
    const icon = getIconForType(item.tipo);

    return (
      <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <MaterialIcons name={icon} size={18} color={color} />
            <Text style={[styles.cardTag, { color }]}>{item.etiqueta}</Text>
          </View>
          <Text style={styles.cardDate}>{item.fecha}</Text>
        </View>

        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <Text style={styles.cardDesc}>{item.descripcion}</Text>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.teacherAvatar}>
            <MaterialIcons name="person" size={16} color={Colors.white} />
          </View>
          <Text style={styles.teacherName}>{item.profesor}</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* ── Tarjeta Resumen ───────────────────────────── */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen del Mes</Text>
        <Text style={styles.summarySubtitle}>Tienes 3 nuevas actualizaciones en tu registro conductual.</Text>
        
        <View style={styles.summaryStats}>
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: PRIMARY }]}>12</Text>
            <Text style={[styles.statLabel, { color: PRIMARY }]}>TOTAL</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: SUCCESS }]}>4</Text>
            <Text style={[styles.statLabel, { color: SUCCESS }]}>POSITIVAS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: ERROR }]}>2</Text>
            <Text style={[styles.statLabel, { color: ERROR }]}>ALERTAS</Text>
          </View>
        </View>
      </View>

      {/* ── Chips Filtros ─────────────────────────────── */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {(['Todas', 'Positivas', 'Llamados'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ── Top App Bar ───────────────────────────────── */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Observaciones</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(alumno)/perfil')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>LE</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Content List ──────────────────────────────── */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderObservacionItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Bottom Bar ───────────────────────────────── */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(alumno)/index')} activeOpacity={0.7}>
            <MaterialIcons name="space-dashboard" size={24} color={PRIMARY} />
            <Text style={[styles.bottomBarText, { color: PRIMARY }]}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(alumno)/horarios')} activeOpacity={0.7}>
            <MaterialIcons name="calendar-today" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Horarios</Text>
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
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
    flex: 1,
    marginLeft: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8DDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  headerContent: {
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: '#F3EFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    color: PRIMARY,
    opacity: 0.8,
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: PRIMARY,
    opacity: 0.2,
  },
  filtersWrapper: {
    marginBottom: 8,
    marginHorizontal: -20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: '#E8DDFF',
    borderColor: '#E8DDFF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  filterTextActive: {
    color: PRIMARY,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTag: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardDate: {
    fontSize: 12,
    color: Colors.secondary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teacherAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A0A0A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.secondary,
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
