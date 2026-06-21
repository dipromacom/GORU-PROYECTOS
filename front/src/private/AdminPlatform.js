/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import { toast } from 'react-toastify';
import {
    getAdminUsuarios,
    getAdminMadurezDireccionList,
    patchAdminUsuarioTipoLicencia,
    patchAdminUsuarioEmpresa,
    deleteAdminUsuario,
    postAdminEmpresa,
    getAllTipoLicenciaCatalogo,
    getAllEmpresasCatalogo,
    getAdminColaboradoresProyectoConfig,
    putAdminColaboradoresProyectoConfig,
    getAdminSesionTimeoutConfig,
    putAdminSesionTimeoutConfig,
} from '../api';
import { selectors as sessionSelectors } from '../reducers/session';
import MadurezAdminDetalleModal from '../components/madurezDireccion/MadurezAdminDetalleModal';
import '../css/Commons.css';
import './AdminPlatform.css';

function AdminPlatform({ user }) {
    const history = useHistory();
    const [usuarios, setUsuarios] = useState([]);
    const [total, setTotal] = useState(0);
    const [tiposLicencia, setTiposLicencia] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingUserId, setSavingUserId] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');

    const [empNombre, setEmpNombre] = useState('');
    const [empIdent, setEmpIdent] = useState('');
    const [empTipoId, setEmpTipoId] = useState('RUC');
    const [creatingEmp, setCreatingEmp] = useState(false);

    const [colabCfg, setColabCfg] = useState(null);
    const [colabDraft, setColabDraft] = useState({
        max_colaboradores_personal: '',
        max_colaboradores_equipo: '',
        max_colaboradores_programa: '',
    });
    const [loadingColabCfg, setLoadingColabCfg] = useState(false);
    const [savingColabCfg, setSavingColabCfg] = useState(false);

    // --- Timeout de sesión ---
    const SESSION_TIMEOUT_KEY = 'goru_session_timeout_minutes';
    const DEFAULT_TIMEOUT = 30;
    const [timeoutMinutes, setTimeoutMinutes] = useState(DEFAULT_TIMEOUT);
    const [timeoutDraft, setTimeoutDraft] = useState(String(DEFAULT_TIMEOUT));
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [savingTimeout, setSavingTimeout] = useState(false);
    const [timeoutLastUpdate, setTimeoutLastUpdate] = useState(null);

    const [draft, setDraft] = useState({});
    const [activeTab, setActiveTab] = useState('plataforma');
    const [madurezList, setMadurezList] = useState([]);
    const [loadingMadurez, setLoadingMadurez] = useState(false);
    const [madurezDetalle, setMadurezDetalle] = useState(null);
    const [showMadurezModal, setShowMadurezModal] = useState(false);
    const [fechaDesdeInput, setFechaDesdeInput] = useState('');
    const [fechaHastaInput, setFechaHastaInput] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (!user.es_super_admin) {
            toast.warn('No tiene acceso al panel de administración.');
            history.push('/home');
        }
    }, [user, history]);

    const loadCatalogos = useCallback(async () => {
        try {
            const [tRes, eRes] = await Promise.all([
                getAllTipoLicenciaCatalogo(),
                getAllEmpresasCatalogo(),
            ]);
            if (tRes.data.success) setTiposLicencia(tRes.data.data || []);
            if (eRes.data.success) setEmpresas(eRes.data.data || []);
        } catch (e) {
            toast.error(e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message);
        }
    }, []);

    const loadUsuarios = useCallback(async () => {
        if (!user || !user.es_super_admin) return;
        setLoading(true);
        try {
            const res = await getAdminUsuarios({
                limit: 100,
                offset: 0,
                q: appliedSearch || undefined,
            });
            if (res.data.success) {
                const rows = res.data.data.rows || [];
                setUsuarios(rows);
                setTotal(res.data.data.total || 0);
                const d = {};
                rows.forEach((u) => {
                    d[u.id] = {
                        tipoLicenciaId: u.tipo_licencia != null ? String(u.tipo_licencia) : '',
                        empresaId: u.empresa != null ? String(u.empresa) : '',
                    };
                });
                setDraft(d);
            }
        } catch (e) {
            if (e.response && e.response.status === 403) {
                toast.error(e.response.data.message || 'Sin acceso');
                history.push('/home');
            } else {
                toast.error(e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message);
            }
        } finally {
            setLoading(false);
        }
    }, [user, appliedSearch, history]);

    useEffect(() => {
        if (!user || !user.es_super_admin) return;
        loadCatalogos();
    }, [user, loadCatalogos]);

    const loadColabConfig = useCallback(async () => {
        if (!user || !user.es_super_admin) return;
        setLoadingColabCfg(true);
        try {
            const res = await getAdminColaboradoresProyectoConfig();
            if (res.data.success && res.data.data) {
                const d = res.data.data;
                setColabCfg(d);
                setColabDraft({
                    max_colaboradores_personal: String(d.maxColaboradoresPersonal ?? ''),
                    max_colaboradores_equipo: String(d.maxColaboradoresEquipo ?? ''),
                    max_colaboradores_programa: String(d.maxColaboradoresPrograma ?? ''),
                });
            }
        } catch (e) {
            toast.error(
                e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message
            );
        } finally {
            setLoadingColabCfg(false);
        }
    }, [user]);

    // --- Cargar / guardar timeout de sesión ---
    const loadTimeoutConfig = useCallback(async () => {
        if (!user || !user.es_super_admin) return;
        setLoadingTimeout(true);
        try {
            const res = await getAdminSesionTimeoutConfig();
            if (res.data.success && res.data.data) {
                const mins = res.data.data.timeout_minutos ?? DEFAULT_TIMEOUT;
                setTimeoutMinutes(mins);
                setTimeoutDraft(String(mins));
                if (res.data.data.fechaActualizacion) setTimeoutLastUpdate(res.data.data.fechaActualizacion);
                // Sincronizar con localStorage para que el hook lo lea
                localStorage.setItem(SESSION_TIMEOUT_KEY, String(mins));
            }
        } catch (e) {
            // Si el backend aún no tiene el endpoint, usar localStorage como fallback
            const stored = localStorage.getItem(SESSION_TIMEOUT_KEY);
            if (stored) {
                setTimeoutMinutes(Number(stored));
                setTimeoutDraft(stored);
            }
        } finally {
            setLoadingTimeout(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user || !user.es_super_admin) return;
        loadTimeoutConfig();
    }, [user, loadTimeoutConfig]);

    const handleGuardarTimeout = async (e) => {
        e.preventDefault();
        const mins = parseInt(timeoutDraft, 10);
        if (!Number.isFinite(mins) || mins < 1 || mins > 1440) {
            toast.warn('El tiempo debe ser un número entero entre 1 y 1440 minutos.');
            return;
        }
        setSavingTimeout(true);
        try {
            await putAdminSesionTimeoutConfig({ timeout_minutos: mins });
            setTimeoutMinutes(mins);
            localStorage.setItem(SESSION_TIMEOUT_KEY, String(mins));
            toast.success('Tiempo de sesión actualizado.');
            await loadTimeoutConfig();
        } catch (er) {
            // Si el backend no existe aún, guardar solo en localStorage
            setTimeoutMinutes(mins);
            localStorage.setItem(SESSION_TIMEOUT_KEY, String(mins));
            toast.success('Tiempo de sesión guardado localmente.');
        } finally {
            setSavingTimeout(false);
        }
    };

    useEffect(() => {
        if (!user || !user.es_super_admin) return;
        loadColabConfig();
    }, [user, loadColabConfig]);

    const handleGuardarColabConfig = async (e) => {
        e.preventDefault();
        const body = {
            max_colaboradores_personal: parseInt(colabDraft.max_colaboradores_personal, 10),
            max_colaboradores_equipo: parseInt(colabDraft.max_colaboradores_equipo, 10),
            max_colaboradores_programa: parseInt(colabDraft.max_colaboradores_programa, 10),
        };
        if ([body.max_colaboradores_personal, body.max_colaboradores_equipo, body.max_colaboradores_programa].some(
            (n) => !Number.isFinite(n)
        )) {
            toast.warn('Los tres límites deben ser números enteros.');
            return;
        }
        setSavingColabCfg(true);
        try {
            const res = await putAdminColaboradoresProyectoConfig(body);
            if (res.data.success) {
                toast.success('Límites de colaboradores actualizados.');
                await loadColabConfig();
            }
        } catch (er) {
            toast.error(
                er.response && er.response.data && er.response.data.message ? er.response.data.message : er.message
            );
        } finally {
            setSavingColabCfg(false);
        }
    };

    useEffect(() => {
        if (!user || !user.es_super_admin) return;
        loadUsuarios();
    }, [user, loadUsuarios]);

    const loadMadurezList = useCallback(async (opts = {}) => {
        if (!user || !user.es_super_admin) return;
        const desde = opts.fechaDesde !== undefined ? opts.fechaDesde : filtroFechaDesde;
        const hasta = opts.fechaHasta !== undefined ? opts.fechaHasta : filtroFechaHasta;
        setLoadingMadurez(true);
        try {
            const params = {};
            if (desde) params.fechaDesde = desde;
            if (hasta) params.fechaHasta = hasta;
            const res = await getAdminMadurezDireccionList(params);
            if (res.data.success) {
                setMadurezList(res.data.data || []);
            }
        } catch (e) {
            toast.error(
                e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message
            );
        } finally {
            setLoadingMadurez(false);
        }
    }, [user, filtroFechaDesde, filtroFechaHasta]);

    const handleFiltrarMadurezPorFecha = () => {
        if (fechaDesdeInput && fechaHastaInput && fechaDesdeInput > fechaHastaInput) {
            toast.warn('La fecha "Desde" no puede ser posterior a "Hasta".');
            return;
        }
        setFiltroFechaDesde(fechaDesdeInput);
        setFiltroFechaHasta(fechaHastaInput);
        loadMadurezList({ fechaDesde: fechaDesdeInput, fechaHasta: fechaHastaInput });
    };

    const handleLimpiarFiltroMadurez = () => {
        setFechaDesdeInput('');
        setFechaHastaInput('');
        setFiltroFechaDesde('');
        setFiltroFechaHasta('');
        loadMadurezList({ fechaDesde: '', fechaHasta: '' });
    };

    useEffect(() => {
        if (!user || !user.es_super_admin) return;
        if (activeTab === 'madurez') {
            loadMadurezList();
        }
    }, [user, activeTab, loadMadurezList]);

    const defaultsFromUser = (u) => ({
        tipoLicenciaId: u.tipo_licencia != null ? String(u.tipo_licencia) : '',
        empresaId: u.empresa != null ? String(u.empresa) : '',
    });

    const updateDraft = (uid, field, value) => {
        setDraft((prev) => {
            const u = usuarios.find((x) => x.id === uid);
            const current = prev[uid] || (u ? defaultsFromUser(u) : { tipoLicenciaId: '', empresaId: '' });
            return { ...prev, [uid]: { ...current, [field]: value } };
        });
    };

    const rowFor = (u) => ({
        ...defaultsFromUser(u),
        ...(draft[u.id] || {}),
    });

    const handleGuardarUsuario = async (uid) => {
        const u = usuarios.find((x) => x.id === uid);
        const row = u ? rowFor(u) : { tipoLicenciaId: '', empresaId: '' };
        if (!row.tipoLicenciaId) {
            toast.warn('Seleccione un tipo de licencia.');
            return;
        }
        setSavingUserId(uid);
        try {
            await patchAdminUsuarioTipoLicencia(uid, parseInt(row.tipoLicenciaId, 10));
            await patchAdminUsuarioEmpresa(uid, row.empresaId === '' ? null : parseInt(row.empresaId, 10));
            toast.success('Usuario actualizado.');
            await loadUsuarios();
        } catch (e) {
            toast.error(e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message);
        } finally {
            setSavingUserId(null);
        }
    };

    const handleDeleteUsuario = async () => {
        if (!deleteTarget) return;
        if (deleteConfirmText !== deleteTarget.username) {
            toast.warn('Escribí exactamente el email del usuario para confirmar.');
            return;
        }
        setDeleting(true);
        try {
            await deleteAdminUsuario(deleteTarget.id);
            toast.success('Usuario eliminado permanentemente.');
            setDeleteTarget(null);
            setDeleteConfirmText('');
            await loadUsuarios();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al eliminar usuario');
        } finally {
            setDeleting(false);
        }
    };

    const handleCrearEmpresa = async (e) => {
        e.preventDefault();
        if (!empNombre.trim() || !empIdent.trim()) {
            toast.warn('Nombre e identificación son obligatorios.');
            return;
        }
        setCreatingEmp(true);
        try {
            await postAdminEmpresa({
                nombre: empNombre.trim(),
                identificacion: empIdent.trim(),
                tipoIdentificacion: empTipoId || 'RUC',
            });
            toast.success('Empresa creada.');
            setEmpNombre('');
            setEmpIdent('');
            await loadCatalogos();
        } catch (er) {
            toast.error(er.response && er.response.data && er.response.data.message ? er.response.data.message : er.message);
        } finally {
            setCreatingEmp(false);
        }
    };

    if (!user || !user.es_super_admin) {
        return null;
    }

    return (
        <div className="admin-platform page-menu-container blue">
            <Container fluid className="admin-platform-content px-0">
                <h1 className="blue mb-3">Administración de plataforma</h1>
                <p className="text-muted mb-4 admin-intro">
                    Planes (tipo de licencia), empresas, asignación de usuarios y assessments de madurez en dirección de proyectos.
                </p>

                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'plataforma')}>
                    <Nav variant="tabs" className="mb-4 admin-tabs">
                        <Nav.Item>
                            <Nav.Link eventKey="plataforma">Plataforma</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="madurez">Assessments madurez</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        <Tab.Pane eventKey="plataforma">
                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Body className="px-3 px-md-4 py-4">
                                    <Card.Title className="blue h5 mb-3">
                                        <i className="bi bi-clock-history me-2" />
                                        Tiempo de inactividad de sesión
                                    </Card.Title>
                                    <p className="text-muted small mb-4">
                                        Si el usuario no interactúa con la plataforma durante el tiempo configurado,
                                        se cerrará la sesión automáticamente y será redirigido al inicio de sesión.
                                        El cambio aplica para todos los usuarios en su próxima sesión.
                                    </p>
                                    {loadingTimeout ? (
                                        <p className="mb-0">Cargando configuración…</p>
                                    ) : (
                                        <Form onSubmit={handleGuardarTimeout}>
                                            <Row className="g-3 align-items-end">
                                                <Col xs={12} md={4}>
                                                    <Form.Group className="mb-0">
                                                        <Form.Label>Minutos de inactividad antes del cierre</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min={1}
                                                            max={1440}
                                                            value={timeoutDraft}
                                                            onChange={(ev) => setTimeoutDraft(ev.target.value)}
                                                            placeholder="Ej. 30"
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Actual: <strong>{timeoutMinutes} min</strong>
                                                            {' — '}Mínimo 1 min, máximo 1440 min (24 h).
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} className="d-flex justify-content-start">
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        disabled={savingTimeout || loadingTimeout}
                                                    >
                                                        <i className="bi bi-save me-2" />
                                                        Guardar tiempo de sesión
                                                    </Button>
                                                </Col>
                                            </Row>
                                            {timeoutLastUpdate && (
                                                <p className="small text-muted mt-3 mb-0">
                                                    Última actualización:{' '}
                                                    {new Date(timeoutLastUpdate).toLocaleString('es-ES')}
                                                </p>
                                            )}
                                        </Form>
                                    )}
                                </Card.Body>
                            </Card>

                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Body className="px-3 px-md-4 py-4">
                                    <Card.Title className="blue h5 mb-3">Límites de colaboradores por proyecto</Card.Title>
                                    <p className="text-muted small mb-4">
                                        Aplica a todos los proyectos según su modo: personal (A), equipo (P) o programa (PR). Los usuarios con
                                        rol asignado cuentan para el límite; el creador del proyecto (sin rol en la tabla pivote) no cuenta.
                                    </p>
                                    {loadingColabCfg ? (
                                        <p className="mb-0">Cargando configuración…</p>
                                    ) : (
                                        <Form onSubmit={handleGuardarColabConfig}>
                                            <Row className="g-3 align-items-end">
                                                <Col xs={12} md={4}>
                                                    <Form.Group className="mb-0">
                                                        <Form.Label>Máx. colaboradores — proyecto personal</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min={0}
                                                            value={colabDraft.max_colaboradores_personal}
                                                            onChange={(ev) =>
                                                                setColabDraft((p) => ({
                                                                    ...p,
                                                                    max_colaboradores_personal: ev.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <Form.Group className="mb-0">
                                                        <Form.Label>Máx. colaboradores — proyecto equipo</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min={0}
                                                            value={colabDraft.max_colaboradores_equipo}
                                                            onChange={(ev) =>
                                                                setColabDraft((p) => ({
                                                                    ...p,
                                                                    max_colaboradores_equipo: ev.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <Form.Group className="mb-0">
                                                        <Form.Label>Máx. colaboradores — programa</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min={0}
                                                            value={colabDraft.max_colaboradores_programa}
                                                            onChange={(ev) =>
                                                                setColabDraft((p) => ({
                                                                    ...p,
                                                                    max_colaboradores_programa: ev.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} className="d-flex justify-content-end">
                                                    <Button type="submit" variant="primary" disabled={savingColabCfg || loadingColabCfg}>
                                                        Guardar límites
                                                    </Button>
                                                </Col>
                                            </Row>
                                            {colabCfg && colabCfg.fechaActualizacion && (
                                                <p className="small text-muted mt-3 mb-0">
                                                    Última actualización: {new Date(colabCfg.fechaActualizacion).toLocaleString('es-ES')}
                                                </p>
                                            )}
                                        </Form>
                                    )}
                                </Card.Body>
                            </Card>


                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Body className="px-3 px-md-4 py-4">
                                    <Card.Title className="blue h5 mb-4">Nueva empresa</Card.Title>
                                    <Form onSubmit={handleCrearEmpresa}>
                                        <Row className="g-3 align-items-end">
                                            <Col xs={12} md={4}>
                                                <Form.Group className="mb-0">
                                                    <Form.Label>Nombre</Form.Label>
                                                    <Form.Control
                                                        value={empNombre}
                                                        onChange={(ev) => setEmpNombre(ev.target.value)}
                                                        autoComplete="organization"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={3}>
                                                <Form.Group className="mb-0">
                                                    <Form.Label>Identificación</Form.Label>
                                                    <Form.Control value={empIdent} onChange={(ev) => setEmpIdent(ev.target.value)} />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <Form.Group className="mb-0">
                                                    <Form.Label>Tipo ID</Form.Label>
                                                    <Form.Control value={empTipoId} onChange={(ev) => setEmpTipoId(ev.target.value)} placeholder="RUC" />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} md={3} className="d-flex align-items-end">
                                                <Button type="submit" variant="primary" disabled={creatingEmp} className="w-100">
                                                    Crear empresa
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Body className="px-3 px-md-4 py-4">
                                    <Card.Title className="blue h5 mb-4">Usuarios</Card.Title>
                                    <Row className="g-2 align-items-end admin-search-row mb-4">
                                        <Col xs={12} md={6} lg={5}>
                                            <Form.Group>
                                                <Form.Label>Buscar por email</Form.Label>
                                                <Form.Control
                                                    value={searchInput}
                                                    onChange={(ev) => setSearchInput(ev.target.value)}
                                                    placeholder="correo@..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs="auto" className="d-flex flex-wrap align-items-end pb-1">
                                            <Button variant="outline-primary" className="me-2 mb-2 mb-md-0" onClick={() => setAppliedSearch(searchInput.trim())}>
                                                Buscar
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                className="mb-2 mb-md-0"
                                                onClick={() => {
                                                    setSearchInput('');
                                                    setAppliedSearch('');
                                                }}
                                            >
                                                Limpiar
                                            </Button>
                                        </Col>
                                    </Row>
                                    {loading ? (
                                        <p className="mb-0">Cargando usuarios…</p>
                                    ) : (
                                        <>
                                            <p className="small text-muted mb-2">
                                                {total} usuario(s) (mostrando hasta 100 por consulta).
                                            </p>
                                            <div className="table-responsive">
                                                <Table striped bordered hover size="sm" className="align-middle admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Email</th>
                                                            <th>Super admin</th>
                                                            <th>Tipo licencia</th>
                                                            <th>Empresa</th>
                                                            <th> </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {usuarios.map((u) => {
                                                            const row = rowFor(u);
                                                            return (
                                                                <tr key={u.id}>
                                                                    <td>{u.id}</td>
                                                                    <td>{u.username}</td>
                                                                    <td>{u.es_super_admin ? 'Sí' : 'No'}</td>
                                                                    <td style={{ minWidth: 180 }}>
                                                                        <Form.Control
                                                                            as="select"
                                                                            size="sm"
                                                                            className="form-select"
                                                                            value={row.tipoLicenciaId}
                                                                            onChange={(ev) => updateDraft(u.id, 'tipoLicenciaId', ev.target.value)}
                                                                        >
                                                                            <option value="">—</option>
                                                                            {tiposLicencia.map((t) => (
                                                                                <option key={t.id} value={t.id}>
                                                                                    {t.nombre || `Plan ${t.id}`}
                                                                                </option>
                                                                            ))}
                                                                        </Form.Control>
                                                                    </td>
                                                                    <td style={{ minWidth: 200 }}>
                                                                        <Form.Control
                                                                            as="select"
                                                                            size="sm"
                                                                            className="form-select"
                                                                            value={row.empresaId}
                                                                            onChange={(ev) => updateDraft(u.id, 'empresaId', ev.target.value)}
                                                                        >
                                                                            <option value="">Sin empresa</option>
                                                                            {empresas.map((em) => (
                                                                                <option key={em.id} value={em.id}>
                                                                                    {em.nombre}
                                                                                </option>
                                                                            ))}
                                                                        </Form.Control>
                                                                    </td>
                                                                    <td className="text-nowrap">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="success"
                                                                            disabled={savingUserId === u.id}
                                                                            onClick={() => handleGuardarUsuario(u.id)}
                                                                            className="me-1"
                                                                        >
                                                                            Guardar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-danger"
                                                                            disabled={savingUserId === u.id}
                                                                            onClick={() => { setDeleteTarget(u); setDeleteConfirmText(''); }}
                                                                        >
                                                                            <i className="bi bi-trash" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </Tab.Pane>

                        <Modal show={!!deleteTarget} onHide={() => { setDeleteTarget(null); setDeleteConfirmText(''); }} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Eliminar usuario permanentemente</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p className="text-danger fw-semibold">
                                    <i className="bi bi-exclamation-triangle me-2" />
                                    Esta acción no se puede deshacer.
                                </p>
                                <p>
                                    Se eliminará el usuario <strong>{deleteTarget?.username}</strong> y todos sus datos asociados
                                    (proyectos, evaluaciones, criterios, etc.).
                                </p>
                                <Form.Group>
                                    <Form.Label>
                                        Escribí <strong>{deleteTarget?.username}</strong> para confirmar:
                                    </Form.Label>
                                    <Form.Control
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder={deleteTarget?.username}
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(''); }}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="danger"
                                    disabled={deleteConfirmText !== deleteTarget?.username || deleting}
                                    onClick={handleDeleteUsuario}
                                >
                                    {deleting ? 'Eliminando…' : 'Eliminar usuario'}
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        <Tab.Pane eventKey="madurez">
                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Body className="px-3 px-md-4 py-4">
                                    <Card.Title className="blue h5 mb-3">
                                        Assessments de Madurez en Dirección de Proyectos
                                    </Card.Title>
                                    <p className="text-muted small mb-3">
                                        Todos los tests completados en la plataforma.
                                    </p>
                                    <Row className="g-2 align-items-end admin-madurez-filters mb-3">
                                        <Col xs={12} md={3} lg={2}>
                                            <Form.Group className="mb-0">
                                                <Form.Label className="small mb-1">Desde (opcional)</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    size="sm"
                                                    value={fechaDesdeInput}
                                                    onChange={(e) => setFechaDesdeInput(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={3} lg={2}>
                                            <Form.Group className="mb-0">
                                                <Form.Label className="small mb-1">Hasta (opcional)</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    size="sm"
                                                    value={fechaHastaInput}
                                                    onChange={(e) => setFechaHastaInput(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs="auto" className="d-flex flex-wrap align-items-end pb-1">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2 mb-2 mb-md-0"
                                                onClick={handleFiltrarMadurezPorFecha}
                                                disabled={loadingMadurez}
                                            >
                                                Filtrar
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="me-2 mb-2 mb-md-0"
                                                onClick={handleLimpiarFiltroMadurez}
                                                disabled={loadingMadurez || (!filtroFechaDesde && !filtroFechaHasta && !fechaDesdeInput && !fechaHastaInput)}
                                            >
                                                Limpiar
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="mb-2 mb-md-0"
                                                onClick={() => loadMadurezList()}
                                                disabled={loadingMadurez}
                                            >
                                                Actualizar
                                            </Button>
                                        </Col>
                                    </Row>
                                    {(filtroFechaDesde || filtroFechaHasta) && (
                                        <p className="small text-muted mb-3">
                                            Filtro activo:
                                            {filtroFechaDesde ? ` desde ${filtroFechaDesde}` : ''}
                                            {filtroFechaHasta ? ` hasta ${filtroFechaHasta}` : ''}
                                        </p>
                                    )}
                                    {loadingMadurez ? (
                                        <p className="mb-0">Cargando assessments…</p>
                                    ) : madurezList.length === 0 ? (
                                        <p className="mb-0 text-muted">
                                            {filtroFechaDesde || filtroFechaHasta
                                                ? 'No hay assessments en el rango de fechas seleccionado.'
                                                : 'No hay assessments registrados.'}
                                        </p>
                                    ) : (
                                        <div className="table-responsive admin-madurez-table-wrap">
                                            <Table striped bordered hover className="align-middle admin-table admin-madurez-table">
                                                <thead>
                                                    <tr>
                                                        <th className="col-fecha">Fecha</th>
                                                        <th className="col-contacto">Contacto</th>
                                                        <th className="col-empresa">Empresa</th>
                                                        <th className="col-correo">Correo</th>
                                                        <th className="col-celular">Celular</th>
                                                        <th className="col-resultado">Resultado</th>
                                                        <th className="col-nivel">Nivel</th>
                                                        <th className="col-usuario">Usuario GORU</th>
                                                        <th className="col-acciones text-center"> </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {madurezList.map((m) => (
                                                        <tr key={m.id}>
                                                            <td className="col-fecha text-nowrap">
                                                                {m.fechaCompletado
                                                                    ? new Date(m.fechaCompletado).toLocaleString('es-ES', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })
                                                                    : '—'}
                                                            </td>
                                                            <td className="col-contacto">{m.nombreContacto}</td>
                                                            <td className="col-empresa">{m.empresa}</td>
                                                            <td className="col-correo">{m.correoContacto}</td>
                                                            <td className="col-celular text-nowrap">{m.celular}</td>
                                                            <td className="col-resultado text-nowrap">
                                                                <strong>{m.puntajeTotal}</strong> / 300
                                                                <span className="admin-madurez-pct"> ({m.porcentajeMadurez}%)</span>
                                                            </td>
                                                            <td className="col-nivel">
                                                                <span className="admin-madurez-nivel-badge">
                                                                    Nivel {m.nivelMadurez}
                                                                </span>
                                                                <span className="admin-madurez-nivel-name">{m.nivelNombre}</span>
                                                            </td>
                                                            <td className="col-usuario">{m.usuarioEmail || m.usuarioId || '—'}</td>
                                                            <td className="col-acciones text-center">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setMadurezDetalle(m);
                                                                        setShowMadurezModal(true);
                                                                    }}
                                                                >
                                                                    Ver detalle
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                    <MadurezAdminDetalleModal
                                        show={showMadurezModal}
                                        onHide={() => {
                                            setShowMadurezModal(false);
                                            setMadurezDetalle(null);
                                        }}
                                        detalle={madurezDetalle}
                                    />
                                </Card.Body>
                            </Card>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Container>
        </div>
    );
}

const mapStateToProps = (state) => ({
    user: sessionSelectors.getUser(state),
});

export default connect(mapStateToProps)(AdminPlatform);
