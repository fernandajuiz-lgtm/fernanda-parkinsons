import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Logo from '../componentes/Logo';
import Texto from '../componentes/Texto';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import { salvarUsuario } from '../servicos/armazenamento';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

// Primeira tela que o usuário vê.
// Pergunta o nome e salva no armazenamento do celular.
export default function BemVindo({ navigation }) {
  const { ts } = useAcessibilidade();
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function continuar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    setSalvando(true);
    const ok = await salvarUsuario({
      nome: nomeLimpo,
      criadoEm: new Date().toISOString(),
    });
    setSalvando(false);

    if (ok) {
      navigation.replace('Principal');
    }
  }

  const podeContinuar = nome.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { padding: ts(espacos.lg) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: ts(espacos.lg) }}>
            <Logo tamanho={64} mostrarTexto />
          </View>

          <Texto style={[styles.titulo, { marginBottom: ts(espacos.sm) }]}>
            Bem-vinda(o) 
          </Texto>

          <Texto style={[styles.subtitulo, { marginBottom: ts(espacos.xl) }]}>
            Como você gostaria de ser chamada(o)?
          </Texto>

          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            placeholderTextColor={cores.inkSuave}
            style={[
              styles.input,
              sombra,
              { fontSize: ts(tamanhos.subtitulo), padding: ts(espacos.md) },
            ]}
            autoFocus
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={continuar}
          />

          <TouchableOpacity
            onPress={continuar}
            disabled={!podeContinuar || salvando}
            style={[
              styles.botao,
              sombra,
              {
                backgroundColor: podeContinuar ? cores.marca : cores.linha,
                padding: ts(espacos.md),
                marginTop: ts(espacos.lg),
              },
            ]}
          >
            <Texto
              style={[
                styles.botaoTexto,
                { color: podeContinuar ? '#FFFFFF' : cores.inkSuave },
              ]}
            >
              {salvando ? 'Salvando...' : 'Continuar →'}
            </Texto>
          </TouchableOpacity>

          <Texto style={[styles.rodape, { marginTop: ts(espacos.lg) }]}>
            Seu nome fica salvo apenas no seu celular.
          </Texto>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.papel },
  container: { flexGrow: 1, justifyContent: 'center' },
  titulo: {
    fontFamily: fontes.extraBold,
    fontSize: tamanhos.hero,
    color: cores.ink,
    letterSpacing: -1,
  },
  subtitulo: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.corpo,
    color: cores.inkSuave,
  },
  input: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    fontFamily: fontes.semiBold,
    color: cores.ink,
  },
  botao: {
    borderRadius: raios.md,
    alignItems: 'center',
  },
  botaoTexto: {
    fontFamily: fontes.bold,
    fontSize: tamanhos.corpo,
  },
  rodape: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    textAlign: 'center',
    opacity: 0.7,
  },
});