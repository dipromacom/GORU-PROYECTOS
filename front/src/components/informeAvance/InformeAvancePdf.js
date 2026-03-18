import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#0066cc',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#0066cc',
        borderBottomWidth: 1,
        borderBottomColor: '#0066cc',
        paddingBottom: 3,
    },
    sectionTitleDanger: {
        fontSize: 12,
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#dc3545',
        borderBottomWidth: 1,
        borderBottomColor: '#dc3545',
        paddingBottom: 3,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        width: '35%',
        fontSize: 9,
    },
    value: {
        width: '65%',
        fontSize: 9,
    },
    textBlock: {
        marginTop: 5,
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 3,
        fontSize: 9,
        lineHeight: 1.4,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    gridItem: {
        width: '33%',
        padding: 4,
        marginBottom: 8,
    },
    gridItemFull: {
        width: '50%',
        padding: 4,
        marginBottom: 8,
    },
    card: {
        padding: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 3,
        textAlign: 'center',
        minHeight: 50,
    },
    cardTitle: {
        fontSize: 8,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    cardValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardValueSuccess: { color: '#28a745' },
    cardValueDanger: { color: '#dc3545' },
    cardValueWarning: { color: '#ffc107' },

    // ── Tabla genérica ──
    table: {
        marginTop: 6,
        marginBottom: 6,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#dee2e6',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: '#adb5bd',
        borderLeftColor: '#adb5bd',
    },
    tableHeaderDanger: {
        flexDirection: 'row',
        backgroundColor: '#f8d7da',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: '#f5c2c7',
        borderLeftColor: '#f5c2c7',
    },
    tableRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: '#dee2e6',
        borderLeftColor: '#dee2e6',
    },
    tableRowAlt: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: '#dee2e6',
        borderLeftColor: '#dee2e6',
        backgroundColor: '#f8f9fa',
    },
    tableCell: {
        padding: 4,
        fontSize: 8,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderRightColor: '#dee2e6',
        borderBottomColor: '#dee2e6',
        flex: 1,
    },
    tableCellHeader: {
        padding: 4,
        fontSize: 8,
        fontWeight: 'bold',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderRightColor: '#adb5bd',
        borderBottomColor: '#adb5bd',
        flex: 1,
    },
    tableCellCenter: {
        padding: 4,
        fontSize: 8,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderRightColor: '#dee2e6',
        borderBottomColor: '#dee2e6',
        flex: 1,
        textAlign: 'center',
    },
    tableCellHeaderCenter: {
        padding: 4,
        fontSize: 8,
        fontWeight: 'bold',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderRightColor: '#adb5bd',
        borderBottomColor: '#adb5bd',
        flex: 1,
        textAlign: 'center',
    },
    badgeSuccess: {
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '2 5',
        borderRadius: 3,
        fontSize: 7,
    },
    badgeDanger: {
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '2 5',
        borderRadius: 3,
        fontSize: 7,
    },
    badgeWarning: {
        backgroundColor: '#ffc107',
        color: '#333',
        padding: '2 5',
        borderRadius: 3,
        fontSize: 7,
    },
    badgeSecondary: {
        backgroundColor: '#6c757d',
        color: '#fff',
        padding: '2 5',
        borderRadius: 3,
        fontSize: 7,
    },
    subSectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: 4,
        marginTop: 8,
    },
    warningBox: {
        backgroundColor: '#fff3cd',
        borderWidth: 1,
        borderColor: '#ffc107',
        borderRadius: 3,
        padding: 6,
        marginBottom: 4,
        fontSize: 8,
    },
    dangerText: {
        color: '#dc3545',
        fontWeight: 'bold',
    },
    // Estilos para la matriz de riesgos
    matrixContainer: { marginTop: 10, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 5 },
    matrixGrid: { flexDirection: 'column', marginTop: 5 },
    matrixRow: { flexDirection: 'row', marginBottom: 2 },
    matrixCell: { width: '33.33%', padding: 8, margin: 1, borderRadius: 3, minHeight: 60 },
    matrixCellHigh: { backgroundColor: '#dc3545' },
    matrixCellMedium: { backgroundColor: '#ffc107' },
    matrixCellLow: { backgroundColor: '#28a745' },
    matrixCellText: { color: '#ffffff', fontSize: 8, textAlign: 'center', marginBottom: 2 },
    matrixCellLabel: { fontSize: 7, color: '#ffffff', fontWeight: 'bold', textAlign: 'center' },
    matrixCellRiesgos: { fontSize: 7, color: '#ffffff', marginTop: 3, textAlign: 'center' },
    matrixLabels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5, fontSize: 8 },
    legend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, padding: 5 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendColor: { width: 15, height: 15, marginRight: 5, borderRadius: 2 },
    legendText: { fontSize: 8 },
    footer: {
        position: 'absolute',
        bottom: 20, left: 30, right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 8,
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20, right: 30,
        fontSize: 8,
        color: '#666',
    },
    logo: {
        width: 160,
        height: 'auto',
        marginBottom: 20,
        alignSelf: 'center',
    },
});

