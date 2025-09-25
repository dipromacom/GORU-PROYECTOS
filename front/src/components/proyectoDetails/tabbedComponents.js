import Form from "react-bootstrap/Form";
import { SortTable } from "../sortTable/SortTable";
import { useMemo, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { CirticalBadge } from "../badge/Badge";
import './tabbedComponents.css';
// Eliminar la importación incorrecta de AWS Amplify



export const GeneralDataComponent = ({ projectDetail }) => {
  return (
    <Form className="blue">
      <Form.Group controlId="numeroProyecto">
        <Form.Label>Número de Proyecto</Form.Label>
        <span className="form-control">{projectDetail?.numero ?? ""} </span>
      </Form.Group>

      <Form.Group controlId="directorProyecto">
        <Form.Label>Director del Proyecto</Form.Label>
        <span className="form-control">
          {projectDetail?.DirectorProyecto?.Persona?.nombre ?? 'No definido'} {projectDetail?.DirectorProyecto?.Persona?.apellido ?? ''}
        </span>
      </Form.Group>

      <Form.Group controlId="patrocinadorProyecto">
        <Form.Label>Patrocinador del Proyecto</Form.Label>
        <span className="form-control">
          {projectDetail?.Patrocinador?.Persona?.nombre}
        </span>
      </Form.Group>

      <Form.Group controlId="departamento">
        <Form.Label>Departamento</Form.Label>
        <span className="form-control">
          {projectDetail?.Departamento?.nombre}
        </span>
      </Form.Group>

      <Form.Group controlId="informacionBreve">
        <Form.Label>Información breve</Form.Label>
        <span className="form-control">
          {projectDetail?.informacion}
        </span>
      </Form.Group>
    </Form>
  )
}

export const PriorizationDataComponent = ({ batch, isLoading, projectId }) => {

  const [selectedIndex, setSelectedIndex ] = useState("")

  const columns = useMemo(
    () => [
      {
        Header: 'Proyecto',
        accessor: 'proyecto',
      },
      {
        Header: 'Director de Proyecto',
        accessor: 'director',
      },
      {
        Header: 'Departamento',
        accessor: 'departamento',
      },
      {
        Header: 'Prioridad',
        accessor: 'prioridad',
      },
    ], []
  );

  const data = useMemo(
    () => {
      const evaluations = batch?.Evaluacion ?? []
      return evaluations.map((evaluacion,index) => {
        const persona = evaluacion.Proyecto.DirectorProyecto?.Persona ?? { nombre: '', apellido: '' };
        const departamento = evaluacion.Proyecto.Departamento ?? { nombre: '' };
        if(evaluacion.Proyecto.id === projectId)
          setSelectedIndex(index)
        return {
          proyecto: evaluacion.Proyecto.nombre,
          director: persona.nombre + ' ' + persona.apellido,
          departamento: departamento.nombre,
          prioridad: <CirticalBadge valor={evaluacion.peso_total}></CirticalBadge>,
        }
      })
    }, [batch]);

  return isLoading ?
    <div className="mh-100 position-relative">
      <Spinner animation="border" role="status" className=" position-absolute top-50 start-50">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
   : data && data.length > 0 ? <SortTable
      columns={columns}
      data={data}
      rowProps={
        row => {
          return ({className: row.id === selectedIndex ? "blue-bg text-white": ""})
        }
      }
    />
      : 
      <span>
        <p>No hay resultados que mostrar</p>
      </span>
}