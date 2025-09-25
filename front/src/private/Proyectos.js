/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import SubMenu from "../components/submenu/SubMenu";
import "../css/Commons.css";
import "./Proyectos.css";
import { CheckTable } from "../components/checkTable/CheckTable";
import { onError } from "../libs/errorLib";
import { actions, selectors } from "../reducers/project";
import { useLocation } from 'react-router-dom';
import { actions as routesActions } from "../reducers/routes";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import moment from 'moment';
import 'moment/locale/es-mx';
import { DateRangePicker } from 'react-dates';
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse"
import { Form, Dropdown } from "react-bootstrap"
import { DownloadPdfButton } from "../components/downloadPdfButton/downloadPdfButton";
import { ProyectoListPDF, csvHeader, convertToCsvData } from "./ProyectosReport"
import { CSVLink } from "react-csv"
import { FaPlay, FaArrowRight } from 'react-icons/fa';
import { MdOutlineDoNotDisturbOn } from "react-icons/md";
import { FaLock } from "react-icons/fa"; // ícono de cerrado
import Modal from "react-bootstrap/Modal";


function Proyectos({ dispatch, projectList, dashboardList, endDate, startDate, dateFilterInput, filtersExpanded }) {
  const location = useLocation()
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [responsable, setResponsable] = useState("");
  const [estado, setEstado] = useState("");

  const [showCerrarModal, setShowCerrarModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [fechaCierre, setFechaCierre] = useState(moment().format("YYYY-MM-DD"));

  const getFilter = () => {
    const searchParams = new URLSearchParams(location.search);
    const paramsObj = {};
    for (const [key, value] of searchParams.entries()) {
      paramsObj[key] = value;
    }
    return paramsObj;
  }

  useEffect(() => {
    async function onLoad() {
      try {
        let queryParams = getFilter();
        if (location.pathname.includes("/activities")) {
          queryParams = { ...queryParams, modo: "A" };
        } else {
          queryParams = { ...queryParams, modo: "P" };
        }


        const { name, startDateFrom, startDateTo, estado, responsable } = queryParams
        if (name || null)
          setNombreProyecto(name)
        if (estado || null)
          setEstado(estado)
        if (responsable || null)
          setResponsable(responsable)

        dispatch(actions.getProjectsByFilter(queryParams))
        dispatch(actions.handleClearDateFilter())
      } catch (e) {
        onError(e)
      }
    }

    onLoad();
  }, [location])

  const handleClickNewProyect = () => {
    let modo = "P";
    if (location.pathname.includes("/activities")) modo = "A"
    else modo = "P"
    dispatch(routesActions.goTo(`projects/new?modo=${modo}`));
  }

  const handleClickDashboard = () => {
    dispatch(routesActions.goTo("Dashboard"))
  }

  const handleOpenCerrarModal = (proyecto) => {

    setSelectedProject(proyecto);
    setFechaCierre(moment().format("YYYY-MM-DD"));
    setShowCerrarModal(true);
  };

  const handleCloseCerrarModal = () => {
    setShowCerrarModal(false);
    setSelectedProject(null);
  };

  const handleConfirmCerrarProyecto = () => {
    let modo = "P"
    if (location.pathname.includes("/activities")) {
      modo = "A"
    }
    if (!selectedProject) return;

    const fechaInicio = moment(selectedProject.fecha_inicio).format("YYYY-MM-DD");

    if (fechaCierre < fechaInicio) {
      alert("La fecha de cierre no puede ser menor a la fecha de inicio.");
      return;
    }
    
    dispatch(actions.closeProject(selectedProject.id, modo, fechaCierre));
    setShowCerrarModal(false);
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Nombre del Proyecto',
        accessor: 'proyecto',
      },
      {
        Header: 'Director de Proyecto',
        accessor: 'responsable',
      },
      {
        Header: 'Fecha de Inicio',
        accessor: 'fecha_inicio',
      },
      {
        Header: 'Estado',
        accessor: 'estado',
      },
      {
        Header: 'Acciones',
        accessor: 'acciones',
      },
    ], []
  );

  const data = useMemo(() => {
    return projectList.map(
      proyecto => {
        const renderTooltip = (props) => (
          <Tooltip {...props}>
            {
              moment(proyecto.fecha_inicio).format('LLL')
            }
          </Tooltip>
        );
        const dateCmp = <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        ><p>{proyecto.fecha_inicio == null ? '-' : moment(proyecto.fecha_inicio).fromNow()}</p></OverlayTrigger>
        return {
          proyecto: proyecto.nombre,
          responsable: `${proyecto.DirectorProyecto?.Persona.nombre ?? 'No definido'} ${proyecto.DirectorProyecto?.Persona.apellido ?? ''}`,
          departamento: proyecto.Departamento?.nombre ?? '-',
          //estado: <span className={`indicator ${proyecto.estado === 'S' ? 'iniciado' : ''}`}>{proyecto.estado === 'S' ? 'Iniciado' : 'Creado'}</span>,

          estado: (
            <span className={`indicator ${proyecto.estado === 'S' ? 'iniciado' : proyecto.estado === 'E' ? 'cerrado' : ''}`}>
              {proyecto.estado === 'S'
                ? 'Iniciado'
                : proyecto.estado === 'E'
                  ? 'Cerrado'
                  : 'Creado'}
            </span>
          ),

          fecha_inicio: dateCmp,
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          /*acciones: proyecto.estado === 'S' 
              ? <a className="btn success" onClick={() => dispatch(routesActions.goTo(`projects/${proyecto.id}`))}><FaArrowRight size={16} /></a> 
              : <a className="btn success" onClick={() => {
                  const confirmResult = window.confirm("¿Esta seguro de dar inicio al proyecto?")
                  if (confirmResult) {
                   dispatch(actions.startProject(proyecto.id, false))
                  }
          }}><FaPlay size={16} /></a>,*/
          acciones:
            proyecto.estado === 'E'
              ? (
                <div style={{ display: "flex", gap: "6px" }}>
                  {/* flecha para editar */}
                  <a className="btn success" onClick={() => dispatch(routesActions.goTo(`projects/${proyecto.id}`))}>
                    <FaArrowRight size={16} />
                  </a>
                </div>
              )
              : proyecto.estado === 'S'
                ? (
                  <div style={{ display: "flex", gap: "6px" }}>
                    {/* flecha para editar */}
                    <a className="btn success" onClick={() => dispatch(routesActions.goTo(`projects/${proyecto.id}`))}>
                      <FaArrowRight size={16} />
                    </a>
                    {/* botón cerrar proyecto */}
                    <a className="btn danger" onClick={() => handleOpenCerrarModal(proyecto)}>
                      <FaLock size={16} />
                    </a>
                  </div>
                )
                : (
                  <a
                    className="btn success"
                    onClick={() => {
                      const confirmResult = window.confirm("¿Está seguro de dar inicio al proyecto?");
                      let modo="P"
                      if (location.pathname.includes("/activities")) {
                        modo = "A"
                      }
                      if (confirmResult) {
                        dispatch(actions.startProject(proyecto.id, modo, false));
                      }
                    }}
                  >
                    <FaPlay size={16} />
                  </a>
                ),
          props: {
            className: "none",
            onClick: (event) => {
              // dispatch(routesActions.goTo(`projects/${proyecto.id}`))
            },
          }
        }
      }
    )
  }, [projectList]);

  function handleDateFilterEndChange(date) {
    dispatch(actions.handleProjectDateFilterEndDate(date))
  }

  function handleDateFilterStartChange(date) {
    dispatch(actions.handleProjectDateFilterStartDate(date))
  }

  function handleDateInputFocus(focused) {
    dispatch(actions.handleProjectDateFilterFocusInput(focused))
  }

  function handleExpandFilters() {
    dispatch(actions.handleExpandFilters())
  }

  function handelCleanInput(e) {
    e.preventDefault();
    setNombreProyecto("")
    setResponsable("")
    setEstado("")
    dispatch(actions.handleClearDateFilter())
  }

  function handleApplyFilter(e) {
    e.preventDefault();
    //const search = getFilter()?.toString()?? ''
    let search = {}
    if (nombreProyecto || null)
      search = { ...search, name: nombreProyecto }
    if ((moment(endDate).isValid() || null) && (moment(startDate).isValid() || null))
      search = { ...search, startDateFrom: startDate.format('YYYY-MM-DD'), startDateTo: endDate.format('YYYY-MM-DD') }
    if (estado || null)
      search = { ...search, status: estado }
    if (responsable || null)
      search = { ...search, responsable }
    const searchUrl = new URLSearchParams(search)
    dispatch(routesActions.goTo(`projects?${searchUrl.toString()}`))
    //dispatch(actions.getProjectsByFilter(getFilter()))

  }

  const customTheme = {
    inputPlaceholderStyle: {
      color: '#ccc',
      fontSize: 14,
      fontStyle: 'italic',
    },
  };

  return (
    <div className="page-menu-container">
      <SubMenu
        title={location.pathname.includes("/activities") ? "Actividades" : "Proyectos"}
        newLabel={location.pathname.includes("/activities") ? "Nueva Actividad" : "Nuevo Proyecto"}
        total={projectList.length}
        newButtonAction={() => handleClickNewProyect()}
        DashboardButtonAction={() => handleClickDashboard()}
      />

      {/* <SubMenu
        title="Dashboard"
        newLabel="Ver Dashboard"
        // total={dashboardList.length}  // Definir bien dashboardList
        newButtonAction={() => handleClickDashboard()}  // envia a ver el Dashboard
      /> */}

      <div className="proyectos-form">
        <div className="d-flex icons-container">
          {/* <div className="float-left icon">
            <img src="icons/Download.svg" />
          </div> */}
          <div className="d-inline mr-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="download-button">
                Descargar
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <DownloadPdfButton pdfReport={<ProyectoListPDF proyectosList={projectList} />} reportPrefix="Proyectos" >
                    <p>PDF <i className="bi bi-filetype-pdf"></i></p>
                  </DownloadPdfButton>
                </Dropdown.Item>
                <CSVLink data={convertToCsvData(projectList)} filename={`Proyectos_${moment().format('YYYYMMDDHHmmss')}.csv`}
                  target="_blank"
                  separator=";"
                  quote="'"
                  encoding="UTF-8"
                  blob="true"
                  className="dropdown-item"
                  headers={csvHeader}
                >
                  CSV <i className="bi bi-filetype-csv"></i>
                </CSVLink>

                {/* <Dropdown.Item>
                  <div>
                    <CSVLink data={projectList} filename="example.csv"
                      target="_blank"
                      separator=";"
                      quote="'"
                      encoding="UTF-8"
                      blob="true"
                      onError={(err) => console.error('Error generating CSV:', err)}>
                      CSV <i className="bi bi-filetype-csv"></i>
                    </CSVLink>
                  </div>
                </Dropdown.Item> */}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="d-inline">
            {/* <Button><i className="bi bi-printer"></i></Button> */}
          </div>

          {/* <div className="float-left icon">
            <img src="icons/Imprimir.svg" />
          </div> */}
        </div>
        <div>
          <div>
            <Button variant="outline-primary" onClick={() => { handleExpandFilters() }}><i className={`bi ${filtersExpanded ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}></i>&nbsp;Filtros</Button>
            <Collapse in={filtersExpanded}>
              <div className="pull-down">
                <Form inline>
                  <Form.Group>
                    <Form.Control type="text" placeholder="Nombre" value={nombreProyecto} onChange={e => setNombreProyecto(e.target.value)}></Form.Control>
                  </Form.Group>
                  &nbsp; &nbsp;
                  <Form.Group>
                    <Form.Control type="text" placeholder="Responsable" value={responsable} onChange={e => setResponsable(e.target.value)}></Form.Control>
                  </Form.Group>
                  &nbsp; &nbsp;
                  <div className="form-group">
                    {/* <label className="form-label">Fechas</label> */}
                    <DateRangePicker // momentPropTypes.momentObj or null,
                      startDate={moment(startDate).isValid() ? moment(startDate) : null}
                      startDateId="startDate"
                      endDate={moment(endDate).isValid() ? moment(endDate) : null}
                      endDateId="endDate"
                      onDatesChange={({ startDate, endDate }) => {
                        handleDateFilterEndChange(endDate)
                        handleDateFilterStartChange(startDate)
                      }}
                      theme={customTheme}
                      focusedInput={dateFilterInput}
                      onFocusChange={(focused) => { handleDateInputFocus(focused) }}
                      showDefaultInputIcon // show the calendar icon
                      showClearDates // show the clear dates button
                      /*handleClearDateFilter={() => {
                        handleDateFilterEndChange(null)
                        handleDateFilterStartChange(null)
                      }}*/
                      startDatePlaceholderText="Fecha Inicial"
                      endDatePlaceholderText="Fecha Final"
                      numberOfMonths={2} // number of months to display
                      isOutsideRange={() => false}
                      small={true}

                    />
                  </div>
                  &nbsp; &nbsp;
                  <Form.Group>
                    <Form.Control as="select" placeholder="Estado" value={estado} onChange={e => setEstado(e.target.value)}>
                      <option value="">Estado</option>
                      <option value="C">Creado</option>
                      <option value="S">Iniciado</option>
                      <option value="E">Cerrado</option>
                    </Form.Control>
                  </Form.Group>
                  &nbsp;&nbsp;
                  <Form.Group>
                    <Button type="submit" onClick={e => handleApplyFilter(e)}>Aplicar</Button>
                  </Form.Group>
                  &nbsp;&nbsp;
                  <Form.Group>
                    <Button type="submit" variant="outline-secondary" onClick={e => handelCleanInput(e)}><i className="bi-x-circle"></i></Button>
                  </Form.Group>
                </Form>
              </div>
            </Collapse>

          </div>
        </div>

        <br />
        {data.length !== 0 ?
          <CheckTable
            columns={columns}
            data={data}
          />
          :
          <div className="center pull-down">
            <p>
              No hay proyectos por el momento
            </p>
          </div>}
      </div>

      <Modal show={showCerrarModal} onHide={handleCloseCerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>Cerrar Proyecto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Fecha de Cierre</Form.Label>
            <Form.Control
              type="date"
              value={fechaCierre}
              min={selectedProject?.fecha_inicio ? moment(selectedProject.fecha_inicio).format("YYYY-MM-DD") : undefined} // 🔹 evita fechas menores
              onChange={(e) => setFechaCierre(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCerrarModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmCerrarProyecto}>
            Cerrar Proyecto
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

//const query = (state) => state.router.location.query

const mapStateToProps = state => ({
  projectList: selectors.getProjectList(state),
  endDate: selectors.getEndDateFilter(state),
  startDate: selectors.getStartDateFilter(state),
  dateFilterInput: selectors.getDateFilterInput(state),
  filtersExpanded: selectors.getFilterExpanded(state)
});

export default connect(mapStateToProps)(Proyectos);
