import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================================
//  CAMADA DE ARMAZENAMENTO
//  Todo acesso ao AsyncStorage passa por aqui.
//  Vantagem: se amanhã trocarmos para Firebase/nuvem,
//  mudamos só este arquivo. O resto do app não sente.
// ==========================================================

const CHAVES = {
  USUARIO: '@parkinsonshelp:usuario',
  MEDICAMENTOS: '@parkinsonshelp:medicamentos',
  REGISTROS: '@parkinsonshelp:registros',
  SINTOMAS: '@parkinsonshelp:sintomas',
  CONTATO_EMERGENCIA: '@parkinsonshelp:contatoEmergencia',
  ALERTAS: '@parkinsonshelp:alertas',
  TREMORES: '@parkinsonshelp:tremores',
};
// -------- USUÁRIO --------
export async function salvarUsuario(usuario) {
  try {
    await AsyncStorage.setItem(CHAVES.USUARIO, JSON.stringify(usuario));
    return true;
  } catch (e) {
    console.error('Erro ao salvar usuário:', e);
    return false;
  }
}

export async function lerUsuario() {
  try {
    const json = await AsyncStorage.getItem(CHAVES.USUARIO);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Erro ao ler usuário:', e);
    return null;
  }
}

export async function apagarUsuario() {
  try {
    await AsyncStorage.removeItem(CHAVES.USUARIO);
    return true;
  } catch (e) {
    console.error('Erro ao apagar usuário:', e);
    return false;
  }
}

// -------- MEDICAMENTOS --------
export async function salvarMedicamentos(lista) {
  try {
    await AsyncStorage.setItem(CHAVES.MEDICAMENTOS, JSON.stringify(lista));
    return true;
  } catch (e) {
    console.error('Erro ao salvar medicamentos:', e);
    return false;
  }
}

export async function lerMedicamentos() {
  try {
    const json = await AsyncStorage.getItem(CHAVES.MEDICAMENTOS);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Erro ao ler medicamentos:', e);
    return [];
  }
}

// -------- REGISTROS (medicação tomada) --------
export async function salvarRegistros(lista) {
  try {
    await AsyncStorage.setItem(CHAVES.REGISTROS, JSON.stringify(lista));
    return true;
  } catch (e) {
    console.error('Erro ao salvar registros:', e);
    return false;
  }
}

export async function lerRegistros() {
  try {
    const json = await AsyncStorage.getItem(CHAVES.REGISTROS);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Erro ao ler registros:', e);
    return [];
  }
}

// -------- SINTOMAS --------
export async function salvarSintomas(lista) {
  try {
    await AsyncStorage.setItem(CHAVES.SINTOMAS, JSON.stringify(lista));
    return true;
  } catch (e) {
    console.error('Erro ao salvar sintomas:', e);
    return false;
  }
}

export async function lerSintomas() {
  try {
    const json = await AsyncStorage.getItem(CHAVES.SINTOMAS);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Erro ao ler sintomas:', e);
    return [];
  }
}

// -------- UTILIDADE --------
// Gera um id único simples (suficiente para o nosso app)
export function gerarId() {
  return Date.now().toString() + '-' + Math.random().toString(36).slice(2, 9);
}
// -------- CONTATO DE EMERGÊNCIA --------
export async function salvarContatoEmergencia(contato) {
  try {
    await AsyncStorage.setItem(CHAVES.CONTATO_EMERGENCIA, JSON.stringify(contato));
    return true;
  } catch (e) {
    console.error('Erro ao salvar contato:', e);
    return false;
  }
}

export async function lerContatoEmergencia() {
  try {
    const json = await AsyncStorage.getItem(CHAVES.CONTATO_EMERGENCIA);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Erro ao ler contato:', e);
    return null;
  }
}

// -------- ALERTAS DE EMERGÊNCIA --------
export async function salvarAlertas(lista) {
  try {
    await AsyncStorage.setItem(CHAVES.ALERTAS, JSON.stringify(lista));
    return true;
  } catch (e) {
    console.error('Erro ao salvar alertas:', e);
    return false;
  }
}

export async function lerAlertas() {
  try {
    const json = await AsyncStorage.getItem(CHAVES.ALERTAS);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Erro ao ler alertas:', e);
    return [];
  }
}
// -------- MEDIÇÕES DE TREMOR --------
export async function salvarTremores(lista) {
  try {
    await AsyncStorage.setItem(CHAVES.TREMORES, JSON.stringify(lista));
    return true;
  } catch (e) {
    console.error('Erro ao salvar tremores:', e);
    return false;
  }
}

export async function lerTremores() {
  try {
    const json = await AsyncStorage.getItem(CHAVES.TREMORES);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Erro ao ler tremores:', e);
    return [];
  }
}