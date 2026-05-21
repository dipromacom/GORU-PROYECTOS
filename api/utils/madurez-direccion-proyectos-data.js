const ESCALA_RESPUESTA = [
    { valor: 1, titulo: 'No existe / informal', descripcion: 'La práctica no está definida o depende totalmente de cada persona.' },
    { valor: 2, titulo: 'Existe parcialmente / aislado', descripcion: 'Algunas áreas o proyectos la aplican, pero no existe consistencia organizacional.' },
    { valor: 3, titulo: 'Documentado / estándar', descripcion: 'La empresa cuenta con procesos, formatos o criterios definidos y aplicados de manera frecuente.' },
    { valor: 4, titulo: 'Gestionado con indicadores', descripcion: 'La práctica se mide, se revisa y se usa para tomar decisiones.' },
    { valor: 5, titulo: 'Optimizado / mejora continua', descripcion: 'La práctica está integrada a la estrategia, se mejora continuamente y genera valor medible.' },
];

const DIMENSIONES = [
    {
        id: 1,
        titulo: 'Gobierno de proyectos',
        descripcion: 'Evalúa si la empresa cuenta con reglas claras para iniciar, priorizar, aprobar, controlar y cerrar proyectos.',
        preguntas: [
            'La empresa tiene criterios formales para aprobar nuevos proyectos.',
            'Existen roles definidos para patrocinadores, líderes, equipos y comités de proyecto.',
            'Los proyectos se revisan periódicamente en espacios de gobierno o comités ejecutivos.',
            'Las decisiones relevantes de los proyectos se documentan y se comunican oportunamente.',
            'Existe una PMO, unidad responsable o función organizacional que supervise la gestión de proyectos.',
        ],
    },
    {
        id: 2,
        titulo: 'Procesos y metodología de dirección de proyectos',
        descripcion: 'Evalúa si la empresa tiene una forma común de gestionar proyectos, sea predictiva, ágil o híbrida.',
        preguntas: [
            'La empresa cuenta con una metodología definida para gestionar proyectos.',
            'Existen plantillas o formatos para acta de constitución, cronograma, presupuesto, riesgos, cambios y cierre.',
            'Los proyectos tienen fases o ciclos de vida claramente definidos.',
            'La metodología se adapta según el tipo, tamaño, riesgo o complejidad del proyecto.',
            'Se aplican prácticas predictivas, ágiles o híbridas según la necesidad del proyecto.',
        ],
    },
    {
        id: 3,
        titulo: 'Alineación estratégica y generación de valor',
        descripcion: 'Evalúa si los proyectos están conectados con la estrategia y con beneficios reales para la organización.',
        preguntas: [
            'Los proyectos se seleccionan considerando objetivos estratégicos de la empresa.',
            'Antes de iniciar un proyecto se define claramente el problema, oportunidad o beneficio esperado.',
            'La empresa mide si los proyectos entregan valor después de su implementación.',
            'Los proyectos tienen indicadores asociados a resultados de negocio.',
            'La alta dirección participa activamente en la priorización y seguimiento de proyectos.',
        ],
    },
    {
        id: 4,
        titulo: 'Planificación y control técnico de proyectos',
        descripcion: 'Evalúa la capacidad de la empresa para planificar, ejecutar y controlar alcance, tiempo, costo, calidad y cambios.',
        preguntas: [
            'Los proyectos cuentan con alcance definido y validado con los interesados.',
            'Se elaboran cronogramas realistas y actualizados durante la ejecución.',
            'Se estiman y controlan los costos de los proyectos.',
            'Existe control formal de cambios en alcance, tiempo, costo o calidad.',
            'Los proyectos cuentan con reportes periódicos de avance, desviaciones y acciones correctivas.',
        ],
    },
    {
        id: 5,
        titulo: 'Gestión de riesgos, problemas y decisiones',
        descripcion: 'Evalúa si la empresa anticipa riesgos o solo reacciona cuando los problemas ya ocurrieron.',
        preguntas: [
            'Los proyectos identifican riesgos antes y durante la ejecución.',
            'Se analizan probabilidad, impacto y prioridad de los riesgos.',
            'Existen planes de respuesta para los principales riesgos del proyecto.',
            'Los problemas críticos se escalan y resuelven mediante mecanismos definidos.',
            'La información de riesgos se usa para tomar decisiones ejecutivas.',
        ],
    },
    {
        id: 6,
        titulo: 'Personas, liderazgo y habilidades blandas',
        descripcion: 'Evalúa las competencias humanas necesarias para dirigir proyectos con efectividad.',
        preguntas: [
            'Los líderes de proyecto tienen habilidades de comunicación, negociación y liderazgo.',
            'Los equipos conocen sus responsabilidades dentro de los proyectos.',
            'Existe gestión activa de interesados internos y externos.',
            'La empresa promueve colaboración, aprendizaje y resolución de conflictos.',
            'Los patrocinadores y líderes reciben formación para ejercer mejor su rol en proyectos.',
        ],
    },
    {
        id: 7,
        titulo: 'Capacitación y certificación internacional',
        descripcion: 'Evalúa el desarrollo profesional del talento vinculado a proyectos.',
        preguntas: [
            'La empresa capacita periódicamente a sus equipos en dirección de proyectos.',
            'Existen rutas de formación para coordinadores, líderes, gerentes de proyecto, Scrum Masters, Product Owners o roles similares.',
            'La empresa promueve certificaciones internacionales en proyectos, agilidad, riesgos, sostenibilidad o portafolios.',
            'Se evalúan las competencias técnicas y conductuales de quienes dirigen proyectos.',
            'La organización cuenta con una comunidad interna, mentoría o espacio de aprendizaje en proyectos.',
        ],
    },
    {
        id: 8,
        titulo: 'Tecnología, software e infraestructura de gestión',
        descripcion: 'Evalúa si la empresa usa herramientas adecuadas para planificar, controlar y visualizar sus proyectos.',
        preguntas: [
            'La empresa utiliza software para gestionar cronogramas, tareas, recursos o tableros de trabajo.',
            'Existe una plataforma común para centralizar información de proyectos.',
            'Los reportes de avance se generan con datos confiables y actualizados.',
            'La empresa utiliza dashboards o tableros ejecutivos para el seguimiento de proyectos.',
            'Las herramientas de gestión de proyectos están integradas o alineadas con otros sistemas de la empresa.',
        ],
    },
    {
        id: 9,
        titulo: 'Gestión de programas y portafolio',
        descripcion: 'Evalúa si la empresa gestiona proyectos de forma aislada o como parte de un sistema de inversión y transformación.',
        preguntas: [
            'La empresa agrupa proyectos relacionados en programas cuando buscan un beneficio común.',
            'Existe una visión consolidada de todos los proyectos relevantes de la organización.',
            'La empresa prioriza proyectos considerando recursos, riesgos, beneficios y estrategia.',
            'Se controlan dependencias entre proyectos.',
            'La alta dirección revisa periódicamente el portafolio de proyectos para decidir continuidad, pausa, cancelación o repriorización.',
        ],
    },
    {
        id: 10,
        titulo: 'Gestión financiera, recursos y capacidad organizacional',
        descripcion: 'Evalúa si la empresa administra recursos, presupuesto y capacidad de ejecución de manera profesional.',
        preguntas: [
            'Los proyectos tienen presupuestos definidos y aprobados.',
            'Se controla el uso de recursos humanos, financieros y materiales en los proyectos.',
            'La empresa identifica sobrecarga de equipos o conflictos de recursos entre proyectos.',
            'Se comparan costos planificados versus costos reales.',
            'La empresa toma decisiones de priorización considerando su capacidad real de ejecución.',
        ],
    },
    {
        id: 11,
        titulo: 'Sostenibilidad, cumplimiento y responsabilidad organizacional',
        descripcion: 'Evalúa si los proyectos consideran impactos sociales, ambientales, regulatorios y reputacionales.',
        preguntas: [
            'Los proyectos consideran requisitos legales, regulatorios o normativos aplicables.',
            'Se evalúan impactos ambientales o sociales relevantes de los proyectos.',
            'La empresa incorpora criterios de sostenibilidad en la toma de decisiones de proyectos.',
            'Se gestionan proveedores y contratistas con criterios de cumplimiento y responsabilidad.',
            'Los proyectos consideran impactos de largo plazo, no solo entrega inmediata.',
        ],
    },
    {
        id: 12,
        titulo: 'Medición, lecciones aprendidas y mejora continua',
        descripcion: 'Evalúa si la empresa aprende de sus proyectos y mejora su sistema de gestión.',
        preguntas: [
            'Los proyectos se cierran formalmente con evaluación de resultados.',
            'Se documentan lecciones aprendidas.',
            'Las lecciones aprendidas se reutilizan en nuevos proyectos.',
            'Existen indicadores de desempeño de proyectos, como cumplimiento de plazo, costo, alcance, calidad, satisfacción o beneficios.',
            'La empresa mejora periódicamente sus procesos de gestión de proyectos.',
        ],
    },
];

