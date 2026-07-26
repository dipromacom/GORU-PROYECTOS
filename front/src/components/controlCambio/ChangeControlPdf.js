import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica', color: '#333' },
    logo: { width: 160, marginBottom: 20, alignSelf: 'center' },
    headerTable: { width: '100%', marginBottom: 20, border: '1pt solid #000' },
    headerTitle: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', padding: 10, backgroundColor: '#f0f0f0', borderBottom: '1pt solid #000' },
    tableRow: { flexDirection: 'row', borderBottom: '0.5pt solid #ccc', minHeight: 20, alignItems: 'center' },
    label: { width: '25%', fontWeight: 'bold', padding: 5, backgroundColor: '#f9f9f9', borderRight: '0.5pt solid #ccc' },
    value: { width: '75%', padding: 5 },
    sectionHeader: { backgroundColor: '#333', color: '#fff', padding: 4, marginTop: 15, fontWeight: 'bold', textAlign: 'center' },
    contentBox: { border: '0.5pt solid #ccc', padding: 10, minHeight: 50, marginTop: 2 },
    footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
    signature: { borderTop: '1pt solid #000', width: '40%', textAlign: 'center', paddingTop: 5 }
});

const ChangeControlPdf = ({ data, proyecto, directorProyecto }) => {
    // Si no hay data, devolvemos un documento vacío pero válido para no romper el stream
    if (!data) return <Document><Page size="A4"><Text>Cargando...</Text></Page></Document>;

    const director = directorProyecto || 'No especificado';
    const fecha = data.fecha_solicitud || new Date().toLocaleDateString();

    // Función auxiliar para limpiar valores y evitar nulls o errores de stream
    const clean = (val) => {
        if (val === null || val === undefined) return '';
        return String(val);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image src="/img/goru-logo.jpg" style={styles.logo} />
                <View style={styles.headerTable}>
                    <Text style={styles.headerTitle}>FORMATO SOLICITUD DE CAMBIO</Text>
                    <View style={styles.tableRow}>
                        <Text style={styles.label}>Nombre Proyecto:</Text>
                        <Text style={styles.value}>{clean(proyecto?.nombre)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.label}>Director Proyecto:</Text>
                        <Text style={styles.value}>{clean(director)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.label}>Solicitud N°:</Text>
                        <Text style={{ width: '25%', padding: 5, borderRight: '0.5pt solid #ccc' }}>{clean(data.id) || 'NUEVA'}</Text>
                        <Text style={{ width: '25%', fontWeight: 'bold', padding: 5, backgroundColor: '#f9f9f9', borderRight: '0.5pt solid #ccc' }}>Fecha:</Text>
                        <Text style={{ width: '25%', padding: 5 }}>{clean(fecha)}</Text>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>INFORMACIÓN DE LA SOLICITUD</Text>
                <View style={styles.tableRow}>
                    <Text style={styles.label}>Nombre del Cambio:</Text>
                    <Text style={styles.value}>{clean(data.nombre_cambio)}</Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={styles.label}>Solicitante:</Text>
                    <Text style={styles.value}>{clean(data.nombre_solicitante)}</Text>
                </View>

                <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Descripción del Cambio:</Text>
                <View style={styles.contentBox}>
                    <Text>{clean(data.descripcion_cambio)}</Text>
                </View>

                <Text style={styles.sectionHeader}>REVISIÓN Y RESOLUCIÓN</Text>
                <View style={styles.tableRow}>
                    <Text style={styles.label}>Asignado a:</Text>
                    <Text style={styles.value}>{clean(data.asignado_a) || 'Pendiente'}</Text>
                </View>

                <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Análisis de Impacto:</Text>
                <View style={styles.contentBox}>
                    {(() => {
                        const ai = typeof data.analisis_impacto === 'string'
                            ? (() => { try { return JSON.parse(data.analisis_impacto); } catch { return { descripcion: data.analisis_impacto }; } })()
                            : (data.analisis_impacto || {});
                        return (
                            <>
                                {ai.descripcion
                                    ? <Text>{ai.descripcion}</Text>
                                    : <Text style={{ color: '#999' }}>Pendiente de revisión</Text>
                                }
                                {(ai.tiempo || ai.dolares) && (
                                    <View style={{ flexDirection: 'row', marginTop: 6, gap: 20 }}>
                                        {ai.tiempo ? (
                                            <Text style={{ fontWeight: 'bold' }}>
                                                Tiempo: {ai.tiempo} días
                                            </Text>
                                        ) : null}
                                        {ai.dolares ? (
                                            <Text style={{ fontWeight: 'bold', marginLeft: 16 }}>
                                                Económico: ${Number(ai.dolares).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </Text>
                                        ) : null}
                                    </View>
                                )}
                            </>
                        );
                    })()}
                </View>

                {/* Recomendación corregida (singular) */}
                <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Recomendación:</Text>
                <View style={styles.contentBox}>
                    <Text>{clean(data.recomendacion) || 'N/A'}</Text>
                </View>

                <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Resolución:</Text>
                <View style={styles.contentBox}>
                    <Text>{clean(data.resolucion) || 'Pendiente'}</Text>
                </View>

                <View style={[styles.tableRow, { marginTop: 10, borderTop: '0.5pt solid #ccc' }]}>
                    <Text style={styles.label}>Impacto Proyecto:</Text>
                    <Text style={{ width: '25%', padding: 5, borderRight: '0.5pt solid #ccc' }}>{clean(data.impacto_proyecto)}</Text>
                    <Text style={styles.label}>Estado:</Text>
                    <Text style={{ width: '25%', padding: 5 }}>{clean(data.estado)}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.signature}>
                        <Text>Elaborado por:</Text>
                        <Text style={{ fontWeight: 'bold' }}>{clean(data.nombre_solicitante)}</Text>
                    </View>
                    <View style={styles.signature}>
                        <Text>Aprobado por (Director):</Text>
                        {/* revision_director corregido */}
                        <Text style={{ fontWeight: 'bold' }}>{clean(data.revision_director) || '________________'}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default ChangeControlPdf;