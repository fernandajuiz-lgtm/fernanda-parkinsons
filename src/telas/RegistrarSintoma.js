import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Activity, Waves, Snowflake, Smile } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import { lerSintomas, salvarSintomas, gerarId } from '../servicos/armazenamento';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

const ESCALA_MOTORA = ['Nenhum', 'Leve', 'Moderado', 'Forte', 'Intenso'];
const ESCALA_HUMOR = ['Ótimo', 'Bem', 'Neutro', 'Mal', 'Péssimo'];

// Cores por nível — do verde ao vermelho
function corNivel(n) {
  return ['#607050', '#8FA37C', '#D9B85A', '#C77B2E', '#8B1C1C'][n];
}

function CartaoSintoma({ IconeLucide, titulo, subtitulo, valor, onChange, escala, ts, corIcone }) {
  return (
    <View style={[styles.cartao, sombra, { padding: ts(espacos.md), marginBottom: ts(espacos.md) }]}>
      <View style={[styles.cabecalhoCartao, { marginBottom: ts(espacos.md) }]}>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: corIcone + '20',
              width: ts(44),
              height: ts(44),
              borderRadius: ts(14),
            },
          ]}
        >
          <Icone Icone={IconeLucide} tamanho={22} cor={corIcone} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <Texto style={styles.tituloCartao}>{titulo}</Texto>
          {subtitulo ? <Texto style={styles.subtituloCartao}>{subtitulo}</Texto> : null}
        </View>
      </View>

      <View style={styles.linhaNiveis}>
        {escala.map((label, n) => {
          const selecionado = valor === n;
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onChange(n)}
              style={[
                styles.botaoNivel,
                {
                  backgroundColor: selecionado ? corNivel(n) : '#FFFFFF',
                  borderColor: selecionado ? corNivel(n) : '#E8DFC8',
                  paddingVertical: ts(espacos.sm),
                },
              ]}
              activeOpacity={0.7}
              accessibilityLabel={`${titulo}, nível ${n}, ${label}`}
            >
              <Texto
                style={[
                  styles.numeroNivel,
                  { color: selecionado ? '#FFFFFF' : cores.ink },
                ]}
              >
                {n}
              </Texto>
            </TouchableOpacity>
          );
        })}
      </View>

      {valor !== null && (
        <Texto
          style={[
            styles.labelSelecionado,
            { color: corNivel(valor), marginTop: ts(espacos.sm) },
          ]}
        >
          {escala[valor]}
        </Texto>
      )}
    </View>
  );
}

export default function RegistrarSintoma({ navigation }) {
  const { ts } = useAcessibilidade();
  const [tremor, setTremor] = useState(null);
  const [rigidez, setRigidez] = useState(null);
  const [congelamento, setCongelamento] = useState(null);
  const [humor, setHumor] = useState(null);

  const podeSalvar =
    tremor !== null && rigidez !== null && congelamento !== null && humor !== null;

  async function salvar() {
    if (!podeSalvar) {
      Alert.alert('Falta preencher', 'Por favor, responda todos os itens.');
      return;
    }

    const novo = {
      id: gerarId(),
      data: new Date().toISOString(),
      tremor,
      rigidez,
      congelamento,
      humor,
    };

    const lista = await lerSintomas();
    await salvarSintomas([novo, ...lista]);

    Alert.alert('Registrado!', 'Seu sintoma foi salvo com sucesso.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
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
          Como está se sentindo?
        </Texto>
        <Texto style={[styles.subtitulo, { marginBottom: ts(espacos.lg) }]}>
          Toque no nível que descreve você agora.
        </Texto>

        <CartaoSintoma
          IconeLucide={Activity}
          titulo="Tremor"
          subtitulo="Movimento involuntário"
          valor={tremor}
          onChange={setTremor}
          escala={ESCALA_MOTORA}
          ts={ts}
          corIcone={cores.medicamento}
        />

        <CartaoSintoma
          IconeLucide={Waves}
          titulo="Rigidez"
          subtitulo="Enrijecimento muscular"
          valor={rigidez}
          onChange={setRigidez}
          escala={ESCALA_MOTORA}
          ts={ts}
          corIcone={cores.sintoma}
        />

        <CartaoSintoma
          IconeLucide={Snowflake}
          titulo="Congelamento"
          subtitulo="Dificuldade para começar a andar"
          valor={congelamento}
          onChange={setCongelamento}
          escala={ESCALA_MOTORA}
          ts={ts}
          corIcone="#5B8BB8"
        />

        <CartaoSintoma
          IconeLucide={Smile}
          titulo="Humor"
          subtitulo="Como você está emocionalmente"
          valor={humor}
          onChange={setHumor}
          escala={ESCALA_HUMOR}
          ts={ts}
          corIcone={cores.historico}
        />

        <TouchableOpacity
          onPress={salvar}
          disabled={!podeSalvar}
          style={[
            styles.botaoSalvar,
            sombra,
            {
              padding: ts(espacos.md),
              backgroundColor: podeSalvar ? cores.sintoma : cores.linha,
            },
          ]}
          activeOpacity={0.85}
        >
          <Texto
            style={[
              styles.botaoSalvarTexto,
              { color: podeSalvar ? '#FFFFFF' : cores.inkSuave },
            ]}
          >
            {podeSalvar ? 'Salvar registro' : 'Preencha todos os itens'}
          </Texto>
        </TouchableOpacity>
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
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  cabecalhoCartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloCartao: {
    fontFamily: fontes.serifSemiBold,
    fontSize: 24,
    color: cores.ink,
    letterSpacing: -0.3,
  },
  subtituloCartao: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
    marginTop: -2,
  },
  linhaNiveis: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoNivel: {
    flex: 1,
    borderRadius: raios.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  numeroNivel: {
    fontFamily: fontes.bold,
    fontSize: 22,
  },
  labelSelecionado: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
    textAlign: 'center',
  },
  botaoSalvar: {
    borderRadius: raios.md,
    alignItems: 'center',
    marginTop: espacos.sm,
  },
  botaoSalvarTexto: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
});