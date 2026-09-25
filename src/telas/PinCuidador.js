import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Delete, ShieldCheck, UserCog } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import {
  salvarPin,
  validarPin,
  temPin,
} from '../servicos/cuidador';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

export default function PinCuidador({ navigation }) {
  const { ts } = useAcessibilidade();
  const [criando, setCriando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [pin, setPin] = useState('');
  const [confirmacao, setConfirmacao] = useState(null); // usado só ao criar

  useEffect(() => {
    (async () => {
      const existe = await temPin();
      setCriando(!existe);
      setCarregando(false);
    })();
  }, []);

  function digitar(numero) {
    if (pin.length >= 4) return;
    const novo = pin + numero;
    setPin(novo);

    // Quando completa 4 dígitos
    if (novo.length === 4) {
      setTimeout(() => finalizar(novo), 200);
    }
  }

  function apagar() {
    setPin(pin.slice(0, -1));
  }

  async function finalizar(pinDigitado) {
    if (criando) {
      // Primeira vez: precisa confirmar
      if (confirmacao === null) {
        setConfirmacao(pinDigitado);
        setPin('');
        return;
      }

      // Segunda vez: compara
      if (confirmacao !== pinDigitado) {
        Alert.alert('PINs diferentes', 'Tente de novo.');
        setPin('');
        setConfirmacao(null);
        return;
      }

      // Salvou
      await salvarPin(pinDigitado);
      navigation.replace('PainelCuidador');
      return;
    }

    // Já existe: valida
    const ok = await validarPin(pinDigitado);
    if (ok) {
      navigation.replace('PainelCuidador');
    } else {
      Alert.alert('PIN incorreto', 'Tente novamente.');
      setPin('');
    }
  }

  if (carregando) return null;

  const titulo = criando
    ? confirmacao === null
      ? 'Crie um PIN de 4 dígitos'
      : 'Confirme o PIN'
    : 'Digite o PIN';
  const subtitulo = criando
    ? confirmacao === null
      ? 'Este PIN será usado para acessar o painel do cuidador.'
      : 'Digite o mesmo PIN novamente.'
    : 'Acesso restrito ao cuidador.';

  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={[
          styles.container,
          { padding: ts(espacos.lg) },
        ]}
      >
        <View style={{ alignItems: 'center', marginBottom: ts(espacos.lg) }}>
          <View
            style={[
              styles.chipIcone,
              {
                backgroundColor: cores.historicoSuave,
                width: ts(80),
                height: ts(80),
                borderRadius: ts(24),
                marginBottom: ts(espacos.md),
              },
            ]}
          >
            <Icone Icone={UserCog} tamanho={40} cor={cores.historico} />
          </View>
          <Texto style={[styles.titulo, { marginBottom: ts(espacos.xs) }]}>
            {titulo}
          </Texto>
                    <Texto style={[styles.subtitulo, { paddingHorizontal: ts(espacos.md) }]}>
            {subtitulo}
          </Texto>
        </View>

        {/* Bolinhas do PIN */}
        <View style={[styles.bolinhasWrap, { marginBottom: ts(espacos.lg) }]}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.bolinha,
                {
                  width: ts(22),
                  height: ts(22),
                  borderRadius: ts(11),
                  backgroundColor: i < pin.length ? cores.marca : 'transparent',
                  borderColor: i < pin.length ? cores.marca : cores.inkSuave,
                },
              ]}
            />
          ))}
        </View>

        {/* Teclado numérico */}
        <View style={styles.teclado}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['vazio', '0', 'back'],
          ].map((linha, i) => (
            <View key={i} style={styles.linhaTeclado}>
              {linha.map((tecla, j) => {
                if (tecla === 'vazio') {
                  return <View key={j} style={styles.tecla} />;
                }
                if (tecla === 'back') {
                  return (
                    <TouchableOpacity
                      key={j}
                      onPress={apagar}
                      style={styles.tecla}
                      activeOpacity={0.7}
                    >
                      <Icone Icone={Delete} tamanho={28} cor={cores.ink} />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={j}
                    onPress={() => digitar(tecla)}
                    style={[
                      styles.tecla,
                      styles.teclaNumero,
                      sombra,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Texto style={styles.teclaNumeroTexto}>{tecla}</Texto>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Rodapé */}
        <View style={[styles.rodapeWrap, { marginTop: ts(espacos.lg) }]}>
          <Icone Icone={ShieldCheck} tamanho={14} cor={cores.inkSuave} />
          <Texto style={styles.rodape}>
            O PIN fica salvo apenas neste celular.
          </Texto>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.papel },
  container: { flex: 1, justifyContent: 'center' },
  chipIcone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontFamily: fontes.serifBold,
    fontSize: 28,
    color: cores.ink,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.corpo,
    color: cores.inkSuave,
    textAlign: 'center',
    
  },
  bolinhasWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  bolinha: {
    borderWidth: 2,
  },
  teclado: {
    marginTop: 8,
  },
  linhaTeclado: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tecla: {
    width: 76,
    height: 76,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teclaNumero: {
    backgroundColor: cores.cartao,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  teclaNumeroTexto: {
    fontFamily: fontes.extraBold,
    fontSize: 32,
    color: cores.ink,
  },
  rodapeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rodape: {
    fontFamily: fontes.regular,
    fontSize: 12,
    color: cores.inkSuave,
    fontStyle: 'italic',
  },
});