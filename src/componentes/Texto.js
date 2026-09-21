import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useAcessibilidade } from '../contexto/Acessibilidade';

// <Texto> — substituto acessível do <Text>.
// Escala automaticamente o fontSize.
export default function Texto({ style, tamanho, children, ...props }) {
  const { ts } = useAcessibilidade();

  const flat = StyleSheet.flatten(style) || {};
  const tamanhoBase = tamanho ?? flat.fontSize ?? 16;
  const tamanhoFinal = ts(tamanhoBase);

  return (
    <RNText
      allowFontScaling={false}
      {...props}
      style={[style, { fontSize: tamanhoFinal }]}
    >
      {children}
    </RNText>
  );
}