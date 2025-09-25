const getLocalDate = () => {
  const fecha = new Date();
  const localDate = new Date(Date.UTC(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    fecha.getHours(),
    fecha.getMinutes(),
    fecha.getSeconds(),
  ));
  return localDate;
};

module.exports = {
  getLocalDate,
};
