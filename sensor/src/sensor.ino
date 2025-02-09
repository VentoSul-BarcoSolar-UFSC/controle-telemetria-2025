#include <ADS1115_WE.h>         // Biblioteca para controlar o ADS1115
#include <Wire.h>               // Biblioteca para comunicação I2C
#include <LiquidCrystal_I2C.h>  // Biblioteca para controle do LCD I2C
#include <ESP.h>                // Biblioteca para importar funções do ESP

// Definições de constantes
#define AMOS 5                    // Número de amostras para cálculo da média
#define INTERVALOLEITURA 200      // Tempo entre as leituras no loop para média (ms)
#define DIVTEN 18.9197080292      // Divisor de tensão (R1+R2)/R2 = (9820+548)/548
#define CONVTEMP 100               // 0.01V = 1°C
#define CHAOCORRENTE 1.65         // Corrente "0" do sistema
// GAIN = Ganho do amplificador operacional (AMP-OP) R2/R1 = 330k/10k
// RSHUNT = Resistência do Shunt = 0.000375
#define CONVCORRENTE 0.012375 // GAIN * RSHUNT = 33 * 0.000375

// Endereço I2C do LCD (geralmente 0x27, mas pode variar dependendo do modelo)
#define LCD_ADDRESS 0x27

// Definindo o número de colunas e linhas do LCD
#define LCD_COLUMNS 20
#define LCD_LINES 4

// Endereço I2C do ADS1115 (por padrão é 0x48)
#define I2C_ADDRESS 0x48


// Criação do objeto para controle do ADC (ADS1115) com o endereço I2C definido
ADS1115_WE adc(I2C_ADDRESS);

// Criação do objeto para controle do LCD I2C
LiquidCrystal_I2C lcd(LCD_ADDRESS, LCD_COLUMNS, LCD_LINES);

// Variáveis globais
float CorrenteMed, TempMed, VoltBat; // Variáveis para armazenar a média da tensão, temperatura e tensão da bateria
int resetHard = 0;

void setup() {
  Wire.begin();             // Inicializa a comunicação I2C
  Serial.begin(115200);     // Inicializa o monitor serial a 115200 bauds

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
  // Calcula a média das leituras analógicas
  CorrenteMed = calculateAverageVoltage(ADS1115_COMP_0_GND);
  TempMed = calculateAverageVoltage(ADS1115_COMP_2_GND);

  // Lê os outros valores dos canais do ADS1115
  VoltBat = readChannel(ADS1115_COMP_1_GND);

  // Exibe a tensão média calculada no display LCD
  CorrenteMed = CorrenteMed < CHAOCORRENTE ? 0 : (CorrenteMed - CHAOCORRENTE) / CONVCORRENTE; // Deixar a leitura em 0 quando 
  lcd.setCursor(0, 1);
  lcd.print("Current: ");
  lcd.print(String(CorrenteMed, 3)); // Exibe a tensão média no LCD com 3 casas decimais

  // Exibe a leitura da corrente no monitor serial
  Serial.print("Corrente: ");
  Serial.println(CorrenteMed);

  // Exibe a temperatura no display LCD
  lcd.setCursor(0, 2);
  lcd.print("Temp: ");
  lcd.print(String(TempMed*CONVTEMP, 1)); // Exibe a temperatura com 1 casa decimal
  lcd.print(" C");

  // Exibe a tensão da bateria no display LCD
  lcd.setCursor(0, 3);
  lcd.print("Voltage: ");
  lcd.print(String(VoltBat*DIVTEN, 2));  // Exibe a tensão da bateria com 2 casas decimais
  lcd.print(" V");
  if(resetHard == 10){
    ESP.restart();
    resetHard = 0;
  } else {
    resetHard += 1;
  }

  delay(1000); // Atraso de 1 segundo entre as leituras para evitar atualizações rápidas demais
}

// Função para calcular a média das leituras analógicas
float calculateAverageVoltage(ADS1115_MUX channel) {
  float sum = 0.0; // Variável para somar as leituras analógicas

  // Realiza a leitura de múltiplas amostras
  for (int i = 0; i < AMOS; i++) {
    sum += readChannel(channel); // Leitura do pino analógico (A0)
    delay(INTERVALOLEITURA); // Atraso entre as leituras para estabilidade
  }

  // Retorna a média das leituras
  return sum / AMOS;
}

// Função para ler um canal do ADS1115 e retornar o valor em volts
float readChannel(ADS1115_MUX channel) {
  // Configura o canal específico para leitura
  adc.setCompareChannels(channel);

  // Obtém e retorna a leitura do valor em volts
  return adc.getResult_V();
}