/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { pdf } from '@react-pdf/renderer';
import LoaderButton from '../components/loaderButton/LoaderButton';
import ContactPopup from '../components/contactPopup/ContactPopup';
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

const CUPO_MAXIMO = 2;

function formatFechaIntento(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function MadurezHubView({
    estado,
    onNuevo,
    onVerResultado,
    onVolver,
}) {
    const { resultados = [], puedeRealizarOtro, cupoAgotado, cupoMaximo } = estado;

    return (
        <div>
            <div className="madurez-actions-top">
                <Button variant="outline-secondary" size="sm" onClick={onVolver}>
                    ← Volver a Instrumentos
                </Button>
            </div>

            {cupoAgotado ? (
                <Alert variant="warning" className="madurez-cupo-alert">
                    Ha utilizado su cupo de {cupoMaximo || CUPO_MAXIMO} assessments.
                    Si necesita realizar más evaluaciones, envíenos un mensaje para ampliar su cupo.
                </Alert>
            ) : (
                <Alert variant="info" className="madurez-cupo-alert">
                    Puede realizar {cupoMaximo || CUPO_MAXIMO} assessments.
                    {' '}Le queda <strong>{(cupoMaximo || CUPO_MAXIMO) - resultados.length}</strong> por completar.
                </Alert>
            )}

            <div className="madurez-hub-actions">
                {puedeRealizarOtro && (
                    <Button variant="success" onClick={onNuevo}>
                        Realizar {resultados.length === 0 ? 'assessment' : 'otro assessment'}
                    </Button>
                )}
                {cupoAgotado && (
                    <ContactPopup>
                        <Button variant="success">Solicitar ampliar cupo</Button>
                    </ContactPopup>
                )}
            </div>

            {resultados.length > 0 && (
                <div className="madurez-hub-resultados">
                    <h3 className="orange">Sus resultados</h3>
                    {resultados.map((r) => (
                        <div key={r.id} className="madurez-hub-card">
                            <div>
                                <strong>Assessment {r.numeroIntento || '—'}</strong>
                                <p className="blue mb-0 small">
                                    {formatFechaIntento(r.fechaCompletado)}
                                    {' · '}
                                    {r.porcentajeMadurez}% — Nivel {r.nivelMadurez}
                                </p>
                            </div>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => onVerResultado(r)}
                            >
                                Ver resultado
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MadurezResultadoView({ resultado, onVolver, onHub, puedeRealizarOtro }) {
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
            <div className="madurez-actions-top madurez-result-actions-top">
                <Button variant="outline-secondary" size="sm" onClick={onVolver}>
                    ← Volver a Instrumentos
                </Button>
                {onHub && (
                    <Button variant="outline-primary" size="sm" onClick={onHub}>
                        ← Volver al menú del assessment
                    </Button>
                )}
            </div>

            {resultado.numeroIntento && (
                <p className="blue small mb-2">
                    Resultado del assessment {resultado.numeroIntento}
                    {resultado.fechaCompletado ? ` — ${formatFechaIntento(resultado.fechaCompletado)}` : ''}
                </p>
            )}

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

            {puedeRealizarOtro && onHub && (
                <div className="madurez-hub-actions mt-4">
                    <Button variant="success" onClick={onHub}>
                        Realizar otro assessment
                    </Button>
                </div>
            )}
        </div>
    );
}

function MadurezDireccionProyectos({ dispatch, usuario }) {
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [estadoMadurez, setEstadoMadurez] = useState(null);
    const [vista, setVista] = useState('hub');
    const [resultadoVista, setResultadoVista] = useState(null);
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

    const resetWizard = useCallback(() => {
        setPaso(0);
        setRespuestas(Array(TOTAL_PREGUNTAS).fill(null));
        setNombreContacto('');
        setEmpresa('');
        setCelular('');
        setCorreoContacto('');
        setError('');
    }, []);

    const cargarEstado = useCallback(async () => {
        if (!usuario?.id) {
            setCargando(false);
            return;
        }
        setCargando(true);
        setError('');
        try {
            const { data } = await getMadurezDireccionEstado(usuario.id);
            setEstadoMadurez(data);
            const cantidad = data.cantidad || 0;
            if (cantidad === 0) {
                resetWizard();
                setVista('wizard');
            } else {
                setVista('hub');
                setResultadoVista(null);
            }
        } catch (e) {
            setEstadoMadurez(null);
            resetWizard();
            setVista('wizard');
            setError('');
        } finally {
            setCargando(false);
        }
    }, [usuario?.id, resetWizard]);

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
                const estadoRes = await getMadurezDireccionEstado(usuario.id);
                const nuevoEstado = estadoRes.data;
                setEstadoMadurez(nuevoEstado);
                const ultimo = nuevoEstado.resultados?.length
                    ? nuevoEstado.resultados[nuevoEstado.resultados.length - 1]
                    : data.resultado;
                setResultadoVista(ultimo);
                setVista('resultado');
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

    const irAlHub = () => {
        setResultadoVista(null);
        setVista('hub');
    };

    const iniciarNuevoAssessment = () => {
        if (!estadoMadurez?.puedeRealizarOtro) return;
        resetWizard();
        setVista('wizard');
    };

    const verResultado = (resultado) => {
        setResultadoVista(resultado);
        setVista('resultado');
    };

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

    if (vista === 'hub' && estadoMadurez) {
        return (
            <div className="page-container">
                <hr className="separator" />
                <div className="madurez-form">
                    <h1 className="orange">Assessment de Madurez en Dirección de Proyectos</h1>
                    <MadurezHubView
                        estado={estadoMadurez}
                        onNuevo={iniciarNuevoAssessment}
                        onVerResultado={verResultado}
                        onVolver={volverInstrumentos}
                    />
                </div>
            </div>
        );
    }

    if (vista === 'resultado' && resultadoVista) {
        const puedeOtro = estadoMadurez?.puedeRealizarOtro === true;
        return (
            <div className="page-container">
                <hr className="separator" />
                <div className="madurez-form">
                    <h1 className="orange">Assessment de Madurez en Dirección de Proyectos</h1>
                    <MadurezResultadoView
                        resultado={resultadoVista}
                        onVolver={volverInstrumentos}
                        onHub={estadoMadurez?.cantidad > 0 ? irAlHub : null}
                        puedeRealizarOtro={puedeOtro}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <hr className="separator" />
            <div className="madurez-form">
                <div className="madurez-actions-top madurez-result-actions-top">
                    <Button variant="outline-secondary" size="sm" onClick={volverInstrumentos}>
                        ← Volver a Instrumentos
                    </Button>
                    {(estadoMadurez?.cantidad || 0) > 0 && (
                        <Button variant="outline-primary" size="sm" onClick={irAlHub}>
                            ← Volver al menú del assessment
                        </Button>
                    )}
                </div>

                <h1 className="orange">Assessment de Madurez en Dirección de Proyectos</h1>
                <p className="blue madurez-dimension-desc">
                    Permite identificar el nivel inicial de madurez en Dirección de Proyectos de su organización.
                    {(estadoMadurez?.cantidad || 0) > 0 && (
                        <> Assessment {(estadoMadurez.cantidad || 0) + 1} de {estadoMadurez.cupoMaximo || CUPO_MAXIMO}.</>
                    )}
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
