import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectors as sessionSelectors } from '../../reducers/session';
import { getMadurezDireccionEstado } from '../../api';
import ContactPopup from '../contactPopup/ContactPopup';
import WidgetTool from '../widgetTool/WidgetTool';

const ESTADO_TIMEOUT_MS = 8000;

function MadurezDireccionWidgetTool({ usuario }) {
    const [estado, setEstado] = useState(null);
    const [estadoListo, setEstadoListo] = useState(false);

    useEffect(() => {
        let activo = true;

        const timeoutId = setTimeout(() => {
            if (activo) setEstadoListo(true);
        }, ESTADO_TIMEOUT_MS);

        async function cargar() {
            if (!usuario?.id) {
                setEstadoListo(true);
                return;
            }
            try {
                const { data } = await getMadurezDireccionEstado(usuario.id);
                if (activo) setEstado(data);
            } catch {
                if (activo) setEstado(null);
            } finally {
                if (activo) setEstadoListo(true);
            }
        }

        cargar();

        return () => {
            activo = false;
            clearTimeout(timeoutId);
        };
    }, [usuario?.id]);

    const cupoAgotado = estado?.cupoAgotado === true;
    const tieneIntentos = (estado?.cantidad || 0) > 0;

    const buttonLabel = !estadoListo
        ? 'Ingresar'
        : (cupoAgotado
            ? 'Ver resultados'
            : (tieneIntentos ? 'Continuar' : 'Ingresar'));

    if (cupoAgotado && estadoListo) {
        return (
            <div className="widget">
                <div className="widget-container">
                    <h3 className="orange">Assessment de la Madurez en Dirección de Proyectos</h3>
                    <div className="description-container">
                        <p className="blue">
                            Permite identificar, de manera rápida, el nivel inicial de madurez en Dirección de Proyectos de su organización, considerando procesos, personas, tecnología, gobierno, negocio, capacitación y portafolio.
                        </p>
                    </div>
                    <div className="center">
                        <ContactPopup>
                            <button type="button" className="btn btn-success btn-pagar">
                                {buttonLabel}
                            </button>
                        </ContactPopup>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <WidgetTool
            title="Assessment de la Madurez en Dirección de Proyectos"
            description="Permite identificar, de manera rápida, el nivel inicial de madurez en Dirección de Proyectos de su organización, considerando procesos, personas, tecnología, gobierno, negocio, capacitación y portafolio."
            hasDisccount={false}
            redirecTo="tools/madurez-direccion-proyectos"
            disabled={false}
            buttonLabel={buttonLabel}
        />
    );
}

const mapStateToProps = (state) => ({
    usuario: sessionSelectors.getUser(state),
});

export default connect(mapStateToProps)(MadurezDireccionWidgetTool);
