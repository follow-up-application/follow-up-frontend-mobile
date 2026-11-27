import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.8;

export interface DrawerMenuItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress?: () => void;
}

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  nombre: string;
  rol: string;
  rolColor: string;
  items: DrawerMenuItem[];
  activeLabel?: string;
  onLogout: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

export default function DrawerMenu({
  visible,
  onClose,
  nombre,
  rol,
  rolColor,
  items,
  activeLabel,
  onLogout,
}: DrawerMenuProps) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, overlayOpacity]);

  const handleLogout = () => {
    onLogout();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={styles.overlayPressable} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.drawer, { transform: [{ translateX }], paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={[styles.closeButton, { top: insets.top + 10 }]} onPress={onClose} activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color={Colors.secondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(nombre)}</Text>
            </View>
            <Text style={styles.nombre}>{nombre}</Text>
            <View style={[styles.rolBadge, { backgroundColor: rolColor }]}>
              <Text style={styles.rolBadgeText}>{rol.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.nav}>
            {items.map((item) => {
              const isActive = activeLabel === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => {
                    item.onPress?.();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={22}
                    color={isActive ? Colors.primary : Colors.secondary}
                  />
                  <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
              <MaterialIcons name="logout" size={22} color={Colors.error} />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 6,
  },
  header: {
    marginBottom: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 8,
  },
  rolBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  rolBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.6,
  },
  nav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: `${Colors.primary}15`,
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.neutral,
  },
  navItemTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.surfaceVariant,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
});
