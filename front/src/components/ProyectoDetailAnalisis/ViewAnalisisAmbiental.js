import React, { useEffect, useState } from 'react';
import { Table, Form, Alert, Row, Col, Card, Modal, Button, InputGroup } from 'react-bootstrap';
import AnalisisAmbiental from './AnalisisImpacto';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { actions, selectors } from '../../reducers/project';
import { toast } from "react-toastify";
import './analisisImpacto.css';

export const ViewAnalisisAmbiental = ({ analysisData, respuestaAnalisisAmbiental, projectID }) => {
    const dispatch = useDispatch();
    const { id } = useParams(); 
    const [totalSum, setTotalSum] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showLink, setShowLink] = useState(false);
    const [documentLink, setDocumentLink] = useState("");
    const [isLinkSaved, setIsLinkSaved] = useState(false);
    // console.log({projectID});

    useEffect(() => {
        if (!analysisData || analysisData.length === 0) return;
        const sumaTotal = analysisData.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        setTotalSum(sumaTotal);
    }, [analysisData]);

    if (!analysisData || analysisData.length === 0) {
        return <Alert variant="info" className="text-center">No hay datos disponibles.</Alert>;
    }
    // console.log({projectID});

    const updateEnlace = async (event) => {
        event.preventDefault();
        if (!documentLink || documentLink.trim() === "") {
            toast.error("Por favor, ingrese un enlace válido.");
            return;
        }

            // Crear el payload con el nuevo enlace
            const payload = {
                proyecto_id: projectID,
                link: documentLink.trim(),
                total_calificacion: totalSum.toFixed(1)
            };

            // Realizar el dispatch
            try {
                dispatch(actions.updateRespuestaAnalisisAmbiental(projectID, payload));
                setIsLinkSaved(true); // Actualizar el estado local
                toast.success("Enlace guardado correctamente");
            } catch (error) {
                console.error("Error al guardar el enlace:", error);
                toast.error("Hubo un problema al guardar el enlace. Inténtalo de nuevo.");
            }
    };

    const handleClose = () => setShowModal(false);

    return (
        <>
            <h2 className="mb-4 text-center">Modelo de Decisión Ambiental</h2>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Table bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Descripción</th>
                                <th>Calificación</th>
                                <th>Weight</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analysisData.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{item.criterioAnalisis?.descripcion || 'Descripción no disponible'}</td>
                                    <td>{item.rating ?? 'N/A'}</td>
                                    <td>{(parseFloat(item.weight) || 0).toFixed(1)}</td>
                                    <td>{(parseFloat(item.total) || 0).toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                                <td>{totalSum.toFixed(1)}</td>
                            </tr>
                        </tfoot>
                    </Table>
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
                                    <tr><td>Bajo</td><td className="text-center">1</td></tr>
                                    <tr><td>Medio</td><td className="text-center">2</td></tr>
                                    <tr><td>Alto</td><td className="text-center">3</td></tr>
                                    <tr><td>Muy Alto</td><td className="text-center">4</td></tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {totalSum > 3 ? (
                <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <strong> Debe realizar un análisis ambiental para su proyecto.</strong>
                </Alert>
            ) : (
                <Alert variant="success">
                    <i className="bi bi-check-circle-fill"></i>
                    <strong> Su proyecto está exento de un análisis ambiental.</strong>
                </Alert>
            )}
            {totalSum > 3 && (
                <Row className="mt-3">
                    <Col md={6}>
                        {respuestaAnalisisAmbiental && respuestaAnalisisAmbiental.link ? (
                            // Si hay datos, mostrar el enlace
                            <Form.Group>
                                <Form.Label>Enlace disponible</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-link-45deg"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="url"
                                        value={respuestaAnalisisAmbiental.link || ''}
                                        readOnly
                                    />
                                    {/* Botón para acceder al enlace */}
                                    <Button
                                        style={{
                                            backgroundColor: '#007bff',
                                            borderColor: '#007bff',
                                        }}
                                        href={respuestaAnalisisAmbiental.link}
                                        target="_blank"
                                    >
                                        Acceder
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        ) : (
                            // Si no hay datos, mostrar el campo para guardar
                            <Form.Group>
                                <Form.Label>Enlace al documento</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-link-45deg"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="url"
                                        placeholder="Ingresa un enlace válido"
                                        value={documentLink}
                                        onChange={(e) => setDocumentLink(e.target.value)}
                                    />
                                    <Button
                                        style={{ backgroundColor: '#60cd26', borderColor: '#60cd26' }}
                                        onClick={updateEnlace}
                                    >
                                        Guardar
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        )}
                    </Col>
                </Row>
            )}



            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Información del Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalMessage}
                    {/* Mostrar el enlace solo si el total es mayor a 3 */}
                    {showLink && (
                        <div>
                            <br />
                            <a href="/subir-documento" target="_blank" rel="noopener noreferrer">
                                Usted debe hacer un analisis ambiental dicho documento debe Subir a la nube.
                            </a>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ViewAnalisisAmbiental;
