import { ProfileMenuItem, ProfileMetric, ProfileView } from '@/components/organisms/ProfileView';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilAlumnoScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/login');
  };

  const metricas: ProfileMetric[] = [
    { id: '1', label: 'Materias', value: '12', icono: 'menu-book' },
    { id: '2', label: 'Promedio', value: '8.2', icono: 'trending-up' },
    { id: '3', label: 'Asist. Prom.', value: '92%', icono: 'fact-check' },
  ];

  const menuItems: ProfileMenuItem[] = [
    {
      id: '1',
      label: 'Datos del Alumno',
      sublabel: 'Matrícula, legajo, división académica',
      icono: 'person',
      onPress: () => {},
    },
    {
      id: '2',
      label: 'Datos de Tutor Responsable',
      sublabel: 'Contacto de tutores registrados',
      icono: 'family-restroom',
      onPress: () => {},
    },
    {
      id: '3',
      label: 'Centro de Soporte',
      sublabel: 'Ayuda y preguntas del portal',
      icono: 'help-outline',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProfileView
          nombre="Lucas Estrada"
          rol="Alumno - 4to Año B"
          avatarInicial="LE"
          primaryColor="#6750A4"
          metricas={metricas}
          menuItems={menuItems}
          onLogout={handleLogout}
          onBackPress={() => router.back()}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
});
