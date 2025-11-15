import Badge from 'react-bootstrap/Badge'

const possibleValues = {
    "H": "Alto",
    "L": "Bajo",
    "M": "Medio"
}

const baseColors = {
    "H": "danger",
    "L": "success",
    "M": "warning"
}

export const CirticalBadge = ({valor})=>{
    const style = valor <= 30 ? 'success': valor <= 60 ? 'warning': 'danger'
    return <Badge pill className={`bg-${style}`} text={style === 'warning' ? 'dark':''} >
        {valor} %
    </Badge>

}

export const CriticalBadgeFromText =  ({value,femenize=false})=>{
    let number = 1;
    if (value === 'H') number = 3
    if (value === 'M') number = 2
    const tempVal = femenize ? possibleValues[value].replace(/.$/, 'a') : possibleValues[value]
    const upOrDown = baseColors[value] === 'success' ? 'bi-chevron-double-down' : 'bi-chevron-double-up'
    return (<p className='mb-0'> ({number}) &nbsp;{tempVal} <i className={`font-weight-bold bi ${upOrDown} text-${baseColors[value]}`}></i></p>)
}

export const CriticalBadgeFromTextValue = ({ value, femenize = false }) => {
    const tempVal = femenize ? possibleValues[value].replace(/.$/, 'a') : possibleValues[value]
    const upOrDown = baseColors[value] === 'success' ? 'bi-chevron-double-down' : 'bi-chevron-double-up'
    return (<p className='mb-0'> {tempVal} <i className={`font-weight-bold bi ${upOrDown} text-${baseColors[value]}`}></i></p>)
}