 // configurações dos gráficos

// Inicializa gráfico de Tensão
const voltageCtx = document.getElementById('voltage').getContext('2d');
const voltage = new Chart(voltageCtx, {
    type: 'line',
    data: {
        labels: ['00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00'],
        datasets: [{
            label: 'Tensão (V)',
            data: [0, 0, 0, 0, 0],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            pointStyle: 'circle',
            pointRadius: 5,
            pointHoverRadius: 15
        }]
    },
    options: {
        responsive: true
    }
  });
// Inicializa gráfico de Temperatura
const temperatureCtx = document.getElementById('temperature').getContext('2d');
const temperature = new Chart(temperatureCtx, {
    type: 'line',
    data: {
        labels: ['00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00'],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [0, 0, 0, 0, 0],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            pointStyle: 'circle',
            pointRadius: 5,
            pointHoverRadius: 15
        }]
    },
    options: {
        responsive: true
    }
  });
// Inicializa gráfico de Corrente
const currentCtx = document.getElementById('current').getContext('2d');
const current = new Chart(currentCtx, {
    type: 'line',
    data: {
        labels: ['00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00'],
        datasets: [{
            label: 'Corrente (A)',
            data: [0, 0, 0, 0, 0],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            pointStyle: 'circle',
            pointRadius: 5,
            pointHoverRadius: 15
        }]
    },
    options: {
        responsive: true
    }
  });

function updateGraphs (newVoltage, newTemperature, newCurrent, time, position) {
    // Atualiza gráfico de tensão
    voltage.data.labels = voltage.data.labels.slice(0, position).concat([time], voltage.data.labels.slice(position))
    voltage.data.datasets[0].data = voltage.data.datasets[0].data.slice(0, position).concat([newVoltage], voltage.data.datasets[0].data.slice(position))
    let length = voltage.data.labels.length
    if (length > 15) {
        voltage.data.labels = voltage.data.labels.slice(length - 15)
        voltage.data.datasets[0].data = voltage.data.datasets[0].data.slice(length - 15)
    }
    voltage.update()
    // Atualiza gráfico de temperatura
    temperature.data.labels = temperature.data.labels.slice(0, position).concat([time], temperature.data.labels.slice(position))
    temperature.data.datasets[0].data = temperature.data.datasets[0].data.slice(0, position).concat([newTemperature], temperature.data.datasets[0].data.slice(position))
    length = temperature.data.labels.length
    if (length > 15) {
        temperature.data.labels = temperature.data.labels.slice(length - 15)
        temperature.data.datasets[0].data = temperature.data.datasets[0].data.slice(length - 15)
    }
    temperature.update()
    // Atualiza gráfico de corrente
    current.data.labels = current.data.labels.slice(0, position).concat([time], current.data.labels.slice(position))
    current.data.datasets[0].data = current.data.datasets[0].data.slice(0, position).concat([newCurrent], current.data.datasets[0].data.slice(position))
    length = current.data.labels.length
    if (length > 15) {
        current.data.labels = current.data.labels.slice(length - 15)
        current.data.datasets[0].data = current.data.datasets[0].data.slice(length - 15)
    }
    current.update()
}