// ── Helpers ──
const getBadgeStyle = (tipo) => {
    switch (tipo) {
        case 'success': return styles.badgeSuccess;
        case 'danger': return styles.badgeDanger;
        case 'warning': return styles.badgeWarning;
        default: return styles.badgeSecondary;
    }
};

const getBadgeEstadoCambio = (estado) => {
    switch (estado) {
        case 'Aprobado': return 'success';
        case 'No Aprobado': return 'danger';
        case 'En Revisión': return 'warning';
        default: return 'secondary';
    }
};

const getBadgeImpacto = (impacto) => {
    switch (impacto) {
        case 'Alto': return 'danger';
        case 'Mediano': return 'warning';
        default: return 'success';
    }
};

const calcularPromedioEncuesta = (enc) => {
    const campos = [
        'comunicacion', 'rapidez_respuesta', 'manejo_reuniones',
        'cumplimiento_plazos', 'cumplimiento_alcance', 'calidad_entregado',
        'nivel_capacitaciones', 'gestion_documentacion', 'experiencia_director',
        'satisfaccion_general'
    ];
    const suma = campos.reduce((acc, campo) => acc + (enc[campo] || 0), 0);
    return (suma / campos.length).toFixed(1);
};

const getAnalisisImpacto = (s) =>
    typeof s.analisis_impacto === 'string' ? {} : (s.analisis_impacto || {});

