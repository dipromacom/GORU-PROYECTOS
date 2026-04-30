/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { toast } from 'react-toastify';
import {
    getAdminUsuarios,
    patchAdminUsuarioTipoLicencia,
    patchAdminUsuarioEmpresa,
    postAdminEmpresa,
    getAllTipoLicenciaCatalogo,
    getAllEmpresasCatalogo,
    getAdminColaboradoresProyectoConfig,
    putAdminColaboradoresProyectoConfig,
} from '../api';
import { selectors as sessionSelectors } from '../reducers/session';
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

    const [draft, setDraft] = useState({});

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
                    Planes (tipo de licencia), empresas y asignación de empresa a usuarios. Tras cambiar el plan, el usuario puede
                    necesitar cerrar sesión y volver a entrar para ver el menú actualizado.
                </p>

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
                                                        <td>
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                disabled={savingUserId === u.id}
                                                                onClick={() => handleGuardarUsuario(u.id)}
                                                            >
                                                                Guardar
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
            </Container>
        </div>
    );
}

const mapStateToProps = (state) => ({
    user: sessionSelectors.getUser(state),
});

export default connect(mapStateToProps)(AdminPlatform);
