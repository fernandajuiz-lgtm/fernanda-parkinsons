import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// ==========================================================
//  SERVIÇO DE VIBRAÇÃO RÍTMICA (CUEING TÁTIL)
//
//  Base científica: pacientes com Parkinson frequentemente
//  apresentam "freezing" da marcha — episódio em que o
//  cérebro não consegue iniciar o movimento. Estudos clínicos
//  mostram que estímulos externos rítmicos (auditivos, visuais
//  ou táteis) ajudam a quebrar o congelamento, funcionando
//  como uma "pista" externa para o cérebro sincronizar os passos.
//
//  Este serviço usa a API nativa de vibração do sistema (mais
//  forte) combinada com feedback háptico para máxima percepção.
// ==========================================================

// Ritmos disponíveis (intervalo em ms entre vibrações)
export const RITMOS_DISPONIVEIS = {
  lento: { intervalo: 1500, label: 'Lento' },
  normal: { intervalo: 1000, label: 'Normal' },
  rapido: { intervalo: 700, label: 'Rápido' },
};

// Duração da vibração em ms — quanto maior, mais forte/perceptível
// 200ms é suficiente para ser bem sentido, sem virar "vibração contínua"
const DURACAO_VIBRACAO = 220;

let timerId = null;

// Vibra uma vez — combina as duas APIs
async function bater() {
  try {
    // 1. API nativa: motor de vibração ligado por DURACAO_VIBRACAO ms
    //    Padrão [espera, vibra, espera, vibra] em ms
    Vibration.vibrate(DURACAO_VIBRACAO);

    // 2. Haptics por cima: adiciona "peso" à sensação
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (e) {
    // Se o dispositivo não suportar, segue o jogo
  }
}

// Inicia vibração rítmica.
// `ritmo`: chave em RITMOS_DISPONIVEIS ('lento' | 'normal' | 'rapido')
// `aoBater`: callback chamado a cada vibração (para contar passos)
export function iniciarVibracao(ritmo, aoBater) {
  pararVibracao();

  const config = RITMOS_DISPONIVEIS[ritmo] || RITMOS_DISPONIVEIS.normal;
  const { intervalo } = config;

  // Vibra imediatamente (o primeiro passo é o mais importante)
  bater();
  if (aoBater) aoBater();

  // Depois agenda vibrações periódicas
  timerId = setInterval(() => {
    bater();
    if (aoBater) aoBater();
  }, intervalo);
}

// Para a vibração rítmica
export function pararVibracao() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  // Garante que o motor pare imediatamente
  try {
    Vibration.cancel();
  } catch (e) {}
}