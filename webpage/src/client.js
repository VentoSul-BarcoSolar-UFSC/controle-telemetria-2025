// função de parsing de mensagens: confere corretude da mensagem
function parseMessage (message) {
    const obj = JSON.parse(message);
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
  
    return obj;
}

// conecta-se ao broker
const url = 'mqtts://e5e3f5fd.ala.us-east-1.emqxsl.com:8883' // url do broker
const options = {
    clientId: 'mqttjs_' + (Math.random() * 10000).toString(16), // gera id do cliente
    username: 'open', // usuário aberto da autenticação
    password: 'open', 
    clean: true, // sessão sem persistência
    rejectUnauthorized: true, // garante certificado SSL/TLS válido
};
const client  = mqtt.connect(url, options)
// ao conectar-se ao broker se inscreve no tópico 
client.on('connect', () => {
    client.subscribe('guara-data'); 
});

client.on('message', (topic, message) => {
    // definir função de callback que trata os dados e atualiza o dashboard
});

client.on('error', (err) => {
    console.error(`Client error:`, err);
});