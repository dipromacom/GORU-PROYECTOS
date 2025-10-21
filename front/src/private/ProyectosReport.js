/* eslint-disable no-unused-vars */
import { Page, Text, View, Image, Document, StyleSheet, Link } from "@react-pdf/renderer";
import moment from 'moment'
import { statesFromChar } from '../libs/statesLib'
import { showDuration, riesgosMap, tiposInformesMap } from '../libs/utils'


const blueColor = '#132544';
const greenColor = '#51ca11';
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 11,
        paddingTop: 30,
        paddingLeft: 60,
        paddingRight: 60,
        lineHeight: 1.5,
        //flexDirection: 'column',
    },

    pageBackground: {
        position: 'absolute',
        display: 'block',
        top: '40%',
        left: '40%',
        width: '50%',
        zindex: '-1'
    },

    // REPORT TITLE
    titleContainer: {
        flexDirection: 'column',
        marginTop: 20,
    },
    reportTitle: {
        color: blueColor,
        fontSize: 22,
        textAlign: 'center',
    },

    // REPORT SUBTITLE
    subTitleContainer: {
        flexDirection: 'column',
        marginTop: 6,
    },
    reportSubTitle: {
        color: blueColor,
        fontSize: 16,
        textAlign: 'center',
    },

    // REPORT DESCRIPTION
    descriptionContainer: {
        flexDirection: 'row',
        marginTop: 16,
    },

    description: {
        color: blueColor,
        fontSize: 12,
        textAlign: 'left',
    },

    // TABLE HEADER
    tableContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 18,
        borderWidth: 1,
        borderColor: blueColor,
    },
    container: {
        flexDirection: 'row',
        // borderBottomColor: greenColor,
        backgroundColor: greenColor,
        color: '#fff',
        // borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        textAlign: 'center',
        fontStyle: 'bold',
        flexGrow: 1,
    },
    nombre: {
        width: '30%',
        borderRightColor: blueColor,
        borderRightWidth: 1,
    },
    responsable: {
        width: '30%',
        borderRightColor: blueColor,
        borderRightWidth: 1,
    },
    fecha: {
        width: '20%',
        borderRightColor: blueColor,
        borderRightWidth: 1,
    },
    estado: {
        width: '20%',
    },

    // TABLE ITEM
    row: {
        flexDirection: 'row',
        borderBottomColor: blueColor,
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        fontStyle: 'bold',
    },
    nombreItem: {
        width: '30%',
        textAlign: 'left',
        borderRightColor: blueColor,
        borderRightWidth: 1,
        paddingLeft: 8,
    },
    responsableItem: {
        width: '30%',
        borderRightColor: blueColor,
        borderRightWidth: 1,
        textAlign: 'left',
        paddingLeft: 8,
    },
    fechaItem: {
        width: '20%',
        borderRightColor: blueColor,
        borderRightWidth: 1,
        textAlign: 'left',
        paddingLeft: 8,
    },

    estadoItem: {
        width: '20%',
        textAlign: 'right',
        paddingRight: 8,
    },

    subtitle: {
        fontFamily: 'Helvetica-Bold'
    },

    info: {
        marginTop: 8,
        marginBottom: 8
    },

    fecha_critica_row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },

    fecha_critica_col_desc: {
        width: '80%',
        textAlign: 'left'
    },

    fecha_critica_col_date: {
        width: '20%',
        textAlign: 'right'
    },

    metricas_row: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: blueColor
    },

    riesgos_col_desc: {
        width: '64%',
    },

    riesgos_col_prob: {
        width: '12%',
    },

    riesgos_col_imp: {
        width: '12%'
    },

    riesgos_col_val: {
        width: '12%'
    },

    title: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 16,
        width: "100%",
        borderBottomColor: blueColor,
        borderBottomWidth: 1
    },
    mainTitle: {
        flexDirection: 'column',
        marginTop: 6,
        fontFamily: 'Helvetica-Bold',
        fontSize: 18,
        width: "100%",
        textAlign: 'center',
    }

});



