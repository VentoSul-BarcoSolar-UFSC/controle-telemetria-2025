
/*
JSON template:
{
  "temperature": "10.9",
  "voltage": "10.9",
  "average_voltage": "10.9",
  "current": "10.9",
  "speed": "10.9",
  "latitude": "10.9",
  "longitude": "10.9"
  "datetime": "2009-06-15T13:45:30"
}
*/
function parseMessage (message) {
    const obj = JSON.parse(message);
    obj.temperature = parseFloat(obj.temperature);
    obj.voltage = parseFloat(obj.voltage);
    obj.average_voltage = parseFloat(obj.average_voltage);
    obj.current = parseFloat(obj.current);
    obj.speed = parseFloat(obj.speed);
    obj.latitude = parseFloat(obj.latitude);
    obj.longitude = parseFloat(obj.longitude);
    [obj.year, obj.month, obj.day] = obj.datetime.slice(0, 10).split("-");
    [obj.hour, obj.minute, obj.second] = obj.datetime.slice(12, -1).split(":");
    delete obj.datetime;

    console.log(obj)
}

parseMessage(`{
  "temperature": "10.9",
  "voltage": "10.9",
  "average_voltage": "10.9",
  "current": "10.9",
  "speed": "10.9",
  "latitude": "10.9",
  "longitude": "10.9",
  "datetime": "2009-06-15T13:45:30"
}`);