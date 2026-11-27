import { ProfileView, ProfileMenuItem, ProfileMetric } from '@/components/organisms/ProfileView';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#4A6FA5';

export default function PerfilDocenteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    router.replace('/login');
  };

  const metricas: ProfileMetric[] = [
    { id: '1', label: 'Cursos', value: '4', icono: 'class', color: '#6750A4' },
    { id: '2', label: 'Alumnos', value: '98', icono: 'people', color: PRIMARY },
    { id: '3', label: 'Asist. Prom.', value: '94%', icono: 'trending-up', color: '#386A20' },
  ];

  const menuItems: ProfileMenuItem[] = [
    {
      id: '1',
      label: 'Mis Datos Personales',
      sublabel: 'Email, teléfono, dirección',
      icono: 'person',
      onPress: () => {},
    },
    {
      id: '2',
      label: 'Configuración de Alertas',
      sublabel: 'Gestionar notificaciones push',
      icono: 'notifications',
      onPress: () => {},
    },
    {
      id: '3',
      label: 'Seguridad y Privacidad',
      sublabel: 'Cambiar contraseña',
      icono: 'security',
      onPress: () => {},
    },
    {
      id: '4',
      label: 'Centro de Soporte',
      sublabel: 'Ayuda y preguntas frecuentes',
      icono: 'help-outline',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProfileView
          nombre="Prof. Damián Ramírez"
          rol="Docente de Ciencias Exactas"
          avatarInicial="DR"
          primaryColor={PRIMARY}
          metricas={metricas}
          menuItems={menuItems}
          onLogout={handleLogout}
          onBackPress={() => router.back()}
        />
      </SafeAreaView>

      {/* Bottom Bar specific to Docente */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(docente)')} activeOpacity={0.7}>
          <MaterialIcons name="space-dashboard" size={24} color={Colors.outline} />
          <Text style={styles.bottomBarText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(docente)/materias')} activeOpacity={0.7}>
          <MaterialIcons name="class" size={24} color={Colors.outline} />
          <Text style={styles.bottomBarText}>Materias</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarItem} activeOpacity={0.7}>
          <MaterialIcons name="person" size={24} color={PRIMARY} />
          <Text style={[styles.bottomBarText, { color: PRIMARY }]}>Perfil</Text>
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
