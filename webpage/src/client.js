// função de parsing de mensagens: confere corretude da mensagem
function parseMessage (message) {
    const obj = JSON.parse(message);
    // separa datetime em ano, mês, dia, hora, minuto, segundo
    [obj.year, obj.month, obj.day] = obj.datetime.slice(0, 10).split("-");
    obj.time = obj.datetime.slice(11, 16);
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
  
    return obj;
}
// mapper
const monthNameToNumber = new Map([
    ['Jan', 1],
    ['Feb', 2],
    ['Mar', 3],
    ['Apr', 4],
    ['May', 5],
    ['Jun', 6],
    ['Jul', 7],
    ['Aug', 8],
    ['Sep', 9],
    ['Oct', 10],
    ['Nov', 11],
    ['Dec', 12]])

// conecta-se ao broker
const url = 'wss://e5e3f5fd.ala.us-east-1.emqxsl.com:8084/mqtt' // url do broker
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
    console.log('connected')
});

client.on('message', (topic, message) => {
    // Faz o parsing da mensagem
    const msgObj = parseMessage(message)
    // Determina pela data e horário da mensagem se ela deve ser exibida
    const d = {
        weekday: 0,
        month: 0,
        day: 0,
        year: 0,
        time: 0
    };
    let _ = 0;
    [_, d.month, d.day, d.year] = new Date().toDateString().split(' ')
    d.day = parseInt(d.day)
    d.year = parseInt(d.year)
    d.month = monthNameToNumber.get(d.month)
    if (msgObj.year != d.year) return
    if (msgObj.month != d.month) return
    if (msgObj.day != d.day) return
    // O js compara strings lexigraficamente letra por letra, o que nesse caso nos serve para comparar os horários já que eles sempre tem mesmo tamalho
    if (msgObj.time < voltage.data.labels[0]) return
    let newMsgPos = 0
    // Determina a posição da mensagem no gráfico de acordo com o horário
    for (let i = 0; i < voltage.data.labels.length; i++) {
        if (voltage.data.labels[i] <= msgObj.time) {
            newMsgPos = i + 1
        } else {
            break
        }
    }
    // Atualiza os gráficos
    updateGraphs(msgObj.voltage, msgObj.temperature, msgObj.current, msgObj.time, newMsgPos)
    // Atualiza as caixas de texto e o marcador no mapa caso a mensagem seja a última cronologicamente
    // É importante ressaltar que esse critério de horário da mensagem não seria suficiente para garantir ordem caso houvesse mais de um microcontrolador que enviasse mensagens quanto a mesma medição no mesmo objeto de observação
    // Porém no nosse caso isso seria uma redundância que não se demonstra necessária
    if (newMsgPos != voltage.data.labels.length) return
    const vPack = document.getElementById('vPackInfo')
    vPack.textContent = `${msgObj.voltage} V`
    const tPack = document.getElementById('tPackInfo')
    tPack.textContent = `${msgObj.temperature} °C`
    const cPack = document.getElementById('cPackInfo')
    cPack.textContent = `${msgObj.current} A`
    // Atualiza o marcador no mapa
    updateMap([msgObj.longitude, msgObj.latitude])
});

client.on('error', (err) => {
    console.error(`Client error:`, err);
});