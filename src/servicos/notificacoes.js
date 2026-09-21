import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ==========================================================
//  SERVIÇO DE NOTIFICAÇÕES
//  Centraliza configuração, permissão e agendamento.
// ==========================================================

// Como as notificações aparecem quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pede permissão ao usuário. Retorna true se concedida.
export async function pedirPermissao() {
  const { status: existente } = await Notifications.getPermissionsAsync();
  let status = existente;

  if (status !== 'granted') {
    const { status: novo } = await Notifications.requestPermissionsAsync();
    status = novo;
  }

  return status === 'granted';
}

// Configura canal Android (necessário para som/vibração corretos)
export async function configurarCanalAndroid() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicamentos', {
      name: 'Lembretes de medicamentos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B1C1C',
      sound: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

// Cancela TODAS as notificações agendadas do app.
// Usamos antes de reagendar (pra evitar duplicatas).
export async function cancelarTodas() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error('Erro ao cancelar notificações:', e);
  }
}

// Converte "HH:MM" para um objeto { hour, minute }
function parseHorario(horario) {
  const [h, m] = horario.split(':').map((n) => parseInt(n, 10));
  return { hour: h, minute: m };
}

// Agenda uma notificação DIÁRIA recorrente para um horário.
// Retorna o id da notificação agendada.
// Agenda uma notificação DIÁRIA recorrente para um horário.
export async function agendarDiaria({ horario, nomeMedicamento, dose, medicamentoId }) {
  const { hour, minute } = parseHorario(horario);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Hora do remédio 💊`,
      body: `Está na hora de tomar ${nomeMedicamento} ${dose}.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { medicamentoId, tipo: 'lembrete-medicamento' },
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'medicamentos' : undefined,
    },
  });

  return id;
}

// Reagenda TODAS as notificações do app, com base na lista de medicamentos.
// Estratégia: cancela tudo e agenda do zero.
export async function reagendarTodas(medicamentos) {
  await cancelarTodas();

  let total = 0;
  for (const med of medicamentos) {
    for (const horario of med.horarios) {
      try {
        await agendarDiaria({
          horario,
          nomeMedicamento: med.nome,
          dose: med.dose,
          medicamentoId: med.id,
        });
        total++;
      } catch (e) {
        console.error('Erro ao agendar', med.nome, horario, e);
      }
    }
  }
  return total;
}

// Envia uma notificação imediata (para testar)
// TESTE: notificação em 5 segundos (pra dar tempo de sair do app)
// TESTE: notificação em 5 segundos (pra dar tempo de sair do app)
export async function enviarTesteAgora() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Teste do Parkinson\'sHelp 🌷',
      body: 'Se você está vendo isso, as notificações funcionam!',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: 'timeInterval',
      seconds: 5,
      repeats: false,
    },
  });
}