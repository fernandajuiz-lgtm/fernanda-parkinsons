import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Texto from './Texto';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

export default function BotaoGrande({
  titulo,
  subtitulo,
  emoji,
  corPrincipal,
  corSuave,
  onPress,
}) {
  const { ts } = useAcessibilidade();

  async function aoTocar() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    if (onPress) onPress();
  }

  const tamanhoChip = ts(56);
  const tamanhoEmoji = ts(30);
  const alturaMinima = ts(190);

  return (
    <TouchableOpacity
      style={[styles.cartao, sombra, { minHeight: alturaMinima }]}
      onPress={aoTocar}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View
        style={[
          styles.chip,
          {
            backgroundColor: corSuave,
            width: tamanhoChip,
            height: tamanhoChip,
            borderRadius: ts(18),
          },
        ]}
      >
        <Texto style={{ fontSize: tamanhoEmoji }}>{emoji}</Texto>
      </View>

      <Texto style={styles.titulo} numberOfLines={2}>
        {titulo}
      </Texto>

      {subtitulo ? (
        <Texto style={[styles.subtitulo, { color: corPrincipal }]} numberOfLines={1}>
          {subtitulo}
        </Texto>
      ) : null}

      <View style={[styles.barra, { backgroundColor: corPrincipal }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: raios.lg,
    padding: espacos.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontFamily: fontes.bold,
    fontSize: tamanhos.subtitulo,
    color: cores.ink,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  subtitulo: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
  },
  barra: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 5,
    width: '100%',
  },
});