#include <ADS1115_WE.h>         // Biblioteca para controlar o ADS1115
#include <Wire.h>               // Biblioteca para comunicação I2C
#include <LiquidCrystal_I2C.h>  // Biblioteca para controle do LCD I2C
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>

// Definições de constantes
#define AMOSTRAS 5              // Número de amostras para cálculo da média
#define INTERVALO_LEITURA 200   // Tempo entre as leituras no loop para média (ms)
#define DIVISOR_TENSAO 18.9197080292  // Divisor de tensão (R1+R2)/R2 = (9820+548)/548
#define CONVERSAO_TEMPERATURA 100      // 0.01V = 1°C
#define CORRENTE_ZERO 1.65      // Corrente "0" do sistema
                                // GANHO = Ganho do amplificador operacional (AMP-OP) R2/R1 = 330k/10k
                                // RESISTENCIA_SHUNT = Resistência do Shunt = 0.000375
#define CONVERSAO_CORRENTE 0.012375 // GANHO * RESISTENCIA_SHUNT = 33 * 0.000375

// Endereço I2C do LCD (geralmente 0x27, mas pode variar dependendo do modelo)
#define ENDERECO_LCD 0x27

// Definindo o número de colunas e linhas do LCD
#define COLUNAS_LCD 20
#define LINHAS_LCD 4

// Endereço I2C do ADS1115 (por padrão é 0x48)
#define ENDERECO_I2C 0x48

// Criação do objeto para controle do ADC (ADS1115) com o endereço I2C definido
ADS1115_WE adc(ENDERECO_I2C);

// Criação do objeto para controle do LCD I2C
LiquidCrystal_I2C lcd(ENDERECO_LCD, COLUNAS_LCD, LINHAS_LCD);

// Variáveis globais
float correnteMedia, temperaturaMedia, tensaoBateria; // Variáveis para armazenar a média da tensão, temperatura e tensão da bateria
int reinicioHardware = 0;

// Credenciais WiFi
const char* ssid = "";
const char* senha = "";

// Configurações do broker EMQX
const char* servidor_mqtt = "";
const int porta_mqtt = 0; // Porta TLS/SSL
const char* usuario_mqtt = "";
const char* senha_mqtt = "";
const char* id_cliente = ""; // ID único de cliente

// Tópicos
const char* topico_publicacao = "";
const char* topico_subscricao = "";

// Certificado Root CA do broker EMQX
const char* certificado_root_ca = "";

WiFiClientSecure clienteEsp;
PubSubClient cliente(clienteEsp);

unsigned long ultimaMensagem = 0;
int valor = 0;
StaticJsonDocument<200> dados;
String dadosString;

void setup() {
    Wire.begin();             // Inicializa a comunicação I2C
    Serial.begin(115200);     // Inicializa o monitor serial a 115200 bauds

    configurarWiFi();

    // Configura o certificado Root CA para TLS/SSL
    clienteEsp.setCACert(certificado_root_ca);

    cliente.setServer(servidor_mqtt, porta_mqtt);
    cliente.setCallback(callback);

    // Inicialização do ADS1115
    if (!adc.init()) {
        Serial.println("ADS1115 não conectado!");  // Verifica se o ADS1115 está conectado corretamente
        while (1); // Loop infinito em caso de erro de conexão
    }

    // Configuração do intervalo de medição do ADS1115 (4.096V de gama máxima)
    adc.setVoltageRange_mV(ADS1115_RANGE_4096);

    // Configuração do modo de medição contínua (as leituras serão feitas de forma contínua)
    adc.setMeasureMode(ADS1115_CONTINUOUS);

    // Inicializa o LCD
    lcd.init();
    lcd.backlight();  // Acende o fundo do LCD para visualização

    // Mensagens iniciais no display LCD
    lcd.setCursor(0, 0);
    lcd.print("Vento Sul Bigode");
}

