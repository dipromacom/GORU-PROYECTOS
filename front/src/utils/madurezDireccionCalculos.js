import {
    DIMENSIONES,
    NIVELES_MADUREZ,
    PUNTAJE_MAXIMO_TOTAL,
    TOTAL_PREGUNTAS,
} from '../data/madurezDireccionProyectosData';

export const getNivelPorPorcentaje = (porcentaje) => {
    let pct = Number(porcentaje);
    if (!Number.isFinite(pct)) return NIVELES_MADUREZ[0];
    if (pct > 0 && pct <= 1) pct *= 100;
    pct = Math.min(100, Math.max(0, Math.round(pct * 100) / 100));
    if (pct <= 20) return NIVELES_MADUREZ[0];
    if (pct <= 40) return NIVELES_MADUREZ[1];
    if (pct <= 60) return NIVELES_MADUREZ[2];
    if (pct <= 80) return NIVELES_MADUREZ[3];
    return NIVELES_MADUREZ[4];
};

export const calcularResultados = (respuestas) => {
    if (!Array.isArray(respuestas) || respuestas.length !== TOTAL_PREGUNTAS) {
        return null;
    }

    const valores = respuestas.map((r) => Number(r));
    if (valores.some((v) => !Number.isInteger(v) || v < 1 || v > 5)) {
        return null;
    }

    const puntajesDimension = DIMENSIONES.map((dim, dimIndex) => {
        const inicio = dimIndex * 5;
        const slice = valores.slice(inicio, inicio + 5);
        return slice.reduce((sum, v) => sum + v, 0);
    });

    const puntajeTotal = puntajesDimension.reduce((sum, p) => sum + p, 0);
    const porcentajeMadurez = Math.round((puntajeTotal / PUNTAJE_MAXIMO_TOTAL) * 10000) / 100;
    const nivel = getNivelPorPorcentaje(porcentajeMadurez);

    const dimensionesDetalle = DIMENSIONES.map((dim, i) => ({
        id: dim.id,
        titulo: dim.titulo,
        puntaje: puntajesDimension[i],
        puntajeMaximo: 25,
        porcentaje: Math.round((puntajesDimension[i] / 25) * 100),
    }));

    const ordenadas = [...dimensionesDetalle].sort((a, b) => a.puntaje - b.puntaje);
    const debiles = ordenadas.slice(0, 3).map((d) => d.titulo);
    const fuertes = [...dimensionesDetalle].sort((a, b) => b.puntaje - a.puntaje).slice(0, 3).map((d) => d.titulo);

    const lecturaEjecutiva = `La empresa presenta un nivel de madurez ${nivel.nombre.toLowerCase()} en Dirección de Proyectos (${porcentajeMadurez}%). Esto significa que actualmente sus proyectos se gestionan principalmente mediante ${nivel.modoGestion}. Las principales fortalezas identificadas son: ${fuertes.join(', ')}. Las principales oportunidades de mejora se encuentran en: ${debiles.join(', ')}.`;

    const proximosPasos = [
        'Fortalecer las dimensiones con menor puntaje.',
        'Definir una hoja de ruta de madurez a 6, 12 y 18 meses.',
        'Implementar prácticas de gobierno, metodología, indicadores y desarrollo de capacidades.',
        'Evaluar si la empresa requiere una PMO, mejora de procesos, capacitación, certificación, herramientas tecnológicas o gestión de portafolio.',
    ];

    return {
        puntajesDimension,
        puntajeTotal,
        porcentajeMadurez,
        nivelMadurez: nivel.nivel,
        nivelNombre: nivel.nombre,
        interpretacion: {
            nivel,
            dimensionesDetalle,
            debiles,
            fuertes,
            lecturaEjecutiva,
            proximosPasos,
        },
    };
};

export const respuestasCompletas = (respuestas) => {
    if (!Array.isArray(respuestas) || respuestas.length !== TOTAL_PREGUNTAS) return false;
    return respuestas.every((r) => {
        const v = Number(r);
        return Number.isInteger(v) && v >= 1 && v <= 5;
    });
};

export const dimensionPreguntasCompletas = (respuestas, dimIndex) => {
    const inicio = dimIndex * 5;
    return respuestas.slice(inicio, inicio + 5).every((r) => {
        const v = Number(r);
        return Number.isInteger(v) && v >= 1 && v <= 5;
    });
};
