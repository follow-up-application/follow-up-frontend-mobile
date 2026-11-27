import AdminHeader from '@/components/organisms/AdminHeader';
import DrawerMenu, { DrawerMenuItem } from '@/components/organisms/DrawerMenu';
import EstadoGrid, { StatCardData } from '@/components/organisms/EstadoGrid';
import ModulosList, { ModuloItemData } from '@/components/organisms/ModulosList';
import { Colors } from '@/constants/Colors';
import { clearSession, getSession, nombreCompleto, Session } from '@/utils/session';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/config/api';


export default function AdminDashboard() {
    const router = useRouter();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [statsData, setStatsData] = useState<StatCardData[]>([
        { id: '1', label: 'Alumnos', value: '0', icon: 'people', iconColor: '#6750A4' },
        { id: '2', label: 'Tutores', value: '0', icon: 'supervisor-account', iconColor: '#625B71' },
    ]);

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

            const response = await fetch(
                `${API_BASE_URL}/admins/estadisticas`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${s.token}`,
                        Accept: 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();

                setStatsData([
                    {
                        id: '1',
                        label: 'Alumnos',
                        value: data.total_alumnos.toString(),
                        icon: 'people',
                        iconColor: '#6750A4',
                    },
                    {
                        id: '2',
                        label: 'Tutores',
                        value: data.total_tutores.toString(),
                        icon: 'supervisor-account',
                        iconColor: '#625B71',
                    },
                ]);
            }

            setLoadingSession(false);
            })();

            return () => {
                activo = false;
            };
        }, [router])

        
    );

    const modulosData: ModuloItemData[] = [
        { id: '1', icon: 'person-add', label: 'Cargar Alumno', onPress: () => router.push('/(admin)/cargar-alumno' as any) },
        { id: '5', icon: 'people', label: 'Listado de Alumnos', onPress: () => router.push('/(admin)/listado-alumnos' as any) },
        { id: '2', icon: 'supervisor-account', label: 'Cargar Docente', onPress: () => router.push('/(admin)/cargar-docente' as any) },
        { id: '6', icon: 'school', label: 'Listado de Docentes', onPress: () => router.push('/(admin)/listado-docentes' as any) },
        { id: '3', icon: 'domain', label: 'Cargar Curso / División', onPress: () => router.push('/(admin)/cargar-curso' as any) },
    ];

    const drawerItems: DrawerMenuItem[] = [
        { icon: 'dashboard', label: 'Panel Principal' },
        { icon: 'person-add', label: 'Cargar Alumno', onPress: () => router.push('/(admin)/cargar-alumno' as any) },
        { icon: 'people', label: 'Listado de Alumnos', onPress: () => router.push('/(admin)/listado-alumnos' as any) },
        { icon: 'supervisor-account', label: 'Cargar Docente', onPress: () => router.push('/(admin)/cargar-docente' as any) },
        { icon: 'school', label: 'Listado de Docentes', onPress: () => router.push('/(admin)/listado-docentes' as any) },
        { icon: 'domain', label: 'Cargar Curso / División', onPress: () => router.push('/(admin)/cargar-curso' as any) },
        { icon: 'settings', label: 'Configuración del Sistema' },
    ];

    const handleLogout = async () => {
        // TODO: si el backend tiene endpoint de logout (revocar token Sanctum),
        // llamarlo acá antes de limpiar la sesión local:
        // await fetch(`${API_BASE_URL}/logout`, { method: 'POST', headers: { Authorization: `Bearer ${session?.token}` } });
        await clearSession();
        router.replace('/login');
    };

    if (loadingSession || !session) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={['top']}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <AdminHeader
                nombreAdmin={session.first_name}
                onMenuPress={() => setDrawerVisible(true)}
                onNotificationsPress={() => { }}
                onAvatarPress={() => router.push('/(admin)/perfil')}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Panel Administrador</Text>
                    <Text style={styles.subtitle}>Centro de control y gestión escolar.</Text>
                    <View style={styles.divider} />
                </View>

                <EstadoGrid stats={statsData} />

                <ModulosList modulos={modulosData} />

            </ScrollView>

            <DrawerMenu
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                nombre={nombreCompleto(session)}
                rol="Administrador"
                rolColor={Colors.primary}
                items={drawerItems}
                activeLabel="Panel Principal"
                onLogout={handleLogout}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    titleSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.neutral,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.secondary,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.surfaceVariant,
        width: '100%',
    },
});