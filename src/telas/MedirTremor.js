import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Activity, Play, Square, Check } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import {
  salvarTremores,
  lerTremores,
  gerarId,
} from '../servicos/armazenamento';
import {
  iniciarLeitura,
  pararLeitura,
  NOMES_NIVEL,
  CORES_NIVEL,
} from '../servicos/sensores';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

// Duração total da medição em segundos
const DURACAO_SEGUNDOS = 20;

export default function MedirTremor({ navigation }) {
  const { ts } = useAcessibilidade();
  const [medindo, setMedindo] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [nivelAtual, setNivelAtual] = useState(0);
  const [variacoes, setVariacoes] = useState([]);
  const [resultado, setResultado] = useState(null);

  const timerRef = useRef(null);
  const amostrasRef = useRef([]);

  // Animação da barra
  const barraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      pararLeitura();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function iniciar() {
    setResultado(null);
    setVariacoes([]);
    amostrasRef.current = [];
    setTempo(0);
    setNivelAtual(0);
    setMedindo(true);

    // Inicia leitura do acelerômetro
    iniciarLeitura(({ variacao, nivel }) => {
      setNivelAtual(nivel);
      amostrasRef.current.push(variacao);

      // Atualiza a barra animada
      const altura = Math.min(1, variacao / 2.5);
      Animated.timing(barraAnim, {
        toValue: altura,
        duration: 100,
        useNativeDriver: false,
      }).start();

      // Guarda histórico visual (últimos 30 valores para o gráfico)
      setVariacoes((prev) => {
        const nova = [...prev, variacao];
        return nova.slice(-30);
      });
    });

    // Timer de contagem
    let seg = 0;
    timerRef.current = setInterval(() => {
      seg += 1;
      setTempo(seg);

      if (seg >= DURACAO_SEGUNDOS) {
        finalizar();
      }
    }, 1000);
  }

  function finalizar() {
    if (timerRef.current) clearInterval(timerRef.current);
    pararLeitura();
    setMedindo(false);

    // Calcula resultado
    const amostras = amostrasRef.current;
    if (amostras.length === 0) {
      Alert.alert('Sem dados', 'Nenhuma amostra coletada. Tente novamente.');
      return;
    }

    const media = amostras.reduce((a, b) => a + b, 0) / amostras.length;
    const nivelFinal = nivelDeVariacao(media);

    setResultado({
      media,
      nivel: nivelFinal,
      totalAmostras: amostras.length,
      duracao: DURACAO_SEGUNDOS,
    });
  }

  function nivelDeVariacao(v) {
    if (v < 0.15) return 0;
    if (v < 0.5) return 1;
    if (v < 1.2) return 2;
    if (v < 2.5) return 3;
    return 4;
  }

  function cancelar() {
    if (timerRef.current) clearInterval(timerRef.current);
    pararLeitura();
    setMedindo(false);
    setTempo(0);
    setVariacoes([]);
    barraAnim.setValue(0);
    amostrasRef.current = [];
    setResultado(null);
  }

  async function salvar() {
    if (!resultado) return;

    const novo = {
      id: gerarId(),
      data: new Date().toISOString(),
      duracao: resultado.duracao,
      nivel: resultado.nivel,
      media: resultado.media,
      amostras: resultado.totalAmostras,
    };

    const lista = await lerTremores();
    await salvarTremores([novo, ...lista]);

    Alert.alert('Salvo!', 'A medição de tremor foi registrada.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  // Altura máxima do gráfico (px)
  const ALTURA_GRAFICO = 120;
  const progresso = tempo / DURACAO_SEGUNDOS;

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
          Medir tremor
        </Texto>
        <Texto style={[styles.subtitulo, { marginBottom: ts(espacos.lg) }]}>
          Coloque o celular na mão e fique o mais parado possível. A gente mede
          a intensidade do seu tremor.
        </Texto>

        {/* ÁREA DO GRÁFICO */}
        <View
          style={[
            styles.graficoContainer,
            sombra,
            {
              height: ts(ALTURA_GRAFICO),
              padding: ts(espacos.sm),
              marginBottom: ts(espacos.md),
            },
          ]}
        >
          {medindo || resultado ? (
            <View style={styles.barrasWrap}>
              {variacoes.map((v, i) => {
                const alturaPx = Math.min(1, v / 2.5) * (ALTURA_GRAFICO - 30);
                const cor = CORES_NIVEL[nivelDeVariacao(v)];
                return (
                  <View
                    key={i}
                    style={[
                      styles.barra,
                      {
                        height: Math.max(4, alturaPx),
                        backgroundColor: cor,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.graficoVazio}>
              <Icone Icone={Activity} tamanho={32} cor={cores.inkSuave} />
              <Texto style={styles.graficoVazioTexto}>
                Aguardando medição...
              </Texto>
            </View>
          )}
        </View>

        {/* STATUS ATUAL */}
        {medindo && (
          <View style={[styles.statusWrap, { marginBottom: ts(espacos.md) }]}>
            <Texto style={styles.statusTempo}>
              {tempo}s / {DURACAO_SEGUNDOS}s
            </Texto>
            <View style={styles.statusNivel}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: CORES_NIVEL[nivelAtual] },
                ]}
              />
              <Texto
                style={[styles.statusNivelTexto, { color: CORES_NIVEL[nivelAtual] }]}
              >
                {NOMES_NIVEL[nivelAtual]}
              </Texto>
            </View>
          </View>
        )}

        {/* RESULTADO */}
        {resultado && (
          <View
            style={[
              styles.cardResultado,
              sombra,
              {
                padding: ts(espacos.md),
                marginBottom: ts(espacos.md),
                borderLeftColor: CORES_NIVEL[resultado.nivel],
              },
            ]}
          >
            <Texto style={styles.resultadoLabel}>Nível detectado</Texto>
            <Texto
              style={[
                styles.resultadoNivel,
                { color: CORES_NIVEL[resultado.nivel] },
              ]}
            >
              {NOMES_NIVEL[resultado.nivel]}
            </Texto>
            <Texto style={styles.resultadoDetalhe}>
              {resultado.totalAmostras} amostras · {resultado.duracao}s
            </Texto>
          </View>
        )}

        {/* BOTÕES */}
        {!medindo && !resultado && (
          <TouchableOpacity
            onPress={iniciar}
            style={[styles.botaoIniciar, sombra, { padding: ts(espacos.lg) }]}
            activeOpacity={0.85}
          >
            <Icone Icone={Play} tamanho={32} cor="#FFFFFF" strokeWidth={2} />
            <Texto style={styles.botaoIniciarTexto}>Iniciar medição</Texto>
          </TouchableOpacity>
        )}

        {medindo && (
          <TouchableOpacity
            onPress={cancelar}
            style={[styles.botaoCancelar, sombra, { padding: ts(espacos.md) }]}
            activeOpacity={0.85}
          >
            <Icone Icone={Square} tamanho={20} cor="#FFFFFF" strokeWidth={2} />
            <Texto style={styles.botaoCancelarTexto}>Cancelar</Texto>
          </TouchableOpacity>
        )}

        {resultado && (
          <>
            <TouchableOpacity
              onPress={salvar}
              style={[styles.botaoSalvar, sombra, { padding: ts(espacos.md) }]}
              activeOpacity={0.85}
            >
              <Icone Icone={Check} tamanho={20} cor="#FFFFFF" strokeWidth={2.5} />
              <Texto style={styles.botaoSalvarTexto}>Salvar medição</Texto>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={iniciar}
              style={[styles.botaoRefazer, { padding: ts(espacos.sm), marginTop: ts(espacos.sm) }]}
              activeOpacity={0.85}
            >
              <Texto style={styles.botaoRefazerTexto}>Medir novamente</Texto>
            </TouchableOpacity>
          </>
        )}

        <Texto style={[styles.rodape, { marginTop: ts(espacos.lg) }]}>
          Esta medição é informativa e não substitui avaliação médica.
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
    lineHeight: 24,
  },
  graficoContainer: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barrasWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flex: 1,
    gap: 2,
  },
  barra: {
    flex: 1,
    borderRadius: 3,
    minHeight: 4,
  },
  graficoVazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  graficoVazioTexto: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
    fontStyle: 'italic',
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTempo: {
    fontFamily: fontes.serifBold,
    fontSize: 28,
    color: cores.ink,
    letterSpacing: -0.5,
  },
  statusNivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusNivelTexto: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
  cardResultado: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    borderLeftWidth: 6,
    alignItems: 'center',
  },
  resultadoLabel: {
    fontFamily: fontes.medium,
    fontSize: 12,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultadoNivel: {
    fontFamily: fontes.serifBold,
    fontSize: 36,
    letterSpacing: -1,
    marginTop: 2,
  },
  resultadoDetalhe: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
    marginTop: 4,
  },
  botaoIniciar: {
    backgroundColor: cores.sintoma,
    borderRadius: raios.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  botaoIniciarTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.bold,
    fontSize: 20,
  },
  botaoCancelar: {
    backgroundColor: cores.ink,
    borderRadius: raios.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoCancelarTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
  botaoSalvar: {
    backgroundColor: cores.medicamento,
    borderRadius: raios.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoSalvarTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
  botaoRefazer: {
    alignItems: 'center',
  },
  botaoRefazerTexto: {
    color: cores.marca,
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
  },
  rodape: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
});