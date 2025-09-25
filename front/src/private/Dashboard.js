import React from "react";
import { Card, Row, Col, Table } from "react-bootstrap";
import { FaCheckCircle, FaClock, FaDollarSign } from "react-icons/fa";
import "../css/Commons.css";
import "./Dashboard.css";

const Dashboard = () => {
    const tableData = [
        {
            nombre: "CLARO",
            concepto: "CAPACITACIÓN",
            tipo: "Corporativo",
            año: 2020,
            numeroOferta: "Q027-19-SY- V1",
            estado: "Cerrado",
            horasContratadas: 240,
            horasEjecutadas: 80,
            horasSobrantes: 160,
            material: "N/A",
            courierMaterial: "-",
            valorOriginal: 13656.5,
            factura: "#6590",
            valorFacturado: 3490.33,
            porcentajeFacturado: "100%",
            gananciaInicial: "31%",
        },
        {
            nombre: "CLARO",
            concepto: "CAPACITACIÓN",
            tipo: "Corporativo",
            año: 2020,
            numeroOferta: "Q027-19-SY- V1",
            estado: "Cerrado",
            horasContratadas: 240,
            horasEjecutadas: 80,
            horasSobrantes: 160,
            material: "N/A",
            courierMaterial: "-",
            valorOriginal: 13656.5,
            factura: "#6591",
            valorFacturado: 3490.33,
            porcentajeFacturado: "100%",
            gananciaInicial: "31%",
        },
    ];

    const chartData = [
        { name: "Horas Contratadas", value: 240 },
        { name: "Horas Ejecutadas", value: 80 },
        { name: "Horas Sobrantes", value: 160 },
    ];

    const maxValue = Math.max(...chartData.map((d) => d.value));

    return (
        <div className="min-vh-100 bg-light p-4 dashboard-container">
            <div className="container-xl">
                {/* Encabezado */}
                <h1 className="text-center text-primary mb-5">Dashboard Empresarial</h1>

                {/* Tarjetas resumen usando react-bootstrap */}
                <Row className="mb-5">
                    <Col sm={12} md={4} lg={3}>
                        <Card className="shadow-sm mb-3">
                            <Card.Body>
                                <FaCheckCircle size={40} color="green" />
                                <Card.Title className="mt-3">Tareas Totales</Card.Title>
                                <Card.Text>2 Proyectos</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm={12} md={4} lg={3}>
                        <Card className="shadow-sm mb-3">
                            <Card.Body>
                                <FaClock size={40} color="orange" />
                                <Card.Title className="mt-3">Horas Contratadas</Card.Title>
                                <Card.Text>240 Horas</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm={12} md={4} lg={3}>
                        <Card className="shadow-sm mb-3">
                            <Card.Body>
                                <FaDollarSign size={40} color="blue" />
                                <Card.Title className="mt-3">Ganancia Inicial</Card.Title>
                                <Card.Text>31%</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Gráfico de barras */}
                <div className="mb-5">
                    <h2 className="text-center mb-4">Distribución de Horas</h2>
                    <div className="d-flex justify-content-around">
                        {chartData.map((d, i) => (
                            <div key={i} className="text-center">
                                <div
                                    className="bar"
                                    style={{
                                        height: `${(d.value / maxValue) * 100}%`,
                                        backgroundColor: "#4CAF50",
                                        width: "50px",
                                        margin: "0 auto",
                                    }}
                                />
                                <div>{d.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabla de proyectos */}
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-center mb-4">Detalles de Proyectos</h2>
                    <Table bordered hover responsive>
                        <thead className="bg-light">
                            <tr>
                                {[
                                    "Nombre",
                                    "Concepto",
                                    "Tipo",
                                    "Año",
                                    "Número de Oferta",
                                    "Estado",
                                    "Horas Contratadas",
                                    "Horas Ejecutadas",
                                    "Horas Sobrantes",
                                    "Material",
                                    "Courier Material",
                                    "Valor Original",
                                    "# Factura",
                                    "Valor Facturado",
                                    "% Facturado",
                                    "Ganancia Inicial",
                                ].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.nombre}</td>
                                    <td>{row.concepto}</td>
                                    <td>{row.tipo}</td>
                                    <td>{row.año}</td>
                                    <td>{row.numeroOferta}</td>
                                    <td>{row.estado}</td>
                                    <td>{row.horasContratadas}</td>
                                    <td>{row.horasEjecutadas}</td>
                                    <td>{row.horasSobrantes}</td>
                                    <td>{row.material}</td>
                                    <td>{row.courierMaterial}</td>
                                    <td>${row.valorOriginal.toLocaleString()}</td>
                                    <td>{row.factura}</td>
                                    <td>${row.valorFacturado.toLocaleString()}</td>
                                    <td>{row.porcentajeFacturado}</td>
                                    <td>{row.gananciaInicial}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
