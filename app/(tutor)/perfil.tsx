import { ProfileMenuItem, ProfileMetric, ProfileView } from '@/components/organisms/ProfileView';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilTutorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    router.replace('/login');
  };

  const metricas: ProfileMetric[] = [
    { id: '1', label: 'Hijos', value: '2', icono: 'people' },
    { id: '2', label: 'Inasist.', value: '0', icono: 'error-outline' },
    { id: '3', label: 'Promedio', value: '8.5', icono: 'trending-up' },
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
      sublabel: 'Alertas de notas, faltas, comunicados',
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
          nombre="María González"
          rol="Tutor Responsable"
          avatarInicial="MG"
          primaryColor={Colors.primary}
          metricas={metricas}
          menuItems={menuItems}
          onLogout={handleLogout}
          onBackPress={() => router.back()}
        />
      </SafeAreaView>

      {/* Bottom Bar specific to Tutor */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(tutor)')} activeOpacity={0.7}>
          <MaterialIcons name="home" size={24} color={Colors.outline} />
          <Text style={styles.bottomBarText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.push('/(tutor)/contacto')} activeOpacity={0.7}>
          <MaterialIcons name="chat-bubble-outline" size={24} color={Colors.outline} />
          <Text style={styles.bottomBarText}>Contacto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.push('/(tutor)/agenda')} activeOpacity={0.7}>
          <MaterialIcons name="calendar-today" size={24} color={Colors.outline} />
          <Text style={styles.bottomBarText}>Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.push('/(tutor)/notas')} activeOpacity={0.7}>
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
