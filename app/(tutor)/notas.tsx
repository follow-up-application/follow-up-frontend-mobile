import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type HijoId = '1' | '2';

const hijos = [
  { id: '1', nombre: 'Mateo García', icono: 'face' as const },
  { id: '2', nombre: 'Lucía García', icono: 'face-3' as const },
];

const calificacionesPorHijo: Record<HijoId, Array<{
  id: string;
  materia: string;
  profesor: string;
  nota1: string;
  nota2: string;
  notaFinal: number;
}>> = {
  '1': [
    { id: '1', materia: 'Matemáticas Avanzadas', profesor: 'Prof. Roberto Domínguez', nota1: '8.5', nota2: '7.0', notaFinal: 7.8 },
    { id: '2', materia: 'Historia Universal', profesor: 'Prof. Elena Martinez', nota1: '9.0', nota2: '8.5', notaFinal: 8.8 },
    { id: '3', materia: 'Física Cuántica', profesor: 'Prof. Carlos Weber', nota1: '4.5', nota2: '5.5', notaFinal: 5.0 },
    { id: '4', materia: 'Lengua y Literatura', profesor: 'Prof. Silvia Rossi', nota1: '7.0', nota2: '8.0', notaFinal: 7.5 },
  ],
  '2': [
    { id: '1', materia: 'Biología Celular', profesor: 'Prof. Roberto Domínguez', nota1: '9.0', nota2: '9.0', notaFinal: 9.0 },
    { id: '2', materia: 'Química Orgánica', profesor: 'Prof. Juan Perez', nota1: '6.0', nota2: '7.0', notaFinal: 6.5 },
  ]
};

const estadisticasPorHijo: Record<HijoId, { asistencia: string; conducta: string; promedio: string; desempeno: string; desc: string }> = {
  '1': {
    asistencia: '94%',
    conducta: 'Excelente',
    promedio: '7.3',
    desempeno: 'Desempeño Sobresaliente',
    desc: 'Mateo se mantiene en el tercio superior de su clase con un promedio general de 7.3'
  },
  '2': {
    asistencia: '98%',
    conducta: 'Excelente',
    promedio: '7.8',
    desempeno: 'Desempeño Sobresaliente',
    desc: 'Lucía se mantiene en el cuadro de honor con un promedio general de 7.8'
  }
};

