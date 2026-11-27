import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#6750A4';
const ERROR = '#B3261E';

type FaltaItem = {
  id: string;
  fecha: string;
  motivo: string;
  justificada: boolean;
};

const mockHistorial: FaltaItem[] = [
  { id: '1', fecha: '14 de Octubre, 2023', motivo: 'Sin motivo registrado', justificada: false },
  { id: '2', fecha: '02 de Octubre, 2023', motivo: 'Cita Médica', justificada: true },
  { id: '3', fecha: '25 de Septiembre, 2023', motivo: 'Competencia deportiva', justificada: true },
  { id: '4', fecha: '12 de Septiembre, 2023', motivo: 'Llegada tarde extrema', justificada: false },
];

export default function AsistenciaAlumnoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderHistorialItem = ({ item }: { item: FaltaItem }) => {
    const isJustificada = item.justificada;
    const iconName = isJustificada ? 'check-circle-outline' : 'event-busy';
    const accentColor = isJustificada ? PRIMARY : ERROR;
    const bgLightColor = isJustificada ? '#E8DDFF' : '#FCE8E6';

    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: bgLightColor }]}>
          <MaterialIcons name={iconName} size={24} color={accentColor} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardDate}>{item.fecha}</Text>
          <Text style={styles.cardReason}>{item.motivo}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: bgLightColor }]}>
          <Text style={[styles.badgeText, { color: accentColor }]}>
            {isJustificada ? 'Justificada' : 'Injustificada'}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* ── Gráfico de Asistencia ──────────────────────── */}
      <View style={styles.chartWrapper}>
        <View style={styles.circleRing}>
          <Text style={styles.percentageText}>92%</Text>
          <Text style={styles.percentageLabel}>Asistencia Total</Text>
        </View>
      </View>

      {/* ── Tarjetas de Resumen ────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialIcons name="check-circle-outline" size={24} color={PRIMARY} />
          <Text style={styles.statValue}>164</Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="cancel" size={24} color={ERROR} />
          <Text style={[styles.statValue, { color: ERROR }]}>8</Text>
          <Text style={styles.statLabel}>Ausentes</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="info-outline" size={24} color={Colors.secondary} />
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Justif.</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Historial de Faltas</Text>
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
          <Text style={styles.appBarTitle}>Asistencia</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(alumno)/perfil')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>LE</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Content List ──────────────────────────────── */}
        <FlatList
          data={mockHistorial}
          keyExtractor={(item) => item.id}
          renderItem={renderHistorialItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
          showsVerticalScrollIndicator={false}
        />

        {/* ── FAB (Floating Action Button) ──────────────── */}
        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(insets.bottom, 4) + 68 }]}
          activeOpacity={0.85}
        >
          <MaterialIcons name="insights" size={24} color={Colors.white} />
        </TouchableOpacity>

        {/* ── Bottom Bar ───────────────────────────────── */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(alumno)/index')} activeOpacity={0.7}>
            <MaterialIcons name="space-dashboard" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Inicio</Text>
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
    gap: 12,
  },
  headerContent: {
    marginBottom: 8,
  },
  chartWrapper: {
    backgroundColor: '#F8F7FC',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  circleRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '400',
    color: PRIMARY,
    letterSpacing: -1,
  },
  percentageLabel: {
    fontSize: 10,
    color: Colors.neutral,
    fontWeight: '600',
    marginTop: -4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F7FC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardDate: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 4,
  },
  cardReason: {
    fontSize: 12,
    color: Colors.secondary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
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
