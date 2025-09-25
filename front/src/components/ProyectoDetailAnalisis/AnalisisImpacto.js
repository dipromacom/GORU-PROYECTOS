import React, { useState } from "react";
import { Button, Form, Alert, Row, Col, Card, Modal, InputGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { actions, selectors } from "../../reducers/project";
import { useDispatch } from 'react-redux';
import { toast } from "react-toastify";
import './analisisImpacto.css';

export const AnalisisAmbiental = ({ showNotification, projectID, analysisData }) => {
    const dispatch = useDispatch();
    const { id } = useParams(); // Extrae el id de los parámetros de la ruta
    // const numericId = parseInt(id, 10);
    //USAR USESELECTOR PARA SACAR DE STATE
    const initialCriteria = [
        { criterio_id: 1, text: 'Tiene una política de gestión ambiental y social activa.', weight: 0.1 },
        { criterio_id: 2, text: 'Los productos pueden ser reciclados.', weight: 0.1 },
        { criterio_id: 3, text: 'Los productos son energéticamente eficientes.', weight: 0.1 },
        { criterio_id: 4, text: 'El producto es perjudicial para el medio ambiente.', weight: 0.1 },
        { criterio_id: 5, text: 'El producto, servicio o proyecto es perjudicial para la sociedad o comunidad.', weight: 0.1 },
        { criterio_id: 6, text: 'Posible impacto negativo por residuos sólidos.', weight: 0.1 },
        { criterio_id: 7, text: 'Posible impacto negativo por residuos líquidos.', weight: 0.1 },
        { criterio_id: 8, text: 'Posible impacto negativo por residuos peligrosos.', weight: 0.1 },
        { criterio_id: 9, text: 'Posible impacto negativo en la vida de la sociedad.', weight: 0.1 },
        { criterio_id: 10, text: 'Posible de daño a la imagen.', weight: 0.1 }
    ];

    const [isSaved, setIsSaved] = useState(false);
    const [totalSum, setTotalSum] = useState(0);
    const [criterios, setCriterios] = useState(initialCriteria);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const [criteriosCalificados, setCriteriosCalificados] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [documentLink, setDocumentLink] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLinkSaved, setIsLinkSaved] = useState(false);
    const [totalFinal, settotalFinal] = useState("");
    // console.log({ numericId, id });

    const handleSelectQuestion = (index) => {
        setSelectedQuestionIndex(index);
    };

    const handleCalificar = (calificacion) => {
        const criterio_id = criterios[selectedQuestionIndex].criterio_id;
        setCriteriosCalificados({
            ...criteriosCalificados,
            [criterio_id]: calificacion
        });
    };


    const handleGuardarAnalisis = (event) => {
        event.preventDefault();
        setIsSaving(true);

        const invalidFields = criterios.filter((criterio) => {
            const calificado = criteriosCalificados[criterio.criterio_id];
            return calificado === undefined || calificado < 1 || calificado > 4;
        });

        if (invalidFields.length > 0) {
            setModalMessage("Por favor, asegúrese de calificar todos los criterios con un valor entre 1 y 4.");
            setShowModal(true);
            setIsSaving(false);
            return;
        }

        const factor = 10;
        const totalSumScaled = criterios.reduce((sum, criterio) => {
            const calificado = criteriosCalificados[criterio.criterio_id] || 0;
            return sum + (calificado * (criterio.weight * factor));
        }, 0);

        const totalFinal = totalSumScaled / factor;
        setTotal(totalFinal);

        // **Usamos totalFinal en la comparación**
        if (totalFinal > 3) {
            setModalMessage("Para este proyecto es necesario hacer un plan de manejo ambiental y social del proyecto. Por favor, sube un enlace a un documento de Word desde la nube.");
            setShowModal(true);
        } else {
            setModalMessage("Su proyecto no necesitará un plan de Manejo Ambiental.");
        }

        setShowResults(true);
        setShowModal(true);

        const payload = criterios.map((criterio) => ({
            criterio_id: criterio.criterio_id,
            proyecto_id: id,
            weight: criterio.weight.toFixed(1),
            rating: criteriosCalificados[criterio.criterio_id] || 0,
        }));

        const resultadoAnalisis = {
            proyecto_id: id,
            link: "",
            total_calificacion: totalFinal.toFixed(1),
        };

        dispatch(actions.createAnalisisAmbientalRequest({ payload }));
        dispatch(actions.createRespuestaAnalisisAmbientalRequest({ resultadoAnalisis }));

        toast.success("Análisis guardado correctamente");
        setIsSaved(true);
    };

    // console.log({setTotal});

    const updateEnlace = (event) => {
        event.preventDefault();

        if (!documentLink || documentLink.trim() === "") {
            toast.error("Por favor, ingrese un enlace válido.");
            return;
        }

        // Crear el payload con el nuevo enlace
        const payload = {
            proyecto_id: id,
            link: documentLink.trim(),
            total_calificacion: total.toFixed(1)
        };

        // Realizar el dispatch
        try {
            dispatch(actions.updateRespuestaAnalisisAmbiental(id, payload));
            setIsLinkSaved(true); // Actualizar el estado local
            toast.success("Enlace guardado correctamente");
        } catch (error) {
            console.error("Error al guardar el enlace:", error);
            toast.error("Hubo un problema al guardar el enlace. Inténtalo de nuevo.");
        }
    };


    const handleCloseModal = () => setShowModal(false);

    return (
        <>
            <Form>
                <h2 className="mb-4 text-center">Modelo de Decisión Ambiental</h2>
                <Row className="justify-content-center">
                    <Col md={8}>
                        <table className="table table-bordered table-hover custom-green">
                            <thead className="text-center" style={{ backgroundColor: '#60cd26', color: '#fff' }}>
                                <tr>
                                    <th style={{ width: '10%' }}>#</th>
                                    <th style={{ width: '50%' }}>Criterio</th>
                                    <th style={{ width: '20%' }}>Weight</th>
                                    <th style={{ width: '20%' }}>Calificación</th>
                                    {showResults && <th style={{ width: '20%' }}>Total</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {criterios.map((item, index) => (
                                    <tr key={item.criterio_id} className="align-middle">
                                        <td className="text-center">{index + 1}</td>
                                        <td>{item.text}</td>
                                        <td className="text-center">
                                            <Form.Control
                                                type="number"
                                                value={item.weight || ''}
                                                readOnly
                                                className="text-center bg-light border-0"
                                            />
                                        </td>
                                        <td className="text-center">
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                max="4"
                                                value={criteriosCalificados[item.criterio_id] || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const parsedValue = parseInt(value, 10);

                                                    if (value === "") {
                                                        // Si se deja vacío, reseteamos la calificación del criterio
                                                        setCriteriosCalificados((prev) => ({
                                                            ...prev,
                                                            [item.criterio_id]: undefined,
                                                        }));
                                                    } else if (parsedValue >= 1 && parsedValue <= 4) {
                                                        // Actualizamos la calificación del criterio
                                                        setCriteriosCalificados((prev) => ({
                                                            ...prev,
                                                            [item.criterio_id]: parsedValue,
                                                        }));
                                                    } else {
                                                        // Mostramos un mensaje de error si el valor está fuera del rango permitido
                                                        setModalMessage("Solo se permiten calificaciones de 1 a 4. Por favor, ingresa un valor válido.");
                                                        setShowModal(true);
                                                    }
                                                }}
                                                placeholder="1 - 4"
                                                className="text-center"
                                                disabled={isSaved} 
                                            />
                                        </td>

                                        {showResults &&(
                                        <td className="text-center">
                                            {((criteriosCalificados[item.criterio_id] || 0) * item.weight).toFixed(1)}
                                            {/* {Math.round((criteriosCalificados[item.criterio_id] || 0) * item.weight)} */}
                                        </td>
                                        )}
                                    </tr>
                                ))}
                                {showResults &&(
                                <tr className="text-center">
                                    <td colSpan="4"><strong>Total</strong></td>
                                    <td><strong>{total.toFixed(2)}</strong></td>
                                </tr>
                                )} 
                            </tbody>
                        </table>
                    </Col>

                    <Col md={4}>
                        <Card style={{ borderColor: '#60cd26' }}>
                            <Card.Header style={{ backgroundColor: '#60cd26', color: '#fff' }} className="text-center">
                                <strong>Leyenda de Puntuación</strong>
                            </Card.Header>
                            <Card.Body>
                                <table className="table table-sm table-borderless mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '70%' }}>Descripción</th>
                                            <th className="text-center" style={{ width: '30%' }}>Puntuación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Bajo</td>
                                            <td className="text-center">1</td>
                                        </tr>
                                        <tr>
                                            <td>Medio</td>
                                            <td className="text-center">2</td>
                                        </tr>
                                        <tr>
                                            <td>Alto</td>
                                            <td className="text-center">3</td>
                                        </tr>
                                        <tr>
                                            <td>Muy Alto</td>
                                            <td className="text-center">4</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="justify-content-center mt-4">
                   {isSaving ? null : (
                        <Col md={3}>
                            <Button
                                style={{ backgroundColor: '#60cd26', borderColor: '#60cd26' }}
                                className="w-100"
                                onClick={handleGuardarAnalisis}
                            >
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </Col>
                     )}
                </Row>

                {/* Renderiza el enlace del documento solo si total > 3 */}
                
                {showResults && (
                    total > 3 ? (
                        <Alert variant="warning">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <strong> Debe realizar un análisis ambiental para su proyecto.</strong>
                        </Alert>
                    ) : (
                        <Alert variant="success">
                            <i className="bi bi-check-circle-fill"></i>
                            <strong> Su proyecto está exento de un análisis ambiental.</strong>
                        </Alert>
                    )
                )}
                {total > 3 && (
                    <Row className="mt-3">
                        <Col md={6}>
                            <Form.Group>
                                <h2 className="mb-4 text-center">Enlace al documento</h2>
                                <InputGroup>
                                    {/* Ícono al lado del input */}
                                    <InputGroup.Text>
                                        <i className="bi bi-link-45deg"></i>
                                    </InputGroup.Text>
                                    {/* Campo para ingresar la URL */}
                                    <Form.Control
                                        type="url"
                                        placeholder="Ingresa un enlace válido"
                                        value={documentLink}
                                        onChange={(e) => setDocumentLink(e.target.value)}
                                        disabled={isLinkSaved} // Deshabilitar input si ya fue guardado
                                    />
                                    {/* Mostrar botón dinámicamente */}
                                    {isLinkSaved ? (
                                        <Button
                                            style={{
                                                backgroundColor: '#007bff',
                                                borderColor: '#007bff',
                                            }}
                                            href={documentLink}
                                            target="_blank"
                                        >
                                            Acceder
                                        </Button>
                                    ) : (
                                        <Button
                                            style={{
                                                backgroundColor: '#60cd26',
                                                borderColor: '#60cd26',
                                            }}
                                            onClick={updateEnlace}
                                        >
                                            Guardar
                                        </Button>
                                    )}
                                </InputGroup>
                            </Form.Group>
                        </Col>

                    </Row>

                )}

            </Form>

            

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Requisito del Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{modalMessage}</p>
                    {totalSum === 4 && (
                        <Form.Group controlId="documentLink">
                            <Form.Label>Enlace al documento de Word</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="Ingresa el enlace del documento desde la nube"
                                value={documentLink}
                                onChange={(e) => setDocumentLink(e.target.value)}
                            />
                        </Form.Group>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (totalSum === 4 && documentLink.trim() === "") {
                                alert("Por favor, ingresa un enlace válido.");
                            } else {
                                // Si el totalSum es 4 y hay un enlace válido
                                if (totalSum === 4) {
                                    console.log("Enlace guardado:", documentLink);
                                }
                                setShowModal(false); // Cierra el modal
                            }
                        }}
                    >
                        {totalSum === 4 ? "Guardar Enlace" : "Aceptar"}
                    </Button>
                </Modal.Footer>
            </Modal>



        </>
    );
};

export default AnalisisAmbiental;