/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
const getNombreApellidoFromStr = (str) => {
  str = str.trim();
  const strArray = str.split(' ');

  let nombre = '';
  let apellido = '';
  if (strArray.length === 1) {
    nombre = strArray[0];
  } else if (strArray.length > 1); {
    nombre = strArray[0];
    const nombreIndex = str.indexOf(nombre) + nombre.length;
    apellido = str.substring(nombreIndex).trim();
  }

  return {
    nombre,
    apellido
  };
}

module.exports = {
  getNombreApellidoFromStr
}
