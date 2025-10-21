import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Button, ListGroup, Modal, Form, Badge } from "react-bootstrap";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { v4 as uuidv4 } from "uuid";

import InteresadosMultiSelect from "./InteresadosMultiSelect";
import { actions as ganttActions, selectors as ganttSelectors } from "../../reducers/gantt";
import "./GanttChart.css";
import { duration } from "moment";

const GanttChart = ({ projectId, interesados = [], tasks: rawTasks, dispatch }) => {
    const safeProjectId = projectId ?? null;

    // Aseguramos que tasks sea un arreglo
    const tasks = Array.isArray(rawTasks)
        ? rawTasks
        : Array.isArray(rawTasks?.tasks)
            ? rawTasks.tasks
            : [];

    console.log(tasks);

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
        type: "task",
        parent_id: "",
        duration: 0,
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


    // --- 🔹 Recalcula fechas de grupos (padres) según sus subtareas
    const recalculateGroupDates = (tasks) => {
        const updated = [...tasks];
        const groups = updated.filter((t) => t.type === "group");

        for (const group of groups) {
            const children = updated.filter((t) => t.parent_id === group.id);
            if (children.length === 0) continue;

            const minStart = new Date(Math.min(...children.map((c) => new Date(c.start_date || c.start))));
            const maxEnd = new Date(Math.max(...children.map((c) => new Date(c.end_date || c.end))));

            group.start_date = minStart.toISOString();
            group.end_date = maxEnd.toISOString();
        }

        return updated;
    };

    // --- 🔹 Detecta ruta crítica (camino más largo de dependencias)
    const findCriticalPath = (tasks) => {
        const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
        const memo = {};

        const dfs = (taskId) => {
            if (memo[taskId]) return memo[taskId];
            const task = taskMap[taskId];
            if (!task) return 0;
            if (!task.dependencies || task.dependencies.length === 0) {
                memo[taskId] = (new Date(task.end_date) - new Date(task.start_date)) / (1000 * 3600 * 24);
                return memo[taskId];
            }

            const maxDep = Math.max(...task.dependencies.map(dfs));
            const duration = (new Date(task.end_date) - new Date(task.start_date)) / (1000 * 3600 * 24);
            memo[taskId] = maxDep + duration;
            return memo[taskId];
        };

        let maxPath = 0;
        let criticalEndTask = null;

        for (const t of tasks) {
            const val = dfs(t.id);
            if (val > maxPath) {
                maxPath = val;
                criticalEndTask = t.id;
            }
        }

        // Reconstruir camino
        const criticalTasks = new Set();
        const backtrack = (taskId) => {
            const t = taskMap[taskId];
            if (!t) return;
            criticalTasks.add(taskId);
            if (!t.dependencies || t.dependencies.length === 0) return;
            let maxDep = null;
            let maxVal = -Infinity;
            for (const dep of t.dependencies) {
                const val = memo[dep];
                if (val > maxVal) {
                    maxVal = val;
                    maxDep = dep;
                }
            }
            if (maxDep) backtrack(maxDep);
        };

        if (criticalEndTask) backtrack(criticalEndTask);

        return [...criticalTasks];
    };

    const ganttTasks = useMemo(() => {
        // 🔸 1. Recalcular fechas de grupos
        const recalculatedTasks = recalculateGroupDates(tasks);

        // 🔸 2. Calcular ruta crítica
        const criticalIds = findCriticalPath(recalculatedTasks);

        // 🔸 3. Ordenar: grupos primero (por fecha más reciente)
        const orderedTasks = [...recalculatedTasks].sort((a, b) => {
            // Prioriza los de tipo grupo
            if (a.type === "group" && b.type !== "group") return -1;
            if (a.type !== "group" && b.type === "group") return 1;

            // Entre grupos, mostrar el más reciente primero
            if (a.type === "group" && b.type === "group") {
                const endA = new Date(a.end_date).getTime();
                const endB = new Date(b.end_date).getTime();
                return endA - endB; // Más reciente primero
            }

            // Para tareas normales, mantener orden actual
            return 0;
        });

        // 🔸 4. Mapear a formato del Gantt
        return orderedTasks.map((t) => {
            const nt = normalizeTaskForGantt(t);
            const interesadosNames = (nt.interesados_id || []).map((iid) => {
                const found = interesados.find((x) => String(x.id) === String(iid));
                return found ? found.nombre_interesado : iid;
            });

            const isCritical = criticalIds.includes(nt.id);

            return {
                id: nt.id,
                name: nt.name,
                start: nt.start,
                end: nt.end,
                type: nt.type === "group" ? "project" : "task",
                progress: Number(nt.progress),
                isDisabled: false,
                dependencies: nt.dependencies || [],
                styles: {
                    backgroundColor: isCritical ? "#d9534f" : "#8cbcf5",
                    progressColor: isCritical ? "#c9302c" : "#2e86de",
                    progressSelectedColor: isCritical ? "#b52b27" : "#145a9e",
                },
                _meta: {
                    description: nt.description || "",
                    interesadosNames,
                    interesadosIds: nt.interesados_id || [],
                    isCritical,
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
            type: "task",
            parent_id: "",
            duration: 0,
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
            type: t.type || "task",
            parent_id: t.parent_id || "",
            duration: t.duration || 0,
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
            type: form.type || "task",
            start: new Date(form.start_date).toISOString(),
            end: new Date(form.end_date).toISOString(),
            progress: Number(form.progress || 0),
            dependencies: form.dependencies || [],
            interesados_id: interesadosUUID,
            parent_id: form.parent_id || null,
            status: form.status,
            is_critical: false, // se marcará luego por lógica de ruta crítica
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
            <div
                className={`gantt-task-custom ${ganttTask._meta?.isCritical ? "critical" : ""}`}
                title={ganttTask.name}
            >
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


    const [expandedGroups, setExpandedGroups] = useState({});

    const toggleGroup = (groupId) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };


    const projectSummary = useMemo(() => {
        if (!tasks || tasks.length === 0) return null;

        const startDates = tasks.map(t => new Date(t.start_date || t.start));
        const endDates = tasks.map(t => new Date(t.end_date || t.end));

        const projectStart = new Date(Math.min(...startDates));
        const projectEnd = new Date(Math.max(...endDates));

        const totalDays = (projectEnd - projectStart) / (1000 * 3600 * 24);
        const totalHours = totalDays * 8;

        const avgProgress = tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / tasks.length;

        const totalTasks = tasks.filter(t => t.gantt_type !== "group").length;
        const totalGroups = tasks.filter(t => t.gantt_type === "group").length;

        const criticalIds = findCriticalPath(tasks);
        const criticalTasks = tasks.filter(t => criticalIds.includes(t.id));
        const criticalDays = criticalTasks.reduce((acc, t) => {
            const start = new Date(t.start_date);
            const end = new Date(t.end_date);
            return acc + (end - start) / (1000 * 3600 * 24);
        }, 0);

        return {
            start: projectStart.toLocaleDateString(),
            end: projectEnd.toLocaleDateString(),
            totalDays: Math.round(totalDays),
            totalHours: Math.round(totalHours),
            avgProgress: Math.round(avgProgress),
            totalTasks,
            totalGroups,
            criticalDays: Math.round(criticalDays)
        };
    }, [tasks]);

    // --- 🔹 Sección resumen general ---
    const renderProjectSummary = () => {
        if (!projectSummary) return null;

        return (
            <div className="gantt-summary">
                <h5 className="gantt-summary-title">Resumen del Proyecto</h5>
                <Row className="gantt-summary-row">
                    <Col md={6} lg={4}>
                        <div className="gantt-summary-item">
                            <strong>Inicio:</strong> {projectSummary.start}
                        </div>
                        <div className="gantt-summary-item">
                            <strong>Fin:</strong> {projectSummary.end}
                        </div>
                    </Col>
                    <Col md={6} lg={4}>
                        <div className="gantt-summary-item">
                            <strong>Total días:</strong> {projectSummary.totalDays}
                        </div>
                        <div className="gantt-summary-item">
                            <strong>Total horas:</strong> {projectSummary.totalHours}
                        </div>
                    </Col>
                    <Col md={6} lg={4}>
                        <div className="gantt-summary-item">
                            <strong>Ruta crítica:</strong> {projectSummary.criticalDays} días
                        </div>
                        <div className="gantt-summary-item">
                            <strong>Avance total:</strong> {projectSummary.avgProgress}%
                        </div>
                    </Col>
                </Row>
                <div className="gantt-summary-footer">
                    <Badge bg="primary">Tareas: {projectSummary.totalTasks}</Badge>{" "}
                    <Badge bg="secondary">Grupos: {projectSummary.totalGroups}</Badge>
                </div>
            </div>
        );
    };

    // --- Lista lateral ---
    const renderLeftList = () => {
        // 🔹 Agrupar tareas por parent_id
        const groups = tasks.filter((t) => t.type === "group");
        const normalTasks = tasks.filter((t) => t.type !== "group");

        const groupedTasks = groups.map((group) => ({
            ...group,
            children: normalTasks.filter((t) => t.parent_id === group.id),
        }));

        // 🔹 Render auxiliar para dependencias
        const renderDependencies = (deps) => {
            if (!deps || deps.length === 0)
                return <span className="gantt-task-none">Sin dependencias</span>;
            return deps.map((depId, i) => {
                const depTask = tasks.find((x) => String(x.id) === String(depId));
                return (
                    <Badge key={i} bg="info" className="gantt-mini-badge">
                        {depTask ? depTask.name : depId}
                    </Badge>
                );
            });
        };

        // 🔹 Render auxiliar para interesados
        const renderInteresados = (ids) => {
            if (!ids || ids.length === 0)
                return <span className="gantt-task-none">Sin interesados</span>;
            return ids.slice(0, 3).map((iid, i) => {
                const found = interesados.find((x) => String(x.id) === String(iid));
                return (
                    <Badge key={i} bg="secondary" className="gantt-mini-badge">
                        {found ? found.nombre_interesado : iid}
                    </Badge>
                );
            });
        };

        return (
            <>
                { renderProjectSummary() }
                <div className="gantt-left">
                    <div className="gantt-left-header">
                        <h5>Actividades</h5>
                        <Button size="sm" variant="outline-primary" onClick={openCreate}>
                            + Nueva
                        </Button>
                    </div>

                    <ListGroup variant="flush" className="gantt-left-list">
                        {tasks.length === 0 && (
                            <div className="gantt-empty">No hay actividades</div>
                        )}

                        {/* 🔹 Render grupos */}
                        {groupedTasks.map((group) => (
                            <React.Fragment key={group.id}>
                                <ListGroup.Item className="gantt-list-item gantt-group-item">
                                    <div className="gantt-item-info">
                                        <div
                                            className="gantt-item-title gantt-group-title"
                                            onClick={() => toggleGroup(group.id)}
                                        >
                                            <span className="gantt-arrow">
                                                {expandedGroups[group.id] ? "▼" : "▶"}
                                            </span>
                                            {group.name}
                                        </div>
                                        <div className="gantt-item-dates">
                                            {group.start_date
                                                ? `${new Date(
                                                    group.start_date
                                                ).toLocaleDateString()} → ${new Date(
                                                    group.end_date
                                                ).toLocaleDateString()}`
                                                : "Sin fechas"}
                                        </div>
                                        <div className="gantt-item-extra">
                                            <div>
                                                <strong>Duración:</strong>{" "}
                                                {group.duration ?? "-"} días
                                            </div>
                                        </div>
                                    </div>
                                    <div className="gantt-item-actions">
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            onClick={() => openEdit(group.id)}
                                        >
                                            ✏️
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() =>
                                                confirmDeleteTask(group.id)
                                            }
                                        >
                                            🗑️
                                        </Button>
                                    </div>
                                </ListGroup.Item>

                                {/* 🔹 Render tareas hijas */}
                                {expandedGroups[group.id] &&
                                    group.children.map((t) => (
                                        <ListGroup.Item
                                            key={t.id}
                                            className="gantt-list-item gantt-child-item"
                                        >
                                            <div className="gantt-item-info">
                                                <div className="gantt-item-title">
                                                    {t.name}
                                                </div>
                                                <div className="gantt-item-dates">
                                                    {t.start_date
                                                        ? `${new Date(
                                                            t.start_date
                                                        ).toLocaleDateString()} → ${new Date(
                                                            t.end_date
                                                        ).toLocaleDateString()}`
                                                        : "Sin fechas"}
                                                </div>
                                                <div className="gantt-item-extra">
                                                    <div>
                                                        <strong>Duración:</strong>{" "}
                                                        {t.duration ?? "-"} días
                                                    </div>
                                                    <div>
                                                        <strong>Dependencias:</strong>{" "}
                                                        {renderDependencies(
                                                            t.dependencies
                                                        )}
                                                    </div>
                                                    <div>
                                                        <strong>Interesados:</strong>{" "}
                                                        {renderInteresados(
                                                            t.interesados_id
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="gantt-item-actions">
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={() => openEdit(t.id)}
                                                >
                                                    ✏️
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() =>
                                                        confirmDeleteTask(t.id)
                                                    }
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                            </React.Fragment>
                        ))}

                        {/* 🔹 Render tareas sin grupo */}
                        {normalTasks
                            .filter((t) => !t.parent_id)
                            .map((t) => (
                                <ListGroup.Item
                                    key={t.id}
                                    className="gantt-list-item"
                                >
                                    <div className="gantt-item-info">
                                        <div className="gantt-item-title">{t.name}</div>
                                        <div className="gantt-item-dates">
                                            {t.start_date
                                                ? `${new Date(
                                                    t.start_date
                                                ).toLocaleDateString()} → ${new Date(
                                                    t.end_date
                                                ).toLocaleDateString()}`
                                                : "Sin fechas"}
                                        </div>
                                        <div className="gantt-item-extra">
                                            <div>
                                                <strong>Duración:</strong>{" "}
                                                {t.duration ?? "-"} días
                                            </div>
                                            <div>
                                                <strong>Dependencias:</strong>{" "}
                                                {renderDependencies(t.dependencies)}
                                            </div>
                                            <div>
                                                <strong>Interesados:</strong>{" "}
                                                {renderInteresados(t.interesados_id)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="gantt-item-actions">
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            onClick={() => openEdit(t.id)}
                                        >
                                            ✏️
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() =>
                                                confirmDeleteTask(t.id)
                                            }
                                        >
                                            🗑️
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ))}
                    </ListGroup>
                </div>
            </>
        );
            
    };


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
                                    onChange={(e) => {
                                        const newStart = e.target.value;

                                        // Si la fecha de fin es menor o igual a la nueva fecha de inicio
                                        if (form.end_date <= newStart) {
                                            // Crear una nueva fecha end_date = start_date + 1 día
                                            const nextDay = new Date(newStart);
                                            nextDay.setDate(nextDay.getDate() + 1);

                                            // Convertir a formato YYYY-MM-DD
                                            const nextDayFormatted = nextDay.toISOString().split("T")[0];

                                            // Actualizar ambos campos
                                            setForm({ ...form, start_date: newStart, end_date: nextDayFormatted });
                                        } else {
                                            // Solo actualizar la fecha de inicio
                                            setForm({ ...form, start_date: newStart });
                                        }
                                    }}
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
                            <Form.Label>Tipo</Form.Label>
                            <Form.Control
                                as="select"
                                value={form.type || "task"}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                            >
                                <option value="task">Tarea</option>
                                <option value="group">Grupo</option>
                            </Form.Control>
                        </Form.Group>

                        {form.type === "task" && (
                            <Form.Group className="mb-3">
                                <Form.Label>Grupo Padre</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={form.parent_id || ""}
                                    onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
                                >
                                    <option value="">Sin grupo</option>
                                    {tasks
                                        .filter((t) => t.type === "group")
                                        .map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                        )}                

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
