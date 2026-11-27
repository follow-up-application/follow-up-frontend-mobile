import { ProfileMenuItem, ProfileMetric, ProfileView } from '@/components/organisms/ProfileView';
import { Colors } from '@/constants/Colors';
import { clearSession, getSession, iniciales, nombreCompleto, Session } from '@/utils/session';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilAdminScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      (async () => {
        const s = await getSession();

        if (!activo) return;

        if (!s || s.rol !== 'administrador') {
          router.replace('/login');
          return;
        }

        setSession(s);
        setLoadingSession(false);
      })();

      return () => {
        activo = false;
      };
    }, [router])
  );

  const handleLogout = async () => {
    // TODO: si el backend tiene endpoint de logout (revocar token Sanctum), llamarlo acá:
    // await fetch(`${API_BASE_URL}/logout`, { method: 'POST', headers: { Authorization: `Bearer ${session?.token}` } });
    await clearSession();
    router.replace('/login');
  };

  // TODO: estas métricas son de ejemplo — reemplazar por datos reales
  // cuando exista el endpoint correspondiente (ej. GET /api/v1/admin/resumen).
  const metricas: ProfileMetric[] = [
    { id: '1', label: 'Sede', value: '1', icono: 'domain' },
    { id: '2', label: 'Docentes', value: '42', icono: 'supervisor-account' },
    { id: '3', label: 'Alumnos', value: '340', icono: 'school' },
  ];

  const menuItems: ProfileMenuItem[] = [
    {
      id: '1',
      label: 'Configuración del Sistema',
      sublabel: 'Variables académicas, períodos lectivos',
      icono: 'settings',
      onPress: () => {},
    },
    {
      id: '2',
      label: 'Auditoría de Logs',
      sublabel: 'Historial de modificaciones del sistema',
      icono: 'security',
      onPress: () => {},
    },
    {
      id: '3',
      label: 'Soporte Técnico',
      sublabel: 'Reportar errores o solicitar funciones',
      icono: 'help-outline',
      onPress: () => {},
    },
  ];

  if (loadingSession || !session) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.loadingContainer} edges={['top']}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProfileView
          nombre={nombreCompleto(session)}
          rol="Administrador de Sistema"
          avatarInicial={iniciales(session)}
          primaryColor="#386A20"
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});