export default function NotasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [hijoSeleccionado, setHijoSeleccionado] = useState<HijoId>('1');

  const materias = calificacionesPorHijo[hijoSeleccionado];
  const stats = estadisticasPorHijo[hijoSeleccionado];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Boletín de Calificaciones</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tutor)/perfil')}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>M</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Student Selector */}
        <View style={styles.studentsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studentsScroll}>
            {hijos.map((hijo) => {
              const isActive = hijo.id === hijoSeleccionado;
              return (
                <TouchableOpacity
                  key={hijo.id}
                  style={[styles.studentChip, isActive && styles.studentChipActive]}
                  onPress={() => setHijoSeleccionado(hijo.id as HijoId)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name={hijo.icono} size={18} color={isActive ? Colors.primary : Colors.outline} />
                  <Text style={[styles.studentChipText, isActive && styles.studentChipTextActive]}>{hijo.nombre}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.studentChipAdd} activeOpacity={0.7}>
              <MaterialIcons name="add" size={18} color={Colors.neutral} />
              <Text style={styles.studentChipText}>Añadir</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Subheader */}
        <View style={styles.subHeader}>
          <View>
            <Text style={styles.yearText}>CICLO LECTIVO 2024</Text>
            <Text style={styles.subHeaderTitle}>Calificaciones</Text>
            <Text style={styles.subHeaderTitle}>Actuales</Text>
          </View>
          <TouchableOpacity style={styles.downloadButton} activeOpacity={0.7}>
            <MaterialIcons name="file-download" size={18} color="#6750A4" />
            <Text style={styles.downloadText}>Descargar PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Grades Scroll */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Grades list */}
          {materias.map((materia) => {
            const isApproved = materia.notaFinal >= 6.0;
            const finalBg = isApproved ? '#386A2015' : '#B3261E15';
            const finalColor = isApproved ? '#386A20' : '#B3261E';

            return (
              <View key={materia.id} style={styles.materiaCard}>
                <View style={styles.materiaInfo}>
                  <Text style={styles.materiaTitle}>{materia.materia}</Text>
                  <View style={styles.teacherRow}>
                    <MaterialIcons name="person" size={14} color={Colors.outline} />
                    <Text style={styles.teacherText}>{materia.profesor}</Text>
                  </View>
                  <View style={styles.trimestersRow}>
                    <View style={styles.trimBox}>
                      <Text style={styles.trimLabel}>1ER TRIM</Text>
                      <Text style={styles.trimValue}>{materia.nota1}</Text>
                    </View>
                    <View style={styles.trimBox}>
                      <Text style={styles.trimLabel}>2DO TRIM</Text>
                      <Text style={styles.trimValue}>{materia.nota2}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.finalColumn}>
                  <View style={[styles.finalBadge, { backgroundColor: finalBg }]}>
                    <Text style={[styles.finalLabel, { color: finalColor }]}>FINAL</Text>
                    <Text style={[styles.finalValue, { color: finalColor }]}>{materia.notaFinal.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.promedioText}>Promedio</Text>
                </View>
              </View>
            );
          })}

          {/* Academic Performance Banner */}
          <View style={styles.performanceBanner}>
            <Text style={styles.bannerSub}>ESTADO ACADÉMICO GENERAL</Text>
            <Text style={styles.bannerTitle}>{stats.desempeno}</Text>
            <Text style={styles.bannerDesc}>{stats.desc}</Text>
            <View style={styles.starOverlay}>
              <MaterialIcons name="star-outline" size={80} color="rgba(255, 255, 255, 0.08)" />
            </View>
          </View>

          {/* Bottom Summaries */}
          <View style={styles.bottomStatsRow}>
            <View style={[styles.statSummaryCard, { backgroundColor: '#6750A415' }]}>
              <Text style={styles.statSummaryLabel}>Asistencia</Text>
              <Text style={[styles.statSummaryValue, { color: '#6750A4' }]}>{stats.asistencia}</Text>
            </View>
            <View style={[styles.statSummaryCard, { backgroundColor: '#B3261E15' }]}>
              <Text style={styles.statSummaryLabel}>Conducta</Text>
              <Text style={[styles.statSummaryValue, { color: '#B3261E' }]}>{stats.conducta}</Text>
            </View>
            <TouchableOpacity style={styles.printFab} activeOpacity={0.8}>
              <MaterialIcons name="print" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(tutor)')} activeOpacity={0.7}>
            <MaterialIcons name="home" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.push('/(tutor)/contacto')} activeOpacity={0.7}>
            <MaterialIcons name="chat-bubble-outline" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Contacto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(tutor)/agenda')} activeOpacity={0.7}>
            <MaterialIcons name="calendar-today" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} activeOpacity={0.7}>
            <MaterialIcons name="grade" size={24} color={Colors.primary} />
            <Text style={[styles.bottomBarText, { color: Colors.primary }]}>Notas</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6750A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  studentsContainer: {
    paddingBottom: 16,
  },
  studentsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  studentChipActive: {
    backgroundColor: '#6750A415',
    borderColor: '#6750A430',
  },
  studentChipAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  studentChipText: {
    fontSize: 13,
    color: Colors.neutral,
    fontWeight: '600',
  },
  studentChipTextActive: {
    color: Colors.primary,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  yearText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.outline,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral,
    lineHeight: 26,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6750A4',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  materiaCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  materiaInfo: {
    flex: 1,
  },
  materiaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 4,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  teacherText: {
    fontSize: 12,
    color: Colors.secondary,
  },
  trimestersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trimBox: {
    backgroundColor: '#F8F8FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 70,
  },
  trimLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.outline,
    marginBottom: 2,
  },
  trimValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral,
  },
  finalColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16,
  },
  finalBadge: {
    borderRadius: 14,
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  finalLabel: {
    fontSize: 8,
    fontWeight: '800',
  },
  finalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  promedioText: {
    fontSize: 10,
    color: Colors.outline,
    fontWeight: '600',
  },
  performanceBanner: {
    backgroundColor: '#6750A4',
    borderRadius: 18,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerSub: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 18,
  },
  starOverlay: {
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  bottomStatsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  statSummaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    justifyContent: 'center',
  },
  statSummaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 4,
  },
  statSummaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  printFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6750A4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  bottomBar: {
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
