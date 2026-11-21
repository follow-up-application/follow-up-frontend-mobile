import { ProfileMenuItem, ProfileMetric, ProfileView } from '@/components/organisms/ProfileView';
import { Colors } from '@/constants/Colors';
import { ApiRequestError } from '@/services/httpClient';
import { getMe } from '@/services/userService';
import type { MeUser } from '@/types/auth';
import { clearSession, getSession, iniciales, nombreCompleto, Session } from '@/utils/session';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilAlumnoScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        const s = await getSession();
        if (!activo) return;
        if (!s || s.rol !== 'alumno') { router.replace('/login'); return; }
        setSession(s);
        setLoading(false);
        getMe()
          .then((perfil) => { if (activo) setMe(perfil); })
          .catch(async (err) => {
            if (err instanceof ApiRequestError && err.status === 401) {
              await clearSession();
              if (activo) router.replace('/login');
            }
          });
      })();
      return () => { activo = false; };
    }, [router])
  );

  const handleLogout = async () => { await clearSession(); router.replace('/login'); };

  if (loading || !session) {
    return <View style={styles.root}><SafeAreaView style={styles.loading} edges={['top']}><ActivityIndicator size="large" color="#6750A4" /></SafeAreaView></View>;
  }

  const nombre = me ? `${me.firstName} ${me.lastName}`.trim() : nombreCompleto(session);
  const avatar = me ? `${me.firstName?.[0] ?? ''}${me.lastName?.[0] ?? ''}`.toUpperCase() : iniciales(session);
  const metricas: ProfileMetric[] = [
    { id: '1', label: 'Materias', value: '-', icono: 'menu-book' },
    { id: '2', label: 'Promedio', value: '-', icono: 'trending-up' },
    { id: '3', label: 'Asist. Prom.', value: '-', icono: 'fact-check' },
  ];
  const datos = [
    { id: 'nombre', label: 'Nombre', value: nombre },
    { id: 'usuario', label: 'Usuario', value: me?.username ?? session.username },
    { id: 'rol', label: 'Rol', value: 'Alumno' },
    ...(me?.dni ? [{ id: 'dni', label: 'DNI', value: String(me.dni) }] : []),
    ...(me?.email ? [{ id: 'email', label: 'Email', value: me.email }] : []),
  ];
  const menuItems: ProfileMenuItem[] = [
    { id: '1', label: 'Datos del Alumno', sublabel: 'Matrícula, legajo, división académica', icono: 'person', onPress: () => {} },
    { id: '2', label: 'Datos de Tutor Responsable', sublabel: 'Contacto de tutores registrados', icono: 'family-restroom', onPress: () => {} },
    { id: '3', label: 'Centro de Soporte', sublabel: 'Ayuda y preguntas del portal', icono: 'help-outline', onPress: () => {} },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProfileView nombre={nombre} rol="Alumno" avatarInicial={avatar} primaryColor="#6750A4" metricas={metricas} datos={datos} menuItems={menuItems} onLogout={handleLogout} onBackPress={() => router.back()} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
