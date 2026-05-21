/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { pdf } from '@react-pdf/renderer';
import LoaderButton from '../components/loaderButton/LoaderButton';
import MadurezDireccionPdf from '../components/madurezDireccion/MadurezDireccionPdf';
import { DownloadPdfButton } from '../components/downloadPdfButton/downloadPdfButton';
import { selectors as sessionSelectors } from '../reducers/session';
import { actions as routesActions } from '../reducers/routes';
import {
    getMadurezDireccionEstado,
    guardarMadurezDireccion,
} from '../api';
import { onError } from '../libs/errorLib';
import {
    ESCALA_RESPUESTA,
    DIMENSIONES,
    TOTAL_PREGUNTAS,
    PUNTAJE_MAXIMO_TOTAL,
    TOTAL_PASOS,
} from '../data/madurezDireccionProyectosData';
import {
    calcularResultados,
    dimensionPreguntasCompletas,
    getNivelPorPorcentaje,
} from '../utils/madurezDireccionCalculos';
import '../css/Commons.css';
import './MadurezDireccionProyectos.css';

const PASOS_LABELS = [
    'Introducción',
    ...DIMENSIONES.map((d, i) => `Dimensión ${i + 1} de 12`),
    'Datos de contacto',
];

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function MadurezResultadoView({ resultado, onVolver }) {
    const { interpretacion } = resultado;
    const nivel = getNivelPorPorcentaje(resultado.porcentajeMadurez);
    const contacto = {
        nombreContacto: resultado.nombreContacto,
        empresa: resultado.empresa,
        celular: resultado.celular,
        correoContacto: resultado.correoContacto,
    };

    const pdfDoc = (
        <MadurezDireccionPdf resultado={resultado} contacto={contacto} />
    );

    return (
        <div>
            <div className="madurez-actions-top">
                <Button variant="outline-secondary" size="sm" onClick={onVolver}>
                    ← Volver a Instrumentos
                </Button>
            </div>

            <div className="madurez-result-hero">
                <p className="blue mb-1">Resultado obtenido</p>
                <div className="madurez-result-score">{resultado.porcentajeMadurez}%</div>
                <p className="blue">
                    {resultado.puntajeTotal} puntos de {PUNTAJE_MAXIMO_TOTAL}
                </p>
                <p className="orange" style={{ fontSize: 16, fontWeight: 600 }}>
                    Nivel {nivel.nivel} – {nivel.nombre}
                </p>
                <p className="blue" style={{ fontSize: 12 }}>
                    Rango: {nivel.rangoLabel || `${nivel.rangoMin}% – ${nivel.rangoMax}%`}
                </p>
                <p className="blue" style={{ fontSize: 13 }}>{nivel.interpretacionCorta}</p>
            </div>

            <div className="center" style={{ marginBottom: 24 }}>
                <DownloadPdfButton pdfReport={pdfDoc} reportPrefix="Madurez-Direccion-Proyectos">
                    <button type="button" className="btn btn-success">
                        Descargar resultado (PDF)
                    </button>
                </DownloadPdfButton>
            </div>

            <p className="blue madurez-dimension-desc">{nivel.descripcion}</p>

            <table className="madurez-dim-table blue">
                <thead>
                    <tr>
                        <th>Dimensión</th>
                        <th>Puntaje</th>
                        <th style={{ width: '35%' }}>Avance</th>
                    </tr>
                </thead>
                <tbody>
                    {(interpretacion?.dimensionesDetalle || []).map((d) => (
                        <tr key={d.id}>
                            <td>{d.titulo}</td>
                            <td>{d.puntaje} / 25 ({d.porcentaje}%)</td>
                            <td>
                                <div className="madurez-dim-bar">
                                    <div
                                        className="madurez-dim-bar-fill"
                                        style={{ width: `${d.porcentaje}%` }}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="madurez-section-block">
                <h4>Características principales</h4>
                <ul>
                    {(nivel.caracteristicas || []).map((c) => <li key={c}>{c}</li>)}
                </ul>
            </div>

            <div className="madurez-section-block">
                <h4>Riesgo principal</h4>
                <p className="blue" style={{ fontSize: 13, margin: 0 }}>{nivel.riesgo}</p>
            </div>

            <div className="madurez-section-block">
                <h4>Prioridad recomendada</h4>
                <p className="blue" style={{ fontSize: 13, margin: 0 }}>{nivel.prioridad}</p>
            </div>

            <div className="madurez-section-block">
                <h4>Lectura ejecutiva</h4>
                <p className="blue" style={{ fontSize: 13, margin: 0 }}>{interpretacion?.lecturaEjecutiva}</p>
            </div>

            <div className="madurez-section-block">
                <h4>Próximos pasos recomendados</h4>
                <ul>
                    {(interpretacion?.proximosPasos || []).map((p) => <li key={p}>{p}</li>)}
                </ul>
            </div>
        </div>
    );
}

function MadurezDireccionProyectos({ dispatch, usuario }) {
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [resultadoGuardado, setResultadoGuardado] = useState(null);
    const [paso, setPaso] = useState(0);
    const [respuestas, setRespuestas] = useState(Array(TOTAL_PREGUNTAS).fill(null));
    const [nombreContacto, setNombreContacto] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [celular, setCelular] = useState('');
    const [correoContacto, setCorreoContacto] = useState('');

    const progresoPct = Math.round((paso / (TOTAL_PASOS - 1)) * 100);
    const esPasoDimension = paso >= 1 && paso <= 12;
    const indiceDimension = esPasoDimension ? paso - 1 : -1;
    const dimensionActual = esPasoDimension ? DIMENSIONES[indiceDimension] : null;

    const cargarEstado = useCallback(async () => {
        if (!usuario?.id) {
            setCargando(false);
            return;
        }
        setCargando(true);
        setError('');
        try {
            const { data } = await getMadurezDireccionEstado(usuario.id);
            if (data.completado && data.resultado) {
                setResultadoGuardado(data.resultado);
            }
        } catch (e) {
            // Permite iniciar el test aunque falle la consulta (p. ej. tabla SQL no ejecutada)
            setError('');
        } finally {
            setCargando(false);
        }
    }, [usuario?.id]);

    useEffect(() => {
        cargarEstado();
    }, [cargarEstado]);

    const setRespuesta = (preguntaGlobal, valor) => {
        setRespuestas((prev) => {
            const next = [...prev];
            next[preguntaGlobal] = valor;
            return next;
        });
    };

    const puedeAvanzar = () => {
        if (paso === 0) return true;
        if (esPasoDimension) return dimensionPreguntasCompletas(respuestas, indiceDimension);
        if (paso === 13) {
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoContacto.trim());
            return nombreContacto.trim() && empresa.trim() && celular.trim() && emailOk;
        }
        return false;
    };

    const handleSiguiente = () => {
        if (!puedeAvanzar()) return;
        if (paso < TOTAL_PASOS - 1) setPaso(paso + 1);
    };

    const handleAnterior = () => {
        if (paso > 0) setPaso(paso - 1);
    };

    const handleFinalizar = async () => {
        if (!puedeAvanzar() || !usuario?.id) return;
        setEnviando(true);
        setError('');
        try {
            const resultados = calcularResultados(respuestas);
            const contacto = {
                nombreContacto: nombreContacto.trim(),
                empresa: empresa.trim(),
                celular: celular.trim(),
                correoContacto: correoContacto.trim(),
            };
            const payloadResultado = {
                ...resultados,
                respuestas,
                ...contacto,
            };
            const pdfBlob = await pdf(
                <MadurezDireccionPdf resultado={payloadResultado} contacto={contacto} />
            ).toBlob();
            const pdfBase64 = await blobToBase64(pdfBlob);

            const { data } = await guardarMadurezDireccion(usuario.id, {
                ...contacto,
                respuestas,
                pdfBase64,
            });

            if (data.success) {
                setResultadoGuardado(data.resultado);
            } else {
                setError(data.message || 'Error al guardar el assessment.');
            }
        } catch (e) {
            const msg = e.response?.data?.message || 'Error al enviar el assessment.';
            setError(msg);
            onError(e);
        } finally {
            setEnviando(false);
        }
    };

    const volverInstrumentos = () => dispatch(routesActions.goTo('tools'));

    if (cargando) {
        return (
            <div className="page-container">
                <hr className="separator" />
                <div className="madurez-form blue">
                    <p>Cargando assessment...</p>
                </div>
            </div>
        );
    }

    if (resultadoGuardado) {
        return (
            <div className="page-container">
                <hr className="separator" />
                <div className="madurez-form">
                    <h1 className="orange">Assessment de Madurez en Dirección de Proyectos</h1>
                    <p className="blue">Ya completó este assessment. A continuación puede consultar su resultado.</p>
                    <MadurezResultadoView resultado={resultadoGuardado} onVolver={volverInstrumentos} />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <hr className="separator" />
            <div className="madurez-form">
                <div className="madurez-actions-top">
                    <Button variant="outline-secondary" size="sm" onClick={volverInstrumentos}>
                        ← Volver a Instrumentos
                    </Button>
                </div>

                <h1 className="orange">Assessment de Madurez en Dirección de Proyectos</h1>
                <p className="blue madurez-dimension-desc">
                    Permite identificar el nivel inicial de madurez en Dirección de Proyectos de su organización.
                </p>

                <div className="madurez-progress-wrap">
                    <div className="madurez-progress-meta blue">
                        <span><strong>Paso {paso + 1}</strong> de {TOTAL_PASOS} — {PASOS_LABELS[paso]}</span>
                        <span>{progresoPct}% completado</span>
                    </div>
                    <div className="madurez-progress-bar">
                        <div className="madurez-progress-fill" style={{ width: `${progresoPct}%` }} />
                    </div>
                    <div className="madurez-step-dots">
                        {Array.from({ length: TOTAL_PASOS }).map((_, i) => (
                            <div
                                key={PASOS_LABELS[i]}
                                className={`madurez-step-dot${i === paso ? ' active' : ''}${i < paso ? ' done' : ''}`}
                                title={PASOS_LABELS[i]}
                            />
                        ))}
                    </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {paso === 0 && (
                    <div className="madurez-intro blue">
                        <p>
                            Cada afirmación debe calificarse del <strong>1 al 5</strong>, según el nivel real de cumplimiento en la empresa.
                        </p>
                        <p className="orange" style={{ fontWeight: 600 }}>
                            ¿La empresa gestiona proyectos por esfuerzo individual, por procesos repetibles,
                            por gobierno organizacional o por un sistema integrado de generación de valor?
                        </p>
                        <br />
                        <p><strong>Escala de calificación:</strong></p>
                        {ESCALA_RESPUESTA.map((e) => (
                            <div key={e.valor} className="madurez-escala-item">
                                <strong>{e.valor} — {e.titulo}</strong>
                                <br />
                                {e.descripcion}
                            </div>
                        ))}
                    </div>
                )}

                {esPasoDimension && dimensionActual && (
                    <div>
                        <h3 className="orange">{dimensionActual.titulo}</h3>
                        <p className="blue madurez-dimension-desc">{dimensionActual.descripcion}</p>
                        <br />
                        {dimensionActual.preguntas.map((pregunta, qIndex) => {
                            const globalIndex = indiceDimension * 5 + qIndex;
                            return (
                                <div key={pregunta} className="madurez-pregunta-card">
                                    <p className="madurez-pregunta-text">
                                        <strong>{qIndex + 1}.</strong> {pregunta}
                                    </p>
                                    <div className="madurez-escala-opciones">
                                        {ESCALA_RESPUESTA.map((e) => (
                                            <button
                                                key={e.valor}
                                                type="button"
                                                className={`madurez-escala-btn${respuestas[globalIndex] === e.valor ? ' selected' : ''}`}
                                                onClick={() => setRespuesta(globalIndex, e.valor)}
                                                title={e.titulo}
                                            >
                                                {e.valor}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {paso === 13 && (
                    <Form className="blue">
                        <p className="madurez-dimension-desc">
                            Antes de finalizar, ingrese sus datos de contacto. El resultado se enviará a su correo.
                        </p>
                        <br />
                        <Form.Group controlId="nombreContacto">
                            <Form.Label>Nombre completo *</Form.Label>
                            <Form.Control
                                type="text"
                                value={nombreContacto}
                                onChange={(e) => setNombreContacto(e.target.value)}
                                autoComplete="name"
                            />
                        </Form.Group>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control
                                type="text"
                                value={empresa}
                                onChange={(e) => setEmpresa(e.target.value)}
                                autoComplete="organization"
                            />
                        </Form.Group>
                        <Form.Group controlId="celular">
                            <Form.Label>Celular *</Form.Label>
                            <Form.Control
                                type="tel"
                                value={celular}
                                onChange={(e) => setCelular(e.target.value)}
                                autoComplete="tel"
                            />
                        </Form.Group>
                        <Form.Group controlId="correoContacto">
                            <Form.Label>Correo electrónico *</Form.Label>
                            <Form.Control
                                type="email"
                                value={correoContacto}
                                onChange={(e) => setCorreoContacto(e.target.value)}
                                autoComplete="email"
                            />
                        </Form.Group>
                    </Form>
                )}

                <div className="madurez-nav">
                    <Button
                        variant="outline-secondary"
                        onClick={handleAnterior}
                        disabled={paso === 0 || enviando}
                    >
                        Anterior
                    </Button>

                    {paso < 13 ? (
                        <Button
                            variant="success"
                            onClick={handleSiguiente}
                            disabled={!puedeAvanzar() || enviando}
                        >
                            Siguiente
                        </Button>
                    ) : (
                        <LoaderButton
                            type="button"
                            className="btn-success"
                            onClick={handleFinalizar}
                            isLoading={enviando}
                            disabled={!puedeAvanzar()}
                        >
                            Finalizar y enviar resultado
                        </LoaderButton>
                    )}
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    usuario: sessionSelectors.getUser(state),
});

export default connect(mapStateToProps)(MadurezDireccionProyectos);
