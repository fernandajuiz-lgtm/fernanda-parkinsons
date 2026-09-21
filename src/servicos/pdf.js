import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ==========================================================
//  GERAÇÃO DE PDF — versão compacta (cabe em 1 página)
// ==========================================================

function dataBR(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

function horaBR(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const NOMES_MOTOR = ['Nenhum', 'Leve', 'Moderado', 'Forte', 'Intenso'];
const NOMES_HUMOR = ['Ótimo', 'Bem', 'Neutro', 'Mal', 'Péssimo'];

function corBarra(n) {
  return ['#607050', '#8FA37C', '#D9B85A', '#C77B2E', '#8B1C1C'][n] || '#CCCCCC';
}

function montarHTML({ usuario, registros, sintomas, periodoLabel }) {
  const totalMedicamentos = registros.length;
  const totalSintomas = sintomas.length;

  const linhasMed = registros
    .slice(0, 20)
    .map(
      (r) => `
      <tr>
        <td>${dataBR(r.horarioTomado)}</td>
        <td>${horaBR(r.horarioTomado)}</td>
        <td>${r.medicamentoNome}</td>
        <td>${r.dose}</td>
      </tr>
    `
    )
    .join('');

  const cardsSint = sintomas
    .slice(0, 15)
    .map(
      (s) => `
      <div class="card-sintoma">
        <div class="card-sintoma-data">
          <strong>${dataBR(s.data)}</strong> · ${horaBR(s.data)}
        </div>
        <table class="tabela-sintoma">
          <tr>
            <td class="celula-sintoma">
              <div class="sintoma-label">Tremor</div>
              <div class="sintoma-valor" style="color:${corBarra(s.tremor)};">
                ${NOMES_MOTOR[s.tremor]}
              </div>
            </td>
            <td class="celula-sintoma">
              <div class="sintoma-label">Rigidez</div>
              <div class="sintoma-valor" style="color:${corBarra(s.rigidez)};">
                ${NOMES_MOTOR[s.rigidez]}
              </div>
            </td>
            <td class="celula-sintoma">
              <div class="sintoma-label">Congelamento</div>
              <div class="sintoma-valor" style="color:${corBarra(s.congelamento)};">
                ${NOMES_MOTOR[s.congelamento]}
              </div>
            </td>
            <td class="celula-sintoma">
              <div class="sintoma-label">Humor</div>
              <div class="sintoma-valor" style="color:${corBarra(s.humor)};">
                ${NOMES_HUMOR[s.humor]}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `
    )
    .join('');

  const nome = usuario?.nome || 'Paciente';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page { margin: 20px 24px; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, 'Helvetica', sans-serif;
          color: #4E3C2B;
          background: #F7F1E1;
          padding: 8px;
          margin: 0;
          font-size: 11px;
        }
        h1 {
          font-family: 'Georgia', serif;
          color: #8B1C1C;
          font-size: 24px;
          margin: 0 0 2px 0;
          letter-spacing: -0.5px;
        }
        h2 {
          font-family: 'Georgia', serif;
          color: #4E3C2B;
          font-size: 15px;
          margin: 12px 0 6px 0;
          border-bottom: 1.5px solid #EAE0CB;
          padding-bottom: 3px;
        }
        .subtitulo {
          color: #7A6A58;
          font-size: 11px;
          margin: 0;
        }
        .cabecalho {
          border-bottom: 2px solid #8B1C1C;
          padding-bottom: 8px;
          margin-bottom: 10px;
        }
        .info-paciente {
          background: #FFFFFF;
          border: 1px solid #EAE0CB;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .info-paciente p { margin: 0; font-size: 11px; }
        .info-paciente strong { color: #4E3C2B; }

        .cards-resumo {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .card {
          flex: 1;
          background: #FFFFFF;
          border: 1px solid #EAE0CB;
          border-radius: 8px;
          padding: 8px;
          text-align: center;
        }
        .card-numero {
          font-family: 'Georgia', serif;
          font-size: 20px;
          color: #8B1C1C;
          font-weight: bold;
          line-height: 1;
        }
        .card-label {
          font-size: 9px;
          color: #7A6A58;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #FFFFFF;
          border-radius: 8px;
          overflow: hidden;
          font-size: 11px;
        }
        th {
          background: #4E3C2B;
          color: #F7F1E1;
          padding: 6px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 5px 8px;
          border-bottom: 1px solid #EAE0CB;
          color: #4E3C2B;
        }
        tr:last-child td { border-bottom: none; }

        .card-sintoma {
          background: #FFFFFF;
          border: 1px solid #EAE0CB;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 6px;
          page-break-inside: avoid;
        }
        .card-sintoma-data {
          font-size: 10px;
          color: #7A6A58;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #F0E8D5;
        }
        .card-sintoma-data strong { color: #4E3C2B; }
        .tabela-sintoma {
          width: 100%;
          border-collapse: collapse;
          background: transparent;
          border-radius: 0;
        }
        .tabela-sintoma td.celula-sintoma {
          border: none;
          padding: 0 8px 0 0;
          vertical-align: top;
        }
        .sintoma-label {
          font-size: 8px;
          color: #7A6A58;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 1px;
        }
        .sintoma-valor {
          font-size: 11px;
          font-weight: bold;
        }

        .vazio {
          color: #7A6A58;
          font-style: italic;
          padding: 10px;
          text-align: center;
          background: #FFFFFF;
          border-radius: 8px;
          font-size: 11px;
        }
        .rodape {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #EAE0CB;
          font-size: 8px;
          color: #7A6A58;
          text-align: center;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="cabecalho">
        <h1>Parkinson's Help</h1>
        <p class="subtitulo">Relatório de acompanhamento — ${periodoLabel}</p>
      </div>

      <div class="info-paciente">
        <p><strong>Paciente:</strong> ${nome}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div class="cards-resumo">
        <div class="card">
          <div class="card-numero">${totalMedicamentos}</div>
          <div class="card-label">Medicamentos tomados</div>
        </div>
        <div class="card">
          <div class="card-numero">${totalSintomas}</div>
          <div class="card-label">Registros de sintomas</div>
        </div>
      </div>

      <h2>Medicamentos tomados</h2>
      ${
        registros.length > 0
          ? `
        <table>
          <thead>
            <tr><th>Data</th><th>Hora</th><th>Medicamento</th><th>Dose</th></tr>
          </thead>
          <tbody>${linhasMed}</tbody>
        </table>
      `
          : '<div class="vazio">Nenhum medicamento registrado no período.</div>'
      }

      <h2>Sintomas registrados</h2>
      ${
        sintomas.length > 0
          ? cardsSint
          : '<div class="vazio">Nenhum sintoma registrado no período.</div>'
      }

      <div class="rodape">
        Este relatório foi gerado automaticamente pelo aplicativo Parkinson's Help.
        As informações aqui apresentadas são de caráter informativo e não substituem avaliação médica.
        Gerado em ${new Date().toLocaleString('pt-BR')}.
      </div>
    </body>
    </html>
  `;
}

export async function gerarCompartilharPDF({ usuario, registros, sintomas, periodoLabel }) {
  try {
    const html = montarHTML({ usuario, registros, sintomas, periodoLabel });

    const { uri } = await Print.printToFileAsync({ html });

    const disponivel = await Sharing.isAvailableAsync();
    if (disponivel) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar relatório',
        UTI: 'com.adobe.pdf',
      });
      return { ok: true, uri };
    }

    return { ok: false, erro: 'Compartilhamento não disponível neste dispositivo.' };
  } catch (e) {
    console.error('Erro ao gerar PDF:', e);
    return { ok: false, erro: e.message || 'Erro desconhecido' };
  }
}