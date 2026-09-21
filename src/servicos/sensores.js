import { Accelerometer } from 'expo-sensors';

// ==========================================================
//  SERVIÇO DE SENSORES
//  Lê o acelerômetro do celular e calcula a intensidade
//  de "tremor" (variação rápida na aceleração).
// ==========================================================

// Frequência de leitura (ms). 50ms ≈ 20Hz — bom para tremor.
const INTERVALO_MS = 50;

// Tamanho da janela para cálculo de variabilidade
const TAMANHO_JANELA = 15;

// Valores para mapeamento de intensidade (empíricos)
// Ajustados para o acelerômetro do celular (em m/s²)
const LIMIAR_LEVE = 0.15;
const LIMIAR_MODERADO = 0.5;
const LIMIAR_FORTE = 1.2;
const LIMIAR_INTENSO = 2.5;

let inscricao = null;
let amostras = [];

// Inicia a leitura. onAmostra é chamada a cada leitura com:
//   { magnitude, variacao, nivel }
export function iniciarLeitura(onAmostra) {
  amostras = [];

  Accelerometer.setUpdateInterval(INTERVALO_MS);

  inscricao = Accelerometer.addListener(({ x, y, z }) => {
    // Magnitude bruta da aceleração
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Variação em relação à gravidade (1g ≈ 1 em unidades do expo-sensors)
    const desvio = Math.abs(magnitude - 1);

    // Guarda na janela
    amostras.push(desvio);
    if (amostras.length > TAMANHO_JANELA) {
      amostras.shift();
    }

    // Variabilidade = desvio padrão da janela (mede "tremida")
    const media = amostras.reduce((a, b) => a + b, 0) / amostras.length;
    const variancia =
      amostras.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) /
      amostras.length;
    const variacao = Math.sqrt(variancia);

    // Converte para nível 0-4
    const nivel = mapearNivel(variacao);

    if (onAmostra) {
      onAmostra({ magnitude, variacao, nivel });
    }
  });

  return inscricao;
}

// Para a leitura
export function pararLeitura() {
  if (inscricao) {
    inscricao.remove();
    inscricao = null;
  }
  amostras = [];
}

// Mapeia variação para nível 0-4
function mapearNivel(variacao) {
  if (variacao < LIMIAR_LEVE) return 0;
  if (variacao < LIMIAR_MODERADO) return 1;
  if (variacao < LIMIAR_FORTE) return 2;
  if (variacao < LIMIAR_INTENSO) return 3;
  return 4;
}

// Rótulos dos níveis (usados no resultado)
export const NOMES_NIVEL = ['Nenhum', 'Leve', 'Moderado', 'Forte', 'Intenso'];

// Cores dos níveis
export const CORES_NIVEL = ['#607050', '#8FA37C', '#D9B85A', '#C77B2E', '#8B1C1C'];