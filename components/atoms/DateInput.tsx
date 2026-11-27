import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Input } from './Input';

interface DateInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    iconName?: keyof typeof MaterialIcons.glyphMap;
    disabled?: boolean;
    minimumDate?: Date;
    maximumDate?: Date;
}

function aIso(fecha: string): string {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

function desdeIso(iso: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

function aDate(fecha: string): Date {
    const iso = aIso(fecha);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);

    if (!match) return new Date();

    const anio = Number(match[1]);
    const mes = Number(match[2]);
    const dia = Number(match[3]);
    const fechaObj = new Date(anio, mes - 1, dia);

    return Number.isNaN(fechaObj.getTime()) ? new Date() : fechaObj;
}

function deDate(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${fecha.getFullYear()}`;
}

export const DateInput = ({
    value,
    onChange,
    placeholder = 'DD/MM/AAAA',
    iconName = 'calendar-today',
    disabled = false,
    minimumDate,
    maximumDate,
}: DateInputProps) => {
    const [mostrarPicker, setMostrarPicker] = useState(false);
    const fechaSeleccionada = useMemo(() => aDate(value), [value]);

    if (Platform.OS === 'web') {
        return (
            <Input
                iconName={iconName}
                placeholder={placeholder}
                value={aIso(value)}
                onChangeText={(texto) => onChange(desdeIso(texto))}
                editable={!disabled}
                {...({ type: 'date' } as any)}
            />
        );
    }

    const handleChange = (event: DateTimePickerEvent, fecha?: Date) => {
        if (event.type === 'dismissed' || !fecha) {
            setMostrarPicker(false);
            return;
        }

        onChange(deDate(fecha));
        setMostrarPicker(false);
    };

    return (
        <View>
            <View style={[styles.container, { borderColor: Colors.border }]}>
                <MaterialIcons name={iconName} size={22} color={Colors.secondary} style={styles.icon} />
                <TouchableOpacity
                    style={styles.valueButton}
                    onPress={() => setMostrarPicker(true)}
                    disabled={disabled}
                >
                    <Text style={value ? styles.value : styles.placeholder}>
                        {value || placeholder}
                    </Text>
                </TouchableOpacity>
                <MaterialIcons name="event" size={20} color={Colors.secondary} />
            </View>

            {mostrarPicker && (
                <View style={styles.pickerContainer}>
                    <DateTimePicker
                        value={fechaSeleccionada}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        onChange={handleChange}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 12,
        minHeight: 52,
        backgroundColor: Colors.white,
    },
    icon: {
        marginRight: 8,
    },
    valueButton: {
        flex: 1,
        justifyContent: 'center',
        minHeight: 52,
    },
    value: {
        fontSize: 16,
        color: Colors.neutral,
    },
    placeholder: {
        fontSize: 16,
        color: Colors.outline,
    },
    pickerContainer: {
        marginTop: 8,
    },
});
