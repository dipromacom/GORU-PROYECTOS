import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Button, ListGroup, Modal, Form, Badge } from "react-bootstrap";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { v4 as uuidv4 } from "uuid";

import InteresadosMultiSelect from "./InteresadosMultiSelect";
import { actions as ganttActions, selectors as ganttSelectors } from "../../reducers/gantt";
import "./GanttChart.css";

const GanttChart = ({ projectId, interesados = [], tasks: rawTasks, dispatch }) => {
    const safeProjectId = projectId ?? null;

    // Aseguramos que tasks sea un arreglo
    const tasks = Array.isArray(rawTasks)
        ? rawTasks
        : Array.isArray(rawTasks?.tasks)
            ? rawTasks.tasks
            : [];

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        id: null,
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        progress: 0,
        dependencies: [],
        interesados_id: [],
        status: "pending",
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // --- Carga inicial ---
    useEffect(() => {
        if (!safeProjectId) return;
        dispatch(ganttActions.fetch({ projectId: safeProjectId }));
    }, [dispatch, safeProjectId]);

    // --- Normalización de datos ---
    const normalizeTaskForGantt = (t) => {
        const start = new Date(t.start_date || t.start || new Date());
        const end = new Date(t.end_date || t.end || start.getTime() + 86400000);

        return {
            ...t,
            start,
            end,
            progress: Number(t.progress ?? 0),
        };
    };

    const ganttTasks = useMemo(() => {
        return tasks.map((t) => {
            const nt = normalizeTaskForGantt(t);
            const interesadosNames = (nt.interesados_id || []).map((iid) => {
                const found = interesados.find((x) => String(x.id) === String(iid));
                return found ? found.nombre_interesado : iid;
            });

            return {
                id: nt.id,
                name: nt.name,
                start: nt.start,
                end: nt.end,
                type: "task",
                progress: nt.progress,
                isDisabled: false,
                dependencies: nt.dependencies || [],
                _meta: {
                    description: nt.description || "",
                    interesadosNames,
                    interesadosIds: nt.interesados_id || [],
                },
            };
        });
    }, [tasks, interesados]);

    // --- Dependencias inversas
    const dependencyMap = useMemo(() => {
        const map = {};
        for (const t of tasks) {
            (t.dependencies || []).forEach((dep) => {
                if (!map[dep]) map[dep] = [];
                map[dep].push(t.id);
            });
        }
        return map;
    }, [tasks]);

    // --- Modal Crear ---
    const openCreate = () => {
        setForm({
            id: uuidv4(),
            name: "",
            description: "",
            start_date: new Date().toISOString().slice(0, 10),
            end_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            progress: 0,
            dependencies: [],
            interesados_id: [],
            status: "pending",
        });
        setModalMode("create");
        setEditingId(null);
        setShowModal(true);
    };

    // --- Modal Editar ---
    const openEdit = (taskId) => {
        const t = tasks.find((x) => String(x.id) === String(taskId));
        if (!t) return;

        setForm({
            id: t.id,
            name: t.name || "",
            description: t.description || "",
            start_date: t.start_date ? t.start_date.slice(0, 10) : new Date(t.start).toISOString().slice(0, 10),
            end_date: t.end_date ? t.end_date.slice(0, 10) : new Date(t.end).toISOString().slice(0, 10),
            progress: Number(t.progress ?? 0),
            dependencies: t.dependencies ? [...t.dependencies] : [],
            interesados_id: t.interesados_id ? t.interesados_id.map(String) : [],
            status: t.status ?? "pending",
        });

        setModalMode("edit");
        setEditingId(taskId);
        setShowModal(true);
    };

    // --- Eliminar ---
    const confirmDeleteTask = (taskId) => {
        // Si hay tareas que dependen de esta, no permitir eliminar
        const dependents = dependencyMap[taskId] || [];
        if (dependents.length > 0) {
            const dependentNames = dependents
                .map((id) => tasks.find((t) => t.id === id)?.name || id)
                .join(", ");
            alert(
                `No se puede eliminar esta actividad porque las siguientes dependen de ella: ${dependentNames}`
            );
            return;
        }

        setDeleteId(taskId);
        setShowDeleteModal(true);
    };

    const deleteTask = () => {
        if (!deleteId) return;
        dispatch(ganttActions.deleteTask({ id: deleteId, projectId: safeProjectId }));
        dispatch(ganttActions.sync({ projectId: safeProjectId }));
        setDeleteId(null);
        setShowDeleteModal(false);
    };

    // --- Guardar / Crear ---
    const saveForm = () => {
        if (!form.name) return alert("Nombre requerido");
        if (!form.start_date || !form.end_date) return alert("Fechas requeridas");

        const interesadosUUID = (form.interesados_id || []).map(String);

        const payload = {
            id: form.id,
            project_id: safeProjectId,
            name: form.name,
            description: form.description,
            start: new Date(form.start_date).toISOString(),
            end: new Date(form.end_date).toISOString(),
            progress: Number(form.progress || 0),
            dependencies: form.dependencies || [],
            interesados_id: interesadosUUID,
            status: form.status,
        };
        console.log(payload);
        if (modalMode === "create") {
            dispatch(ganttActions.createTask(payload));
        } else {
            dispatch(ganttActions.editTask(payload));
        }

        dispatch(ganttActions.sync({ projectId: safeProjectId }));
        setShowModal(false);
    };

    // --- Eventos Gantt ---
    const onDateChange = (gTask, task) => {
        dispatch(
            ganttActions.moveTask({
                id: task.id,
                newStart: gTask.start.toISOString(),
                newEnd: gTask.end.toISOString(),
            })
        );
        dispatch(ganttActions.sync({ projectId: safeProjectId }));
    };

    const onProgressChange = (gTask, task) => {
        dispatch(ganttActions.editTask({ id: task.id, progress: gTask.progress }));
        dispatch(ganttActions.sync({ projectId: safeProjectId }));
    };

    const onTaskClick = (task) => {
        if (!showModal) openEdit(task.id);
    };

    // --- Render personalizado ---
    const renderTask = (ganttTask) => {
        const meta = ganttTask._meta || {};
        const interesadosNames = meta.interesadosNames || [];
        return (
            <div className="gantt-task-custom" title={ganttTask.name}>
                <div className="gantt-task-name">{ganttTask.name}</div>
                <div className="gantt-task-interesados">
                    {interesadosNames.length > 0
                        ? interesadosNames.map((n, i) => (
                            <Badge key={i} bg="light" text="dark" className="gantt-task-badge">
                                {n}
                            </Badge>
                        ))
                        : "Sin interesados"}
                </div>
            </div>
        );
    };

    // --- Lista lateral ---
    const renderLeftList = () => (
        <div className="gantt-left">
            <div className="gantt-left-header">
                <h5>Actividades</h5>
                <Button size="sm" variant="outline-primary" onClick={openCreate}>
                    + Nueva
                </Button>
            </div>
            <ListGroup variant="flush" className="gantt-left-list">
                {tasks.length === 0 && <div className="gantt-empty">No hay actividades</div>}
                {tasks.map((t) => {
                    const interesadosNames = (t.interesados_id || []).map((iid) => {
                        const found = interesados.find((x) => String(x.id) === String(iid));
                        return found ? found.nombre_interesado : iid;
                    });
                    return (
                        <ListGroup.Item key={t.id} className="gantt-list-item">
                            <div className="gantt-item-info">
                                <div className="gantt-item-title">{t.name}</div>
                                <div className="gantt-item-dates">
                                    {(t.start_date ?? t.start)
                                        ? `${new Date(t.start_date ?? t.start).toLocaleDateString()} → ${new Date(
                                            t.end_date ?? t.end
                                        ).toLocaleDateString()}`
                                        : "Sin fechas"}
                                </div>
                                <div className="gantt-item-badges">
                                    {(interesadosNames || []).slice(0, 3).map((n, i) => (
                                        <Badge key={i} bg="secondary" className="gantt-mini-badge">
                                            {n}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="gantt-item-actions">
                                <Button size="sm" variant="outline-secondary" onClick={() => openEdit(t.id)}>
                                    ✏️
                                </Button>
                                <Button size="sm" variant="outline-danger" onClick={() => confirmDeleteTask(t.id)}>
                                    🗑️
                                </Button>
                            </div>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </div>
    );

    console.log("✅ Gantt debug:", {
        safeProjectId,
        rawTasks,
        tasks,
        tasksLength: tasks?.length,
    });

    return (
        <>
            <Row className="gantt-container">
                <Col md={4}>{renderLeftList()}</Col>
                <Col md={8} className="gantt-chart-wrapper">
                    {tasks.length > 0 ? (
                        <Gantt
                            tasks={ganttTasks}
                            viewMode={ViewMode.Day}
                            onDateChange={onDateChange}
                            onProgressChange={onProgressChange}
                            onClick={onTaskClick}
                            renderTask={renderTask}
                            listCellWidth=""
                        />
                    ) : (
                        <div className="gantt-empty">No hay actividades para mostrar</div>
                    )}
                </Col>
            </Row>

            {/* --- Modal Crear/Editar --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === "create" ? "Crear actividad" : "Editar actividad"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fechas</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="date"
                                    value={form.start_date}
                                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    value={form.end_date}
                                    onChange={(e) => {
                                        const newEndDate = e.target.value;
                                        if (newEndDate < form.start_date) {
                                            alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
                                            return; // evita actualizar el estado
                                        }
                                        setForm({ ...form, end_date: newEndDate });
                                    }}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Interesados</Form.Label>
                            <InteresadosMultiSelect
                                interesados={interesados}
                                selectedIds={form.interesados_id}
                                onChange={(selected) => setForm({ ...form, interesados_id: selected })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Dependencias</Form.Label>

                            <Form.Control
                                as="select"
                                multiple
                                value={Array.isArray(form.dependencies) ? form.dependencies : []}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                                    // Si el usuario selecciona la opción 'Ninguna', vaciamos las dependencias
                                    if (selectedOptions.includes("")) {
                                        setForm({ ...form, dependencies: [] });
                                    } else {
                                        setForm({ ...form, dependencies: selectedOptions });
                                    }
                                }}
                                disabled={!Array.isArray(tasks) || tasks.length <= 0} // solo deshabilitar si no hay tareas
                            >
                                {tasks.length > 0 ? (
                                    tasks
                                        .filter((t) => t && String(t.id) !== String(form.id)) // excluye solo la tarea actual
                                        .map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name ?? `Actividad ${t.id}`}
                                            </option>
                                        ))
                                        
                                ) : (
                                    <option value="">No hay otras actividades disponibles</option>
                                )} 
                                {/* Opción para quitar dependencias */}
                                <option value="">Ninguna dependencia</option>
                                
                            </Form.Control>

                            <Form.Text className="text-muted">
                                Seleccione las actividades de las que depende esta (si existen).
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Progreso (%)</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                max={100}
                                value={form.progress}
                                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={saveForm}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* --- Modal Eliminar --- */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar actividad</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Está seguro que desea eliminar esta actividad?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteTask}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const mapState = (state) => ({
    tasks: ganttSelectors.getTasks(state),
});

export default connect(mapState)(GanttChart);
