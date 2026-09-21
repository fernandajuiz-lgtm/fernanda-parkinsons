// ==========================================================
//  SERVIÇO DE ANÁLISE
//  Calcula tendências, médias e insights a partir dos dados
//  de sintomas e medicamentos.
// ==========================================================

// Retorna o nome do dia da semana em pt-BR abreviado
function diaSemana(iso) {
  const d = new Date(iso);
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return dias[d.getDay()];
}

// Chave de "dia" (ex: "2026-09-20") para agrupar
function chaveDia(iso) {
  const d = new Date(iso);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Verifica se uma data está dentro dos últimos N dias
function dentroDe(iso, dias) {
  const agora = new Date();
  const data = new Date(iso);
  const diff = (agora - data) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= dias;
}

// ------------------------------------------------------------------
//  MÉDIA POR DIA (últimos N dias)
//  Retorna array de { data, diaSemana, tremor, rigidez, congelamento, humor, total }
//  Só dias com pelo menos 1 registro.
// ------------------------------------------------------------------
export function mediaPorDia(sintomas, dias = 7) {
  const ultimos = sintomas.filter((s) => dentroDe(s.data, dias));

  // Agrupa por dia
  const mapa = {};
  for (const s of ultimos) {
    const chave = chaveDia(s.data);
    if (!mapa[chave]) {
      mapa[chave] = {
        data: chave,
        diaSemana: diaSemana(s.data),
        tremor: 0,
        rigidez: 0,
        congelamento: 0,
        humor: 0,
        total: 0,
      };
    }
    mapa[chave].tremor += s.tremor;
    mapa[chave].rigidez += s.rigidez;
    mapa[chave].congelamento += s.congelamento;
    mapa[chave].humor += s.humor;
    mapa[chave].total += 1;
  }

  // Calcula as médias
  const lista = Object.values(mapa).map((d) => ({
    data: d.data,
    diaSemana: d.diaSemana,
    tremor: d.tremor / d.total,
    rigidez: d.rigidez / d.total,
    congelamento: d.congelamento / d.total,
    humor: d.humor / d.total,
    total: d.total,
  }));

  // Ordena por data crescente
  lista.sort((a, b) => a.data.localeCompare(b.data));

  return lista;
}

// ------------------------------------------------------------------
//  MÉDIA GERAL em um período
//  Retorna { tremor, rigidez, congelamento, humor, total }
//  Ou null se não houver dados.
// ------------------------------------------------------------------
export function mediaPeriodo(sintomas, dias) {
  const filtrados = sintomas.filter((s) => dentroDe(s.data, dias));
  if (filtrados.length === 0) return null;

  const soma = filtrados.reduce(
    (acc, s) => ({
      tremor: acc.tremor + s.tremor,
      rigidez: acc.rigidez + s.rigidez,
      congelamento: acc.congelamento + s.congelamento,
      humor: acc.humor + s.humor,
    }),
    { tremor: 0, rigidez: 0, congelamento: 0, humor: 0 }
  );

  return {
    tremor: soma.tremor / filtrados.length,
    rigidez: soma.rigidez / filtrados.length,
    congelamento: soma.congelamento / filtrados.length,
    humor: soma.humor / filtrados.length,
    total: filtrados.length,
  };
}

// ------------------------------------------------------------------
//  TAXA DE ADESÃO
//  Conta medicamentos tomados nos últimos N dias vs N dias anteriores.
//  Retorna { atual, anterior, variacao, temDadosSuficientes }
// ------------------------------------------------------------------
export function adesaoMedicamentos(registros) {
  const atual = registros.filter((r) => dentroDe(r.horarioTomado, 7)).length;

  const anterior = registros.filter((r) => {
    const d = new Date(r.horarioTomado);
    const agora = new Date();
    const diff = (agora - d) / (1000 * 60 * 60 * 24);
    return diff > 7 && diff <= 14;
  }).length;

  const temDadosSuficientes = atual + anterior >= 3;

  let variacao = 0;
  if (anterior > 0) {
    variacao = ((atual - anterior) / anterior) * 100;
  } else if (atual > 0) {
    variacao = 100;
  }

  return { atual, anterior, variacao, temDadosSuficientes };
}

// ------------------------------------------------------------------
//  GERADOR DE INSIGHTS
//  Recebe sintomas e registros e devolve uma lista de insights
//  com texto e nível de "atenção".
//  Cada insight: { id, tipo, severidade, titulo, descricao }
//  severidade: 'info' | 'atencao' | 'positivo'
// ------------------------------------------------------------------
export function gerarInsights(sintomas, registros) {
  const insights = [];

  if (sintomas.length === 0 && registros.length === 0) {
    return insights;
  }

  // --- Comparação de sintomas: esta semana vs semana anterior ---
  const atual = mediaPeriodo(sintomas, 7);
  const anteriorMedia = mediaPeriodo(
    sintomas.filter((s) => {
      const d = new Date(s.data);
      const agora = new Date();
      const diff = (agora - d) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    }),
    30
  );

  if (atual && anteriorMedia) {
    // Tremor
    const deltaTremor = atual.tremor - anteriorMedia.tremor;
    if (deltaTremor >= 0.7) {
      insights.push({
        id: 'tremor-aumentou',
        tipo: 'tremor',
        severidade: 'atencao',
        titulo: 'Aumento no tremor',
        descricao: `Seu tremor aumentou em relação à semana anterior. Vale conversar com seu médico.`,
      });
    } else if (deltaTremor <= -0.7) {
      insights.push({
        id: 'tremor-melhorou',
        tipo: 'tremor',
        severidade: 'positivo',
        titulo: 'Melhora no tremor',
        descricao: `Seu tremor diminuiu em relação à semana anterior. Continue o tratamento.`,
      });
    }

    // Rigidez
    const deltaRigidez = atual.rigidez - anteriorMedia.rigidez;
    if (deltaRigidez >= 0.7) {
      insights.push({
        id: 'rigidez-aumentou',
        tipo: 'rigidez',
        severidade: 'atencao',
        titulo: 'Aumento na rigidez',
        descricao: `Sua rigidez muscular aumentou nos últimos dias. Observe se persiste.`,
      });
    }

    // Humor
    const deltaHumor = atual.humor - anteriorMedia.humor;
    if (deltaHumor >= 0.8) {
      insights.push({
        id: 'humor-piorou',
        tipo: 'humor',
        severidade: 'atencao',
        titulo: 'Queda no humor',
        descricao: `Seu humor esteve mais baixo nesta semana. Considere conversar com alguém de confiança.`,
      });
    } else if (deltaHumor <= -0.8) {
      insights.push({
        id: 'humor-melhorou',
        tipo: 'humor',
        severidade: 'positivo',
        titulo: 'Humor melhorou',
        descricao: `Seu humor melhorou nesta semana. Isso é muito bom!`,
      });
    }
  }

  // --- Sintoma mais frequente ---
  if (sintomas.length >= 3) {
    const media = mediaPeriodo(sintomas, 30);
    if (media) {
      const candidatos = [
        { nome: 'Tremor', valor: media.tremor },
        { nome: 'Rigidez', valor: media.rigidez },
        { nome: 'Congelamento', valor: media.congelamento },
      ];
      candidatos.sort((a, b) => b.valor - a.valor);
      const principal = candidatos[0];

      if (principal.valor >= 1.5) {
        insights.push({
          id: 'sintoma-principal',
          tipo: 'padrao',
          severidade: 'info',
          titulo: `Sintoma principal: ${principal.nome}`,
          descricao: `Nos últimos 30 dias, "${principal.nome}" tem sido o sintoma mais presente nos seus registros.`,
        });
      }
    }
  }

  // --- Adesão aos medicamentos ---
  if (registros.length >= 3) {
    const adesao = adesaoMedicamentos(registros);
    if (adesao.temDadosSuficientes) {
      if (adesao.variacao >= 30) {
        insights.push({
          id: 'adesao-aumentou',
          tipo: 'medicamento',
          severidade: 'positivo',
          titulo: 'Boa adesão ao tratamento',
          descricao: `Você registrou mais medicamentos nesta semana do que na anterior. Continue assim!`,
        });
      } else if (adesao.variacao <= -30) {
        insights.push({
          id: 'adesao-caiu',
          tipo: 'medicamento',
          severidade: 'atencao',
          titulo: 'Atenção à medicação',
          descricao: `Você registrou menos medicamentos nesta semana. Tente manter os horários regulares.`,
        });
      }
    }
  }

  return insights;
}

// Cores por severidade (usadas na tela)
export const CORES_SEVERIDADE = {
  info: '#5B8BB8',      // azul calmo
  atencao: '#C77B2E',   // laranja
  positivo: '#607050',  // verde oliva
};