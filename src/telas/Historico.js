import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FileText, Pill, Activity, TrendingUp, TrendingDown, Info, Sparkles } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import GraficoSintomas from '../componentes/GraficoSintomas';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import {
  lerRegistros,
  lerSintomas,
  lerUsuario,
} from '../servicos/armazenamento';
import { gerarCompartilharPDF } from '../servicos/pdf';
import {
  mediaPorDia,
  gerarInsights,
  CORES_SEVERIDADE,
} from '../servicos/analise';
import { gerarAnaliseIA } from '../servicos/ia';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

const FILTROS = [
  { label: 'Hoje', dias: 1 },
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: 'Tudo', dias: 9999 },
];

function dentroDoPeriodo(isoData, dias) {
  if (dias >= 9999) return true;
  const agora = new Date();
  const data = new Date(isoData);
  const diff = (agora - data) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= dias;
}

function formatarDataHora(iso) {
  const d = new Date(iso);
  const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} ${hora}`;
}

const NOMES_MOTOR = ['Nenhum', 'Leve', 'Moderado', 'Forte', 'Intenso'];
const NOMES_HUMOR = ['Ótimo', 'Bem', 'Neutro', 'Mal', 'Péssimo'];

function corNivel(n) {
  return ['#607050', '#8FA37C', '#D9B85A', '#C77B2E', '#8B1C1C'][n] || cores.inkSuave;
}

// Ícone conforme severidade do insight
function IconeInsight({ severidade }) {
  if (severidade === 'positivo') {
    return <Icone Icone={TrendingUp} tamanho={20} cor={CORES_SEVERIDADE.positivo} />;
  }
  if (severidade === 'atencao') {
    return <Icone Icone={TrendingDown} tamanho={20} cor={CORES_SEVERIDADE.atencao} />;
  }
  return <Icone Icone={Info} tamanho={20} cor={CORES_SEVERIDADE.info} />;
}

export default function Historico({ navigation }) {
  const { ts } = useAcessibilidade();
  const [filtro, setFiltro] = useState(FILTROS[1]);
  const [registros, setRegistros] = useState([]);
  const [sintomas, setSintomas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [analiseIA, setAnaliseIA] = useState(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        const [r, s, u] = await Promise.all([
          lerRegistros(),
          lerSintomas(),
          lerUsuario(),
        ]);
        if (ativo) {
          setRegistros(r);
          setSintomas(s);
          setUsuario(u);
        }
      })();
      return () => {
        ativo = false;
      };
    }, [])
  );

  // ----- ANÁLISE -----

  // Dados para o gráfico (últimos 7 dias, sempre — não segue o filtro)
  const dadosGrafico = useMemo(() => mediaPorDia(sintomas, 7), [sintomas]);

  // Insights gerados a partir de todos os dados
  const insights = useMemo(
    () => gerarInsights(sintomas, registros),
    [sintomas, registros]
  );

  // ----- FILTROS -----

  const registrosFiltrados = registros.filter((r) =>
    dentroDoPeriodo(r.horarioTomado, filtro.dias)
  );
  const sintomasFiltrados = sintomas.filter((s) =>
    dentroDoPeriodo(s.data, filtro.dias)
  );
   async function pedirAnaliseIA() {
    setCarregandoIA(true);
    setAnaliseIA(null);
    setErroIA(null);

    const resultado = await gerarAnaliseIA({
      usuario,
      registros: registrosFiltrados,
      sintomas: sintomasFiltrados,
      insights,
    });

    setCarregandoIA(false);

    if (resultado.ok) {
      setAnaliseIA(resultado.texto);
    } else {
      // Em vez de Alert feio, mostramos card amigável
      setErroIA(resultado.erro);
    }
  }
  async function exportarPDF() {
    setGerando(true);
    const resultado = await gerarCompartilharPDF({
      usuario,
      registros: registrosFiltrados,
      sintomas: sintomasFiltrados,
      periodoLabel: filtro.label,
    });
    setGerando(false);

    if (!resultado.ok) {
      Alert.alert('Erro ao gerar PDF', resultado.erro || 'Tente novamente.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { padding: ts(espacos.md), paddingBottom: ts(espacos.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Texto style={[styles.titulo, { marginBottom: ts(espacos.xs) }]}>
          Meu histórico
        </Texto>
        <Texto style={[styles.subtitulo, { marginBottom: ts(espacos.lg) }]}>
          Acompanhe seus registros ao longo do tempo.
        </Texto>

        {/* ---------- INSIGHTS ---------- */}
        {insights.length > 0 && (
          <View style={{ marginBottom: ts(espacos.lg) }}>
            <View style={[styles.secaoHeader, { marginBottom: ts(espacos.sm) }]}>
              <Icone Icone={Info} tamanho={18} cor={cores.marca} />
              <Texto style={styles.secaoTitulo}>Análise do período</Texto>
            </View>

            {insights.map((ins) => (
              <View
                key={ins.id}
                style={[
                  styles.cardInsight,
                  sombra,
                  {
                    padding: ts(espacos.md),
                    marginBottom: ts(espacos.sm),
                    borderLeftColor: CORES_SEVERIDADE[ins.severidade],
                  },
                ]}
              >
                <View style={styles.linhaInsightTopo}>
                  <IconeInsight severidade={ins.severidade} />
                  <Texto
                    style={[
                      styles.insightTitulo,
                      { color: CORES_SEVERIDADE[ins.severidade] },
                    ]}
                  >
                    {ins.titulo}
                  </Texto>
                </View>
                <Texto style={styles.insightDescricao}>{ins.descricao}</Texto>
              </View>
            ))}
          </View>
        )}

        {/* ---------- GRÁFICO ---------- */}
        <View style={{ marginBottom: ts(espacos.lg) }}>
          <View style={[styles.secaoHeader, { marginBottom: ts(espacos.sm) }]}>
            <Icone Icone={Activity} tamanho={18} cor={cores.sintoma} />
            <Texto style={styles.secaoTitulo}>Últimos 7 dias</Texto>
          </View>

          <GraficoSintomas dados={dadosGrafico} mostrarLegenda />
        </View>

        {/* ---------- FILTROS ---------- */}
        <View style={[styles.filtrosWrap, { marginBottom: ts(espacos.md) }]}>
          {FILTROS.map((f) => {
            const selecionado = f.label === filtro.label;
            return (
              <TouchableOpacity
                key={f.label}
                onPress={() => setFiltro(f)}
                style={[
                  styles.chipFiltro,
                  {
                    backgroundColor: selecionado ? cores.marca : cores.cartao,
                    borderColor: selecionado ? cores.marca : '#F0E8D5',
                    paddingVertical: ts(espacos.xs),
                    paddingHorizontal: ts(espacos.sm),
                  },
                  sombra,
                ]}
                activeOpacity={0.7}
              >
                <Texto
                  style={[
                    styles.chipFiltroTexto,
                    { color: selecionado ? '#FFFFFF' : cores.ink },
                  ]}
                >
                  {f.label}
                </Texto>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------- RESUMO ---------- */}
        <View style={[styles.resumo, { marginBottom: ts(espacos.lg) }]}>
          <View style={[styles.resumoCard, sombra, { padding: ts(espacos.md) }]}>
            <Icone Icone={Pill} tamanho={20} cor={cores.medicamento} />
            <Texto style={styles.resumoNumero}>{registrosFiltrados.length}</Texto>
            <Texto style={styles.resumoLabel}>Tomados</Texto>
          </View>
          <View style={[styles.resumoCard, sombra, { padding: ts(espacos.md) }]}>
            <Icone Icone={Activity} tamanho={20} cor={cores.sintoma} />
            <Texto style={styles.resumoNumero}>{sintomasFiltrados.length}</Texto>
            <Texto style={styles.resumoLabel}>Sintomas</Texto>
          </View>
        </View>

        {/* ---------- MEDICAMENTOS ---------- */}
        <View style={[styles.secaoHeader, { marginBottom: ts(espacos.sm) }]}>
          <Icone Icone={Pill} tamanho={18} cor={cores.medicamento} />
          <Texto style={styles.secaoTitulo}>Medicamentos tomados</Texto>
        </View>

        {registrosFiltrados.length === 0 ? (
          <View
            style={[
              styles.vazio,
              sombra,
              { padding: ts(espacos.md), marginBottom: ts(espacos.lg) },
            ]}
          >
            <Texto style={styles.vazioTexto}>
              Nenhum medicamento registrado nesse período.
            </Texto>
          </View>
        ) : (
          registrosFiltrados.slice(0, 20).map((r) => (
            <View
              key={r.id}
              style={[
                styles.itemCard,
                sombra,
                { padding: ts(espacos.md), marginBottom: ts(espacos.sm) },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Texto style={styles.itemNome}>{r.medicamentoNome}</Texto>
                <Texto style={styles.itemDetalhe}>
                  {r.dose} · {formatarDataHora(r.horarioTomado)}
                </Texto>
              </View>
            </View>
          ))
        )}

        {/* ---------- SINTOMAS ---------- */}
        <View
          style={[
            styles.secaoHeader,
            { marginTop: ts(espacos.md), marginBottom: ts(espacos.sm) },
          ]}
        >
          <Icone Icone={Activity} tamanho={18} cor={cores.sintoma} />
          <Texto style={styles.secaoTitulo}>Sintomas registrados</Texto>
        </View>

        {sintomasFiltrados.length === 0 ? (
          <View
            style={[
              styles.vazio,
              sombra,
              { padding: ts(espacos.md), marginBottom: ts(espacos.lg) },
            ]}
          >
            <Texto style={styles.vazioTexto}>
              Nenhum sintoma registrado nesse período.
            </Texto>
          </View>
        ) : (
          sintomasFiltrados.slice(0, 20).map((s) => (
            <View
              key={s.id}
              style={[
                styles.itemCard,
                sombra,
                { padding: ts(espacos.md), marginBottom: ts(espacos.sm) },
              ]}
            >
              <Texto style={styles.itemDetalheData}>
                {formatarDataHora(s.data)}
              </Texto>

              <View style={styles.linhaSintomas}>
                <View style={styles.sintomaItem}>
                  <Texto style={styles.sintomaLabel}>Tremor</Texto>
                  <Texto
                    style={[styles.sintomaValor, { color: corNivel(s.tremor) }]}
                  >
                    {NOMES_MOTOR[s.tremor]}
                  </Texto>
                </View>
                <View style={styles.sintomaItem}>
                  <Texto style={styles.sintomaLabel}>Rigidez</Texto>
                  <Texto
                    style={[styles.sintomaValor, { color: corNivel(s.rigidez) }]}
                  >
                    {NOMES_MOTOR[s.rigidez]}
                  </Texto>
                </View>
                <View style={styles.sintomaItem}>
                  <Texto style={styles.sintomaLabel}>Congel.</Texto>
                  <Texto
                    style={[
                      styles.sintomaValor,
                      { color: corNivel(s.congelamento) },
                    ]}
                  >
                    {NOMES_MOTOR[s.congelamento]}
                  </Texto>
                </View>
                <View style={styles.sintomaItem}>
                  <Texto style={styles.sintomaLabel}>Humor</Texto>
                  <Texto style={[styles.sintomaValor, { color: corNivel(s.humor) }]}>
                    {NOMES_HUMOR[s.humor]}
                  </Texto>
                </View>
              </View>
            </View>
          ))
        )}
        {/* ---------- IA ---------- */}
        <View style={{ marginTop: ts(espacos.md), marginBottom: ts(espacos.lg) }}>
          <View style={[styles.secaoHeader, { marginBottom: ts(espacos.sm) }]}>
            <Icone Icone={Sparkles} tamanho={18} cor={cores.marca} />
            <Texto style={styles.secaoTitulo}>Análise inteligente</Texto>
          </View>

          {!analiseIA && !carregandoIA && (
            <TouchableOpacity
              onPress={pedirAnaliseIA}
              style={[
                styles.botaoIA,
                sombra,
                { padding: ts(espacos.md), marginBottom: ts(espacos.sm) },
              ]}
              activeOpacity={0.85}
            >
              <Icone Icone={Sparkles} tamanho={20} cor="#FFFFFF" strokeWidth={2} />
              <Texto style={styles.botaoIATexto}>
                Pedir análise à IA
              </Texto>
            </TouchableOpacity>
          )}

          {carregandoIA && (
            <View
              style={[
                styles.cardIA,
                sombra,
                { padding: ts(espacos.md), alignItems: 'center' },
              ]}
            >
              <ActivityIndicator color={cores.marca} />
              <Texto style={[styles.iaCarregando, { marginTop: ts(espacos.sm) }]}>
                A IA está analisando seus dados...
              </Texto>
            </View>
          )}
          {erroIA && !carregandoIA && (
            <View
              style={[
                styles.cardIA,
                sombra,
                {
                  padding: ts(espacos.md),
                  borderLeftColor: cores.sintoma,
                },
              ]}
            >
              <Texto style={styles.iaErroTitulo}>Não foi possível gerar</Texto>
              <Texto style={styles.iaErroDescricao}>
                {erroIA}
              </Texto>
              <Texto style={[styles.iaErroDica, { marginTop: ts(espacos.sm) }]}>
                Os insights automáticos acima continuam válidos.
              </Texto>
            </View>
          )}

          {analiseIA && (
            <View
              style={[
                styles.cardIA,
                sombra,
                { padding: ts(espacos.md) },
              ]}
            >
              <Texto style={styles.iaTexto}>{analiseIA}</Texto>

              <TouchableOpacity
                onPress={pedirAnaliseIA}
                style={[styles.botaoIARefa, { marginTop: ts(espacos.md) }]}
                activeOpacity={0.7}
              >
                <Texto style={styles.botaoIARefaTexto}>Gerar nova análise</Texto>
              </TouchableOpacity>
            </View>
          )}

          <Texto style={[styles.rodapeIA, { marginTop: ts(espacos.sm) }]}>
            Análise gerada por IA. Não substitui avaliação médica.
          </Texto>
        </View>

        {/* ---------- BOTÃO PDF ---------- */}
        <TouchableOpacity
          onPress={exportarPDF}
          disabled={gerando}
          style={[
            styles.botaoPDF,
            sombra,
            {
              padding: ts(espacos.md),
              marginTop: ts(espacos.md),
              opacity: gerando ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.85}
        >
          {gerando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icone Icone={FileText} tamanho={20} cor="#FFFFFF" strokeWidth={2} />
              <Texto style={styles.botaoPDFTexto}>Exportar relatório PDF</Texto>
            </>
          )}
        </TouchableOpacity>

        <Texto style={[styles.rodape, { marginTop: ts(espacos.md) }]}>
          Compartilhe este relatório com seu médico na próxima consulta.
        </Texto>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.papel },
  container: { flexGrow: 1 },
  titulo: {
    fontFamily: fontes.serifBold,
    fontSize: tamanhos.titulo,
    color: cores.ink,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.corpo,
    color: cores.inkSuave,
  },

  // Insights
  cardInsight: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    borderLeftWidth: 5,
  },
  linhaInsightTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  insightTitulo: {
    fontFamily: fontes.semiBold,
    fontSize: 15,
    flex: 1,
  },
  insightDescricao: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
    lineHeight: 19,
    marginLeft: 28,
  },

  filtrosWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipFiltro: {
    borderRadius: raios.pill,
    borderWidth: 1,
  },
  chipFiltroTexto: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
  },
  resumo: { flexDirection: 'row', gap: 12 },
  resumoCard: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E8D5',
    gap: 4,
  },
  resumoNumero: {
    fontFamily: fontes.serifBold,
    fontSize: 32,
    color: cores.ink,
    lineHeight: 36,
  },
  resumoLabel: {
    fontFamily: fontes.medium,
    fontSize: 12,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secaoTitulo: {
    fontFamily: fontes.serifSemiBold,
    fontSize: 22,
    color: cores.ink,
  },
  itemCard: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  itemNome: {
    fontFamily: fontes.semiBold,
    fontSize: 17,
    color: cores.ink,
  },
  itemDetalhe: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
    marginTop: 2,
  },
  itemDetalheData: {
    fontFamily: fontes.medium,
    fontSize: 12,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  linhaSintomas: { flexDirection: 'row', justifyContent: 'space-between' },
  sintomaItem: { flex: 1 },
  sintomaLabel: {
    fontFamily: fontes.regular,
    fontSize: 11,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sintomaValor: {
    fontFamily: fontes.semiBold,
    fontSize: 14,
    marginTop: 2,
  },
  vazio: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    alignItems: 'center',
  },
  vazioTexto: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  botaoPDF: {
    backgroundColor: cores.marca,
    borderRadius: raios.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoPDFTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
  rodape: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    textAlign: 'center',
    opacity: 0.7,
  },
    botaoIA: {
    backgroundColor: cores.marca,
    borderRadius: raios.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoIATexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
  cardIA: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    borderLeftWidth: 5,
    borderLeftColor: cores.marca,
  },
  iaCarregando: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    fontStyle: 'italic',
  },
  iaTexto: {
    fontFamily: fontes.regular,
    fontSize: 15,
    color: cores.ink,
    lineHeight: 22,
  },
  botaoIARefa: {
    alignSelf: 'center',
  },
  botaoIARefaTexto: {
    color: cores.marca,
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
  },
  rodapeIA: {
    fontFamily: fontes.regular,
    fontSize: 11,
    color: cores.inkSuave,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  iaErroTitulo: {
    fontFamily: fontes.semiBold,
    fontSize: 15,
    color: cores.sintoma,
    marginBottom: 4,
  },
  iaErroDescricao: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
    lineHeight: 19,
  },
  iaErroDica: {
    fontFamily: fontes.regular,
    fontSize: 12,
    color: cores.inkSuave,
    fontStyle: 'italic',
  },
});