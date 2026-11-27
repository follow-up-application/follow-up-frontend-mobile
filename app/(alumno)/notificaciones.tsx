import { NotificationsView } from '@/components/organisms/NotificationsView';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#6750A4';

const mockNotifications = [
  {
    id: '1',
    titulo: 'Nueva Calificación Cargada',
    mensaje: 'El Prof. Damián Ramírez ha cargado la nota del Examen de Matemáticas II: 9 (Aprobado).',
    tiempo: 'Hace 5 min',
    urgente: false,
    icono: 'assignment' as const,
    iconoColor: '#386A20',
    tipoAccion: 'link' as const,
    textoAccion: 'Ver boletín',
    leido: false,
  },
  {
    id: '2',
    titulo: 'Aviso Urgente: Circular Fin de Mes',
    mensaje: 'Se encuentra disponible la circular informativa sobre el receso invernal y entrega de libretas.',
    tiempo: 'Hace 2 horas',
    urgente: true,
    icono: 'warning' as const,
    iconoColor: '#B3261E',
    tipoAccion: 'boton' as const,
    textoAccion: 'Ver Circular',
    leido: false,
  },
  {
    id: '3',
    titulo: 'Clase Suspendida',
    mensaje: 'La clase de Física I de mañana a las 10:45 hs ha sido suspendida por refacciones en el laboratorio.',
    tiempo: 'Hace 1 día',
    urgente: false,
    icono: 'event-busy' as const,
    iconoColor: '#6750A4',
    leido: false,
  },
];

export default function NotificacionesAlumnoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NotificationsView notifications={mockNotifications} />
      </SafeAreaView>

      {/* Bottom Bar specific to Alumno */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  bottomBarItem: { flex: 1, alignItems: 'center', paddingVertical: 6, gap: 4 },
  bottomBarText: { fontSize: 11, fontWeight: '500', color: Colors.outline },
});
