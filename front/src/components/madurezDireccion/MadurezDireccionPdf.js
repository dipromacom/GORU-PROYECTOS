import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { DIMENSIONES, NIVELES_MADUREZ, PUNTAJE_MAXIMO_TOTAL } from '../../data/madurezDireccionProyectosData';
import { getNivelPorPorcentaje } from '../../utils/madurezDireccionCalculos';

const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 9, fontFamily: 'Helvetica' },
    logoHeader: { alignItems: 'center', marginBottom: 20 },
    logo: { width: 200, marginBottom: 8 },
    title: { fontSize: 16, color: '#EB5E00', marginBottom: 4, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { fontSize: 11, color: '#122544', marginBottom: 16, textAlign: 'center' },
    sectionTitle: { fontSize: 11, color: '#122544', fontWeight: 'bold', marginTop: 12, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#EB5E00', paddingBottom: 3 },
    row: { flexDirection: 'row', marginBottom: 3 },
    label: { width: '38%', fontWeight: 'bold', color: '#122544' },
    value: { width: '62%' },
    highlight: { fontSize: 14, color: '#EB5E00', fontWeight: 'bold', marginVertical: 6, textAlign: 'center' },
    dimRow: { flexDirection: 'row', marginBottom: 4, paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    dimName: { width: '55%', fontSize: 8 },
    dimScore: { width: '22%', textAlign: 'right' },
    dimPct: { width: '23%', textAlign: 'right' },
    bullet: { marginBottom: 3, paddingLeft: 8 },
    textBlock: { marginTop: 4, lineHeight: 1.35, textAlign: 'justify' },
    matrizHeader: { flexDirection: 'row', backgroundColor: '#f1f4f8', padding: 6, fontWeight: 'bold' },
    matrizRow: { flexDirection: 'row', padding: 5, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    matrizCol1: { width: '22%' },
    matrizCol2: { width: '28%' },
    matrizCol3: { width: '50%' },
});

const MadurezDireccionPdf = ({ resultado, contacto }) => {
    const { interpretacion } = resultado;
    const nivel = getNivelPorPorcentaje(resultado.porcentajeMadurez);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.logoHeader}>
                    <Image src="/img/goru-logo.jpg" style={styles.logo} />
                </View>
                <Text style={styles.title}>Assessment de Madurez en Dirección de Proyectos</Text>
                <Text style={styles.subtitle}>Test de Autoevaluación Organizacional</Text>

                <Text style={styles.sectionTitle}>Datos de contacto</Text>
                <View style={styles.row}><Text style={styles.label}>Nombre:</Text><Text style={styles.value}>{contacto.nombreContacto}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Empresa:</Text><Text style={styles.value}>{contacto.empresa}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Celular:</Text><Text style={styles.value}>{contacto.celular}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Correo:</Text><Text style={styles.value}>{contacto.correoContacto}</Text></View>

                <Text style={styles.sectionTitle}>Resultado global</Text>
                <Text style={styles.highlight}>
                    {resultado.puntajeTotal} / {PUNTAJE_MAXIMO_TOTAL} puntos — {resultado.porcentajeMadurez}% de madurez
                </Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nivel identificado:</Text>
                    <Text style={styles.value}>Nivel {nivel.nivel} – {nivel.nombre} ({nivel.rangoLabel || `${nivel.rangoMin}% – ${nivel.rangoMax}%`})</Text>
                </View>
                <Text style={styles.textBlock}>{nivel.descripcion}</Text>

                <Text style={styles.sectionTitle}>Matriz resumen de resultados</Text>
                <View style={styles.matrizHeader}>
                    <Text style={styles.matrizCol1}>Resultado</Text>
                    <Text style={styles.matrizCol2}>Nivel de madurez</Text>
                    <Text style={styles.matrizCol3}>Interpretación</Text>
                </View>
                {NIVELES_MADUREZ.map((n) => (
                    <View key={n.nivel} style={styles.matrizRow}>
                        <Text style={styles.matrizCol1}>{n.rangoLabel || `${n.rangoMin}% – ${n.rangoMax}%`}</Text>
                        <Text style={styles.matrizCol2}>Nivel {n.nivel}: {n.nombreCorto}</Text>
                        <Text style={styles.matrizCol3}>{n.interpretacionCorta}</Text>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Puntaje por dimensión</Text>
                <View style={styles.dimRow}>
                    <Text style={[styles.dimName, { fontWeight: 'bold' }]}>Dimensión</Text>
                    <Text style={[styles.dimScore, { fontWeight: 'bold' }]}>Puntaje</Text>
                    <Text style={[styles.dimPct, { fontWeight: 'bold' }]}>%</Text>
                </View>
                {(interpretacion?.dimensionesDetalle || []).map((d) => (
                    <View key={d.id} style={styles.dimRow}>
                        <Text style={styles.dimName}>{d.titulo}</Text>
                        <Text style={styles.dimScore}>{d.puntaje} / 25</Text>
                        <Text style={styles.dimPct}>{d.porcentaje}%</Text>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Características del nivel</Text>
                {(nivel.caracteristicas || []).map((c) => (
                    <Text key={c} style={styles.bullet}>• {c}</Text>
                ))}

                <Text style={styles.sectionTitle}>Riesgo principal</Text>
                <Text style={styles.textBlock}>{nivel.riesgo}</Text>

                <Text style={styles.sectionTitle}>Prioridad recomendada</Text>
                <Text style={styles.textBlock}>{nivel.prioridad}</Text>
            </Page>

            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>Lectura ejecutiva</Text>
                <Text style={styles.textBlock}>{interpretacion?.lecturaEjecutiva}</Text>

                <Text style={styles.sectionTitle}>Próximos pasos recomendados</Text>
                {(interpretacion?.proximosPasos || []).map((p) => (
                    <Text key={p} style={styles.bullet}>• {p}</Text>
                ))}

                <Text style={styles.sectionTitle}>Detalle de respuestas por dimensión</Text>
                {DIMENSIONES.map((dim, dimIndex) => (
                    <View key={dim.id} wrap={false} style={{ marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold', color: '#122544', marginBottom: 4, fontSize: 9 }}>
                            {dim.id}. {dim.titulo} — {resultado.puntajesDimension[dimIndex]}/25
                        </Text>
                        {dim.preguntas.map((pregunta, qIndex) => {
                            const globalIndex = dimIndex * 5 + qIndex;
                            const valor = resultado.respuestas[globalIndex];
                            return (
                                <Text key={pregunta} style={{ fontSize: 7.5, marginBottom: 2, paddingLeft: 6 }}>
                                    {qIndex + 1}. {pregunta} → Calificación: {valor}
                                </Text>
                            );
                        })}
                    </View>
                ))}

                <Text style={{ marginTop: 16, fontSize: 8, color: '#666', textAlign: 'center' }}>
                    Generado por GORU — Assessment de Madurez en Dirección de Proyectos
                </Text>
            </Page>
        </Document>
    );
};

export default MadurezDireccionPdf;
