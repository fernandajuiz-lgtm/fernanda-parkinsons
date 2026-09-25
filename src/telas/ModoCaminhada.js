import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Footprints, Square, AlertCircle } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import {
  iniciarVibracao,
  pararVibracao,
  RITMOS_DISPONIVEIS,
} from '../servicos/vibracao';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

// Tempo em segundos antes de avisar o usuário (2 minutos)
const AVISO_SEGUNDOS = 120;

export default function ModoCaminhada({ navigation }) {
  const { ts } = useAcessibilidade();
  const [rodando, setRodando] = useState(false);
  const [ritmo, setRitmo] = useState('normal');
  const [segundos, setSegundos] = useState(0);
  const [batidas, setBatidas] = useState(0);

  const timerRef = useRef(null);
  const avisouRef = useRef(false);

  // Limpa tudo ao sair da tela
  useEffect(() => {
    return () => {
      pararVibracao();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Aviso após 2 minutos
  useEffect(() => {
    if (segundos >= AVISO_SEGUNDOS && !avisouRef.current && rodando) {
      avisouRef.current = true;
      Alert.alert(
        'Você está vibrando há 2 minutos',
        'Quer continuar a caminhada ou parar?',
        [
          { text: 'Continuar', style: 'default' },
          { text: 'Parar', style: 'destructive', onPress: parar },
        ]
      );
    }
  }, [segundos, rodando]);

  function iniciar() {
    setSegundos(0);
    setBatidas(0);
    avisouRef.current = false;
    setRodando(true);

    iniciarVibracao(ritmo, () => setBatidas((b) => b + 1));

    timerRef.current = setInterval(() => {
      setSegundos((s) => s + 1);
    }, 1000);
  }

  function parar() {
    pararVibracao();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRodando(false);
  }

  function trocarRitmo(novoRitmo) {
    setRitmo(novoRitmo);
    // Se já está rodando, reinicia com o novo ritmo
    if (rodando) {
      iniciarVibracao(novoRitmo, () => setBatidas((b) => b + 1));
    }
  }

  function formatarTempo(s) {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min}:${String(seg).padStart(2, '0')}`;
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
          Modo caminhada
        </Texto>
        <Texto style={[styles.subtitulo, { marginBottom: ts(espacos.lg) }]}>
          {rodando
            ? 'Siga o ritmo das vibrações. Cada vibração é um passo.'
            : 'O celular vai vibrar em ritmo constante para ajudar você a andar.'}
        </Texto>

        {/* ----- CARD DE STATUS (só quando rodando) ----- */}
        {rodando && (
          <View
            style={[
              styles.cardStatus,
              sombra,
              {
                padding: ts(espacos.md),
                marginBottom: ts(espacos.md),
              },
            ]}
          >
            <Texto style={styles.statusLabel}>TEMPO</Texto>
            <Texto style={styles.statusTempo}>{formatarTempo(segundos)}</Texto>
            <Texto style={styles.statusBatidas}>{batidas} passos no ritmo</Texto>
          </View>
        )}

        {/* ----- SELETOR DE RITMO ----- */}
        <Texto style={styles.label}>Ritmo da vibração</Texto>
        <View style={[styles.ritmosWrap, { marginBottom: ts(espacos.lg) }]}>
          {Object.entries(RITMOS_DISPONIVEIS).map(([chave, valor]) => {
            const selecionado = ritmo === chave;
            return (
              <TouchableOpacity
                key={chave}
                onPress={() => trocarRitmo(chave)}
                style={[
                  styles.botaoRitmo,
                  sombra,
                  {
                    backgroundColor: selecionado ? cores.caminhada : cores.cartao,
                    borderColor: selecionado ? cores.caminhada : '#F0E8D5',
                    paddingVertical: ts(espacos.sm),
                    paddingHorizontal: ts(espacos.md),
                    marginRight: 8,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Texto
                  style={[
                    styles.botaoRitmoTexto,
                    { color: selecionado ? '#FFFFFF' : cores.ink },
                  ]}
                >
                  {valor.label}
                </Texto>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ----- BOTÃO PRINCIPAL ----- */}
        {!rodando ? (
          <TouchableOpacity
            onPress={iniciar}
            style={[
              styles.botaoIniciar,
              sombra,
              { padding: ts(espacos.xl) },
            ]}
            activeOpacity={0.85}
          >
            <Icone Icone={Footprints} tamanho={48} cor="#FFFFFF" strokeWidth={1.8} />
            <Texto style={styles.botaoIniciarTexto}>Iniciar caminhada</Texto>
            <Texto style={styles.botaoIniciarSub}>
              O celular vai vibrar em ritmo constante
            </Texto>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={parar}
            style={[
              styles.botaoParar,
              sombra,
              { padding: ts(espacos.lg) },
            ]}
            activeOpacity={0.85}
          >
            <Icone Icone={Square} tamanho={32} cor="#FFFFFF" strokeWidth={2} />
            <Texto style={styles.botaoPararTexto}>Parar caminhada</Texto>
          </TouchableOpacity>
        )}

        {/* ----- DICA ----- */}
        {rodando && (
          <View style={[styles.dicaWrap, { marginTop: ts(espacos.md) }]}>
            <Icone Icone={AlertCircle} tamanho={16} cor={cores.inkSuave} />
            <Texto style={styles.dica}>
              Se travou, respire fundo e tente dar um passo no ritmo da vibração.
            </Texto>
          </View>
        )}

        <Texto style={[styles.rodape, { marginTop: ts(espacos.lg) }]}>
          Técnica de cueing rítmico baseada em evidências clínicas. Não substitui fisioterapia.
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
  cardStatus: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: fontes.medium,
    fontSize: 11,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statusTempo: {
    fontFamily: fontes.serifBold,
    fontSize: 56,
    color: cores.caminhada,
    letterSpacing: -2,
    lineHeight: 60,
  },
  statusBatidas: {
    fontFamily: fontes.medium,
    fontSize: 14,
    color: cores.inkSuave,
  },
  label: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ritmosWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  botaoRitmo: {
    borderRadius: raios.pill,
    borderWidth: 1,
  },
  botaoRitmoTexto: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
  botaoIniciar: {
    backgroundColor: cores.caminhada,
    borderRadius: raios.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 220,
  },
  botaoIniciarTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.extraBold,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  botaoIniciarSub: {
    color: '#FFFFFF',
    fontFamily: fontes.regular,
    fontSize: 13,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  botaoParar: {
    backgroundColor: cores.sos,
    borderRadius: raios.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 140,
  },
  botaoPararTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.bold,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  dicaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dica: {
    fontFamily: fontes.regular,
    fontSize: 12,
    color: cores.inkSuave,
    textAlign: 'center',
  },
  rodape: {
    fontFamily: fontes.regular,
    fontSize: 11,
    color: cores.inkSuave,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
});