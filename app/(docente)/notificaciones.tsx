import { NotificationItem, NotificationsView } from '@/components/organisms/NotificationsView';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#4A6FA5';

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    titulo: 'Inasistencia Reiterada',
    mensaje: 'El alumno Fabricio Alegre acumula 5 inasistencias en tu materia este mes.',
    tiempo: 'Hace 1 hora',
    urgente: true,
    icono: 'error' as const,
    iconoColor: '#B3261E',
    tipoAccion: 'link',
    textoAccion: 'Ver detalle',
    leido: false,
  },
  {
    id: '2',
    titulo: 'Entrega de calificaciones',
    mensaje: 'Recordatorio: debes cargar las notas del 2do trimestre antes del viernes.',
    tiempo: 'Hace 3 horas',
    urgente: false,
    icono: 'assignment-late' as const,
    iconoColor: '#E65100',
    leido: false,
  },
  {
    id: '3',
    titulo: 'Reunión de Departamento',
    mensaje: 'La reunión de hoy a las 15:30 en Sala 4 ha sido confirmada.',
    tiempo: 'Hace 5 horas',
    urgente: false,
    icono: 'groups' as const,
    iconoColor: '#6750A4',
    leido: true,
  },
];

export default function NotificacionesDocenteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NotificationsView notifications={mockNotifications} />
      </SafeAreaView>

      {/* Bottom Bar specific to Docente */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(docente)')} activeOpacity={0.7}>
          <MaterialIcons name="space-dashboard" size={24} color={Colors.outline} />
          <Text style={styles.bottomBarText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.push('/(docente)/materias')} activeOpacity={0.7}>
          <MaterialIcons name="class" size={24} color={Colors.outline} />
          <Text style={styles.bottomBarText}>Materias</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(docente)/perfil')} activeOpacity={0.7}>
          <MaterialIcons name="person-outline" size={24} color={Colors.outline} />
          <Text style={styles.bottomBarText}>Perfil</Text>
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
