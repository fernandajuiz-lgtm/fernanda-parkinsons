import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Texto from '../componentes/Texto';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

export default function Acessibilidade({ navigation }) {
  const { escala, preferencia, setPreferencia, fontScaleSistema, ts } = useAcessibilidade();

  const opcoes = [
    { label: 'Padrão', valor: 1 },
    { label: 'Grande', valor: 1.15 },
    { label: 'Muito grande', valor: 1.3 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.container, { padding: ts(espacos.lg) }]}>
        <Texto style={styles.titulo}>Acessibilidade</Texto>

        <View style={[styles.info, sombra, { padding: ts(espacos.md) }]}>
          <Texto style={styles.infoLabel}>Configuração do seu celular</Texto>
          <Texto style={styles.infoValor}>{Math.round(fontScaleSistema * 100)}%</Texto>
        </View>

        <View style={[styles.info, sombra, { padding: ts(espacos.md) }]}>
          <Texto style={styles.infoLabel}>Escala aplicada no app</Texto>
          <Texto style={styles.infoValor}>{Math.round(escala * 100)}%</Texto>
        </View>

        <Texto style={[styles.secao, { marginTop: ts(espacos.lg) }]}>Ajuste fino</Texto>

        {opcoes.map((op) => (
          <TouchableOpacity
            key={op.label}
            style={[
              styles.opcao,
              sombra,
              preferencia === op.valor && styles.opcaoAtiva,
              { padding: ts(espacos.md), marginBottom: ts(espacos.sm) },
            ]}
            onPress={() => setPreferencia(op.valor)}
          >
            <Texto
              style={[
                styles.opcaoTexto,
                preferencia === op.valor && styles.opcaoTextoAtivo,
              ]}
            >
              {op.label}
            </Texto>
          </TouchableOpacity>
        ))}

        <View style={[styles.amostra, sombra, { padding: ts(espacos.md), marginTop: ts(espacos.lg) }]}>
          <Texto style={styles.amostraTitulo}>Pré-visualização</Texto>
          <Texto style={styles.amostraTexto}>
            Este é o tamanho que os textos do app vão aparecer.
          </Texto>
        </View>

        <TouchableOpacity
          style={[styles.voltar, sombra, { padding: ts(16), marginTop: ts(espacos.xl) }]}
          onPress={() => navigation.goBack()}
        >
          <Texto style={styles.voltarTexto}>← Voltar</Texto>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.papel },
  container: {},
  titulo: {
    fontFamily: fontes.extraBold,
    fontSize: tamanhos.titulo,
    color: cores.ink,
    letterSpacing: -0.5,
    marginBottom: espacos.md,
  },
  info: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    marginBottom: espacos.sm,
  },
  infoLabel: {
    fontFamily: fontes.medium,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
  },
  infoValor: {
    fontFamily: fontes.extraBold,
    fontSize: tamanhos.titulo,
    color: cores.marca,
  },
  secao: {
    fontFamily: fontes.bold,
    fontSize: tamanhos.subtitulo,
    color: cores.ink,
    marginBottom: espacos.sm,
  },
  opcao: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    alignItems: 'center',
  },
  opcaoAtiva: { backgroundColor: cores.marca },
  opcaoTexto: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
    color: cores.ink,
  },
  opcaoTextoAtivo: { color: '#FFFFFF' },
  amostra: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
  },
  amostraTitulo: {
    fontFamily: fontes.bold,
    fontSize: tamanhos.subtitulo,
    color: cores.ink,
    marginBottom: espacos.xs,
  },
  amostraTexto: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.corpo,
    color: cores.inkSuave,
  },
  voltar: {
    backgroundColor: cores.ink,
    borderRadius: raios.md,
    alignItems: 'center',
  },
  voltarTexto: { color: '#FFFFFF', fontFamily: fontes.semiBold, fontSize: tamanhos.corpo },
});