import { Colors } from '@/constants/Colors';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { getTutor, inhabilitarTutor } from '@/services/tutorService';
import type { Tutor } from '@/types/tutor';
import { getSession } from '@/utils/session';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TutorDetalleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [puedeEditar, setPuedeEditar] = useState(false);
  const [inhabilitando, setInhabilitando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarTutor = useCallback(async () => {
    if (!id) {
      setError('No se indicó el tutor.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await getSession();

      if (!session || (session.rol !== 'administrador' && session.rol !== 'tutor')) {
        router.replace('/login');
        return;
      }

      setPuedeEditar(session.rol === 'administrador');
      setTutor(await getTutor(id));
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err.status === 403) {
          setError('No tenés permisos para ver este tutor.');
          return;
        }
        if (err.status === 404) {
          setError('Tutor no encontrado.');
          return;
        }
      }

      setError(mensajeDeError(err, 'No se pudo cargar el detalle del tutor.'));
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      cargarTutor();
    }, [cargarTutor])
  );

  const inhabilitar = async () => {
    if (!id) return;

    setInhabilitando(true);

    try {
      await inhabilitarTutor(id);

      Alert.alert('Tutor inhabilitado', 'El tutor no podrá iniciar sesión.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.replace('/login');
        return;
      }

      Alert.alert('Error', mensajeDeError(err, 'No se pudo inhabilitar el tutor.'));
    } finally {
      setInhabilitando(false);
    }
  };

  const confirmarInhabilitacion = () => {
    Alert.alert(
      'Inhabilitar tutor',
      `¿Estás seguro de que deseas inhabilitar a ${nombre}? Esta acción no se puede deshacer desde la app.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Inhabilitar', style: 'destructive', onPress: inhabilitar },
      ]
    );
  };

  const nombre = tutor ? `${tutor.first_name} ${tutor.last_name}`.trim() : '';
  const iniciales = tutor
    ? `${tutor.first_name.charAt(0)}${tutor.last_name.charAt(0)}`.toUpperCase()
    : '';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Tutor</Text>
          {puedeEditar && id ? (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/(admin)/tutor/[id]/editar' as any,
                params: { id },
              })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="edit" size={22} color={Colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={40} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={cargarTutor}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : tutor ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.perfil}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{iniciales}</Text>
              </View>
              <Text style={styles.nombre}>{nombre}</Text>
              <View style={styles.rolChip}>
                <Text style={styles.rolChipText}>Tutor Responsable</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Información del tutor</Text>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Nombre</Text>
                <Text style={styles.filaValue}>{tutor.first_name}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Apellido</Text>
                <Text style={styles.filaValue}>{tutor.last_name}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>DNI</Text>
                <Text style={styles.filaValue}>{tutor.dni}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Teléfono</Text>
                <Text style={styles.filaValue}>{tutor.telephone}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Email</Text>
                <Text style={styles.filaValue}>{tutor.email}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>ID</Text>
                <Text style={[styles.filaValue, styles.idValue]} selectable>
                  {tutor.id}
                </Text>
              </View>
            </View>

            {puedeEditar ? (
              <TouchableOpacity
                style={styles.destructiveButton}
                activeOpacity={0.8}
                disabled={inhabilitando}
                onPress={confirmarInhabilitacion}
              >
                {inhabilitando ? (
                  <ActivityIndicator color={Colors.error} />
                ) : (
                  <>
                    <MaterialIcons name="block" size={20} color={Colors.error} />
                    <Text style={styles.destructiveButtonText}>Inhabilitar tutor</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  errorText: { fontSize: 14, color: Colors.secondary, textAlign: 'center' },
  retryButton: {
    marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 8,
  },
  retryButtonText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  scrollContent: { padding: 16, gap: 16 },
  perfil: { alignItems: 'center', paddingVertical: 16 },
  avatar: {
    width: 88, height: 88, borderRadius: 44, alignItems: 'center',
    justifyContent: 'center', marginBottom: 12, backgroundColor: Colors.primary,
  },
  avatarText: { color: Colors.white, fontSize: 30, fontWeight: '700' },
  nombre: { fontSize: 22, fontWeight: '800', color: Colors.neutral, textAlign: 'center' },
  rolChip: {
    marginTop: 8, backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 20,
  },
  rolChipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  infoCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceVariant,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.neutral, marginBottom: 12 },
  fila: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant,
  },
  filaLabel: { fontSize: 13, color: Colors.secondary, marginRight: 16 },
  filaValue: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.neutral, textAlign: 'right' },
  idValue: { fontSize: 11, color: Colors.secondary },
  destructiveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16, paddingVertical: 14, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.error, backgroundColor: `${Colors.error}10`,
  },
  destructiveButtonText: { fontSize: 15, fontWeight: '600', color: Colors.error },
});
