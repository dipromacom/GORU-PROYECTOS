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
    cardValueSuccess: {
        color: '#28a745',
    },
    cardValueDanger: {
        color: '#dc3545',
    },
    cardValueWarning: {
        color: '#ffc107',
    },
    // Estilos para la matriz de riesgos
    matrixContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
    },
    matrixGrid: {
        flexDirection: 'column',
        marginTop: 5,
    },
    matrixRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    matrixCell: {
        width: '33.33%',
        padding: 8,
        margin: 1,
        borderRadius: 3,
        minHeight: 60,
    },
    matrixCellHigh: {
        backgroundColor: '#dc3545',
    },
    matrixCellMedium: {
        backgroundColor: '#ffc107',
    },
    matrixCellLow: {
        backgroundColor: '#28a745',
    },
    matrixCellText: {
        color: '#ffffff',
        fontSize: 8,
        textAlign: 'center',
        marginBottom: 2,
    },
    matrixCellLabel: {
        fontSize: 7,
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    matrixCellRiesgos: {
        fontSize: 7,
        color: '#ffffff',
        marginTop: 3,
        textAlign: 'center',
    },
    matrixLabels: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 5,
        fontSize: 8,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        padding: 5,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 15,
        height: 15,
        marginRight: 5,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 8,
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        right: 30,
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

const InformeAvancePdf = ({
    informe,
    projectDetail,
    resumenEjecucion,
    resumenDesempeno,
    estadisticas,
    logs,
    riesgosList,
    leccionesAprendidas
}) => {
    const esActividad = projectDetail?.modo === "A";
    const esPrograma = projectDetail?.modo === "PR";
    const cerrado = projectDetail?.estado === "E";
    const ejecutado = projectDetail?.estado === "X";

    const tipoEntidad = esActividad ? "Proyecto Personal" : esPrograma ? "Programa" : "Proyecto";

    // Función para generar la matriz de calor
    const generateRiskMatrix = (showResidual = false) => {
        const matrixData = [];

        for (let impacto = 3; impacto >= 1; impacto--) {
            const row = [];
            for (let probabilidad = 1; probabilidad <= 3; probabilidad++) {
                const riesgosEnCelda = riesgosList.filter(r => {
                    const prob = showResidual && r.probabilidad_residual !== null
                        ? r.probabilidad_residual
                        : r.probabilidad;
                    const imp = showResidual && r.impacto_residual !== null
                        ? r.impacto_residual
                        : r.impacto;
                    return prob === probabilidad && imp === impacto;
                });

                const valor = probabilidad * impacto;
                let nivel = 'low';
                if (valor === 9) nivel = 'high';
                else if (valor >= 4 && valor <= 6) nivel = 'medium';

                row.push({
                    valor,
                    nivel,
                    riesgos: riesgosEnCelda
                });
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
            {/* PÁGINA 1 */}
            <Page size="A4" style={styles.page}>
                <Image src="/img/goru-logo.jpg" style={styles.logo} />
                <Text style={styles.title}>Informe de Avance del {tipoEntidad}</Text>

                {/* Información del Informe */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información del Informe</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Generado por:</Text>
                        <Text style={styles.value}>{informe.nombre_persona}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha del Informe:</Text>
                        <Text style={styles.value}>
                            {new Date(informe.fecha_informe).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>

                {/* Información del Proyecto */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información del {tipoEntidad}</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nombre:</Text>
                        <Text style={styles.value}>{projectDetail?.nombre}</Text>
                    </View>
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
                            {projectDetail?.DirectorProyecto?.Persona ?
                                `${projectDetail.DirectorProyecto.Persona.nombre} ${projectDetail.DirectorProyecto.Persona.apellido}` :
                                'No asignado'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Patrocinador:</Text>
                        <Text style={styles.value}>
                            {projectDetail?.Patrocinador?.Persona ?
                                `${projectDetail.Patrocinador.Persona.nombre} ${projectDetail.Patrocinador.Persona.apellido}` :
                                'No asignado'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Departamento:</Text>
                        <Text style={styles.value}>{projectDetail?.Departamento?.nombre || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Información breve:</Text>
                        <Text style={styles.value}>{projectDetail?.informacion || 'N/A'}</Text>
                    </View>
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
                </View>

                {/* Resumen de Satisfacción y Control de cambios */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen de Satisfacción y Control de Cambios</Text>
                    <View style={styles.gridContainer}>
                        <View style={styles.gridItemFull}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Promedio Encuestas de Satisfacción</Text>
                                <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                    {estadisticas?.satisfaccionGeneral || 'N/A'} / 5
                                </Text>
                            </View>
                        </View>
                        <View style={styles.gridItemFull}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Total Cambios de Estados</Text>
                                <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                    {logs?.length || 0}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Resumen de Ejecución */}
                {(ejecutado || cerrado) && resumenEjecucion && !esActividad && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Resumen de Ejecución</Text>
                        <View style={styles.gridContainer}>
                            <View style={styles.gridItem}>
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>Avance de Alcance</Text>
                                    <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                        {resumenEjecucion.alcance}%
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.gridItem}>
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>Avance de Hitos</Text>
                                    <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                        {resumenEjecucion.hitos}%
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.gridItem}>
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>Desviación de Costos</Text>
                                    <Text style={[
                                        styles.cardValue,
                                        resumenEjecucion.costoDesviacion >= 0 ? styles.cardValueSuccess : styles.cardValueDanger
                                    ]}>
                                        {resumenEjecucion.costoDesviacion}%
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.gridItem}>
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>
                                        {esPrograma ? 'Avance de Beneficios' : 'Avance de Calidad'}
                                    </Text>
                                    <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                        {esPrograma ? resumenEjecucion.beneficios : resumenEjecucion.calidad}%
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.gridItem}>
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>Nivel de Riesgo</Text>
                                    <Text style={[styles.cardValue, styles.cardValueWarning]}>
                                        {resumenEjecucion.riesgoPromedio}%
                                    </Text>
                                </View>
                            </View>
                            {resumenEjecucion.gantt > 0 && (
                                <View style={styles.gridItem}>
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Avance de Gantt</Text>
                                        <Text style={[styles.cardValue, styles.cardValueSuccess]}>
                                            {resumenEjecucion.gantt}%
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
            </Page>

            {/* PÁGINA 2 - Resumen de Desempeño */}
            {(ejecutado || cerrado) && resumenDesempeno && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.sectionTitle}>Resumen de Desempeño</Text>
                    <View style={styles.gridContainer}>
                        <View style={styles.gridItem}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Alcance</Text>
                                <Text style={[
                                    styles.cardValue,
                                    resumenDesempeno.alcance >= 1 ? styles.cardValueSuccess : styles.cardValueDanger
                                ]}>
                                    {resumenDesempeno.alcance.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Hitos</Text>
                                <Text style={[
                                    styles.cardValue,
                                    resumenDesempeno.hitos >= 1 ? styles.cardValueSuccess : styles.cardValueDanger
                                ]}>
                                    {resumenDesempeno.hitos.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Costos</Text>
                                <Text style={[
                                    styles.cardValue,
                                    resumenDesempeno.costos >= 1 ? styles.cardValueSuccess : styles.cardValueDanger
                                ]}>
                                    {resumenDesempeno.costos.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Todo</Text>
                                <Text style={[
                                    styles.cardValue,
                                    resumenDesempeno.todo >= 1 ? styles.cardValueSuccess : styles.cardValueDanger
                                ]}>
                                    {resumenDesempeno.todo.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Kanban</Text>
                                <Text style={[
                                    styles.cardValue,
                                    resumenDesempeno.eficiencia >= 1 ? styles.cardValueSuccess : styles.cardValueDanger
                                ]}>
                                    {resumenDesempeno.eficiencia.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Cronograma</Text>
                                <Text style={[
                                    styles.cardValue,
                                    resumenDesempeno.cronograma >= 1 ? styles.cardValueSuccess : styles.cardValueDanger
                                ]}>
                                    {resumenDesempeno.cronograma.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Matriz de Riesgos Inicial */}
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
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: '#28a745' }]} />
                                        <Text style={styles.legendText}>Bajo (1-3)</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: '#ffc107' }]} />
                                        <Text style={styles.legendText}>Medio (4-6)</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: '#dc3545' }]} />
                                        <Text style={styles.legendText}>Alto (9)</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
                </Page>
            )}

            {/* PÁGINA 3 - Matriz Residual (si existe) */}
            {matrixResidual && (
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
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: '#28a745' }]} />
                                <Text style={styles.legendText}>Bajo (1-3)</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: '#ffc107' }]} />
                                <Text style={styles.legendText}>Medio (4-6)</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: '#dc3545' }]} />
                                <Text style={styles.legendText}>Alto (9)</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.section, { marginTop: 20 }]}>
                        <Text style={{ fontSize: 9, fontStyle: 'italic' }}>
                            Riesgos con plan completado: {riesgosList.filter(r => r.completado).length} de {riesgosList.length}
                        </Text>
                    </View>

                    <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
                </Page>
            )}

            {/* PÁGINA FINAL - Lecciones, Conclusiones y Próximos Pasos */}
            <Page size="A4" style={styles.page}>
                {/* Lecciones Aprendidas */}
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

                {/* Conclusiones */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conclusiones del Informe</Text>
                    <View style={styles.textBlock}>
                        <Text>{informe.conclusiones}</Text>
                    </View>
                </View>

                {/* Próximos Pasos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Próximos Pasos</Text>
                    <View style={styles.textBlock}>
                        <Text>{informe.proximos_pasos}</Text>
                    </View>
                </View>

                <Text style={styles.footer}>
                    Documento generado automáticamente el {new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Text>
                <Text style={styles.pageNumber} render={({ pageNumber }) => `Página ${pageNumber}`} fixed />
            </Page>
        </Document>
    );
};

export default InformeAvancePdf;