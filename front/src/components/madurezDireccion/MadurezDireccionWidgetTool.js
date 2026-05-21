import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectors as sessionSelectors } from '../../reducers/session';
import { getMadurezDireccionEstado } from '../../api';
import WidgetTool from '../widgetTool/WidgetTool';

const ESTADO_TIMEOUT_MS = 8000;

function MadurezDireccionWidgetTool({ usuario }) {
    const [completado, setCompletado] = useState(false);
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
                if (activo) setCompletado(!!data.completado);
            } catch {
                // Si el API falla (tabla no creada, red, etc.) el botón sigue usable
                if (activo) setCompletado(false);
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

    const buttonLabel = !estadoListo
        ? 'Ingresar'
        : (completado ? 'Ver resultado' : 'Ingresar');

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