export const ProyectoListPDF = ({ proyectosList, dateFrom = '', dateTo = '' }) => (
    <Document title={`Lista de Proyectos ${(dateFrom || null) && (dateTo || null) ? `comenzados desde ${moment(dateFrom).format('DD/MM/YYYY')} hasta ${moment(dateTo).format('DD/MM/YYYY')}` : ""
        }`}>
        <Page size="A4" style={styles.page}>
            <Image src="./Goru-a4.png" style={styles.pageBackground} />

            <View style={styles.titleContainer}>
                <Text style={styles.reportTitle}>Listado de Proyectos {
                    (dateFrom || null) && (dateTo || null) ? `comenzados desde ${moment(dateFrom).format('DD/MM/YYYY')} hasta ${moment(dateTo).format('DD/MM/YYYY')}` : ""
                }</Text>
            </View>

            {/* <View style={styles.subTitleContainer}>
                <Text style={styles.reportSubTitle}>Batch - {details.nombre}</Text>
            </View>

            <View style={styles.descriptionContainer}>
                <Text style={styles.description}>Descripción: {details.descripcion}</Text>
            </View> */}

            <View style={styles.tableContainer}>
                <View style={styles.container}>
                    <Text style={styles.nombre}>Nombre</Text>
                    <Text style={styles.responsable}>Director de Proyecto</Text>
                    <Text style={styles.fecha}>Fecha de Inicio</Text>
                    <Text style={styles.estado}>Estado</Text>
                </View>
            </View>

            {
                proyectosList.map(item =>
                    <View style={styles.row} key={item.id}>
                        <Text style={styles.nombreItem}>{item.nombre.length > 20 ? `${item.nombre.substring(0, 19)}...` : item.nombre}</Text>
                        <Text style={styles.responsableItem}>{`${item.DirectorProyecto?.Persona.nombre ?? ''} ${item.DirectorProyecto?.Persona.apellido ?? ''}`}</Text>
                        <Text style={styles.fechaItem}>{item.fecha_inicio ? moment(item.fecha_inicio).format('D [de] MMM, YYYY') : '-'}</Text>
                        <Text style={styles.estadoItem}>{
                            item.estado === 'C'
                                ? 'Creado'
                                : item.estado === 'S' 
                                    ? 'Iniciado'
                                    : 'No definido'
                        }</Text>
                    </View>
                )
            }

        </Page>
    </Document>
);


