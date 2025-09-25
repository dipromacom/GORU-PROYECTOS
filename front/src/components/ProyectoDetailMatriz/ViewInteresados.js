import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { CheckTable } from '../checkTable/CheckTable';
import moment from 'moment';
import { selectors } from "../../reducers/project";
import { Interesado } from "../ProyectoDetailMatriz/Interesado";
import './ViewInteresados.css';

export const ViewInteresados = ({ interesados, toDo, usuario, markAsDoneCallback }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [verInteresado, setVerInteresado] = useState(null); // Estado para alternar vista

    // Columnas de la tabla
    const columns = useMemo(
        () => [
            { Header: 'Nombre del Interesado', accessor: 'nombre_interesado' },
            { Header: 'Rol', accessor: 'rol' },
            { Header: 'Cargo', accessor: 'cargo' },
            { Header: 'Compañía', accessor: 'compania_clasificacion' },
            { Header: 'Correo', accessor: 'email' },
            { Header: 'Evaluación', accessor: 'valoracion' },
            {
                Header: 'Acciones',
                accessor: 'acciones',
                Cell: ({ row }) => (
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Fecha de registro: {moment(row.original.fecha_creacion).format('LLL')}</Tooltip>}
                    >
                        <button
                            className="btn d-flex align-items-center"
                            style={{ margin: '0 10px' }}
                            onClick={() => setVerInteresado(row.original)}
                        >
                            <FaArrowRight size={16} />
                        </button>
                    </OverlayTrigger>
                ),
            },
        ],
        []
    );

    useEffect(() => {
        if (!interesados || interesados.length === 0) {
            setFilteredData([]); // No hay interesados
            return;
        }

        // Convertir la lista de interesados en el formato esperado para la tabla
        const data = interesados.map(interesado => ({
            id: interesado.id,
            nombre_interesado: interesado.nombre_interesado ?? '',
            rol: interesado.rol ?? '',
            cargo: interesado.cargo ?? '-',
            compania_clasificacion: interesado.compania_clasificacion ?? '',
            email: interesado.email ?? '',
            valoracion: interesado.EvaluacionInteresado?.[0]?.valoracion ?? '0',
            fecha_creacion: interesado.fecha_creacion ?? '',
        }));

        setFilteredData(data);
    }, [interesados]); 


    return (
        <div className="proyectos-form">
            {/* Mostrar lista de interesados si no se ha seleccionado uno */}
            {!verInteresado ? (
                <>
                    <CheckTable columns={columns} data={filteredData} />
                    {filteredData.length === 0 && (
                        <div className="center pull-down">
                            <p>No hay interesados por el momento</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Botón para regresar a la lista */}
                    <button className="btn btn-secondary mb-3" onClick={() => setVerInteresado(null)}>
                        <FaArrowLeft size={16} /> Volver a la lista
                    </button>

                    {/* Mostrar componente `Interesado` */}
                        <Interesado Interesadoid={verInteresado.id} toDo={toDo} markAsDoneCallback={markAsDoneCallback} />
                </>
            )}
        </div>
    );
};

const mapStateToProps = state => ({
    isLoading: selectors.getIsLoading(state),
    showNotification: selectors.getShowNotification(state),
    interesados: selectors.getInteresadoList(state), // Ahora toma una lista en lugar de un solo objeto
});

export default connect(mapStateToProps)(ViewInteresados);
