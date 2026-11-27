import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { Colors } from '@/constants/Colors';
import { getDocente } from '@/services/docenteService';
import { ApiRequestError, mensajeDeError } from '@/services/httpClient';
import { docenteUsername } from '@/types/docente';
import type { Docente } from '@/types/docente';
import { getSession } from '@/utils/session';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DocenteDetalleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [docente, setDocente] = useState<Docente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDocente = useCallback(async () => {
    if (!id) {
      setError('No se indicó el docente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await getSession();

      if (!session || session.rol !== 'administrador') {
        router.replace('/login');
        return;
      }

      const data = await getDocente(id);
      setDocente(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err.status === 403) {
          setError('No tenés permisos para ver este docente.');
          return;
        }
        if (err.status === 404) {
          setError('Docente no encontrado.');
          return;
        }
      }

      setError(mensajeDeError(err, 'No se pudo cargar el detalle del docente.'));
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      cargarDocente();
    }, [cargarDocente])
  );

  const nombre = docente
    ? `${docente.first_name} ${docente.last_name}`.trim()
    : '';
  const username = docente ? docente.username || docenteUsername(docente) : '';

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
          <Text style={styles.headerTitle}>Detalle de Docente</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={40} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={cargarDocente}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : docente ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.perfil}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {docente.first_name.charAt(0).toUpperCase()}
                  {docente.last_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.nombre}>{nombre}</Text>
              <View style={styles.usuarioChip}>
                <Text style={styles.usuarioChipText}>{username}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Información del docente</Text>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Nombre</Text>
                <Text style={styles.filaValue}>{docente.first_name}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Apellido</Text>
                <Text style={styles.filaValue}>{docente.last_name}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>DNI</Text>
                <Text style={styles.filaValue}>{docente.dni}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Teléfono</Text>
                <Text style={styles.filaValue}>{docente.telephone}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Usuario</Text>
                <Text style={styles.filaValue}>{username}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>Fecha de ingreso</Text>
                <Text style={styles.filaValue}>{docente.fecha_ingreso}</Text>
              </View>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>ID</Text>
                <Text style={[styles.filaValue, styles.idValue]} selectable>
                  {docente.id}
                </Text>
              </View>
            </View>

            <PrimaryButton
              title="Ver materias asignadas"
              onPress={() => router.push({
                pathname: '/(admin)/docente/[id]/materias' as any,
                params: { id: docente.id },
              })}
            />
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
  avatarText: { color: Colors.white, fontSize: 32, fontWeight: '700' },
  nombre: { fontSize: 20, fontWeight: '700', color: Colors.neutral, textAlign: 'center' },
  usuarioChip: {
    marginTop: 8, backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  usuarioChipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  infoCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceVariant, gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral, marginBottom: 4 },
  fila: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceVariant, paddingTop: 12,
  },
  filaLabel: { fontSize: 14, color: Colors.secondary },
  filaValue: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.neutral, textAlign: 'right' },
  idValue: { fontSize: 12 },
});