export const ProyectoPdf = ({ proyecto }) => {
    let {
        numero,
        nombre,
        informacion,
        fecha_creacion,
        fecha_inicio,
        pendiente_asignacion,
        documentacion_adjunta,
        contrato,
        caso_negocio,
        portafolio,
        enunciado,
        programa,
        justificacion,
        descripcion,
        analisis_viabilidad,
        objetivo_desc,
        objetivo_costo,
        objetivo_plazo,
        objetivo_desempeno,
        alcance_entregables,
        tiempo_duracion,
        tiempo_fechas_criticas,
        costo_entregable,
        costo_reserva_contingencia,
        costo_reserva_gestion,
        calidad_metricas,
        riesgos,
        recursos_requeridos,
        supuestos,
        restricciones,
        max_desvio_presupuesto,
        max_desvio_tiempo,
        dir_autorizado_firmas,
        dir_tareas_funciones,
        tipos_informes,
        incentivo,
        autidad_control_cambios,
        director,
        tipo_proyecto,
        empresa,
        departamento,
        patrocinador,
        DirectorProyecto,
        Patrocinador,
        Empresa,
        Departamento,
        TipoProyecto
    } = proyecto

    return (
        <Document title={nombre}>
            <Page size="A4" style={styles.page}>
                {/*<Image src="/img/Goru-a4.png" style={styles.pageBackground} />*/}
                <View style={styles.titleContainer}>
                    <Text style={styles.reportTitle}>{nombre}</Text>
                </View>
                <View>
                    <Text style={styles.mainTitle}>DATOS GENERALES</Text>

                    {DirectorProyecto?.Persona?.nombre ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Director del proyecto:</Text> {DirectorProyecto.Persona.nombre} {DirectorProyecto.Persona.apellido || ""}
                    </Text> : <></>}
                    {Patrocinador?.Persona?.nombre ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Patrocinador del Proyecto:</Text> {Patrocinador.Persona.nombre} {Patrocinador.Persona.apellido || ""}
                    </Text> : <></>}
                    {Departamento?.nombre ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Departamento:</Text> {Departamento.nombre}
                    </Text> : <></>}
                    {informacion ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Información:</Text> {informacion}
                    </Text> : <></>}
                    {fecha_creacion ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Fecha de Creación:</Text> {moment(fecha_creacion).format('DD/MM/YYYY')}
                    </Text> : <></>}
                    {fecha_inicio ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Fecha de Inicio:</Text> {moment(fecha_inicio).format('DD/MM/YYYY')}
                    </Text> : <></>}
                    {TipoProyecto?.nombre ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Tipo de Proyecto:</Text> {TipoProyecto.nombre}
                    </Text> : <></>}
                    {/* 🔹 Salto de página */}
                    <View style={{ marginTop: 20 }} break />
                    
                    <Text style={styles.mainTitle}>ACTA CONSITITUCIÓN</Text>
                    
                    <Text style={styles.info}>
                        <Text style={styles.subtitle}>Pendiente de Asignación:</Text> {pendiente_asignacion ? 'Sí' : 'No'}
                    </Text>
                    {/*{informacion ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Información:</Text> {informacion}
                    </Text> : <></>}
                    {fecha_creacion ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Fecha de Creación:</Text> {moment(fecha_creacion).format('DD/MM/YYYY')}
                    </Text> : <></>}
                    {fecha_inicio ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Fecha de Inicio:</Text> {moment(fecha_inicio).format('DD/MM/YYYY')}
                    </Text> : <></>}*/}
                    {documentacion_adjunta ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Documentación Adjunta: </Text> <Link src={documentacion_adjunta}>{documentacion_adjunta}</Link>
                    </Text> : <></>}
                    {contrato ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Contrato: </Text> <Link src={contrato}>{contrato}</Link>
                    </Text> : <></>}
                    {caso_negocio ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Caso de Negocio: </Text> <Link src={caso_negocio}>{caso_negocio}</Link>
                    </Text> : <></>}
                    {enunciado ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Enunciado de Trabajo: </Text> <Link src={enunciado}>{enunciado}</Link>
                    </Text> : <></>}
                    {portafolio ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Portafolio:</Text> {portafolio}
                    </Text> : <></>}
                    {programa ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Programa:</Text> {programa}
                    </Text> : <></>}
                    {(justificacion || descripcion || analisis_viabilidad) ?
                        <Text style={styles.title}>Información Previa</Text> : <></>}
                    {justificacion ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Justificación del Proyecto:</Text> {justificacion}
                    </Text> : <></>}
                    {descripcion ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Descripción del Proyecto:</Text> {descripcion}
                    </Text> : <></>}
                    {analisis_viabilidad ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Análisis previo de Viabilidad:</Text> {analisis_viabilidad}
                    </Text> : <></>}
                    {(objetivo_desc || objetivo_costo || objetivo_plazo || objetivo_desempeno) ?
                        <Text style={styles.title}>Objetivos del Proyecto </Text> : <></>}
                    {objetivo_desc ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Objetivo Descripción:</Text> {objetivo_desc}
                    </Text> : <></>}
                    {objetivo_costo ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Objetivo Costo:</Text> {objetivo_costo}
                    </Text> : <></>}
                    {objetivo_plazo ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Objetivo Plazo:</Text> {objetivo_plazo}
                    </Text> : <></>}
                    {objetivo_desempeno ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Objetivo Desempeño:</Text> {objetivo_desempeno}
                    </Text> : <></>}
                    {(alcance_entregables || tiempo_duracion || tiempo_fechas_criticas || costo_entregable || costo_reserva_contingencia || costo_reserva_gestion || calidad_metricas) ?
                        <Text style={styles.title}>Descripción del proyecto a alto nivel </Text> : <></>}
                    {alcance_entregables ?
                        <View style={styles.info}>
                            <Text style={styles.subtitle}>Alcance Entregables:</Text>
                            {alcance_entregables.map((value, idx) => (
                                <Text key={idx}>{value}</Text>
                            ))}
                        </View> : <></>}
                    {tiempo_duracion ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Duración:</Text> {showDuration(tiempo_duracion)}
                    </Text> : <></>}
                    {
                        tiempo_fechas_criticas ?
                        <View style={styles.info}>
                            <Text style={styles.subtitle}>Fechas Criticas:</Text>
                            {
                                tiempo_fechas_criticas.map((fc, idx) => (
                                    <View style={styles.fecha_critica_row}>
                                        <Text style={styles.fecha_critica_col_desc} key={`col1_${idx}`}>{fc.description}</Text>
                                        <Text style={styles.fecha_critica_col_date} key={`col2_${idx}`}>{moment(fc.date).format('DD/MM/YYYY')}</Text>
                                    </View>
                                ))
                            }
                        </View> : <></>
                    }
                    {
                        costo_entregable ?
                        <View style={styles.info}>
                            <Text style={styles.subtitle}>Costo Por entregables</Text>
                            {
                                costo_entregable.map((fc, idx) => (
                                    <View style={styles.fecha_critica_row}>
                                        <Text style={styles.fecha_critica_col_desc} key={`col1_${idx}`}>{fc.entregable}</Text>
                                        <Text style={styles.fecha_critica_col_date} key={`col2_${idx}`}>${fc.costo}</Text>
                                    </View>
                                ))
                            }
                        </View> : <></>
                    }
                    {costo_reserva_contingencia ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Reserva de Contingencia:</Text> ${costo_reserva_contingencia}
                    </Text> : <></>}
                    {costo_reserva_gestion ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Reserva de Gestion:</Text> ${costo_reserva_gestion}
                    </Text> : <></>}
                    {
                        calidad_metricas ?
                        <View style={styles.info}>
                            <Text style={styles.subtitle}>Metricas / criterios de aceptación: </Text>
                            {
                                calidad_metricas.map((fc, idx) => (
                                    <View style={styles.metricas_row}>
                                        <Text><Text style={styles.subtitle}>Entregable:</Text> {fc.entregable}</Text>
                                        <Text><Text style={styles.subtitle}>Métrica:</Text> {fc.metrica}</Text>
                                    </View>
                                ))
                            }
                        </View> : <></>
                    }
                    {(riesgos) ?
                        <Text style={styles.title}>Riesgos Críticos</Text> : <></>}

                    {
                        riesgos ?
                        <View style={styles.info}>
                            {
                                riesgos.map((fc, idx) => (
                                    <View style={styles.fecha_critica_row}>
                                        <Text style={styles.riesgos_col_desc} key={`col1_${idx}`}>{fc.descripcion}</Text>
                                        <Text style={styles.riesgos_col_prob} key={`col2_${idx}`}>{riesgosMap[fc.probabilidad]}</Text>
                                        <Text style={styles.riesgos_col_imp} key={`col3_${idx}`}>{riesgosMap[fc.impacto]}</Text>
                                        <Text style={styles.riesgos_col_val} key={`col4_${idx}`}>{riesgosMap[fc.Valor]}</Text>
                                    </View>
                                ))
                            }
                        </View> : <></>
                    }
                    {(recursos_requeridos || supuestos || restricciones) ?
                        <Text style={styles.title}>Alcance</Text> : <></>}
                    {recursos_requeridos ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Recursos Requeridos:</Text> {recursos_requeridos}
                    </Text> : <></>}
                    {supuestos ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Supuestos:</Text> {supuestos}
                    </Text> : <></>}
                    {restricciones ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Restricciones:</Text> {restricciones}
                    </Text> : <></>}
                    
                    {(max_desvio_presupuesto || max_desvio_tiempo || dir_autorizado_firmas || dir_tareas_funciones || tipos_informes || incentivo || autidad_control_cambios) ?
                        <Text style={styles.title}>Alcance</Text> : <></>}
                    {max_desvio_presupuesto ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Máximo desvio de Presupuesto:</Text> ${max_desvio_presupuesto}
                    </Text> : <></>}
                    {max_desvio_tiempo ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Máximo desvio de Tiempo:</Text> ${max_desvio_tiempo}
                    </Text> : <></>}
                    <Text style={styles.info}>
                        <Text style={styles.subtitle}>Autorizado de Firmas:</Text> {dir_autorizado_firmas ? 'Sí' : 'No'}
                    </Text>
                    {dir_tareas_funciones ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Tareas / Funciones:</Text> {dir_tareas_funciones}
                    </Text> : <></>}
                    {tipos_informes ?
                        <View style={styles.info}>
                            <Text style={styles.subtitle}>Tipos de Informes:</Text>
                            {
                                tipos_informes.map((ti, idx) => (
                                    <Text key={idx}>{tiposInformesMap[ti]}</Text>
                                ))
                            }

                        </View> : <></>}
                    {incentivo ? <Text style={styles.info}>
                        <Text style={styles.subtitle}>Incentivo:</Text> {incentivo}
                    </Text> : <></>}
                    <Text style={styles.info}>
                        <Text style={styles.subtitle}>Autoridad Control de Cambios:</Text> {autidad_control_cambios ? 'Sí' : 'No'}
                    </Text>
                </View>
            </Page>
        </Document>)
}

export const convertToCsvData = (dataList) => {
    return dataList.map(item => ({
        id: item.id,
        nombre: item.nombre,
        responsable: `${item.DirectorProyecto?.Persona.nombre ?? ''} ${item.DirectorProyecto?.Persona.apellido ?? ''}`,
        inicio: item.fecha_inicio ? moment(item.fecha_inicio).format('LLL') : '-',
        estado: statesFromChar(item.estado)
    }))
}

export const csvHeader = [
    { "lable": "id", "key": "id" },
    { "label": "Nombre", "key": "nombre" },
    { "label": "Responsable", "key": "responsable" },
    { "label": "Fecha Inicio", "key": "inicio" },
    { "label": "Estado", "key": "estado" },
]