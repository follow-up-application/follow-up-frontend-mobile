import { ProfileMenuItem, ProfileMetric, ProfileView } from '@/components/organisms/ProfileView';
import { Colors } from '@/constants/Colors';
import { ApiRequestError } from '@/services/httpClient';
import { getMe } from '@/services/userService';
import type { MeUser } from '@/types/auth';
import { clearSession, getSession, iniciales, nombreCompleto, Session } from '@/utils/session';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#4A6FA5';

export default function PerfilDocenteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        const s = await getSession();
        if (!activo) return;
        if (!s || s.rol !== 'docente') { router.replace('/login'); return; }
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
    return <View style={styles.root}><SafeAreaView style={styles.loading} edges={['top']}><ActivityIndicator size="large" color={PRIMARY} /></SafeAreaView></View>;
  }

  const nombre = me ? `${me.firstName} ${me.lastName}`.trim() : nombreCompleto(session);
  const avatar = me ? `${me.firstName?.[0] ?? ''}${me.lastName?.[0] ?? ''}`.toUpperCase() : iniciales(session);
  const metricas: ProfileMetric[] = [
    { id: '1', label: 'Cursos', value: '-', icono: 'class', color: '#6750A4' },
    { id: '2', label: 'Alumnos', value: '-', icono: 'people', color: PRIMARY },
    { id: '3', label: 'Asist. Prom.', value: '-', icono: 'trending-up', color: '#386A20' },
  ];
  const datos = [
    { id: 'nombre', label: 'Nombre', value: nombre },
    { id: 'usuario', label: 'Usuario', value: me?.username ?? session.username },
    { id: 'rol', label: 'Rol', value: 'Docente' },
    ...(me?.dni ? [{ id: 'dni', label: 'DNI', value: String(me.dni) }] : []),
    ...(me?.email ? [{ id: 'email', label: 'Email', value: me.email }] : []),
  ];
  const menuItems: ProfileMenuItem[] = [
    { id: '1', label: 'Mis Datos Personales', sublabel: 'Email, teléfono, dirección', icono: 'person', onPress: () => {} },
    { id: '2', label: 'Configuración de Alertas', sublabel: 'Gestionar notificaciones push', icono: 'notifications', onPress: () => {} },
    { id: '3', label: 'Seguridad y Privacidad', sublabel: 'Cambiar contraseña', icono: 'security', onPress: () => {} },
    { id: '4', label: 'Centro de Soporte', sublabel: 'Ayuda y preguntas frecuentes', icono: 'help-outline', onPress: () => {} },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProfileView nombre={nombre} rol="Docente" avatarInicial={avatar} primaryColor={PRIMARY} metricas={metricas} datos={datos} menuItems={menuItems} onLogout={handleLogout} onBackPress={() => router.back()} />
      </SafeAreaView>

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
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
