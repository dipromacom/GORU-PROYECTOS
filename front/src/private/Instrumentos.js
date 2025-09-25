import React from "react";
import ContactPopup from "../components/contactPopup/ContactPopup";
import WidgetTool from "../components/widgetTool/WidgetTool";
import "../css/Commons.css";
import "./Instrumentos.css";

import { connect } from "react-redux";

function Instrumentos() {

    return (
        <div className="page-container">
        <hr className="separator" />
        <div className="tools-form">
            <h1 className="orange">Instrumentos</h1>
            
            <div className="subtitle-container">
            <h2 className="blue">Gestión de proyectos y preparación para certificaciones</h2>
            </div>

            <ContactPopup />

            <div className="widget-placeholder">
                <WidgetTool
                    title="Assessment de Salud del Proyecto"
                    description="Herramienta que permitirá medir el desempeño del proyecto y 
                    evaluarlo de una forma integral."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/saludProyecto"}
                    disabled={false}
                />

                <WidgetTool
                    title="Assessment de Director de Proyecto - Conductual"
                    description="La prresente autoevaluación permite conocer el perfil de director de proyecto basado en la conducta y acciones dirias que realiza. Permite conocer en que se debe mejorar como habilidades y competencias."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/perfilDirectorProyectoConductual"}
                    disabled={false}
                />

                <WidgetTool
                    title="Assessment de Director de Proyecto - Cognitivo"
                    description="El Assessment le permitirá autoevaluar y determinar las 
                    habilidades del Director de Proyecto."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/perfilDirectorProyecto"}
                    disabled={false}
                />

                <WidgetTool
                    title="Assessment de Cronograma del Proyecto"
                    description="Assessment que permite determinar el correcto desarrollo del 
                    cronograma de trabajo de un proyecto."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/madurezCronograma"}
                    disabled={false}
                />

                <WidgetTool
                    title="Herramienta de Estilo de Liderazgo"
                    description="Permite conocer nuestro estímulo de liderazgo preponderante y con ello conocernos en nuestros estilos de liderazgos."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/estiloLiderazgo"}
                    disabled={false}
                />

                <WidgetTool
                    title="Herramienta de Estilo de Liderazgo (tarea - persona)"
                    description="Esta herramientas permite conocernos si nuestro liderazgo se enfoca más en la tarea o en la persona y como ello nos lleva a nuestra toma de decisiones diarias."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/estiloLiderazgoTareaPersona"}
                    disabled={false}
                />

                <WidgetTool
                    title="Prácticas Gerenciales"
                    description="La presente autoevaluación nos ayuda a analizar cuales son las prácticas generales más usadas por nosotros y cuales se deben fortalecer."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/practicasGerenciales"}
                    disabled={false}
                />

                <WidgetTool
                    title="Estilo de Resolución de Problemas"
                    description="La presenta autoevaluación nos ayuda a conocer cuales son los principales esquemas de resolución de problemas que nos enfocamos."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/resolucionProblemas"}
                    disabled={false}
                />

                 <WidgetTool
                    title="Herramienta de Priorización de Proyectos"
                    description="Herramienta que permitira medir el nivel de prioridad de un Proyecto
                    y a su vez facilitando la tarea de selección de un proyecto previo a su comienzo."
                    hasDisccount={false}
                    redirecTo="priorization/result"
                    disabled={false}
                />

                <WidgetTool
                    title="Herramienta de Nivel de Madurez del Cronograma"
                    description="Esta herramienta permite evaluar el nivel de madurez de un cronograma de proyecto,
                    facilitando la medición de la prioridad de un proyecto antes de su inicio. 
                    Su objetivo es optimizar el proceso de selección de proyectos, 
                    asegurando que se tomen decisiones informadas sobre cuáles proyectos deben iniciarse primero, basándose en la preparación y viabilidad de su cronograma."
                    hasDisccount={false}
                    externalUrl={"https://recursos.escueladeproyectos.dipromacom.net/madurezCronograma"}
                    disabled={false}
                />
                
            </div>
        </div>
            
        </div>
    );
}

export default connect()(Instrumentos);