const NIVELES_MADUREZ = [
    {
        nivel: 1,
        nombre: 'Inicial o reactivo',
        nombreCorto: 'Inicial',
        rangoLabel: '0% a 20%',
        rangoMin: 0,
        rangoMax: 20,
        interpretacionCorta: 'Gestión informal, reactiva y dependiente de personas',
        descripcion: 'La empresa gestiona proyectos de manera informal. El éxito depende principalmente del esfuerzo individual, la experiencia de algunas personas o la presión para resolver problemas en el momento. No existen procesos comunes, los reportes son limitados y la alta dirección tiene poca visibilidad sobre el estado real de los proyectos.',
        caracteristicas: [
            'La gestión es reactiva.',
            'No existe metodología común.',
            'Hay baja documentación.',
            'Los proyectos dependen de héroes internos.',
            'Los errores se repiten porque no hay aprendizaje sistemático.',
        ],
        riesgo: 'Alta probabilidad de retrasos, sobrecostos, conflictos internos y pérdida de oportunidades estratégicas.',
        prioridad: 'Definir roles, metodología básica, formatos mínimos y un sistema simple de seguimiento.',
        modoGestion: 'esfuerzo individual y reacción ante problemas',
    },
    {
        nivel: 2,
        nombre: 'Básico o repetible',
        nombreCorto: 'Básico',
        rangoLabel: '21% a 40%',
        rangoMin: 21,
        rangoMax: 40,
        interpretacionCorta: 'Prácticas aisladas, parcialmente repetibles',
        descripcion: 'La empresa ya cuenta con algunas prácticas de gestión de proyectos, pero se aplican de forma parcial o inconsistente. Algunos líderes utilizan cronogramas, reuniones, reportes o herramientas, pero no existe una disciplina organizacional homogénea.',
        caracteristicas: [
            'Existen buenas prácticas aisladas.',
            'Algunos proyectos se gestionan mejor que otros.',
            'Hay plantillas o reportes, pero no siempre se usan.',
            'La capacitación es ocasional.',
            'La dirección todavía toma decisiones con información incompleta.',
        ],
        riesgo: 'La empresa puede tener resultados aceptables en algunos proyectos, pero no puede garantizar consistencia en toda la organización.',
        prioridad: 'Estandarizar procesos, capacitar roles clave y crear un tablero básico de control de proyectos.',
        modoGestion: 'prácticas parciales sin consistencia organizacional',
    },
    {
        nivel: 3,
        nombre: 'Estandarizado o definido',
        nombreCorto: 'Estandarizado',
        rangoLabel: '41% a 60%',
        rangoMin: 41,
        rangoMax: 60,
        interpretacionCorta: 'Procesos definidos y metodología común',
        descripcion: 'La empresa tiene procesos definidos para gestionar proyectos. Existe una metodología común, roles más claros y mayor disciplina en planificación, seguimiento y control. Sin embargo, la medición de desempeño, gestión de beneficios y mejora continua todavía pueden estar en desarrollo. Este nivel se relaciona con la lógica de modelos como P3M3, donde la organización pasa de prácticas repetibles a procesos definidos y aplicados de manera organizacional.',
        caracteristicas: [
            'Existe metodología formal.',
            'Los proyectos tienen fases y entregables definidos.',
            'Se aplican herramientas y reportes comunes.',
            'La empresa empieza a gestionar riesgos y cambios.',
            'La PMO o función equivalente comienza a tener mayor relevancia.',
        ],
        riesgo: 'Tener procesos documentados, pero todavía no suficientemente medidos ni conectados con resultados estratégicos.',
        prioridad: 'Fortalecer indicadores, control ejecutivo, gestión de beneficios y gobierno de portafolio.',
        modoGestion: 'procesos definidos y metodología común',
    },
    {
        nivel: 4,
        nombre: 'Gestionado o medido',
        nombreCorto: 'Gestionado',
        rangoLabel: '61% a 80%',
        rangoMin: 61,
        rangoMax: 80,
        interpretacionCorta: 'Gestión medida, controlada y orientada a decisiones',
        descripcion: 'La empresa gestiona proyectos con información confiable, indicadores y mecanismos de control. La alta dirección cuenta con visibilidad sobre desempeño, riesgos, recursos, presupuesto y beneficios. La gestión de proyectos ya no es solo operativa, sino una capacidad organizacional.',
        caracteristicas: [
            'Existen indicadores de desempeño.',
            'La empresa mide plazo, costo, alcance, calidad, riesgos y beneficios.',
            'Hay control de recursos y capacidad organizacional.',
            'Se gestionan programas y portafolios.',
            'La toma de decisiones se basa en datos.',
        ],
        riesgo: 'Medir mucho, pero no convertir la información en decisiones estratégicas o mejora continua.',
        prioridad: 'Integrar gestión de proyectos con estrategia, beneficios, portafolio, sostenibilidad, tecnología y desarrollo de capacidades.',
        modoGestion: 'indicadores, control y decisiones basadas en datos',
    },
    {
        nivel: 5,
        nombre: 'Optimizado o estratégico',
        nombreCorto: 'Optimizado',
        rangoMin: 81,
        rangoMax: 100,
        interpretacionCorta: 'Sistema estratégico, integrado y en mejora continua',
        descripcion: 'La empresa posee una Dirección de Proyectos madura, integrada a la estrategia y orientada a la generación de valor. Los proyectos, programas y portafolios se gestionan con gobierno, datos, tecnología, talento, aprendizaje organizacional y mejora continua. En modelos como OPM3, la madurez no se limita a tener procesos, sino a desarrollar capacidades, obtener resultados, medirlos mediante indicadores y mejorar continuamente en proyectos, programas y portafolios.',
        rangoLabel: '81% a 100%',
        caracteristicas: [
            'La Dirección de Proyectos es una ventaja competitiva.',
            'Existe gobierno integral de proyectos, programas y portafolios.',
            'Los proyectos se priorizan por valor estratégico.',
            'La organización mide beneficios y desempeño.',
            'Hay cultura de mejora continua, innovación y aprendizaje.',
            'La tecnología y los datos soportan la toma de decisiones.',
        ],
        riesgo: 'Mantener la madurez alcanzada y evitar burocratizar el sistema.',
        prioridad: 'Evolucionar hacia centros de excelencia, analítica avanzada, inteligencia artificial, sostenibilidad, gestión de beneficios y optimización del portafolio.',
        modoGestion: 'un sistema integrado de generación de valor',
    },
];

const TOTAL_PREGUNTAS = DIMENSIONES.reduce((acc, d) => acc + d.preguntas.length, 0);
const PUNTAJE_MAXIMO_TOTAL = TOTAL_PREGUNTAS * 5;

const getNivelPorPorcentaje = (porcentaje) => {
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

module.exports = {
    ESCALA_RESPUESTA,
    DIMENSIONES,
    NIVELES_MADUREZ,
    TOTAL_PREGUNTAS,
    PUNTAJE_MAXIMO_TOTAL,
    getNivelPorPorcentaje,
};