void loop() {
    if (!cliente.connected()) {
        reconectar();
    }
    cliente.loop();

    // Calcula a média das leituras analógicas
    correnteMedia = calcularTensaoMedia(ADS1115_COMP_0_GND);
    temperaturaMedia = calcularTensaoMedia(ADS1115_COMP_2_GND) * CONVERSAO_TEMPERATURA;

    // Lê os outros valores dos canais do ADS1115
    tensaoBateria = lerCanal(ADS1115_COMP_1_GND) * DIVISOR_TENSAO;

    // Exibe a tensão média calculada no display LCD
    correnteMedia = correnteMedia < CORRENTE_ZERO ? 0 : (correnteMedia - CORRENTE_ZERO) / CONVERSAO_CORRENTE;
    lcd.setCursor(0, 1);
    lcd.print("Corrente: ");
    lcd.print(String(correnteMedia, 3)); // Exibe a tensão média no LCD com 3 casas decimais

    // Exibe a leitura da corrente no monitor serial
    Serial.print("Corrente: ");
    Serial.println(correnteMedia);

    // Exibe a temperatura no display LCD
    lcd.setCursor(0, 2);
    lcd.print("Temp: ");
    lcd.print(String(temperaturaMedia, 1)); // Exibe a temperatura com 1 casa decimal
    lcd.print(" C");

    // Exibe a tensão da bateria no display LCD
    lcd.setCursor(0, 3);
    lcd.print("Tensão: ");
    lcd.print(String(tensaoBateria, 2));  // Exibe a tensão da bateria com 2 casas decimais
    lcd.print(" V");

    dados["current"] = correnteMedia;
    dados["temperature"] = temperaturaMedia;
    dados["voltage"] = tensaoBateria;

    unsigned long agora = millis();
    if (agora - ultimaMensagem > 2000) {
        ultimaMensagem = agora;
        dados["datetime"] = agora;
        Serial.print("Publicando mensagem: ");
        serializeJson(dados, dadosString);
        Serial.println(dadosString);
        cliente.publish(topico_publicacao, dadosString.c_str());
    }

    if(reinicioHardware == 10){
        ESP.restart();
        reinicioHardware = 0;
    } else {
        reinicioHardware += 1;
    }

    delay(1000); // Atraso de 1 segundo entre as leituras para evitar atualizações rápidas demais
}

// Função para calcular a média das leituras analógicas
float calcularTensaoMedia(ADS1115_MUX canal) {
    float soma = 0.0; // Variável para somar as leituras analógicas

    // Realiza a leitura de múltiplas amostras
    for (int i = 0; i < AMOSTRAS; i++) {
        soma += lerCanal(canal); // Leitura do pino analógico
        delay(INTERVALO_LEITURA); // Atraso entre as leituras para estabilidade
    }

    // Retorna a média das leituras
    return soma / AMOSTRAS;
}

// Função para ler um canal do ADS1115 e retornar o valor em volts
float lerCanal(ADS1115_MUX canal) {
    // Configura o canal específico para leitura
    adc.setCompareChannels(canal);

    // Obtém e retorna a leitura do valor em volts
    return adc.getResult_V();
}

void configurarWiFi() {
    delay(10);
    Serial.println();
    Serial.print("Conectando a ");
    Serial.println(ssid);

    WiFi.begin(ssid, senha);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi conectado");
    Serial.println("Endereço IP: ");
    Serial.println(WiFi.localIP());
}

void callback(char* topico, byte* payload, unsigned int tamanho) {
    Serial.print("Mensagem recebida [");
    Serial.print(topico);
    Serial.print("] ");
    for (int i = 0; i < tamanho; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();

    // Adicione sua lógica de controle aqui baseada nas mensagens recebidas
}

void reconectar() {
    // Loop até reconectar
    while (!cliente.connected()) {
        Serial.print("Tentando conexão MQTT...");
        // Tentativa de conexão
        if (cliente.connect(id_cliente, usuario_mqtt, senha_mqtt)) {
            Serial.println("conectado");
            // Uma vez conectado, subscreve ao tópico
            cliente.subscribe(topico_subscricao);
        } else {
            Serial.print("falhou, rc=");
            Serial.print(cliente.state());
            Serial.println(" - Significado do erro: ");
            // Imprime mensagem de erro baseada no código de retorno
            switch(cliente.state()) {
                case -4: Serial.println("Tempo limite de conexão"); break;
                case -3: Serial.println("Conexão perdida"); break;
                case -2: Serial.println("Falha na conexão"); break;
                case -1: Serial.println("Desconectado"); break;
                case 1: Serial.println("Protocolo inválido"); break;
                case 2: Serial.println("ID de cliente inválido"); break;
                case 3: Serial.println("Servidor indisponível"); break;
                case 4: Serial.println("Credenciais inválidas"); break;
                case 5: Serial.println("Não autorizado"); break;
            }
        }
    }
}
