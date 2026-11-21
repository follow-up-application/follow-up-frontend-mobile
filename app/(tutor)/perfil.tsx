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

export default function PerfilTutorScreen() {
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
        if (!s || s.rol !== 'tutor') { router.replace('/login'); return; }
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
    return <View style={styles.root}><SafeAreaView style={styles.loading} edges={['top']}><ActivityIndicator size="large" color={Colors.primary} /></SafeAreaView></View>;
  }

  const nombre = me ? `${me.firstName} ${me.lastName}`.trim() : nombreCompleto(session);
  const avatar = me ? `${me.firstName?.[0] ?? ''}${me.lastName?.[0] ?? ''}`.toUpperCase() : iniciales(session);
  const metricas: ProfileMetric[] = [
    { id: '1', label: 'Hijos', value: '-', icono: 'people' },
    { id: '2', label: 'Inasist.', value: '-', icono: 'error-outline' },
    { id: '3', label: 'Promedio', value: '-', icono: 'trending-up' },
  ];
  const datos = [
    { id: 'nombre', label: 'Nombre', value: nombre },
    { id: 'usuario', label: 'Usuario', value: me?.username ?? session.username },
    { id: 'rol', label: 'Rol', value: 'Tutor' },
    ...(me?.dni ? [{ id: 'dni', label: 'DNI', value: String(me.dni) }] : []),
    ...(me?.email ? [{ id: 'email', label: 'Email', value: me.email }] : []),
  ];
  const menuItems: ProfileMenuItem[] = [
    { id: '1', label: 'Mis Datos Personales', sublabel: 'Email, teléfono, dirección', icono: 'person', onPress: () => {} },
    { id: '2', label: 'Configuración de Alertas', sublabel: 'Alertas de notas, faltas, comunicados', icono: 'notifications', onPress: () => {} },
    { id: '3', label: 'Seguridad y Privacidad', sublabel: 'Cambiar contraseña', icono: 'security', onPress: () => {} },
    { id: '4', label: 'Centro de Soporte', sublabel: 'Ayuda y preguntas frecuentes', icono: 'help-outline', onPress: () => {} },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProfileView nombre={nombre} rol="Tutor Responsable" avatarInicial={avatar} primaryColor={Colors.primary} metricas={metricas} datos={datos} menuItems={menuItems} onLogout={handleLogout} onBackPress={() => router.back()} />
      </SafeAreaView>

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
