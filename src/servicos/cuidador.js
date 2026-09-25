import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================================
//  SERVIÇO DO MODO CUIDADOR
//  Gerencia o PIN de acesso ao painel do cuidador.
//  O PIN fica salvo localmente no dispositivo.
// ==========================================================

const CHAVE_PIN = '@parkinsonshelp:pinCuidador';

// Salva o PIN (4 dígitos)
export async function salvarPin(pin) {
  try {
    await AsyncStorage.setItem(CHAVE_PIN, pin);
    return true;
  } catch (e) {
    console.error('Erro ao salvar PIN:', e);
    return false;
  }
}

// Lê o PIN salvo (ou null se ainda não foi criado)
export async function lerPin() {
  try {
    return await AsyncStorage.getItem(CHAVE_PIN);
  } catch (e) {
    console.error('Erro ao ler PIN:', e);
    return null;
  }
}

// Verifica se o PIN digitado está correto
export async function validarPin(pin) {
  const salvo = await lerPin();
  return salvo !== null && salvo === pin;
}

// Verifica se já existe PIN cadastrado
export async function temPin() {
  const pin = await lerPin();
  return pin !== null;
}

// Apaga o PIN (útil para "esqueci o PIN")
export async function apagarPin() {
  try {
    await AsyncStorage.removeItem(CHAVE_PIN);
    return true;
  } catch (e) {
    console.error('Erro ao apagar PIN:', e);
    return false;
  }
}