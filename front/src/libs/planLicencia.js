/**
 * Debe coincidir con api/constants/plan-licencia.js (tipo_licencia.id).
 * Opcional: REACT_APP_PLAN_* en .env del front.
 */
export const PLAN_PERSONAL_ID = Number(process.env.REACT_APP_PLAN_PERSONAL_ID) || 2;
export const PLAN_EQUIPOS_ID = Number(process.env.REACT_APP_PLAN_EQUIPOS_ID) || 3;
export const PLAN_CORPORATIVO_ID = Number(process.env.REACT_APP_PLAN_CORPORATIVO_ID) || 4;

/** Valores usados en MembershipOption / saga (histórico) */
export const MEMBERSHIP_DEMO = "Demo";
export const MEMBERSHIP_PROFESIONAL = "Profesional";
export const MEMBERSHIP_CORPORATIVO = "Corporativo";

/**
 * @param {object|null|undefined} user - session.userSystem
 * @returns {number|null|undefined}
 */
export function getTipoLicenciaIdFromUser(user) {
  if (!user) return null;
  const nested = user.TipoLicencia?.id;
  if (nested != null) return nested;
  return user.tipo_licencia != null ? user.tipo_licencia : null;
}

export function userHasTipoLicencia(user) {
  return getTipoLicenciaIdFromUser(user) != null;
}

/**
 * Opciones de membership permitidas según plan en BD.
 * @param {object|null|undefined} user
 * @returns {Set<string>}
 */
export function getAllowedMembershipValuesForUser(user) {
  const id = getTipoLicenciaIdFromUser(user);
  if (id == null) return new Set();
  if (id === PLAN_CORPORATIVO_ID) {
    return new Set([MEMBERSHIP_DEMO, MEMBERSHIP_PROFESIONAL, MEMBERSHIP_CORPORATIVO]);
  }
  if (id === PLAN_EQUIPOS_ID) {
    return new Set([MEMBERSHIP_DEMO, MEMBERSHIP_PROFESIONAL]);
  }
  return new Set([MEMBERSHIP_DEMO]);
}

/**
 * Modo de suscripción compatible con la lógica previa de Proyectos (Demo / Profesional / Corporativo).
 * @param {object|null|undefined} user
 * @returns {'Demo'|'Profesional'|'Corporativo'}
 */
export function getSubscriptionModeFromUser(user) {
  const id = getTipoLicenciaIdFromUser(user);
  if (id === PLAN_CORPORATIVO_ID) return MEMBERSHIP_CORPORATIVO;
  if (id === PLAN_EQUIPOS_ID) return MEMBERSHIP_PROFESIONAL;
  return MEMBERSHIP_DEMO;
}

/**
 * Modo de navegación por defecto al iniciar sesión (antes de pasar por /membership).
 * @param {object|null|undefined} user
 * @returns {'Demo'|'Profesional'|'Corporativo'}
 */
export function defaultMembershipNavFromPlan(user) {
  return getSubscriptionModeFromUser(user);
}

/**
 * @param {string} pathname
 * @param {object|null|undefined} user
 */
export function isRouteAllowedForUserPlan(pathname, user) {
  const id = getTipoLicenciaIdFromUser(user);
  if (id == null) return false;
  if (pathname.includes("/activities")) return true;
  if (pathname.includes("/programs")) return id === PLAN_CORPORATIVO_ID;
  if (pathname.includes("/projects")) return id === PLAN_EQUIPOS_ID || id === PLAN_CORPORATIVO_ID;
  return true;
}

/** Plan solo personales (o sin licencia): no debe abrir detalle de equipo/programa */
export function isPersonalOnlyPlanUser(user) {
  const id = getTipoLicenciaIdFromUser(user);
  return id == null || id === PLAN_PERSONAL_ID;
}
