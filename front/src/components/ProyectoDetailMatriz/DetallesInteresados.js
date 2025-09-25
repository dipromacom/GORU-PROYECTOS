import React from "react";

const DetallesInteresados = ({ data }) => {

    const [detalles, setDetalles] = useState(data);

    useEffect(() => {
        setDetalles(data);
    }, [data]); // Se actualiza cuando `data` cambia

    if (!detalles) {
        return <p>No hay datos disponibles</p>;
    }

    return (
        <div className="detalles-interesados">
            <h2>Detalles del Interesado</h2>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{detalles.nombre_interesado}</h5>
                    <p className="card-text"><strong>ID:</strong> {"00" + detalles.id.toString().padStart(2, "0")}</p>
                    <p className="card-text"><strong>Proyecto ID:</strong> {detalles.proyecto_id}</p>
                    <p className="card-text"><strong>Teléfono:</strong> {detalles.telefono}</p>
                    <p className="card-text"><strong>Email:</strong> {detalles.email}</p>
                    <p className="card-text">
                        <strong>Otros Datos de Contacto:</strong> {detalles.otros_datos_contacto}
                    </p>
                    <p className="card-text"><strong>Código:</strong> {detalles.codigo}</p>
                    <p className="card-text"><strong>Rol:</strong> {detalles.rol}</p>
                    <p className="card-text"><strong>Cargo:</strong> {detalles.cargo}</p>
                    <p className="card-text">
                        <strong>Clasificación de Compañía:</strong> {detalles.compania_clasificacion}
                    </p>
                    <p className="card-text">
                        <strong>Expectativas:</strong> {detalles.expectativas || "N/A"}
                    </p>
                    <p className="card-text">
                        <strong>Fecha de Creación:</strong> {new Date(detalles.fecha_creacion).toLocaleString()}
                    </p>
                    <h6>Evaluación del Interesado</h6>
                    {detalles.EvaluacionInteresado.length > 0 ? (
                        detalles.EvaluacionInteresado.map((evalItem, index) => (
                            <div key={index} className="evaluation-item">
                                <p><strong>ID:</strong> {evalItem.id}</p>
                                <p><strong>Poder:</strong> {evalItem.poder || "N/A"}</p>
                                <p><strong>Influencia:</strong> {evalItem.influencia || "N/A"}</p>
                                <p><strong>Conocimiento:</strong> {evalItem.conocimiento || "N/A"}</p>
                                <p><strong>Interés/Actitud:</strong> {evalItem.interesActitud || "N/A"}</p>
                                <p><strong>Valoración:</strong> {evalItem.valoracion || "N/A"}</p>
                                <p><strong>Acción Estratégica:</strong> {evalItem.accionEstrategica || "N/A"}</p>
                                <p><strong>Responsable de Estrategia:</strong> {evalItem.responsableEstrategia || "N/A"}</p>
                                <p>
                                    <strong>Fecha de Evaluación:</strong>{" "}
                                    {new Date(evalItem.fechaEvaluacion).toLocaleString()}
                                </p>
                                <hr />
                            </div>
                        ))
                    ) : (
                        <p>No hay evaluaciones disponibles.</p>
                    )}
                    <h6>Disponibilidad</h6>
                    {detalles.NoDisponibilidad.length > 0 ? (
                        detalles.NoDisponibilidad.map((noDisp, index) => (
                            <div key={index}>
                                {/* Agrega detalles específicos de NoDisponibilidad si están disponibles */}
                                <p>{JSON.stringify(noDisp)}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay restricciones de disponibilidad.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetallesInteresados;
