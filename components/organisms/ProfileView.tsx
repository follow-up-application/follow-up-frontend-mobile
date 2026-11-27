import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface ProfileMetric {
  id: string;
  label: string;
  value: string;
  icono: keyof typeof MaterialIcons.glyphMap;
  color?: string;
}

export interface ProfileMenuItem {
  id: string;
  label: string;
  sublabel?: string;
  icono: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

interface ProfileViewProps {
  nombre: string;
  rol: string;
  institucion?: string;
  avatarInicial: string;
  primaryColor?: string;
  metricas?: ProfileMetric[];
  menuItems: ProfileMenuItem[];
  onLogout?: () => void;
  onBackPress?: () => void;
}

export function ProfileView({
  nombre,
  rol,
  institucion = 'Colegio Secundario FollowUp',
  avatarInicial,
  primaryColor = '#6750A4',
  metricas = [],
  menuItems,
  onLogout,
  onBackPress,
}: ProfileViewProps) {
  return (
    <View style={styles.root}>
      {/* ── Header ─────────────────────────────── */}
      <View style={styles.header}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.neutral} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="notifications-none" size={24} color={Colors.neutral} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Perfil Card ────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
            <Text style={styles.avatarText}>{avatarInicial}</Text>
          </View>
          <Text style={styles.nameText}>{nombre}</Text>
          <Text style={styles.rolText}>{rol}</Text>
          <View style={styles.schoolPill}>
            <Text style={styles.schoolText}>{institucion}</Text>
          </View>
        </View>

        {/* ── Métricas / Resumen Académico ──────── */}
        {metricas.length > 0 && (
          <View style={styles.metricsContainer}>
            {metricas.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Menú de Ajustes ────────────────────── */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItemRow,
                index === menuItems.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuItemIconBg, { backgroundColor: '#F3EDF7' }]}>
                <MaterialIcons name={item.icono} size={20} color="#21005D" />
              </View>
              <View style={styles.menuItemTextCol}>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                {item.sublabel && <Text style={styles.menuItemSublabel}>{item.sublabel}</Text>}
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Botón Cerrar Sesión ────────────────── */}
        {onLogout && (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            activeOpacity={0.85}
          >
            <MaterialIcons name="logout" size={20} color={Colors.white} style={styles.logoutIcon} />
            <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.neutral,
    marginBottom: 4,
  },
  rolText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
  },
  schoolPill: {
    backgroundColor: '#E8DDFF30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DDFF',
  },
  schoolText: {
    fontSize: 11,
    color: '#21005D',
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F1F1F6',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuItemIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemTextCol: {
    flex: 1,
    gap: 2,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral,
  },
  menuItemSublabel: {
    fontSize: 12,
    color: Colors.outline,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 24,
    paddingVertical: 14,
    backgroundColor: '#B3261E',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#B3261E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutIcon: {
    marginRight: 4,
  },
  logoutBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
