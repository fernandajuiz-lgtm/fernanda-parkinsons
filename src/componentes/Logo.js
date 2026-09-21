import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Texto from './Texto';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import { cores, fontes } from '../estilos/tema';

// Logo do Parkinson'sHelp — Tulipa + nome em serifada
export default function Logo({ tamanho = 64, mostrarTexto = false }) {
  const { ts } = useAcessibilidade();

  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../assets/logo.png')}
        style={{
          width: ts(tamanho),
          height: ts(tamanho),
          // Compensa o espaço em branco em volta do PNG da tulipa
          transform: [{ scale: 1.15 }],
        }}
        resizeMode="contain"
      />

      {mostrarTexto && (
       <Texto style={styles.texto}>
  Parkinson's{' '}
  <Texto style={styles.textoDestaque}>Help</Texto>
</Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  texto: {
    fontFamily: fontes.serifBold,
    fontSize: 28,
    color: cores.ink,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  textoDestaque: {
    color: cores.marca,
    fontSize: 30,
   letterSpacing: 0.3,
},
});