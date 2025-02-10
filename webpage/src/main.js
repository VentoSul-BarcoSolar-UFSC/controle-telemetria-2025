/*
JSON template:
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
// JSON message parsing function
function parseMessage (message) {
    const obj = JSON.parse(message);
    const correct_keys = ["temperature", "voltage", "average_voltage", "current", "speed0", "latitude", "longitude", "year", "month", "day", "hour", "minute", "second"];
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

    // checks for correctness of message formating
    for (const [key, value] of Object.entries(obj)) {
        if (!key in correct_keys) return;
        else if (isNaN(value)) return;
    }

    return obj;
}
