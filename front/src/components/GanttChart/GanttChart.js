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

const GanttChart = ({ projectId, interesados = [], tasks: rawTasks, dispatch, cerrado, ejecutado, esPrograma, onSummaryChange = () => { }, onPerformanceChange = () => { }, onGanttSummary = () => { } }) => {
    let type = "actividad"
    if (esPrograma) type = "componente"
    let types = "actividades"
    if (esPrograma) types = "componentes"
    const safeProjectId = projectId ?? null;
    const [view, setView] = useState(ViewMode.Day);
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
        const dateToUTC = (dateString) => {
            if (!dateString) return new Date();
            return new Date(dateString);
        };

        const start = dateToUTC(t.start_date || t.start);
        let end;
        if (t.end_date || t.end) {
            end = dateToUTC(t.end_date || t.end);
        } else {
            end = new Date(start.getTime() + 86400000);
        }

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

            const minStartMs = Math.min(...children.map((c) => new Date(c.start_date || c.start).getTime()));
            const maxEndMs = Math.max(...children.map((c) => new Date(c.end_date || c.end).getTime()));

            const minStart = new Date(minStartMs);
            const maxEnd = new Date(maxEndMs);

            group.start_date = minStart.toISOString();
            group.end_date = maxEnd.toISOString();
        }

        return updated;
    };

    // --- 🔹 Detecta ruta crítica (camino más largo de dependencias)
    const findCriticalPath = (tasks) => {
        const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
        const memo = {};

        const getUTCMidnight = (dateStr) => {
            if (!dateStr) return new Date();
            return new Date(`${dateStr.slice(0, 10)}T00:00:00Z`);
        }

        const dfs = (taskId) => {
            if (memo[taskId]) return memo[taskId];
            const task = taskMap[taskId];
            if (!task) return 0;

            const startDate = getUTCMidnight(task.start_date);
            const endDate = getUTCMidnight(task.end_date);

            if (!task.dependencies || task.dependencies.length === 0) {
                memo[taskId] = (endDate - startDate) / (1000 * 3600 * 24);
                return memo[taskId];
            }

            const maxDep = Math.max(...task.dependencies.map(dfs));
            const duration = (endDate - startDate) / (1000 * 3600 * 24);
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

    const calculatePerformance = (task) => {
        const now = new Date();
        const start = new Date(task.start_date || task.start);
        const end = new Date(task.end_date || task.end);

        // Si el proyecto aún no ha empezado
        if (now < start) {
            return {
                performance: 0,
                expectedProgress: 0,
                isFuture: true
            };
        }

        // Si el proyecto ya terminó
        if (now > end) {
            return {
                performance: task.progress >= 100 ? 1 : task.progress / 100,
                expectedProgress: 100,
                isFuture: false
            };
        }

        // Calcular porcentaje de tiempo transcurrido
        const totalDuration = end - start;
        const elapsed = now - start;
        const expectedProgress = (elapsed / totalDuration) * 100;

        // Evitar división por cero
        if (expectedProgress === 0 || expectedProgress < 1) {
            return {
                performance: 0,
                expectedProgress: Math.round(expectedProgress),
                isFuture: true
            };
        }

        // Desempeño como decimal = Avance Real / Avance Esperado
        const performance = task.progress / expectedProgress;

        return {
            performance: Math.min(Math.round(performance * 100) / 100, 2.00), // 🔹 MODIFICADO: Límite a 2.00
            expectedProgress: Math.round(expectedProgress),
            isFuture: false
        };
    };

    // Calcula el avance y desempeño promedio de un grupo basado en sus hijos
    const calculateGroupMetrics = (groupId, tasks) => {
        const children = tasks.filter(t => t.parent_id === groupId && t.type !== 'group');

        if (children.length === 0) {
            return { avgProgress: 0, avgPerformance: 0, avgExpected: 0 };
        }

        const totalProgress = children.reduce((sum, child) => sum + (child.progress || 0), 0);
        const avgProgress = totalProgress / children.length;

        let totalPerformance = 0;
        let totalExpected = 0;
        let validPerformanceCount = 0;

        children.forEach(child => {
            const metrics = calculatePerformance(child);
            totalExpected += metrics.expectedProgress;

            if (!metrics.isFuture && metrics.expectedProgress > 0) {
                totalPerformance += metrics.performance;
                validPerformanceCount++;
            }
        });

        const avgPerformance = validPerformanceCount > 0
            ? totalPerformance / validPerformanceCount
            : 0;
        const avgExpected = totalExpected / children.length;

        return {
            avgProgress: Math.round(avgProgress),
            avgPerformance: Math.min(Math.round(avgPerformance * 100) / 100, 2.00), // 🔹 MODIFICADO: Límite a 2.00
            avgExpected: Math.round(avgExpected)
        };
    };

    // Retorna color basado en el nivel de desempeño
    const getPerformanceColor = (performance) => {
        if (performance >= 1) return '#28a745';     // Verde - Excelente (100% o más)
        if (performance >= 0.8) return '#ffc107';   // Amarillo - Bueno (80-99%)
        if (performance >= 0.5) return '#fd7e14';   // Naranja - Regular (50-79%)
        return '#dc3545';                            // Rojo - Crítico (< 50%)
    };

    const ganttTasks = useMemo(() => {
        // 🔸 1. Recalcular fechas de grupos
        let recalculatedTasks = recalculateGroupDates(tasks);

        // 🔸 2 Generar Alias (T1, G1, T2, G2...))
        const taskAliasCounter = { task: 1, group: 1 };
        recalculatedTasks = recalculatedTasks.map(t => {
            if (t.type === 'group' || t.type === 'task') {
                const prefix = t.type === 'task' ? 'T' : 'G';
                const alias = `${prefix}${taskAliasCounter[t.type]++}`;
                return { ...t, alias };
            }
            return t;
        });

        // 🔸 3. Calcular ruta crítica
        const criticalIds = findCriticalPath(recalculatedTasks);

        // 🔸 4. MODIFICADO: Ordenar grupos con sus tareas hijas juntas
        const groups = recalculatedTasks.filter(t => t.type === "group");
        const tasksWithoutParent = recalculatedTasks.filter(t => t.type !== "group" && !t.parent_id);

        // Ordenar grupos por fecha de inicio
        const sortedGroups = groups.sort((a, b) => {
            const startA = new Date(a.start_date).getTime();
            const startB = new Date(b.start_date).getTime();
            return startA - startB;
        });

        // Crear array ordenado: grupo seguido de sus hijos
        const orderedTasks = [];
        sortedGroups.forEach(group => {
            orderedTasks.push(group);
            const children = recalculatedTasks.filter(t => t.parent_id === group.id);
            // Ordenar hijos por fecha de inicio
            const sortedChildren = children.sort((a, b) => {
                const startA = new Date(a.start_date).getTime();
                const startB = new Date(b.start_date).getTime();
                return startA - startB;
            });
            orderedTasks.push(...sortedChildren);
        });

        // Añadir tareas sin grupo al final, ordenadas por fecha
        const sortedTasksWithoutParent = tasksWithoutParent.sort((a, b) => {
            const startA = new Date(a.start_date).getTime();
            const startB = new Date(b.start_date).getTime();
            return startA - startB;
        });
        orderedTasks.push(...sortedTasksWithoutParent);

        // 🔸 5. Mapear a formato del Gantt
        return orderedTasks.map((t) => {
            const nt = normalizeTaskForGantt(t);
            const interesadosNames = (nt.interesados_id || []).map((iid) => {
                const found = interesados.find((x) => String(x.id) === String(iid));
                return found ? found.nombre_interesado : iid;
            });

            const isCritical = criticalIds.includes(nt.id);

            return {
                id: nt.id,
                name: nt.alias,
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
                    originalName: t.name,
                    alias: t.alias,
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

    // --- Mapeo de alias para la lista lateral ---
    const taskAliasMap = useMemo(() => {
        return ganttTasks.reduce((acc, t) => {
            acc[t.id] = t._meta.alias; // El alias está en _meta
            return acc;
        }, {});
    }, [ganttTasks]);

    // --- Mapeo de tareas con fechas y duración actualizadas ---
    const updatedTasksMap = useMemo(() => {
        return ganttTasks.reduce((acc, t) => {
            // Calcular duración en días (diferencia de milisegundos / milisegundos en un día)
            const durationMs = t.end.getTime() - t.start.getTime();
            const durationDays = Math.ceil(durationMs / (1000 * 3600 * 24));

            acc[t.id] = {
                ...t,
                start_date_local: t.start.toLocaleDateString('es-EC'),
                end_date_local: t.end.toLocaleDateString('es-EC'),
                duration_days: durationDays,
                originalName: t._meta.originalName,
                alias: t._meta.alias,
                interesados_id: t._meta.interesadosIds,
                dependencies: t.dependencies,
                progress: t.progress,
            };
            return acc;
        }, {});
    }, [ganttTasks]);

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
            duration: 1,
        });
        setModalMode("create");
        setEditingId(null);
        setShowModal(true);
    };

    const toInputDate = (isoString) => {
        const d = new Date(isoString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // --- Modal Editar ---
    const openEdit = (taskId) => {
        const t = tasks.find((x) => String(x.id) === String(taskId));
        if (!t) return;

        // 🔹 NUEVO: Calcular duración en días desde las fechas existentes
        const startDate = new Date(t.start_date || t.start);
        const endDate = new Date(t.end_date || t.end);
        const durationInDays = Math.ceil((endDate - startDate) / (1000 * 3600 * 24));

        setForm({
            id: t.id,
            name: t.name || "",
            description: t.description || "",
            start_date: t.start_date ? toInputDate(t.start_date) : toInputDate(t.start),
            end_date: t.end_date ? toInputDate(t.end_date) : toInputDate(t.end), // Se mantiene para referencia
            progress: Number(t.progress ?? 0),
            dependencies: t.dependencies ? [...t.dependencies] : [],
            interesados_id: t.interesados_id ? t.interesados_id.map(String) : [],
            status: t.status ?? "pending",
            type: t.type || "task",
            parent_id: t.parent_id || "",
            duration: durationInDays > 0 ? durationInDays : 1, // 🔹 NUEVO: Calcular duración
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
                `No se puede eliminar el ${type} porque las siguientes dependen de ella: ${dependentNames}`
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
        if (!form.start_date) return alert("Fecha de inicio requerida");
        if (!form.duration || form.duration < 1) return alert("La duración debe ser al menos 1 día");

        const interesadosUUID = (form.interesados_id || []).map(String);

        // 🔹 NUEVO: Calcular fecha final basada en la duración
        const startDate = new Date(`${form.start_date}T00:00:00`);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(form.duration));

        const payload = {
            id: form.id,
            project_id: safeProjectId,
            name: form.name,
            description: form.description,
            type: form.type || "task",
            start: startDate.toISOString(),
            end: endDate.toISOString(), // 🔹 CAMBIO: Usar fecha calculada
            progress: Number(form.progress || 0),
            dependencies: form.dependencies || [],
            interesados_id: interesadosUUID,
            parent_id: form.parent_id || null,
            status: form.status,
            is_critical: false,
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
        const originalName = meta.originalName || ganttTask.name;
        const alias = meta.alias || ganttTask.name;
        const interesadosNames = meta.interesadosNames || [];
        return (
            <div
                className={`gantt-task-custom ${ganttTask._meta?.isCritical ? "critical" : ""}`}
                title={originalName}
            >
                <div className="gantt-task-name">{alias}</div>
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
        let remainDays = (projectEnd - new Date()) / (1000 * 3600 * 24);
        if (remainDays < 0) remainDays = 0;

        // 🔹 Calcular solo con tareas individuales (no grupos)
        const individualTasks = tasks.filter(t => t.type !== "group");

        const avgProgress = individualTasks.length > 0
            ? individualTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / individualTasks.length
            : 0;

        // 🔹 MODIFICADO: Calcular desempeño excluyendo tareas futuras
        let totalPerformance = 0;
        let totalExpected = 0;
        let validPerformanceCount = 0; // 🔹 NUEVO: Solo contar tareas activas

        individualTasks.forEach(t => {
            const metrics = calculatePerformance(t);
            totalExpected += metrics.expectedProgress;

            // 🔹 NUEVO: Solo incluir en desempeño si ya empezó (expectedProgress > 0)
            if (!metrics.isFuture && metrics.expectedProgress > 0) {
                totalPerformance += metrics.performance;
                validPerformanceCount++;
            }
        });

        const avgPerformance = validPerformanceCount > 0
            ? Math.min(totalPerformance / validPerformanceCount, 2.00)
            : 0;

        const avgExpected = individualTasks.length > 0
            ? totalExpected / individualTasks.length
            : 0;

        const totalTasks = tasks.filter(t => t.type !== "group").length;
        const totalGroups = tasks.filter(t => t.type === "group").length;

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
            remainDays: Math.round(remainDays),
            avgProgress: Math.round(avgProgress),
            avgPerformance: Math.round(avgPerformance * 100) / 100, // 🔹 Decimal con 2 decimales
            avgExpected: Math.round(avgExpected),
            totalTasks,
            totalGroups,
            criticalDays: Math.round(criticalDays)
        };
    }, [tasks]);

    // --- 🔹 Sección resumen general ---
    const renderProjectSummary = () => {
        if (!projectSummary) return null;

        const performanceColor = getPerformanceColor(projectSummary.avgPerformance);

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
                            <strong>Días restantes:</strong> {projectSummary.remainDays}
                        </div>
                    </Col>
                    <Col md={6} lg={4}>
                        <div className="gantt-summary-item">
                            <strong>Avance real:</strong>{' '}
                            {projectSummary.avgProgress}%
                        </div>
                        {(cerrado || ejecutado)  && (
                            <>
                                <div className="gantt-summary-item">
                                    <strong>Avance estimado:</strong>{' '}
                                    {projectSummary.avgExpected}%
                                </div>
                                {/* 🔹 MODIFICADO: Mostrar como número decimal */}
                                <div className="gantt-summary-item">
                                    <strong>Desempeño total:</strong>{' '}
                                    <span style={{
                                        color: performanceColor,
                                        fontWeight: 'bold',
                                        fontSize: '1.1em'
                                    }}>
                                        {projectSummary.avgPerformance.toFixed(2)}
                                    </span>
                                </div>
                            </>
                        )}
                    </Col>
                </Row>
                <div className="gantt-summary-footer">
                    <Badge bg="primary">Tareas: {projectSummary.totalTasks}</Badge>{" "}
                    <Badge bg="secondary">Grupos: {projectSummary.totalGroups}</Badge>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if ((ejecutado || cerrado) && projectSummary) {
            onSummaryChange('gantt', projectSummary.avgProgress);
            onPerformanceChange('cronograma', projectSummary.avgPerformance);
            onGanttSummary({
                start: projectSummary.start,
                end: projectSummary.end,
                totalDays: projectSummary.totalDays,
            });
        } else {
            onSummaryChange('gantt', 0);
            onPerformanceChange('cronograma', 0);
            onGanttSummary(null);
        }
    }, [projectSummary, ejecutado, cerrado, onSummaryChange, onPerformanceChange, onGanttSummary]);

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
                const alias = taskAliasMap[depId] || '';
                return (
                    <Badge key={i} bg="info" className="gantt-mini-badge">
                        {depTask ? `${depTask.name} (${alias})` : depId}
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
                {renderProjectSummary()}
                <div className="gantt-left">
                    <div className="gantt-left-header">
                        <h5>{esPrograma ? "Componentes" : "Actividades"}</h5>
                        {!cerrado && (
                            <Button size="sm" variant="outline-primary" onClick={openCreate}>
                                + Nueva
                            </Button>
                        )}
                    </div>

                    <ListGroup variant="flush" className="gantt-left-list">
                        {tasks.length === 0 && (
                            <div className="gantt-empty">No hay {types}</div>
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
                                            {group.name} ({taskAliasMap[group.id] || 'G?'})
                                        </div>
                                        <div className="gantt-item-dates">
                                            {updatedTasksMap[group.id]?.start_date_local
                                                ? `${updatedTasksMap[group.id].start_date_local} → ${updatedTasksMap[group.id].end_date_local}`
                                                : "Sin fechas"}
                                        </div>
                                        <div className="gantt-item-extra">
                                            <div>
                                                <strong>Duración:</strong>{" "}
                                                {updatedTasksMap[group.id]?.duration_days ?? "-"} días
                                            </div>
                                            {/* Métricas del grupo */}
                                            {(() => {
                                                const metrics = calculateGroupMetrics(group.id, tasks);
                                                const performanceColor = getPerformanceColor(metrics.avgPerformance);
                                                return (
                                                    <>
                                                        <div>
                                                            <strong>Avance estimado:</strong>{" "}
                                                            {metrics.avgExpected}%
                                                        </div>
                                                        {(cerrado || ejecutado) && (
                                                            <>
                                                                <div>
                                                                    <strong>Avance real:</strong>{" "}
                                                                    {metrics.avgProgress}%
                                                                </div>
                                                                <div>
                                                                    <strong>Desempeño:</strong>{" "}
                                                                    <span style={{
                                                                        color: performanceColor,
                                                                        fontWeight: 'bold',
                                                                        fontSize: '1em'
                                                                    }}>
                                                                        {metrics.avgPerformance.toFixed(2)}
                                                                    </span>
                                                                    
                                                                </div>
                                                            </>
                                                        )}           
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div className="gantt-item-actions">
                                        {!cerrado && (
                                            <>
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
                                                    onClick={() => confirmDeleteTask(group.id)}
                                                >
                                                    🗑️
                                                </Button>
                                            </>
                                        )}
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
                                                    {t.name} ({taskAliasMap[t.id] || 'T?'})
                                                </div>
                                                <div className="gantt-item-dates">
                                                    {updatedTasksMap[t.id]?.start_date_local
                                                        ? `${updatedTasksMap[t.id].start_date_local} → ${updatedTasksMap[t.id].end_date_local}`
                                                        : "Sin fechas"}
                                                </div>
                                                <div className="gantt-item-extra">
                                                    <div>
                                                        <strong>Duración:</strong>{" "}
                                                        {updatedTasksMap[t.id]?.duration_days ?? "-"} días
                                                    </div>
                                                    <div>
                                                        <strong>Dependencias:</strong>{" "}
                                                        {renderDependencies(t.dependencies)}
                                                    </div>
                                                    <div>
                                                        <strong>Interesados:</strong>{" "}
                                                        {renderInteresados(t.interesados_id)}
                                                    </div>
                                                    {(cerrado || ejecutado) && (
                                                        <>
                                                            <div>
                                                                <strong>Avance estimado:</strong>{" "}
                                                                {(() => {
                                                                    const metrics = calculatePerformance(t);
                                                                    return <>{metrics.expectedProgress}%</>;
                                                                })()}
                                                            </div>
                                                            <div>
                                                                <strong>Avance real:</strong>{" "}
                                                                {t.progress}%
                                                            </div>
                                                            <div>
                                                                <strong>Desempeño:</strong>{" "}
                                                                {(() => {
                                                                    const metrics = calculatePerformance(t);
                                                                    const performanceColor = getPerformanceColor(metrics.performance);
                                                                    if (metrics.isFuture) {
                                                                        return (
                                                                            <span style={{
                                                                                color: '#6c757d',
                                                                                fontStyle: 'italic'
                                                                            }}>
                                                                                Pendiente
                                                                            </span>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <span style={{
                                                                            color: performanceColor,
                                                                            fontWeight: 'bold',
                                                                            fontSize: '1.1em'
                                                                        }}>
                                                                            {metrics.performance.toFixed(2)}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="gantt-item-actions">
                                                {!cerrado && (
                                                    <>
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
                                                            onClick={() => confirmDeleteTask(t.id)}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </>
                                                )}
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
                                        <div className="gantt-item-title">{t.name} ({taskAliasMap[t.id] || 'T?'})</div>
                                        <div className="gantt-item-dates">
                                            {updatedTasksMap[t.id]?.start_date_local
                                                ? `${updatedTasksMap[t.id].start_date_local} → ${updatedTasksMap[t.id].end_date_local}`
                                                : "Sin fechas"}
                                        </div>
                                        <div className="gantt-item-extra">
                                            <div>
                                                <strong>Duración:</strong>{" "}
                                                {updatedTasksMap[t.id]?.duration_days ?? "-"} días
                                            </div>
                                            <div>
                                                <strong>Dependencias:</strong>{" "}
                                                {renderDependencies(t.dependencies)}
                                            </div>
                                            <div>
                                                <strong>Interesados:</strong>{" "}
                                                {renderInteresados(t.interesados_id)}
                                            </div>
                                            <div>
                                                <strong>Avance estimado:</strong>{" "}
                                                {(() => {
                                                    const metrics = calculatePerformance(t);
                                                    return <>{metrics.expectedProgress}%</>;
                                                })()}
                                            </div>
                                            {(cerrado || ejecutado) && (
                                                <>
                                                    <div>
                                                        <strong>Avance real:</strong>{" "}
                                                        {t.progress}%
                                                    </div>
                                                    <div>
                                                        <strong>Desempeño:</strong>{" "}
                                                        {(() => {
                                                            const metrics = calculatePerformance(t);
                                                            const performanceColor = getPerformanceColor(metrics.performance);
                                                            if (metrics.isFuture) {
                                                                return (
                                                                    <span style={{
                                                                        color: '#6c757d',
                                                                        fontStyle: 'italic'
                                                                    }}>
                                                                        Pendiente
                                                                    </span>
                                                                );
                                                            }

                                                            return (
                                                                <span style={{
                                                                    color: performanceColor,
                                                                    fontWeight: 'bold',
                                                                    fontSize: '1.1em'
                                                                }}>
                                                                    {metrics.performance.toFixed(2)}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="gantt-item-actions">
                                        {!cerrado && (
                                            <>
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
                                                    onClick={() => confirmDeleteTask(t.id)}
                                                >
                                                    🗑️
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                    </ListGroup>
                </div>
            </>
        );

    };

    const handleViewChange = (newView) => {
        setView(newView);
    };

    const renderZoom = () => (
        <div className="gantt-zoom-controls"> {/* 🎯 Clase CSS clave para flotar */}
            <button
                className={`btn btn-sm ${view === ViewMode.Day ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleViewChange(ViewMode.Day)}
                title="Vista por Día"
            >
                Día
            </button>
            <button
                className={`btn btn-sm mx-1 ${view === ViewMode.Week ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleViewChange(ViewMode.Week)}
                title="Vista por Semana"
            >
                Semana
            </button>
            <button
                className={`btn btn-sm ${view === ViewMode.Month ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleViewChange(ViewMode.Month)}
                title="Vista por Mes"
            >
                Mes
            </button>
            <button
                className={`btn btn-sm ml-1 ${view === ViewMode.Year ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleViewChange(ViewMode.Year)}
                title="Vista por Año"
            >
                Año
            </button>
        </div>
    );

    return (
        <>
            <Row className="gantt-container">
                <Col md={4}>{renderLeftList()}</Col>
                <Col md={8} className="gantt-chart-wrapper">
                    {renderZoom()}
                    {tasks.length > 0 ? (
                        <Gantt
                            tasks={ganttTasks}
                            viewMode={view}
                            onDateChange={cerrado ? null : onDateChange}
                            onProgressChange={cerrado ? null : onProgressChange}
                            onClick={cerrado ? null : onTaskClick}
                            renderTask={renderTask}
                            listCellWidth=""
                        />
                    ) : (
                            <div className="gantt-empty">No hay {types} para mostrar</div>
                    )}
                </Col>
            </Row>

            {/* --- Modal Crear/Editar --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === "create" ? `Crear ${types}` : `Editar ${types}`}</Modal.Title>
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
                            <Form.Label>Fecha de Inicio</Form.Label>
                            <Form.Control
                                type="date"
                                value={form.start_date}
                                onChange={(e) => {
                                    setForm({ ...form, start_date: e.target.value });
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Duración (días)</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                value={form.duration}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    setForm({ ...form, duration: value });
                                }}
                                placeholder="Ingrese la duración en días"
                            />
                            <Form.Text className="text-muted">
                                {form.start_date && form.duration ? (
                                    <>
                                        Fecha final calculada:{" "}
                                        <strong>
                                            {(() => {
                                                const start = new Date(form.start_date);
                                                const end = new Date(start);
                                                end.setDate(end.getDate() + parseInt(form.duration));
                                                return end.toLocaleDateString('es-EC');
                                            })()}
                                        </strong>
                                    </>
                                ) : (
                                    "Seleccione una fecha de inicio para ver la fecha final"
                                )}
                            </Form.Text>
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
                                                {t.name ?? `${type} ${t.id}`}
                                            </option>
                                        ))

                                ) : (
                                        <option value="">No hay {types} disponibles</option>
                                )}
                                {/* Opción para quitar dependencias */}
                                <option value="">Ninguna dependencia</option>

                            </Form.Control>

                            <Form.Text className="text-muted">
                                Seleccione {types} de las que depende (si existen).
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Progreso (%)</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                max={100}
                                value={form.progress === 0 ? "" : form.progress}
                                placeholder="0"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "") {
                                        setForm({ ...form, progress: 0 });
                                        return;
                                    }
                                    const num = Number(val);
                                    if (num >= 0 && num <= 100) {
                                        setForm({ ...form, progress: num });
                                    }
                                }}
                                disabled={form.type === "group"}
                            />
                            {form.type === "group" && (
                                <Form.Text className="text-muted">
                                    El progreso de los grupos se calcula automáticamente según sus tareas hijas.
                                </Form.Text>
                            )}
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
                    <Modal.Title>Eliminar {type}</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Está seguro que desea eliminar {type}?</Modal.Body>
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
