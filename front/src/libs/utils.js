import moment from 'moment';

export const showDuration = (value)=>{
    const duration = moment.duration(value, 'd');
    const years = duration.years();
    const months = duration.months();
    const days = duration.days();
    let durationString = '';
    if (years > 0) {
        durationString += `${years} año${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        durationString += `${durationString ? ', ' : ''}${months} mes${months > 1 ? 'es' : ''}`;
    }
    if (days > 0) {
        durationString += `${durationString ? ', y ' : ''}${days} dia${days > 1 ? 's' : ''}`;
    }
    return durationString;
}

export const riesgosMap = {
    "H": "Alto",
    "M": "Medio",
    "L": "Bajo",
}

export const tiposInformesMap = {
    "1":"Comienzo de Proyecto",
    "2":"Reuniones Semanales",
    "4":"Reuniones Mensuales",
    "8":"Reuniones Trimestrales",
    "16":"Cuando Ocurran Eventos Importantes",
    "32":"Conclusion del proyecto"
}