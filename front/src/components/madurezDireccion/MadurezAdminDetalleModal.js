import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { DIMENSIONES, ESCALA_RESPUESTA } from '../../data/madurezDireccionProyectosData';
import { getNivelPorPorcentaje } from '../../utils/madurezDireccionCalculos';
import './MadurezAdminDetalleModal.css';

const escalaLabel = (valor) => {
    const item = ESCALA_RESPUESTA.find((e) => e.valor === Number(valor));
    return item ? `${item.valor} – ${item.titulo}` : String(valor);
};

function MadurezAdminDetalleModal({ show, onHide, detalle }) {
    if (!detalle) return null;

    const nivel = getNivelPorPorcentaje(detalle.porcentajeMadurez);
    const interpretacion = detalle.interpretacion || {};

    return (
        <Modal show={show} onHide={onHide} size="lg" scrollable centered>
            <Modal.Header closeButton>
                <Modal.Title className="blue">
                    Detalle del assessment — {detalle.empresa}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="madurez-admin-modal-body">
                <section className="madurez-admin-resumen">
                    <div className="madurez-admin-resumen-item">
                        <span className="label">Contacto</span>
                        <span>{detalle.nombreContacto}</span>
                    </div>
                    <div className="madurez-admin-resumen-item">
                        <span className="label">Correo</span>
                        <span>{detalle.correoContacto}</span>
                    </div>
                    <div className="madurez-admin-resumen-item">
                        <span className="label">Celular</span>
                        <span>{detalle.celular}</span>
                    </div>
                    <div className="madurez-admin-resumen-item">
                        <span className="label">Usuario GORU</span>
                        <span>{detalle.usuarioEmail || detalle.usuarioId || '—'}</span>
                    </div>
                    <div className="madurez-admin-resumen-item">
                        <span className="label">Fecha</span>
                        <span>
                            {detalle.fechaCompletado
                                ? new Date(detalle.fechaCompletado).toLocaleString('es-ES')
                                : '—'}
                        </span>
                    </div>
                    <div className="madurez-admin-resumen-item madurez-admin-resumen-highlight">
                        <span className="label">Resultado</span>
                        <span className="orange">
                            {detalle.puntajeTotal} / 300 ({detalle.porcentajeMadurez}%)
                        </span>
                    </div>
                    <div className="madurez-admin-resumen-item madurez-admin-resumen-highlight">
                        <span className="label">Nivel</span>
                        <span className="orange">
                            Nivel {nivel.nivel} – {nivel.nombre} ({nivel.rangoLabel})
                        </span>
                    </div>
                </section>

                {interpretacion.lecturaEjecutiva && (
                    <section className="madurez-admin-block">
                        <h6 className="orange">Lectura ejecutiva</h6>
                        <p>{interpretacion.lecturaEjecutiva}</p>
                    </section>
                )}

                <section className="madurez-admin-block">
                    <h6 className="orange">Respuestas por dimensión</h6>
                    {DIMENSIONES.map((dim, dimIndex) => {
                        const puntajeDim = detalle.puntajesDimension
                            ? detalle.puntajesDimension[dimIndex]
                            : null;
                        return (
                            <div key={dim.id} className="madurez-admin-dimension">
                                <div className="madurez-admin-dimension-header">
                                    <strong>{dim.id}. {dim.titulo}</strong>
                                    {puntajeDim != null && (
                                        <span className="madurez-admin-dim-score">
                                            {puntajeDim} / 25 pts
                                        </span>
                                    )}
                                </div>
                                <ul className="madurez-admin-preguntas">
                                    {dim.preguntas.map((pregunta, qIndex) => {
                                        const globalIndex = dimIndex * 5 + qIndex;
                                        const valor = detalle.respuestas
                                            ? detalle.respuestas[globalIndex]
                                            : '—';
                                        return (
                                            <li key={pregunta}>
                                                <span className="madurez-admin-pregunta-text">{pregunta}</span>
                                                <span className="madurez-admin-pregunta-valor">
                                                    {escalaLabel(valor)}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </section>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default MadurezAdminDetalleModal;
