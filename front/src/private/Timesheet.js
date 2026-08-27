import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { Button, ButtonGroup, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import moment from 'moment';
import 'moment/locale/es';
import { actions as timesheetActions, selectors as timesheetSelectors } from '../reducers/timesheet';
import { selectors as sessionSelectors } from '../reducers/session';
import './Timesheet.css';

moment.locale('es');

function Timesheet({ user, tasks, entries, loading, saving, submitting, alertMessage, dispatch }) {
    const [currentDate, setCurrentDate] = useState(moment());
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
    const [collapsedProjects, setCollapsedProjects] = useState({});
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Rango de fechas según modo de vista (Mes o Semana)
    const { startDate, endDate, daysArray } = useMemo(() => {
        let start, end;
        if (viewMode === 'week') {
            start = currentDate.clone().startOf('isoWeek');
            end = currentDate.clone().endOf('isoWeek');
        } else {
            start = currentDate.clone().startOf('month');
            end = currentDate.clone().endOf('month');
        }

        const days = [];
        let curr = start.clone();
        while (curr.isSameOrBefore(end, 'day')) {
            days.push(curr.clone());
            curr.add(1, 'day');
        }

        return {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
            daysArray: days
        };
    }, [currentDate, viewMode]);

    // Cargar datos del servidor a través de Redux
    useEffect(() => {
        if (!user || !user.id) return;
        dispatch(timesheetActions.fetchTimesheet({ desde: startDate, hasta: endDate }));
    }, [dispatch, user, startDate, endDate]);

    // Limpiar estado del módulo al desmontar
    useEffect(() => {
        return () => dispatch(timesheetActions.clean());
    }, [dispatch]);

    // Navegación temporal
    const handlePrev = () => {
        setCurrentDate(prev => prev.clone().subtract(1, viewMode === 'week' ? 'week' : 'month'));
    };

    const handleNext = () => {
        setCurrentDate(prev => prev.clone().add(1, viewMode === 'week' ? 'week' : 'month'));
    };

    const handleToday = () => {
        setCurrentDate(moment());
    };

    // Cambiar input de horas por celda
    const handleHoursChange = (taskId, dateStr, projectId, val) => {
        const key = `${taskId}_${dateStr}`;
        const current = entries[key];

        // No permitir editar si ya está enviado
        if (current && current.estado === 'enviado') return;

        let numVal = val === '' ? '' : parseFloat(val);
        if (val !== '' && (isNaN(numVal) || numVal < 0)) return;
        if (numVal > 24) numVal = 24;

        // Validar contra esfuerzo restante de la tarea
        const task = tasks.find(t => t.id === taskId);
        if (task && val !== '') {
            // Calcular horas ya enviadas históricamente
            const horasEnviadas = task.horasEnviadasUsuario || 0;
            // Sumar horas ingresadas en el periodo actual para esta tarea excepto la celda actual
            let horasOtrasCeldasPeriodo = 0;
            daysArray.forEach(d => {
                const dStr = d.format('YYYY-MM-DD');
                if (dStr !== dateStr) {
                    const otherVal = entries[`${taskId}_${dStr}`]?.horas;
                    if (otherVal && !isNaN(otherVal)) {
                        horasOtrasCeldasPeriodo += parseFloat(otherVal);
                    }
                }
            });

            const maxPermitido = task.esfuerzoAsignadoUsuario - horasEnviadas;
            if (numVal + horasOtrasCeldasPeriodo > maxPermitido) {
                const maxParaEstaCelda = Math.max(0, parseFloat((maxPermitido - horasOtrasCeldasPeriodo).toFixed(2)));
                alert(`No puede superar su esfuerzo asignado de ${task.esfuerzoAsignadoUsuario}h para esta tarea (Máx. restante para esta celda: ${maxParaEstaCelda}h)`);
                numVal = maxParaEstaCelda;
            }
        }

        dispatch(timesheetActions.updateEntry(key, {
            horas: numVal,
            estado: current?.estado || 'borrador',
            project_id: projectId
        }));
    };

    // Guardar borrador
    const handleSaveDraft = () => {
        dispatch(timesheetActions.saveTimesheet({ desde: startDate, hasta: endDate }));
    };

    // Enviar y bloquear periodo
    const handleSubmitPeriod = () => {
        setShowConfirmModal(false);
        dispatch(timesheetActions.submitTimesheet({ desde: startDate, hasta: endDate }));
    };

    // Agrupación jerárquica de tareas: Proyecto -> Grupo/Fase -> Tareas
    const hierarchicalData = useMemo(() => {
        const projectMap = {};

        tasks.forEach(task => {
            const pId = task.project_id || (task.Proyecto && task.Proyecto.id) || 'sin_proyecto';
            const pNombre = task.Proyecto ? task.Proyecto.nombre : `Proyecto #${pId}`;

            if (!projectMap[pId]) {
                projectMap[pId] = {
                    id: pId,
                    nombre: pNombre,
                    groups: {},
                    rootTasks: []
                };
            }

            if (task.parent_id) {
                if (!projectMap[pId].groups[task.parent_id]) {
                    const parentTask = tasks.find(t => t.id === task.parent_id);
                    projectMap[pId].groups[task.parent_id] = {
                        id: task.parent_id,
                        nombre: parentTask ? parentTask.name : `Fase / Grupo #${task.parent_id}`,
                        tasks: []
                    };
                }
                projectMap[pId].groups[task.parent_id].tasks.push(task);
            } else if (task.type !== 'group') {
                projectMap[pId].rootTasks.push(task);
            }
        });

        return Object.values(projectMap);
    }, [tasks]);

    // Totales de horas por día en cabecera
    const dayTotals = useMemo(() => {
        const totals = {};
        daysArray.forEach(d => {
            const dStr = d.format('YYYY-MM-DD');
            let sum = 0;
            Object.keys(entries).forEach(key => {
                if (key.endsWith(`_${dStr}`)) {
                    const val = entries[key]?.horas;
                    if (val && !isNaN(val)) sum += parseFloat(val);
                }
            });
            totals[dStr] = sum;
        });
        return totals;
    }, [entries, daysArray]);

    // Total de horas del periodo
    const totalPeriodHours = useMemo(() => {
        return Object.values(dayTotals).reduce((acc, h) => acc + h, 0);
    }, [dayTotals]);

    // Días laborables en el periodo
    const laborDaysCount = useMemo(() => {
        return daysArray.filter(d => d.isoWeekday() <= 5).length;
    }, [daysArray]);

    const toggleProject = (pId) => {
        setCollapsedProjects(prev => ({ ...prev, [pId]: !prev[pId] }));
    };

    const toggleGroup = (gId) => {
        setCollapsedGroups(prev => ({ ...prev, [gId]: !prev[gId] }));
    };

    return (
        <div className="timesheet-page">
            {/* Cabecera */}
            <div className="timesheet-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h1 className="timesheet-title">
                        <i className="bi bi-clock-history me-2" />
                        Hoja de Tiempos
                    </h1>
                    <p className="timesheet-subtitle mb-0">
                        Registro y reporte de esfuerzo en actividades de proyectos asignados
                    </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleSaveDraft}
                        disabled={saving || loading || submitting}
                    >
                        {saving ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bi bi-floppy me-1" />}
                        Guardar Borrador
                    </Button>
                    <Button
                        className="btn-submit-timesheet"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={submitting || loading || totalPeriodHours === 0}
                    >
                        {submitting ? (
                            <Spinner size="sm" animation="border" className="me-1" />
                        ) : (
                            <i className="bi bi-send-check me-2" />
                        )}
                        Enviar {viewMode === 'week' ? 'Semana' : 'Mes'} ({totalPeriodHours.toFixed(1)}h)
                    </Button>
                </div>
            </div>

            {alertMessage && (
                <Alert variant={alertMessage.type} dismissible onClose={() => dispatch(timesheetActions.clearAlert())} className="mb-4">
                    {alertMessage.text}
                </Alert>
            )}

            {/* Barra de Controles y Navegación */}
            <div className="timesheet-controls">
                <div className="timesheet-nav-group">
                    <Button variant="outline-primary" size="sm" onClick={handlePrev} title="Periodo anterior">
                        <i className="bi bi-chevron-left" />
                    </Button>
                    <span className="timesheet-period-label">
                        {viewMode === 'week'
                            ? `Semana ${currentDate.isoWeek()} - ${currentDate.format('MMMM YYYY')}`
                            : currentDate.format('MMMM YYYY')}
                    </span>
                    <Button variant="outline-primary" size="sm" onClick={handleNext} title="Periodo siguiente">
                        <i className="bi bi-chevron-right" />
                    </Button>
                    <Button variant="light" size="sm" onClick={handleToday} className="ms-2 fw-semibold">
                        Hoy
                    </Button>
                </div>

                <div className="d-flex align-items-center gap-4">
                    <div className="timesheet-status-card">
                        <div>
                            <span className="text-muted small d-block">Horas Registradas</span>
                            <span className="timesheet-hours-total">{totalPeriodHours.toFixed(2)}h</span>
                        </div>
                        <div className="border-start ps-3">
                            <span className="text-muted small d-block">Días Laborables</span>
                            <span className="fw-bold text-secondary">{laborDaysCount} días</span>
                        </div>
                    </div>

                    <ButtonGroup className="timesheet-view-toggle">
                        <Button
                            variant={viewMode === 'week' ? 'primary' : 'outline-secondary'}
                            onClick={() => setViewMode('week')}
                        >
                            Semana
                        </Button>
                        <Button
                            variant={viewMode === 'month' ? 'primary' : 'outline-secondary'}
                            onClick={() => setViewMode('month')}
                        >
                            Mes
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            {/* Grid Principal de Hoja de Tiempos */}
            <div className="timesheet-table-container">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2">Cargando actividades y registros de tiempo...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-calendar-x" style={{ fontSize: '2.5rem' }} />
                        <h5 className="mt-3">No tienes actividades asignadas</h5>
                        <p className="small">
                            Aparecerás aquí cuando un Director de Proyecto te asigne como integrante en tareas del cronograma Gantt.
                        </p>
                    </div>
                ) : (
                    <table className="timesheet-table">
                        <thead>
                            <tr className="timesheet-header-row">
                                <th className="timesheet-th-activity">
                                    Proyecto / Actividad
                                </th>
                                <th className="timesheet-th-effort">
                                    Esfuerzo Restante
                                </th>
                                {daysArray.map((d) => {
                                    const dStr = d.format('YYYY-MM-DD');
                                    const isWeekend = d.isoWeekday() > 5;
                                    const isToday = d.isSame(moment(), 'day');
                                    const daySum = dayTotals[dStr] || 0;

                                    return (
                                        <th
                                            key={dStr}
                                            className={`timesheet-th-day ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`}
                                        >
                                            <div className="timesheet-day-name">{d.format('ddd')}</div>
                                            <div className="timesheet-day-number">{d.format('D')}</div>
                                            <div className="timesheet-day-sum">{daySum > 0 ? `${daySum.toFixed(1)}h` : '0h'}</div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {hierarchicalData.map(proj => {
                                const isProjCollapsed = collapsedProjects[proj.id];
                                return (
                                    <React.Fragment key={proj.id}>
                                        {/* Fila de Proyecto */}
                                        <tr className="timesheet-row-project">
                                            <td className="timesheet-td-activity" colSpan={2}>
                                                <span
                                                    className="timesheet-tree-toggle"
                                                    onClick={() => toggleProject(proj.id)}
                                                >
                                                    {isProjCollapsed ? '▶' : '▼'}
                                                </span>
                                                <i className="bi bi-folder2-open text-warning me-2" />
                                                <strong>{proj.nombre}</strong>
                                            </td>
                                            <td colSpan={daysArray.length} />
                                        </tr>

                                        {!isProjCollapsed && (
                                            <>
                                                {/* Grupos / Fases del proyecto */}
                                                {Object.values(proj.groups).map(grp => {
                                                    const isGrpCollapsed = collapsedGroups[grp.id];
                                                    return (
                                                        <React.Fragment key={grp.id}>
                                                            <tr className="timesheet-row-group">
                                                                <td className="timesheet-td-activity ps-4" colSpan={2}>
                                                                    <span
                                                                        className="timesheet-tree-toggle"
                                                                        onClick={() => toggleGroup(grp.id)}
                                                                    >
                                                                        {isGrpCollapsed ? '▶' : '▼'}
                                                                    </span>
                                                                    <i className="bi bi-diagram-3 text-primary me-2" />
                                                                    <span>{grp.nombre}</span>
                                                                </td>
                                                                <td colSpan={daysArray.length} />
                                                            </tr>

                                                            {!isGrpCollapsed && grp.tasks.map(task => renderTaskRow(task, proj.id, 5))}
                                                        </React.Fragment>
                                                    );
                                                })}

                                                {/* Tareas raíz sin grupo */}
                                                {proj.rootTasks.map(task => renderTaskRow(task, proj.id, 4))}
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de confirmación para Enviar periodo */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="blue">
                        <i className="bi bi-check2-circle me-2 text-success" />
                        Confirmar Envío de Hoja de Tiempos
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Está a punto de enviar <strong>{totalPeriodHours.toFixed(2)} horas</strong> registradas para el periodo{' '}
                        <strong>{viewMode === 'week' ? `Semana ${currentDate.isoWeek()} de ${currentDate.format('MMMM YYYY')}` : currentDate.format('MMMM YYYY')}</strong>.
                    </p>
                    <Alert variant="warning" className="small mb-0">
                        <i className="bi bi-exclamation-triangle-fill me-2" />
                        <strong>Importante:</strong> Una vez enviadas, las horas quedarán bloqueadas y no podrán modificarse. El % de avance en los proyectos de Gantt asociados se actualizará automáticamente.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                    </Button>
                    <Button className="btn-submit-timesheet" onClick={handleSubmitPeriod}>
                        Confirmar y Enviar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );

    // Función auxiliar para renderizar una fila de tarea
    function renderTaskRow(task, projectId, indentLevel = 4) {
        const esfuerzoRestante = task.esfuerzoRestante !== undefined ? task.esfuerzoRestante : task.duration * 8;
        const isCompleted = task.progress >= 100 || esfuerzoRestante <= 0;

        return (
            <tr key={task.id} className="timesheet-row-task">
                <td className={`timesheet-td-activity ps-${indentLevel}`}>
                    <i className="bi bi-pin-angle text-muted me-2" />
                    <span className="fw-medium">{task.name}</span>
                </td>
                <td className="text-center">
                    <span className={`timesheet-effort-badge ${isCompleted ? 'completed' : esfuerzoRestante < 5 ? 'critical' : ''}`}>
                        <i className="bi bi-clock" />
                        {esfuerzoRestante.toFixed(1)}h
                    </span>
                </td>
                {daysArray.map(d => {
                    const dStr = d.format('YYYY-MM-DD');
                    const isWeekend = d.isoWeekday() > 5;
                    const key = `${task.id}_${dStr}`;
                    const entry = entries[key];
                    const horasVal = entry?.horas !== undefined && entry?.horas !== null ? entry.horas : '';
                    const isSubmitted = entry?.estado === 'enviado';

                    return (
                        <td key={dStr} className={`timesheet-input-cell ${isWeekend ? 'timesheet-th-day weekend' : ''}`}>
                            <div className="timesheet-input-wrapper">
                                <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    step="0.5"
                                    disabled={isSubmitted || isCompleted && !horasVal}
                                    value={horasVal}
                                    placeholder="-"
                                    onChange={(e) => handleHoursChange(task.id, dStr, projectId, e.target.value)}
                                    className={`timesheet-input ${horasVal ? 'has-value' : ''} ${isSubmitted ? 'is-submitted' : ''} ${isWeekend ? 'is-weekend' : ''}`}
                                    title={isSubmitted ? `Enviado el ${moment(entry.fecha_envio).format('DD/MM/YYYY')}` : `Registrar horas (${d.format('DD/MM')})`}
                                />
                                {isSubmitted && (
                                    <i className="bi bi-check-circle-fill timesheet-submitted-icon" title="Horas enviadas y aprobadas" />
                                )}
                            </div>
                        </td>
                    );
                })}
            </tr>
        );
    }
}

const mapStateToProps = (state) => ({
    user: sessionSelectors.getUser(state),
    tasks: timesheetSelectors.getTasks(state),
    entries: timesheetSelectors.getEntries(state),
    loading: timesheetSelectors.getLoading(state),
    saving: timesheetSelectors.getSaving(state),
    submitting: timesheetSelectors.getSubmitting(state),
    alertMessage: timesheetSelectors.getAlert(state),
});

export default connect(mapStateToProps)(Timesheet);