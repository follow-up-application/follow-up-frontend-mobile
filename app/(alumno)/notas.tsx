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

type TrimestreGrade = {
  trimestre: number;
  nota: string | number;
};

type BoletinItem = {
  id: string;
  materia: string;
  profesor: string;
  promedio: number;
  trimestres: TrimestreGrade[];
};

const mockBoletin: BoletinItem[] = [
  {
    id: '1',
    materia: 'Matemáticas Avanzadas',
    profesor: 'Prof. Ricardo Méndez',
    promedio: 9.0,
    trimestres: [
      { trimestre: 1, nota: 8.5 },
      { trimestre: 2, nota: 9.2 },
      { trimestre: 3, nota: 9.3 },
    ],
  },
  {
    id: '2',
    materia: 'Física Cuántica',
    profesor: 'Prof. Elena Martínez',
    promedio: 5.8,
    trimestres: [
      { trimestre: 1, nota: 6.0 },
      { trimestre: 2, nota: 5.5 },
      { trimestre: 3, nota: 6.0 },
    ],
  },
  {
    id: '3',
    materia: 'Literatura Universal',
    profesor: 'Prof. Carlos Fuentes',
    promedio: 8.5,
    trimestres: [
      { trimestre: 1, nota: 8.0 },
      { trimestre: 2, nota: 8.5 },
      { trimestre: 3, nota: 9.0 },
    ],
  },
  {
    id: '4',
    materia: 'Historia del Arte',
    profesor: 'Dra. Sofía Ortega',
    promedio: 7.8,
    trimestres: [
      { trimestre: 1, nota: 7.5 },
      { trimestre: 2, nota: 8.0 },
      { trimestre: 3, nota: 7.8 },
    ],
  },
  {
    id: '5',
    materia: 'Biología Celular',
    profesor: 'Prof. Juan Valdés',
    promedio: 6.5,
    trimestres: [
      { trimestre: 1, nota: 6.0 },
      { trimestre: 2, nota: 6.5 },
      { trimestre: 3, nota: 7.0 },
    ],
  },
];

export default function NotasAlumnoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderBoletinItem = ({ item }: { item: BoletinItem }) => {
    const isAprobado = item.promedio >= 7.0;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.materiaTitle}>{item.materia}</Text>
            <Text style={styles.profesorName}>{item.profesor}</Text>
          </View>
          <View style={[styles.badgeContainer, { backgroundColor: isAprobado ? '#E6F4EA' : '#FCE8E6' }]}>
            <Text style={[styles.badgeText, { color: isAprobado ? '#137333' : '#C5221F' }]}>
              {item.promedio.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.trimestresRow}>
          {item.trimestres.map((trim) => (
            <View key={trim.trimestre} style={styles.trimestreCol}>
              <Text style={styles.trimestreLabel}>{trim.trimestre}° Trim.</Text>
              <Text style={styles.trimestreValue}>
                {typeof trim.nota === 'number' ? trim.nota.toFixed(1) : trim.nota}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.promedioCard}>
        <MaterialIcons name="star" size={140} color="#D1C4E9" style={styles.promedioStarBg} />
        <Text style={styles.promedioLabel}>PROMEDIO GENERAL</Text>
        <Text style={styles.promedioValue}>8.2</Text>
        <View style={styles.trendPill}>
          <MaterialIcons name="trending-up" size={16} color={PRIMARY} />
          <Text style={styles.trendText}>+0.4 este trimestre</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ── Top App Bar ───────────────────────────────── */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.neutral} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Notas</Text>
          <View style={styles.appBarActions}>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.push('/(alumno)/notificaciones')}>
              <MaterialIcons name="notifications-none" size={24} color={Colors.neutral} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(alumno)/perfil')}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>LE</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Content List ──────────────────────────────── */}
        <FlatList
          data={mockBoletin}
          keyExtractor={(item) => item.id}
          renderItem={renderBoletinItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 16) + 60 }]}
          showsVerticalScrollIndicator={false}
        />

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
          <TouchableOpacity style={styles.bottomBarItem} activeOpacity={0.7}>
            <MaterialIcons name="grade" size={24} color={PRIMARY} />
            <Text style={[styles.bottomBarText, { color: PRIMARY }]}>Notas</Text>
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
    color: Colors.neutral,
    flex: 1,
    marginLeft: 16,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  listHeader: {
    marginBottom: 8,
  },
  promedioCard: {
    backgroundColor: '#E8DDFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  promedioStarBg: {
    position: 'absolute',
    right: -20,
    top: 10,
    opacity: 0.6,
  },
  promedioLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  promedioValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#21005D',
    marginBottom: 12,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1C4E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#21005D',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 12,
  },
  materiaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 4,
  },
  profesorName: {
    fontSize: 12,
    color: Colors.secondary,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  trimestresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  trimestreCol: {
    alignItems: 'flex-start',
    flex: 1,
  },
  trimestreLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  trimestreValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D47E1B', // Color naranja similar al mockup
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
