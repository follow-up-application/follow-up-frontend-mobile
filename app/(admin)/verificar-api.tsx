import { Colors } from '@/constants/Colors';
import { API_BASE_URL } from '@/config/api';
import {
    CheckResult,
    construirChecks,
    ejecutarVerificacion,
    limpiarTemporales,
    prepararContexto,
    ResultadoCorrida,
} from '@/services/apiVerification';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { OutlinedButton } from '@/components/atoms/OutlinedButton';
import { Input } from '@/components/atoms/Input';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession, saveSession } from '@/utils/session';

type Filtro = 'todos' | 'fallo' | 'ok' | 'omitido';

const COLOR_ESTADO: Record<CheckResult['estado'], string> = {
    ok: '#2E7D32',
    fallo: Colors.error,
    omitido: Colors.outline,
};

const ICONO_ESTADO: Record<CheckResult['estado'], keyof typeof MaterialIcons.glyphMap> = {
    ok: 'check-circle',
    fallo: 'cancel',
    omitido: 'remove-circle-outline',
};

export default function VerificarApiScreen() {
    const router = useRouter();

    const [escribir, setEscribir] = useState(false);
    const [codigoTutor, setCodigoTutor] = useState('');
    const [corrida, setCorrida] = useState<ResultadoCorrida | null>(null);
    const [filtro, setFiltro] = useState<Filtro>('todos');
    const [ejecutando, setEjecutando] = useState(false);
    const [progreso, setProgreso] = useState('');
    const [error, setError] = useState('');
    const [limpieza, setLimpieza] = useState<string | null>(null);

    const checks = useMemo(() => construirChecks(codigoTutor.trim()), [codigoTutor]);

    const visibles = useMemo(() => {
        if (!corrida) {
            return [];
        }

        if (filtro === 'todos') {
            return corrida.checks;
        }

        return corrida.checks.filter((c) => c.estado === filtro);
    }, [corrida, filtro]);

    const handleEjecutar = async () => {
        if (ejecutando) {
            return;
        }

        setEjecutando(true);
        setError('');
        setCorrida(null);
        setLimpieza(null);
        setProgreso('Conectando con la API...');

        try {
            const ctx = await prepararContexto(escribir);

            const resultado = await ejecutarVerificacion(ctx, checks, (_, index, total) => {
                setProgreso(`Verificando ${index + 1}/${total}...`);
            });

            setCorrida(resultado);

            // El check de login re autentica al administrador y el backend le
            // revoca el token anterior: hay que guardar el nuevo o la app queda
            // con una sesión muerta.
            const session = await getSession();

            if (session && session.token !== ctx.tokenAdmin) {
                await saveSession({ ...session, token: ctx.tokenAdmin });
            }

            if (escribir) {
                setProgreso('Limpiando datos temporales...');
                const borrados = await limpiarTemporales(ctx);

                setLimpieza(
                    borrados.length
                        ? `Se borraron: ${borrados.join(', ')}.`
                        : 'No quedaron datos temporales.'
                );
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo ejecutar la verificación.');
        } finally {
            setProgreso('');
            setEjecutando(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
                    <MaterialIcons name="arrow-back" size={24} color={Colors.neutral} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verificar API</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.urlCard}>
                    <Text style={styles.urlLabel}>API</Text>
                    <Text style={styles.urlValue}>{API_BASE_URL}</Text>
                    <Text style={styles.urlHint}>
                        Se define con EXPO_PUBLIC_API_URL en el archivo .env
                    </Text>
                </View>

                <View style={styles.switchRow}>
                    <View style={styles.switchText}>
                        <Text style={styles.switchTitle}>Modo escritura</Text>
                        <Text style={styles.switchHint}>
                            Crea y borra registros de prueba en la base de datos.
                        </Text>
                    </View>
                    <Switch
                        value={escribir}
                        onValueChange={setEscribir}
                        trackColor={{ true: Colors.primary, false: Colors.surfaceVariant }}
                        thumbColor={Colors.white}
                    />
                </View>

                <Text style={styles.label}>Código institucional (opcional)</Text>
                <Input
                    iconName="badge"
                    placeholder="ALU-XXXXXX-XXXXXX"
                    value={codigoTutor}
                    onChangeText={setCodigoTutor}
                    autoCapitalize="characters"
                    editable={!ejecutando}
                />
                <Text style={styles.helper}>
                    Necesario para verificar el registro de tutores. El endpoint consume el
                    código y no se puede volver a usar: el tutor queda registrado con ese email,
                    así que sólo cargalo contra una base descartable.
                </Text>

                <PrimaryButton
                    title={ejecutando ? 'Verificando...' : `Ejecutar ${checks.length} checks`}
                    onPress={handleEjecutar}
                    isLoading={ejecutando}
                    style={styles.ejecutarBtn}
                />

                {ejecutando ? (
                    <View style={styles.progresoRow}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text style={styles.progresoText}>{progreso}</Text>
                    </View>
                ) : null}

                {error ? (
                    <View style={styles.errorCard}>
                        <MaterialIcons name="error-outline" size={18} color={Colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {limpieza ? <Text style={styles.limpieza}>{limpieza}</Text> : null}

                {corrida ? (
                    <>
                        <View style={styles.resumen}>
                            <ResumenTile valor={corrida.totales.ok} label="OK" color="#2E7D32" />
                            <ResumenTile
                                valor={corrida.totales.fallos}
                                label="Fallan"
                                color={Colors.error}
                            />
                            <ResumenTile
                                valor={corrida.totales.omitidos}
                                label="Omitidos"
                                color={Colors.outline}
                            />
                        </View>

                        <View style={styles.filtros}>
                            {(['todos', 'fallo', 'ok', 'omitido'] as Filtro[]).map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.filtro, filtro === f && styles.filtroActivo]}
                                    onPress={() => setFiltro(f)}
                                >
                                    <Text
                                        style={[
                                            styles.filtroText,
                                            filtro === f && styles.filtroTextActivo,
                                        ]}
                                    >
                                        {f[0].toUpperCase() + f.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {visibles.map((check) => (
                            <CheckCard key={check.id} check={check} />
                        ))}
                    </>
                ) : (
                    <Text style={styles.hint}>
                        Presioná &quot;Ejecutar&quot; para recorrer todos los endpoints habilitados del
                        backend. Los checks de escritura sólo corren si activás el modo escritura.
                    </Text>
                )}

                {corrida ? (
                    <OutlinedButton title="Volver" onPress={() => router.back()} />
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

function ResumenTile({ valor, label, color }: { valor: number; label: string; color: string }) {
    return (
        <View style={styles.tile}>
            <Text style={[styles.tileValor, { color }]}>{valor}</Text>
            <Text style={styles.tileLabel}>{label}</Text>
        </View>
    );
}

function CheckCard({ check }: { check: CheckResult }) {
    const [expandido, setExpandido] = useState(false);
    const color = COLOR_ESTADO[check.estado];

    return (
        <TouchableOpacity style={styles.card} onPress={() => setExpandido((v) => !v)} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
                <MaterialIcons name={ICONO_ESTADO[check.estado]} size={20} color={color} />
                <View style={styles.cardMain}>
                    <Text style={styles.metodoRuta}>
                        {check.metodo} {check.ruta}
                    </Text>
                    <Text style={styles.descripcion}>{check.descripcion}</Text>
                </View>
                <Text style={[styles.status, { color }]}>
                    {check.status ?? '—'}
                </Text>
            </View>

            {expandido ? (
                <View style={styles.cardDetail}>
                    <Text style={styles.detailLine}>Esperado: {check.esperado}</Text>
                    <Text style={styles.detailLine}>Roles: {check.roles}</Text>
                    <Text style={styles.detailLine}>Duración: {check.duracionMs} ms</Text>
                    {check.detalle ? (
                        <Text style={styles.detailLine}>Respuesta: {check.detalle}</Text>
                    ) : null}
                    {check.nota ? (
                        <View style={styles.notaBox}>
                            <Text style={styles.notaText}>{check.nota}</Text>
                        </View>
                    ) : null}
                </View>
            ) : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral },
    content: { padding: 20, paddingBottom: 40, gap: 12 },
    urlCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 14,
    },
    urlLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.secondary,
        letterSpacing: 0.8,
    },
    urlValue: { fontSize: 14, color: Colors.neutral, marginTop: 4 },
    urlHint: { fontSize: 11, color: Colors.outline, marginTop: 4 },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 14,
    },
    switchText: { flex: 1 },
    switchTitle: { fontSize: 15, fontWeight: '600', color: Colors.neutral },
    switchHint: { fontSize: 12, color: Colors.secondary, marginTop: 2 },
    label: { fontSize: 13, fontWeight: '600', color: Colors.neutral },
    helper: { fontSize: 11, color: Colors.outline },
    ejecutarBtn: { borderRadius: 24 },
    progresoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    progresoText: { fontSize: 13, color: Colors.secondary },
    errorCard: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: `${Colors.error}15`,
        borderRadius: 10,
        padding: 12,
    },
    errorText: { flex: 1, fontSize: 13, color: Colors.error },
    limpieza: { fontSize: 12, color: Colors.secondary },
    hint: { fontSize: 13, color: Colors.secondary, lineHeight: 18 },
    resumen: { flexDirection: 'row', gap: 12 },
    tile: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    tileValor: { fontSize: 22, fontWeight: '800' },
    tileLabel: { fontSize: 11, color: Colors.secondary, marginTop: 2 },
    filtros: { flexDirection: 'row', gap: 8 },
    filtro: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Colors.surface,
    },
    filtroActivo: { backgroundColor: Colors.primary },
    filtroText: { fontSize: 12, color: Colors.secondary, fontWeight: '600' },
    filtroTextActivo: { color: Colors.white },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.surfaceVariant,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardMain: { flex: 1 },
    metodoRuta: { fontSize: 13, fontWeight: '700', color: Colors.neutral },
    descripcion: { fontSize: 12, color: Colors.secondary, marginTop: 2 },
    status: { fontSize: 15, fontWeight: '800' },
    cardDetail: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceVariant,
        gap: 4,
    },
    detailLine: { fontSize: 12, color: Colors.secondary },
    notaBox: {
        marginTop: 6,
        backgroundColor: `${Colors.tertiary}15`,
        borderRadius: 8,
        padding: 8,
    },
    notaText: { fontSize: 11, color: Colors.tertiary, lineHeight: 16 },
});