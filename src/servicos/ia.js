// ==========================================================
//  SERVIÇO DE IA — Google Gemini
//  Com retry automático para lidar com instabilidade da API
// ==========================================================

const MODELO = 'gemini-3.5-flash-lite';
const URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`;

function getChave() {
  const chave = process.env.EXPO_PUBLIC_GEMINI_KEY;
  if (!chave) {
    throw new Error(
      'Chave da IA não configurada. Verifique o arquivo .env na raiz do projeto.'
    );
  }
  return chave;
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function montarContexto({ usuario, registros, sintomas, insights }) {
  const nome = usuario?.nome || 'Paciente';
  const linhas = [];

  linhas.push(`Paciente: ${nome}`);
  linhas.push('');

  linhas.push(`Registros de medicação (últimos 30 dias): ${registros.length}`);
  if (registros.length > 0) {
    const ultimos = registros.slice(0, 15).map((r) => {
      const d = new Date(r.horarioTomado);
      return `  - ${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}: ${r.medicamentoNome} ${r.dose}`;
    });
    linhas.push(...ultimos);
  }
  linhas.push('');

  linhas.push(`Registros de sintomas (últimos 30 dias): ${sintomas.length}`);
  if (sintomas.length > 0) {
    const nomesMotor = ['Nenhum', 'Leve', 'Moderado', 'Forte', 'Intenso'];
    const nomesHumor = ['Ótimo', 'Bem', 'Neutro', 'Mal', 'Péssimo'];

    const ultimos = sintomas.slice(0, 15).map((s) => {
      const d = new Date(s.data);
      return (
        `  - ${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}: ` +
        `Tremor ${nomesMotor[s.tremor]} | ` +
        `Rigidez ${nomesMotor[s.rigidez]} | ` +
        `Congelamento ${nomesMotor[s.congelamento]} | ` +
        `Humor ${nomesHumor[s.humor]}`
      );
    });
    linhas.push(...ultimos);
  }
  linhas.push('');

  if (insights && insights.length > 0) {
    linhas.push('Alertas automáticos detectados pelo app:');
    for (const ins of insights) {
      linhas.push(`  - ${ins.titulo}: ${ins.descricao}`);
    }
    linhas.push('');
  }

  return linhas.join('\n');
}

function montarPrompt(contexto) {
  return `Você é um assistente de saúde especializado em apoiar pacientes com Doença de Parkinson.

Sua tarefa é analisar os dados de acompanhamento abaixo e fornecer um RESUMO CLÍNICO ÚTIL para o médico que vai ler este relatório na próxima consulta.

REGRAS IMPORTANTES:
- Escreva em português do Brasil, em linguagem clara.
- NÃO faça diagnóstico. NÃO prescreva medicamentos. NÃO substitua avaliação médica.
- Foque em PADRÕES observados nos dados (ex: "tremor aumentou nos últimos dias", "boa adesão à medicação").
- Seja objetivo. Entre 3 e 5 parágrafos curtos.
- Comece com uma frase resumindo a situação geral do paciente.
- Depois destaque 2-3 pontos de atenção ou observações relevantes.
- Termine com uma frase sobre o que o médico pode considerar investigar na consulta.
- NÃO use markdown (asteriscos, #, etc). Texto puro, parágrafos separados por linha em branco.

DADOS DO PACIENTE:
${contexto}

Agora, escreva o resumo clínico:`;
}

// Chama a API com retry automático
export async function gerarAnaliseIA({ usuario, registros, sintomas, insights }) {
  const chave = getChave();
  const contexto = montarContexto({ usuario, registros, sintomas, insights });
  const prompt = montarPrompt(contexto);

  const MAX_TENTATIVAS = 3;
  let ultimoErro = null;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const resposta = await fetch(`${URL_BASE}?key=${chave}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        }),
      });

      // 503 (sobrecarga) ou 429 (cota) → tenta de novo
      if (resposta.status === 503 || resposta.status === 429) {
        ultimoErro = 'Serviço de IA sobrecarregado';
        console.log(`Tentativa ${tentativa} falhou. Aguardando...`);
        if (tentativa < MAX_TENTATIVAS) {
          await esperar(tentativa * 2000); // 2s, 4s
          continue;
        }
        throw new Error(
          'O serviço de IA está com alta demanda. Tente novamente em alguns minutos.'
        );
      }

      if (!resposta.ok) {
        const erro = await resposta.text();
        console.error('Erro da API Gemini:', erro);
        throw new Error(`Erro da IA (${resposta.status}).`);
      }

      const dados = await resposta.json();
      const texto = dados?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!texto) {
        throw new Error('A IA não retornou texto.');
      }

      return { ok: true, texto: texto.trim() };
    } catch (e) {
      ultimoErro = e.message;
      if (tentativa < MAX_TENTATIVAS && !e.message.includes('não configurada')) {
        await esperar(tentativa * 2000);
        continue;
      }
      break;
    }
  }

  return {
    ok: false,
    erro: ultimoErro || 'Erro desconhecido ao chamar a IA.',
  };
}