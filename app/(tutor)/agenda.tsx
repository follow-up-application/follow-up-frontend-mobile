import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Categoria = 'Todo' | 'Exámenes' | 'Entregas' | 'Reuniones';

const timelineData = [
  {
    section: 'ESTA SEMANA',
    items: [
      {
        id: '1',
        mes: 'JUN',
        dia: '25',
        badge: 'Examen',
        badgeColor: '#B3261E',
        hora: '08:30 AM',
        titulo: 'Examen de Matemáticas',
        desc: 'Unidad 4: Álgebra y funciones lineales.',
        icono: 'star' as const,
        iconoBg: '#6750A4',
        avatars: false,
      },
      {
        id: '2',
        mes: 'JUN',
        dia: '26',
        badge: 'Entrega',
        badgeColor: '#6750A4',
        hora: '11:59 PM',
        titulo: 'Informe de Biología',
        desc: 'Laboratorio de sistemas celulares.',
        icono: 'description' as const,
        iconoBg: '#6750A4',
        avatars: false,
      },
      {
        id: '3',
        mes: 'JUN',
        dia: '28',
        badge: 'Reunión',
        badgeColor: '#386A20',
        hora: '05:00 PM',
        titulo: 'Consejo de Padres',
        desc: 'Discusión de planificación fin de curso.',
        icono: 'people' as const,
        iconoBg: '#386A20',
        avatars: true, // Simulating avatars
      },
    ],
  },
  {
    section: 'PRÓXIMA SEMANA',
    items: [
      {
        id: '4',
        mes: 'JUL',
        dia: '02',
        badge: 'Importante',
        badgeColor: '#E65100',
        hora: '10:00 AM',
        titulo: 'Simulacro General',
        desc: 'Ejercicio de seguridad institucional obligatorio.',
        icono: 'calendar-today' as const,
        iconoBg: '#B3261E',
        avatars: false,
      },
    ],
  }
];

export default function AgendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filtroActivo, setFiltroActivo] = useState<Categoria>('Reuniones');

  const filtros: Categoria[] = ['Todo', 'Exámenes', 'Entregas', 'Reuniones'];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Próximas Actividades</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tutor)/perfil')}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>T</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {filtros.map((filtro) => {
              const isActive = filtro === filtroActivo;
              return (
                <TouchableOpacity
                  key={filtro}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setFiltroActivo(filtro)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{filtro}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Timeline */}
        <ScrollView style={styles.timelineScroll} contentContainerStyle={styles.timelineContent} showsVerticalScrollIndicator={false}>
          {timelineData.map((section, secIdx) => (
            <View key={section.section} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              
              {section.items.map((item, itemIdx) => {
                const isLast = itemIdx === section.items.length - 1;
                return (
                  <View key={item.id} style={styles.timelineRow}>
                    
                    {/* Left Column (Date & Icon) */}
                    <View style={styles.leftCol}>
                      <Text style={styles.monthText}>{item.mes}</Text>
                      <Text style={styles.dayText}>{item.dia}</Text>
                      <View style={[styles.circleIcon, { backgroundColor: item.iconoBg + '15' }]}>
                        <MaterialIcons name={item.icono} size={16} color={item.iconoBg} />
                      </View>
                      {/* Vertical line connector, don't show on last item of section unless you want it continuous */}
                      {!isLast && <View style={styles.verticalLine} />}
                    </View>

                    {/* Right Column (Card) */}
                    <View style={styles.rightCol}>
                      <View style={styles.card}>
                        <View style={styles.cardHeader}>
                          <View style={[styles.badge, { backgroundColor: item.badgeColor + '15' }]}>
                            <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                          </View>
                          <Text style={styles.horaText}>{item.hora}</Text>
                        </View>
                        <Text style={styles.cardTitle}>{item.titulo}</Text>
                        <Text style={styles.cardDesc}>{item.desc}</Text>
                        
                        {item.avatars && (
                          <View style={styles.avatarsContainer}>
                            <View style={[styles.smallAvatar, { backgroundColor: '#4285F4', zIndex: 3 }]} />
                            <View style={[styles.smallAvatar, { backgroundColor: '#DB4437', marginLeft: -8, zIndex: 2 }]} />
                            <View style={[styles.smallAvatar, { backgroundColor: '#E0E0E0', marginLeft: -8, zIndex: 1 }]}>
                              <Text style={styles.avatarMoreText}>+4</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>

                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.replace('/(tutor)')} activeOpacity={0.7}>
            <MaterialIcons name="home" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.push('/(tutor)/contacto')} activeOpacity={0.7}>
            <MaterialIcons name="chat-bubble-outline" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Contacto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} activeOpacity={0.7}>
            <MaterialIcons name="calendar-today" size={24} color={Colors.primary} />
            <Text style={[styles.bottomBarText, { color: Colors.primary }]}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => router.push('/(tutor)/notas')} activeOpacity={0.7}>
            <MaterialIcons name="grade" size={24} color={Colors.outline} />
            <Text style={styles.bottomBarText}>Notas</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  timelineScroll: {
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  leftCol: {
    width: 50,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  dayText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.neutral,
    marginBottom: 8,
  },
  circleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  verticalLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
    marginBottom: 8,
  },
  rightCol: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#F8F8FA', // Using lighter background per the image card style
    borderRadius: 12,
    padding: 16,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  horaText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.outline,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F8F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  bottomBarItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  bottomBarText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.outline,
  },
});