const InformeAvancePdf = ({
    informe,
    projectDetail,
    resumenEjecucion,
    resumenDesempeno,
    estadisticas,
    logs,
    riesgosList,
    leccionesAprendidas,
    listaSolicitudes = [],
    listaEncuestas = [],
    alcanceEntregables = [],
    tiempoFechasCriticas = [],
    costoEntregable = [],
    calidadMetricas = [],
    todo = [],
    totalesAprobados = { tiempo: 0, dolares: 0, cantidad: 0 },
    presupuesto = 0,
    ganttSummary = null,
}) => {
    const esActividad = projectDetail?.modo === "A";
    const esPrograma = projectDetail?.modo === "PR";
    const cerrado = projectDetail?.estado === "E";
    const ejecutado = projectDetail?.estado === "X";
    const tipoEntidad = esActividad ? "Proyecto Personal" : esPrograma ? "Programa" : "Proyecto";

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'No definida';

    // ── Elementos retrasados ──
    // Estructura real confirmada de BD:
    // alcanceEntregables:  { nombre, deadline, completado, fecha_entregable }
    // tiempoFechasCriticas:{ description, date, completado, fecha_hito }
    // costoEntregable:     { entregable, costo, costoReal, deadline, completado, fecha_cerrado }
    // calidadMetricas:     { entregable, metrica, completado }  ← sin deadline
    // todo:                { task/name/descripcion, dueDate, done }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const alcanceRetrasado = (alcanceEntregables || []).filter(ent => {
        const d = ent.deadline ? new Date(ent.deadline) : null;
        return d && d < hoy && !ent.completado;
    });
    const hitosRetrasados = (tiempoFechasCriticas || []).filter(h => {
        const d = h.date ? new Date(h.date) : null;
        return d && d < hoy && !h.completado;
    });
    const costosRetrasados = (costoEntregable || []).filter(c => {
        const d = c.deadline ? new Date(c.deadline) : null;
        return d && d < hoy && !c.completado;
    });
    // Calidad no tiene deadline → pendientes = no completadas
    const calidadPendiente = (calidadMetricas || []).filter(c => !c.completado);
    const tareasAtrasadas = (todo || []).filter(t => {
        const d = t.dueDate ? new Date(t.dueDate) : null;
        return d && d < hoy && !t.done;
    });
    const hayRetrasos = alcanceRetrasado.length > 0 || hitosRetrasados.length > 0 ||
        costosRetrasados.length > 0 || tareasAtrasadas.length > 0;
    const hayCualquierAlerta = hayRetrasos || calidadPendiente.length > 0;

    // ── Impacto acumulado de cambios Aprobados ──
    const solicitudesAprobadas = (listaSolicitudes || []).filter(s => s.estado === 'Aprobado');
    const impactoDolares = solicitudesAprobadas.reduce((acc, s) => {
        const val = parseFloat(getAnalisisImpacto(s).dolares);
        return acc + (isNaN(val) ? 0 : val);
    }, 0);
    const totalImpactoTiempo = solicitudesAprobadas
        .reduce((acc, s) => {
            const ai = typeof s.analisis_impacto === 'string'
                ? (() => { try { return JSON.parse(s.analisis_impacto); } catch { return {}; } })()
                : (s.analisis_impacto || {});
            return acc + Number(ai.tiempo || 0);
        }, 0);

    // ── Matriz de riesgos ──
    const generateRiskMatrix = (showResidual = false) => {
        const matrixData = [];
        for (let impacto = 3; impacto >= 1; impacto--) {
            const row = [];
            for (let probabilidad = 1; probabilidad <= 3; probabilidad++) {
                const riesgosEnCelda = (riesgosList || []).filter(r => {
                    const prob = showResidual && r.probabilidad_residual !== null ? r.probabilidad_residual : r.probabilidad;
                    const imp = showResidual && r.impacto_residual !== null ? r.impacto_residual : r.impacto;
                    return prob === probabilidad && imp === impacto;
                });
                const valor = probabilidad * impacto;
                let nivel = 'low';
                if (valor === 9) nivel = 'high';
                else if (valor >= 4) nivel = 'medium';
                row.push({ valor, nivel, riesgos: riesgosEnCelda });
            }
            matrixData.push(row);
        }
        return matrixData;
    };

    const getCellStyle = (nivel) => {
        switch (nivel) {
            case 'high': return styles.matrixCellHigh;
            case 'medium': return styles.matrixCellMedium;
            default: return styles.matrixCellLow;
        }
    };
    const getNivelLabel = (nivel) => {
        switch (nivel) {
            case 'high': return 'Alto';
            case 'medium': return 'Medio';
            default: return 'Bajo';
        }
    };

    const matrixInicial = riesgosList && riesgosList.length > 0 ? generateRiskMatrix(false) : null;
    const hasResidual = riesgosList && riesgosList.some(r => r.completado);
    const matrixResidual = hasResidual ? generateRiskMatrix(true) : null;

    return (
        <Document>
            {/* ══════════════════════════════════════════════════
                PÁGINA 1 — Info general + Satisfacción/Cambios
            ══════════════════════════════════════════════════ */}
            <Page size="A4" style={styles.page}>
                <Image src="/img/goru-logo.jpg" style={styles.logo} />
                <Text style={styles.title}>Informe de Avance del {tipoEntidad}</Text>

                {/* Info del informe */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información del Informe</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Generado por:</Text>
                        <Text style={styles.value}>{informe.nombre_persona}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha del Informe:</Text>
                        <Text style={styles.value}>
                            {new Date(informe.fecha_informe).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                    </View>
                </View>

                {/* Info del proyecto */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información del {tipoEntidad}</Text>
                    <View style={styles.row}><Text style={styles.label}>Nombre:</Text><Text style={styles.value}>{projectDetail?.nombre}</Text></View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Estado:</Text>
                        <Text style={styles.value}>
                            {projectDetail?.estado === 'P' && 'Planificado'}
                            {projectDetail?.estado === 'S' && 'Iniciado'}
                            {projectDetail?.estado === 'X' && 'En Ejecución'}
                            {projectDetail?.estado === 'E' && 'Cerrado'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Director:</Text>
                        <Text style={styles.value}>
                            {projectDetail?.DirectorProyecto?.Persona
                                ? `${projectDetail.DirectorProyecto.Persona.nombre} ${projectDetail.DirectorProyecto.Persona.apellido}`
                                : 'No asignado'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Patrocinador:</Text>
                        <Text style={styles.value}>
                            {projectDetail?.Patrocinador?.Persona
                                ? `${projectDetail.Patrocinador.Persona.nombre} ${projectDetail.Patrocinador.Persona.apellido}`
                                : 'No asignado'}
                        </Text>
                    </View>
                    <View style={styles.row}><Text style={styles.label}>Departamento:</Text><Text style={styles.value}>{projectDetail?.Departamento?.nombre || 'N/A'}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Información breve:</Text><Text style={styles.value}>{projectDetail?.informacion || 'N/A'}</Text></View>
                    {!esPrograma && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Tipo de proyecto:</Text>
                            <Text style={styles.value}>
                                {projectDetail?.tipo_proyecto === 1 && 'Ágil'}
                                {projectDetail?.tipo_proyecto === 2 && 'Predictivo'}
                                {projectDetail?.tipo_proyecto === 3 && 'Híbrido'}
                            </Text>
                        </View>
                    )}
                    {/* ── Datos financieros y temporales para análisis ── */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Presupuesto Planificado:</Text>
                        <Text style={[styles.value, { color: '#0066cc', fontWeight: 'bold' }]}>{formatCurrency(presupuesto)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha de Inicio:</Text>
                        <Text style={styles.value}>{formatDate(projectDetail?.fecha_inicio)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha de Cierre:</Text>
                        <Text style={styles.value}>{formatDate(projectDetail?.fecha_cierre)}</Text>
                    </View>
                    {ganttSummary && (
                        <>
                            <View style={styles.row}>
                                <Text style={styles.label}>Inicio del Proyecto (Gantt):</Text>
                                <Text style={styles.value}>{ganttSummary.start}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Fin del Proyecto (Gantt):</Text>
                                <Text style={styles.value}>{ganttSummary.end}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Total Días del Proyecto:</Text>
                                <Text style={[styles.value, { fontWeight: 'bold' }]}>{ganttSummary.totalDays} días</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Resumen satisfacción, cambios y desvío aprobado */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen de Satisfacción y Control de Cambios</Text>
                    <View style={styles.gridContainer}>
                        <View style={{ width: '33%', padding: 4, marginBottom: 8 }}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Promedio Encuestas de Satisfacción</Text>
                                <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                    {estadisticas?.satisfaccionGeneral || 'N/A'} / 5
                                </Text>
                                <Text style={{ fontSize: 7, color: '#666', marginTop: 2 }}>
                                    Basado en {estadisticas?.totalEncuestas || 0} encuesta(s)
                                </Text>
                            </View>
                        </View>
                        <View style={{ width: '33%', padding: 4, marginBottom: 8 }}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Total Cambios de Estado</Text>
                                <Text style={[styles.cardValue, styles.cardValueSuccess]}>{logs?.length || 0}</Text>
                            </View>
                        </View>
                        <View style={{ width: '33%', padding: 4, marginBottom: 8 }}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Solicitudes Aprobadas</Text>
                                <Text style={[styles.cardValue, { color: '#0066cc' }]}>{totalesAprobados.cantidad}</Text>
                                <Text style={{ fontSize: 7, color: '#666', marginTop: 2 }}>
                                    de {listaSolicitudes.length} solicitudes
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Bloque desvío acumulado aprobado */}
                    {totalesAprobados.cantidad > 0 && (
                        <View style={{
                            marginTop: 8,
                            padding: 8,
                            backgroundColor: '#fff3cd',
                            borderWidth: 1,
                            borderColor: '#ffc107',
                            borderRadius: 3,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#856404', marginBottom: 4 }}>
                                    TOTAL DESVÍO ACUMULADO (APROBADO)
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                                        {totalesAprobados.tiempo} días laborables
                                    </Text>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#28a745', marginLeft: 16 }}>
                                        {formatCurrency(totalesAprobados.dolares)} USD adicionales
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Resumen Ejecución (solo si aplica) */}
                {(ejecutado || cerrado) && resumenEjecucion && !esActividad && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Resumen de Ejecución</Text>
                        <View style={styles.gridContainer}>
                            <View style={styles.gridItem}><View style={styles.card}><Text style={styles.cardTitle}>Avance de Alcance</Text><Text style={[styles.cardValue, styles.cardValueSuccess]}>{resumenEjecucion.alcance}%</Text></View></View>
                            <View style={styles.gridItem}><View style={styles.card}><Text style={styles.cardTitle}>Avance de Hitos</Text><Text style={[styles.cardValue, styles.cardValueSuccess]}>{resumenEjecucion.hitos}%</Text></View></View>
                            <View style={styles.gridItem}>
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>Desviación de Costos</Text>
                                    <Text style={[styles.cardValue, resumenEjecucion.costoDesviacion >= 0 ? styles.cardValueSuccess : styles.cardValueDanger]}>
                                        {resumenEjecucion.costoDesviacion}%
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.gridItem}><View style={styles.card}><Text style={styles.cardTitle}>{esPrograma ? 'Avance de Beneficios' : 'Avance de Calidad'}</Text><Text style={[styles.cardValue, styles.cardValueSuccess]}>{esPrograma ? resumenEjecucion.beneficios : resumenEjecucion.calidad}%</Text></View></View>
                            <View style={styles.gridItem}><View style={styles.card}><Text style={styles.cardTitle}>Nivel de Riesgo</Text><Text style={[styles.cardValue, styles.cardValueWarning]}>{resumenEjecucion.riesgoPromedio}%</Text></View></View>
                            {resumenEjecucion.gantt > 0 && (
                                <View style={styles.gridItem}><View style={styles.card}><Text style={styles.cardTitle}>Avance de Gantt</Text><Text style={[styles.cardValue, styles.cardValueSuccess]}>{resumenEjecucion.gantt}%</Text></View></View>
                            )}
                        </View>
                    </View>
                )}

                <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
            </Page>

            {/* ══════════════════════════════════════════════════
                PÁGINA 2 — Detalle de Encuestas de Satisfacción
            ══════════════════════════════════════════════════ */}
            {listaEncuestas && listaEncuestas.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Detalle de Encuestas de Satisfacción</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableCellHeader, { flex: 2 }]}>Nombre</Text>
                                <Text style={styles.tableCellHeaderCenter}>Fecha</Text>
                                <Text style={styles.tableCellHeaderCenter}>Comunicación</Text>
                                <Text style={styles.tableCellHeaderCenter}>Plazos</Text>
                                <Text style={styles.tableCellHeaderCenter}>Alcance</Text>
                                <Text style={styles.tableCellHeaderCenter}>Calidad</Text>
                                <Text style={styles.tableCellHeaderCenter}>Promedio</Text>
                            </View>
                            {listaEncuestas.map((enc, i) => {
                                const promedio = parseFloat(calcularPromedioEncuesta(enc));
                                const badgeStyle = promedio >= 4 ? styles.badgeSuccess : promedio >= 3 ? styles.badgeWarning : styles.badgeDanger;
                                return (
                                    <View key={enc.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>{enc.nombre}</Text>
                                        <Text style={styles.tableCellCenter}>{new Date(enc.createdAt).toLocaleDateString('es-ES')}</Text>
                                        <Text style={styles.tableCellCenter}>{enc.comunicacion || '-'}</Text>
                                        <Text style={styles.tableCellCenter}>{enc.cumplimiento_plazos || '-'}</Text>
                                        <Text style={styles.tableCellCenter}>{enc.cumplimiento_alcance || '-'}</Text>
                                        <Text style={styles.tableCellCenter}>{enc.calidad_entregado || '-'}</Text>
                                        <Text style={[styles.tableCellCenter, { fontWeight: 'bold' }]}>{promedio} / 5</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                    <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
                </Page>
            )}

            {/* ══════════════════════════════════════════════════
                PÁGINA 3 — Detalle de Control de Cambios
            ══════════════════════════════════════════════════ */}
            {listaSolicitudes && listaSolicitudes.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Detalle de Solicitudes de Control de Cambios</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableCellHeader, { flex: 0.4 }]}>#</Text>
                                <Text style={[styles.tableCellHeader, { flex: 2 }]}>Nombre del Cambio</Text>
                                <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Solicitante</Text>
                                <Text style={styles.tableCellHeaderCenter}>Impacto</Text>
                                <Text style={styles.tableCellHeaderCenter}>Estado</Text>
                                <Text style={[styles.tableCellHeader, { flex: 2 }]}>Resolución</Text>
                            </View>
                            {listaSolicitudes.map((sol, i) => (
                                <View key={sol.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                    <Text style={[styles.tableCell, { flex: 0.4 }]}>{sol.id}</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{sol.nombre_cambio}</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{sol.nombre_solicitante}</Text>
                                    <Text style={[styles.tableCellCenter, getBadgeStyle(getBadgeImpacto(sol.impacto_proyecto))]}>
                                        {sol.impacto_proyecto}
                                    </Text>
                                    <Text style={[styles.tableCellCenter, getBadgeStyle(getBadgeEstadoCambio(sol.estado))]}>
                                        {sol.estado}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                        {sol.resolucion || 'Sin resolución'}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Análisis de impacto — solo cuando tiempo o dólares tienen valor */}
                        {listaSolicitudes.some(s => {
                            const ai = typeof s.analisis_impacto === 'string'
                                ? {}
                                : (s.analisis_impacto || {});
                            return ai.tiempo || ai.dolares;
                        }) && (
                                <>
                                    <Text style={[styles.subSectionTitle, { marginTop: 14 }]}>Análisis de Impacto por Solicitud</Text>
                                    {listaSolicitudes
                                        .filter(s => {
                                            const ai = typeof s.analisis_impacto === 'string'
                                                ? {}
                                                : (s.analisis_impacto || {});
                                            return ai.tiempo || ai.dolares;
                                        })
                                        .map(sol => {
                                            const ai = sol.analisis_impacto || {};
                                            return (
                                                <View key={sol.id} style={[styles.warningBox, { marginBottom: 6 }]}>
                                                    <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>#{sol.id} — {sol.nombre_cambio}</Text>
                                                    {ai.descripcion ? <Text>Descripción: {ai.descripcion}</Text> : null}
                                                    {ai.tiempo ? <Text>Impacto en tiempo: {ai.tiempo}</Text> : null}
                                                    {ai.dolares ? <Text>Impacto económico: ${ai.dolares}</Text> : null}
                                                </View>
                                            );
                                        })}
                                </>
                            )}

                        {/* Impacto acumulado de cambios Aprobados */}
                        {solicitudesAprobadas.length > 0 && (
                            <View style={{ marginTop: 14 }}>
                                <Text style={[styles.subSectionTitle, { color: '#28a745' }]}>
                                    Impacto Acumulado de Cambios Aprobados ({solicitudesAprobadas.length})
                                </Text>
                                <View style={[styles.gridContainer, { marginTop: 6 }]}>
                                    <View style={styles.gridItemFull}>
                                        <View style={[styles.card, { borderWidth: 1, borderColor: '#28a745' }]}>
                                            <Text style={styles.cardTitle}>Impacto Económico Total</Text>
                                            <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                                ${impactoDolares.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Text>
                                            <Text style={{ fontSize: 7, color: '#666', marginTop: 2 }}>
                                                suma de {solicitudesAprobadas.length} solicitud{solicitudesAprobadas.length !== 1 ? 'es' : ''} aprobada{solicitudesAprobadas.length !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.gridItemFull}>
                                        <View style={[styles.card, { borderWidth: 1, borderColor: '#28a745' }]}>
                                            <Text style={styles.cardTitle}>Impacto en Tiempo</Text>
                                            {totalImpactoTiempo > 0 ? (
                                                <>
                                                    <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                                        {totalImpactoTiempo}
                                                    </Text>
                                                    <Text style={{ fontSize: 7, color: '#666', marginTop: 2 }}>
                                                        días laborables acumulados
                                                    </Text>
                                                </>
                                            ) : (
                                                <Text style={{ fontSize: 8, color: '#999', marginTop: 4 }}>
                                                    Sin impacto en tiempo registrado
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                    <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
                </Page>
            )}

            {/* ══════════════════════════════════════════════════
                PÁGINA 4 — Elementos Retrasados / Pendientes
            ══════════════════════════════════════════════════ */}
            {hayCualquierAlerta && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.sectionTitleDanger}>⚠ Elementos Retrasados / Pendientes</Text>

                    {/* Alcance: { nombre, deadline, completado, fecha_entregable } */}
                    {alcanceRetrasado.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.subSectionTitle}>
                                Alcance retrasado ({alcanceRetrasado.length} entregable(s))
                            </Text>
                            <View style={styles.table}>
                                <View style={styles.tableHeaderDanger}>
                                    <Text style={[styles.tableCellHeader, { flex: 2 }]}>Entregable</Text>
                                    <Text style={styles.tableCellHeaderCenter}>Fecha Límite</Text>
                                    <Text style={styles.tableCellHeaderCenter}>Fecha Entregable Real</Text>
                                </View>
                                {alcanceRetrasado.map((ent, i) => (
                                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>{ent.nombre}</Text>
                                        <Text style={[styles.tableCellCenter, styles.dangerText]}>
                                            {ent.deadline ? new Date(ent.deadline).toLocaleDateString('es-ES') : '-'}
                                        </Text>
                                        <Text style={styles.tableCellCenter}>
                                            {ent.fecha_entregable ? new Date(ent.fecha_entregable).toLocaleDateString('es-ES') : '-'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Hitos: { description, date, completado, fecha_hito } */}
                    {hitosRetrasados.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.subSectionTitle}>
                                Hitos retrasados ({hitosRetrasados.length})
                            </Text>
                            <View style={styles.table}>
                                <View style={styles.tableHeaderDanger}>
                                    <Text style={[styles.tableCellHeader, { flex: 2 }]}>Hito</Text>
                                    <Text style={styles.tableCellHeaderCenter}>Fecha Planificada</Text>
                                    <Text style={styles.tableCellHeaderCenter}>Fecha Real del Hito</Text>
                                </View>
                                {hitosRetrasados.map((h, i) => (
                                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>{h.description}</Text>
                                        <Text style={[styles.tableCellCenter, styles.dangerText]}>
                                            {h.date ? new Date(h.date).toLocaleDateString('es-ES') : '-'}
                                        </Text>
                                        <Text style={styles.tableCellCenter}>
                                            {h.fecha_hito ? new Date(h.fecha_hito).toLocaleDateString('es-ES') : '-'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Costos: { entregable, costo, costoReal, deadline, completado, fecha_cerrado } */}
                    {costosRetrasados.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.subSectionTitle}>
                                Costos retrasados ({costosRetrasados.length})
                            </Text>
                            <View style={styles.table}>
                                <View style={styles.tableHeaderDanger}>
                                    <Text style={[styles.tableCellHeader, { flex: 2 }]}>Entregable</Text>
                                    <Text style={styles.tableCellHeaderCenter}>Costo Plan. ($)</Text>
                                    <Text style={styles.tableCellHeaderCenter}>Costo Real ($)</Text>
                                    <Text style={styles.tableCellHeaderCenter}>Fecha Límite</Text>
                                </View>
                                {costosRetrasados.map((c, i) => (
                                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>{c.entregable}</Text>
                                        <Text style={styles.tableCellCenter}>{c.costo ?? '-'}</Text>
                                        <Text style={styles.tableCellCenter}>{c.costoReal ?? '-'}</Text>
                                        <Text style={[styles.tableCellCenter, styles.dangerText]}>
                                            {c.deadline ? new Date(c.deadline).toLocaleDateString('es-ES') : '-'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Calidad: { entregable, metrica, completado } — sin deadline, se muestran pendientes */}
                    {calidadPendiente.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.subSectionTitle}>
                                Calidad pendiente ({calidadPendiente.length}) — sin fecha de cierre registrada
                            </Text>
                            <View style={styles.table}>
                                <View style={[styles.tableHeader, { backgroundColor: '#fff3cd' }]}>
                                    <Text style={[styles.tableCellHeader, { flex: 2 }]}>Entregable</Text>
                                    <Text style={[styles.tableCellHeader, { flex: 3 }]}>Métrica</Text>
                                </View>
                                {calidadPendiente.map((c, i) => (
                                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>{c.entregable}</Text>
                                        <Text style={[styles.tableCell, { flex: 3, color: c.metrica ? '#000' : '#999' }]}>
                                            {c.metrica || 'Sin métrica definida'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Tareas: { task/name/descripcion, dueDate, done } */}
                    {tareasAtrasadas.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.subSectionTitle}>
                                Tareas retrasadas ({tareasAtrasadas.length})
                            </Text>
                            <View style={styles.table}>
                                <View style={styles.tableHeaderDanger}>
                                    <Text style={[styles.tableCellHeader, { flex: 3 }]}>Tarea</Text>
                                    <Text style={styles.tableCellHeaderCenter}>Fecha Límite</Text>
                                </View>
                                {tareasAtrasadas.map((t, i) => (
                                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                        <Text style={[styles.tableCell, { flex: 3 }]}>{t.task || t.name || t.descripcion}</Text>
                                        <Text style={[styles.tableCellCenter, styles.dangerText]}>
                                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString('es-ES') : '-'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
                </Page>
            )}

            {/* ══════════════════════════════════════════════════
                PÁGINA 5 — Resumen de Desempeño + Riesgos (Inicial)
            ══════════════════════════════════════════════════ */}
            {(ejecutado || cerrado) && resumenDesempeno && !esActividad && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.sectionTitle}>Resumen de Desempeño</Text>
                    <View style={styles.gridContainer}>
                        {[
                            { label: 'Alcance', key: 'alcance' },
                            { label: 'Hitos', key: 'hitos' },
                            { label: 'Costos', key: 'costos' },
                            { label: 'Todo', key: 'todo' },
                            { label: 'Kanban', key: 'eficiencia' },
                            { label: 'Cronograma', key: 'cronograma' },
                        ].map(({ label, key }) => (
                            <View style={styles.gridItem} key={key}>
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>{label}</Text>
                                    <Text style={[styles.cardValue, resumenDesempeno[key] >= 1 ? styles.cardValueSuccess : styles.cardValueDanger]}>
                                        {resumenDesempeno[key]?.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {matrixInicial && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Matriz de Calor de Riesgos (Inicial)</Text>
                            <View style={styles.matrixContainer}>
                                <View style={styles.matrixGrid}>
                                    {matrixInicial.map((row, rowIndex) => (
                                        <View key={rowIndex} style={styles.matrixRow}>
                                            {row.map((cell, colIndex) => (
                                                <View key={colIndex} style={[styles.matrixCell, getCellStyle(cell.nivel)]}>
                                                    <Text style={styles.matrixCellLabel}>{getNivelLabel(cell.nivel)}</Text>
                                                    <Text style={styles.matrixCellText}>({cell.valor})</Text>
                                                    {cell.riesgos.length > 0 && (
                                                        <Text style={styles.matrixCellRiesgos}>
                                                            {cell.riesgos.map(r => r.id).join(', ')}
                                                        </Text>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.matrixLabels}>
                                    <Text>← Probabilidad: Bajo (1) | Medio (2) | Alto (3) →</Text>
                                </View>
                                <View style={styles.legend}>
                                    <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#28a745' }]} /><Text style={styles.legendText}>Bajo (1-3)</Text></View>
                                    <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#ffc107' }]} /><Text style={styles.legendText}>Medio (4-6)</Text></View>
                                    <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#dc3545' }]} /><Text style={styles.legendText}>Alto (9)</Text></View>
                                </View>
                            </View>
                        </View>
                    )}

                    <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
                </Page>
            )}

            {/* ══════════════════════════════════════════════════
                PÁGINA 6 — Matriz Residual (si existe)
            ══════════════════════════════════════════════════ */}
            {matrixResidual && !esActividad && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.sectionTitle}>Matriz de Calor de Riesgos (Residual)</Text>
                    <View style={styles.matrixContainer}>
                        <View style={styles.matrixGrid}>
                            {matrixResidual.map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.matrixRow}>
                                    {row.map((cell, colIndex) => (
                                        <View key={colIndex} style={[styles.matrixCell, getCellStyle(cell.nivel)]}>
                                            <Text style={styles.matrixCellLabel}>{getNivelLabel(cell.nivel)}</Text>
                                            <Text style={styles.matrixCellText}>({cell.valor})</Text>
                                            {cell.riesgos.length > 0 && (
                                                <Text style={styles.matrixCellRiesgos}>
                                                    {cell.riesgos.map(r => r.id).join(', ')}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                        <View style={styles.matrixLabels}>
                            <Text>← Probabilidad: Bajo (1) | Medio (2) | Alto (3) →</Text>
                        </View>
                        <View style={styles.legend}>
                            <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#28a745' }]} /><Text style={styles.legendText}>Bajo (1-3)</Text></View>
                            <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#ffc107' }]} /><Text style={styles.legendText}>Medio (4-6)</Text></View>
                            <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#dc3545' }]} /><Text style={styles.legendText}>Alto (9)</Text></View>
                        </View>
                    </View>
                    <View style={[styles.section, { marginTop: 10 }]}>
                        <Text style={{ fontSize: 9, fontStyle: 'italic' }}>
                            Riesgos con plan completado: {(riesgosList || []).filter(r => r.completado).length} de {(riesgosList || []).length}
                        </Text>
                    </View>
                    <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
                </Page>
            )}

            {/* ══════════════════════════════════════════════════
                PÁGINA FINAL — Lecciones, Conclusiones, Próximos Pasos
            ══════════════════════════════════════════════════ */}
            <Page size="A4" style={styles.page}>
                {cerrado && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Lecciones Aprendidas</Text>
                        <View style={styles.textBlock}>
                            <Text>
                                {leccionesAprendidas && leccionesAprendidas.trim() !== ''
                                    ? leccionesAprendidas
                                    : 'No disponible por el momento'}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conclusiones del Informe</Text>
                    <View style={styles.textBlock}><Text>{informe.conclusiones}</Text></View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Próximos Pasos</Text>
                    <View style={styles.textBlock}><Text>{informe.proximos_pasos}</Text></View>
                </View>

                <Text style={styles.footer}>
                    Documento generado automáticamente el {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
            </Page>
        </Document>
    );
};

export default InformeAvancePdf;