import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { Phone, User } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import { salvarContatoEmergencia } from '../servicos/armazenamento';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

export default function CadastrarContato({ navigation, route }) {
  const { ts } = useAcessibilidade();
  const contatoExistente = route.params?.contato || null;

  const [nome, setNome] = useState(contatoExistente?.nome || '');
  const [telefone, setTelefone] = useState(contatoExistente?.telefone || '');

  function formatarTelefone(texto) {
    const numeros = texto.replace(/[^0-9]/g, '').slice(0, 11);

    if (numeros.length <= 2) {
      setTelefone(numeros);
    } else if (numeros.length <= 6) {
      setTelefone(`(${numeros.slice(0, 2)}) ${numeros.slice(2)}`);
    } else if (numeros.length <= 10) {
      setTelefone(`(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`);
    } else {
      setTelefone(`(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`);
    }
  }

  async function salvar() {
    const nomeLimpo = nome.trim();
    const telNumeros = telefone.replace(/[^0-9]/g, '');

    if (!nomeLimpo) {
      Alert.alert('Falta o nome', 'Digite o nome do contato.');
      return;
    }
    if (telNumeros.length < 10) {
      Alert.alert('Telefone incompleto', 'Digite DDD + número.');
      return;
    }

    Keyboard.dismiss();

    await salvarContatoEmergencia({
      nome: nomeLimpo,
      telefone: telNumeros,
    });

    Alert.alert('Salvo!', `${nomeLimpo} é seu contato de emergência.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { padding: ts(espacos.md), paddingBottom: ts(espacos.xl) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Texto style={[styles.titulo, { marginBottom: ts(espacos.xs) }]}>
            Contato de emergência
          </Texto>
          <Texto style={[styles.subtitulo, { marginBottom: ts(espacos.lg) }]}>
            Quem você quer avisar se precisar de ajuda?
          </Texto>

          <Texto style={styles.label}>Nome</Texto>
          <View
            style={[
              styles.inputWrap,
              sombra,
              {
                marginBottom: ts(espacos.md),
                paddingHorizontal: ts(espacos.md),
              },
            ]}
          >
            <Icone Icone={User} tamanho={20} cor={cores.inkSuave} />
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Carlos (filho)"
              placeholderTextColor={cores.inkSuave}
              style={[
                styles.input,
                { fontSize: ts(tamanhos.corpo), paddingVertical: ts(espacos.sm) },
              ]}
              maxLength={40}
            />
          </View>

          <Texto style={styles.label}>Telefone</Texto>
          <View
            style={[
              styles.inputWrap,
              sombra,
              {
                marginBottom: ts(espacos.md),
                paddingHorizontal: ts(espacos.md),
              },
            ]}
          >
            <Icone Icone={Phone} tamanho={20} cor={cores.inkSuave} />
            <TextInput
              value={telefone}
              onChangeText={formatarTelefone}
              placeholder="(11) 98765-4321"
              placeholderTextColor={cores.inkSuave}
              keyboardType="phone-pad"
              style={[
                styles.input,
                { fontSize: ts(tamanhos.corpo), paddingVertical: ts(espacos.sm) },
              ]}
              maxLength={16}
            />
          </View>

          <Texto style={[styles.dica, { marginBottom: ts(espacos.lg) }]}>
            Use DDD + número. Ex: (11) 98765-4321.
          </Texto>

          <TouchableOpacity
            onPress={salvar}
            style={[styles.botao, sombra, { padding: ts(espacos.md) }]}
            activeOpacity={0.85}
          >
            <Texto style={styles.botaoTexto}>Salvar contato</Texto>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  label: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  input: {
    flex: 1,
    fontFamily: fontes.semiBold,
    color: cores.ink,
  },
  dica: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    fontStyle: 'italic',
  },
  botao: {
    backgroundColor: cores.marca,
    borderRadius: raios.md,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
});