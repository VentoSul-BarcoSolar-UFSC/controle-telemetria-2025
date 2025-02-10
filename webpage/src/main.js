/*
template JSON:
{
  "temperature": "10.9",
  "voltage": "10.9",
  "average_voltage": "10.9",
  "current": "10.9",
  "speed": "10.9",
  "latitude": "10.9",
  "longitude": "10.9",
  "datetime": "2009-06-15T13:45:30"
}
*/
// função de parsing de mensagens: confere corretude da mensagem
function parseMessage (message) {
    const obj = JSON.parse(message);
    const correct_keys = ["temperature", "voltage", "average_voltage", "current", "speed0", "latitude", "longitude", "year", "month", "day", "hour", "minute", "second"];
    // separa datetime em ano, mês, dia, hora, minuto, segundo
    [obj.year, obj.month, obj.day] = obj.datetime.slice(0, 10).split("-");
    [obj.hour, obj.minute, obj.second] = obj.datetime.slice(12, -1).split(":");
    // deleta a propriedade datetime
    delete obj.datetime;
    // converte os valores de string para o valor numérico respectivo
    // é necessário para garantir que o string é compatível com o tipo esperado de dado
    obj.temperature = parseFloat(obj.temperature);
    obj.voltage = parseFloat(obj.voltage);
    obj.average_voltage = parseFloat(obj.average_voltage);
    obj.current = parseFloat(obj.current);
    obj.speed = parseFloat(obj.speed);
    obj.latitude = parseFloat(obj.latitude);
    obj.longitude = parseFloat(obj.longitude);
    obj.year = parseInt(obj.year);
    obj.month = parseInt(obj.month);
    obj.day = parseInt(obj.day);
    obj.hour = parseInt(obj.hour);
    obj.minute = parseInt(obj.minute);
    obj.second = parseInt(obj.second);

    // checa a corretude da formatação da mensagem
    for (const [key, value] of Object.entries(obj)) {
        if (!key in correct_keys) return;
        else if (isNaN(value)) return;
    }

    return JSON.stringify(obj);
}
