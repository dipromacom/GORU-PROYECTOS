import React, { useCallback } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
    NOVA_INSTR_GORU_HOY,
    buildNovaHoyDump,
    openNovaPopup,
} from '../informeAvance/novaInformeDump';

/**
 * Asistente Goru — contexto efímero vía NOVA (sin API, sin guardar informe).
 * El botón principal abre NOVA en ventana emergente y copia instrucción + volcado.
 */
function GoruQueHacemosHoyPanel(props) {
    const {
        proyectoId,
        usuario,
        projectDetail,
        resumenEjecucion,
        resumenDesempeno,
        estadisticas,
        logs,
        riesgosList,
        listaSolicitudes,
        listaEncuestas,
        alcanceEntregables,
        tiempoFechasCriticas,
        costoEntregable,
        calidadMetricas,
        todo,
        totalesAprobados,
        presupuesto,
        ganttSummary,
        leccionesAprendidas,
        compact = false,
    } = props;

    const dumpProps = {
        proyectoId,
        usuario,
        projectDetail,
        resumenEjecucion,
        resumenDesempeno,
        estadisticas,
        logs,
        riesgosList,
        listaSolicitudes,
        listaEncuestas,
        alcanceEntregables,
        tiempoFechasCriticas,
        costoEntregable,
        calidadMetricas,
        todo,
        totalesAprobados,
        presupuesto,
        ganttSummary,
        leccionesAprendidas,
    };

    const copiar = useCallback(async (texto) => {
        try {
            await navigator.clipboard.writeText(texto);
            const truncado = texto.includes('[--- GORU: volcado truncado');
            toast.success(
                truncado
                    ? 'Copiado (volcado truncado al final). Pegá en NOVA.'
                    : 'Copiado. Pegá en la ventana emergente de NOVA (Ctrl+V).',
            );
        } catch {
            toast.warn('No se pudo copiar al portapapeles.');
        }
    }, []);

    const handleAbrirAsistente = () => {
        const win = openNovaPopup();
        if (!win) {
            toast.warn('El navegador bloqueó la ventana emergente. Permití ventanas para este sitio y probá de nuevo.');
        }
        copiar(NOVA_INSTR_GORU_HOY + buildNovaHoyDump(dumpProps));
    };

    return (
        <>
            <Card
                className={`border-primary border-opacity-25 shadow-sm ${compact ? '' : 'mb-4'}`}
                style={{ background: 'linear-gradient(135deg, #f8fbff 0%, #fff 100%)' }}
            >
                <Card.Body className={compact ? 'py-3' : 'py-4'}>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <span className="fs-3" role="img" aria-hidden>
                                🤖
                            </span>
                            <div>
                                <strong className="d-block text-primary">Goru — ¿Qué hacemos hoy?</strong>
                                <small className="text-muted">
                                    Prioridades del día con NOVA; no guarda informe (solo contexto copiado).
                                </small>
                            </div>
                        </div>
                        <Button variant="primary" type="button" className="px-4" onClick={handleAbrirAsistente}>
                            Abrir asistente
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal heredado (ya no enlazado a la UI); se conserva el componente por si se reutiliza. */}
            <Modal show={false} onHide={() => { }} aria-hidden="true">
                <Modal.Header closeButton>
                    <Modal.Title>Goru — panel heredado</Modal.Title>
                </Modal.Header>
                <Modal.Body className="small text-muted">
                    El flujo actual usa solo el botón «Abrir asistente»: abre NOVA en ventana emergente y copia el
                    contexto al portapapeles.
                </Modal.Body>
            </Modal>
        </>
    );
}

export default GoruQueHacemosHoyPanel;
