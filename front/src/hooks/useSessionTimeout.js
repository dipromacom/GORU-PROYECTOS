/**
 * useSessionTimeout.js
 *
 * Custom hook que detecta inactividad del usuario y cierra la sesión
 * automáticamente tras el tiempo configurado (en minutos).
 *
 * El tiempo se lee de localStorage bajo la clave 'goru_session_timeout_minutes'.
 * Si no existe, se usa el valor por defecto (DEFAULT_TIMEOUT_MINUTES).
 *
 * Solo actúa cuando isAuthenticated === true.
 */
import { useEffect, useRef, useCallback } from 'react';

const SESSION_TIMEOUT_KEY = 'goru_session_timeout_minutes';
const DEFAULT_TIMEOUT_MINUTES = 30;
const ACTIVITY_EVENTS = [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
    'scroll',
    'wheel',
    'click',
];

/**
 * @param {boolean} isAuthenticated  – ¿Hay sesión activa?
 * @param {Function} onTimeout       – Callback ejecutado al expirar (dispatch logout + redirect)
 */
function useSessionTimeout(isAuthenticated, onTimeout) {
    const timerRef = useRef(null);
    const onTimeoutRef = useRef(onTimeout);
    onTimeoutRef.current = onTimeout;

    const getTimeoutMs = useCallback(() => {
        const stored = localStorage.getItem(SESSION_TIMEOUT_KEY);
        const minutes = stored ? parseFloat(stored) : DEFAULT_TIMEOUT_MINUTES;
        const valid = Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_TIMEOUT_MINUTES;
        return valid * 60 * 1000;
    }, []);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onTimeoutRef.current();
        }, getTimeoutMs());
    }, [getTimeoutMs]);

    useEffect(() => {
        if (!isAuthenticated) {
            // Si no hay sesión, limpiar cualquier timer pendiente
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // Arrancar el timer y escuchar eventos de actividad
        resetTimer();

        ACTIVITY_EVENTS.forEach((evt) =>
            window.addEventListener(evt, resetTimer, { passive: true })
        );

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            ACTIVITY_EVENTS.forEach((evt) =>
                window.removeEventListener(evt, resetTimer)
            );
        };
    }, [isAuthenticated, resetTimer]);
}

export default useSessionTimeout;
