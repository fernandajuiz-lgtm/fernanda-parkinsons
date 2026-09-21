import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Siren, Phone, User, MapPin, Edit } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import {
  lerContatoEmergencia,
  salvarAlertas,
  lerAlertas,
  gerarId,
} from '../servicos/armazenamento';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

export default function SOS({ navigation }) {
  const { ts } = useAcessibilidade();
  const [contato, setContato] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        const c = await lerContatoEmergencia();
        if (ativo) setContato(c);
      })();
      return () => {
        ativo = false;
      };
    }, [])
  );

  async function dispararAlerta() {
    if (!contato) {
      Alert.alert(
        'Sem contato cadastrado',
        'Cadastre um contato de emergência antes de enviar alertas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cadastrar',
            onPress: () => navigation.navigate('CadastrarContato'),
          },
        ]
      );
      return;
    }

    setEnviando(true);

    try {
      // 1. Pede permissão de localização
      const { status } = await Location.requestForegroundPermissionsAsync();

      let localizacao = null;
      let linkMapa = '';

      if (status === 'granted') {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          localizacao = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          linkMapa = `https://maps.google.com/?q=${localizacao.lat},${localizacao.lng}`;
        } catch (e) {
          console.error('Erro ao pegar GPS:', e);
        }
      }

      // 2. Monta a mensagem
      const agora = new Date().toLocaleString('pt-BR');
      let mensagem = `🚨 ALERTA - Parkinson's Help\n\nPreciso de ajuda. Este é um alerta automático enviado por ${contato.nome ? 'mim' : 'um usuário'}.\n\nData/hora: ${agora}`;

      if (linkMapa) {
        mensagem += `\n\nMinha localização:\n${linkMapa}`;
      } else {
        mensagem += `\n\n(localização não disponível)`;
      }

      // 3. Salva no histórico
      const alertas = await lerAlertas();
      const novoAlerta = {
        id: gerarId(),
        data: new Date().toISOString(),
        contatoNome: contato.nome,
        contatoTelefone: contato.telefone,
        localizacao,
      };
      await salvarAlertas([novoAlerta, ...alertas]);

      // 4. Abre o SMS pré-preenchido
      const separador = Platform.OS === 'ios' ? '&' : '?';
      const url = `sms:${contato.telefone}${separador}body=${encodeURIComponent(mensagem)}`;

      const suportado = await Linking.canOpenURL(url);
      if (!suportado) {
        Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mensagens.');
        setEnviando(false);
        return;
      }

      await Linking.openURL(url);
      setEnviando(false);
    } catch (e) {
      console.error('Erro ao disparar alerta:', e);
      Alert.alert('Erro', 'Não foi possível enviar o alerta. Tente novamente.');
      setEnviando(false);
    }
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
          Emergência
        </Texto>
        <Texto style={[styles.subtitulo, { marginBottom: ts(espacos.lg) }]}>
          Toque no botão para avisar seu contato com sua localização.
        </Texto>

        {/* CARD DO CONTATO */}
        {contato ? (
          <View style={[styles.card, sombra, { padding: ts(espacos.md), marginBottom: ts(espacos.lg) }]}>
            <View style={styles.linhaTopo}>
              <View style={[styles.chip, { backgroundColor: cores.sosSuave }]}>
                <Icone Icone={User} tamanho={22} cor={cores.sos} />
              </View>
              <View style={{ flex: 1 }}>
                <Texto style={styles.contatoLabel}>Contato de emergência</Texto>
                <Texto style={styles.contatoNome}>{contato.nome}</Texto>
                <View style={styles.linhaTel}>
                  <Icone Icone={Phone} tamanho={14} cor={cores.inkSuave} />
                  <Texto style={styles.contatoTel}>{contato.telefone}</Texto>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('CadastrarContato', { contato })}
                style={styles.editar}
                accessibilityLabel="Editar contato"
              >
                <Icone Icone={Edit} tamanho={20} cor={cores.inkSuave} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('CadastrarContato')}
            style={[styles.cardVazio, sombra, { padding: ts(espacos.md), marginBottom: ts(espacos.lg) }]}
            activeOpacity={0.85}
          >
            <Icone Icone={Phone} tamanho={28} cor={cores.marca} />
            <Texto style={styles.cardVazioTexto}>
              Cadastrar contato de emergência
            </Texto>
          </TouchableOpacity>
        )}

        {/* BOTÃO GIGANTE DE SOS */}
        <TouchableOpacity
          onPress={dispararAlerta}
          disabled={enviando}
          style={[
            styles.botaoSOS,
            sombra,
            {
              padding: ts(espacos.xl),
              opacity: enviando ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.85}
        >
          {enviando ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Texto style={styles.botaoSOSTexto}>Enviando alerta...</Texto>
            </>
          ) : (
            <>
              <Icone Icone={Siren} tamanho={64} cor="#FFFFFF" strokeWidth={1.8} />
              <Texto style={styles.botaoSOSTexto}>Enviar alerta</Texto>
              <Texto style={styles.botaoSOSSub}>
                Abrir SMS com sua localização
              </Texto>
            </>
          )}
        </TouchableOpacity>

        <View style={[styles.avisoWrap, { marginTop: ts(espacos.md) }]}>
          <Icone Icone={MapPin} tamanho={16} cor={cores.inkSuave} />
          <Texto style={styles.aviso}>
            Sua localização é enviada apenas se você autorizar.
          </Texto>
        </View>

        <Texto style={[styles.rodape, { marginTop: ts(espacos.lg) }]}>
          Este alerta não substitui uma ligação para emergência (192 ou 193).
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
  },
  card: {
    backgroundColor: cores.cartao,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chip: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contatoLabel: {
    fontFamily: fontes.medium,
    fontSize: 11,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  contatoNome: {
    fontFamily: fontes.serifSemiBold,
    fontSize: 22,
    color: cores.ink,
    letterSpacing: -0.3,
    marginTop: -1,
  },
  linhaTel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  contatoTel: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
  },
  editar: {
    padding: 6,
  },
  cardVazio: {
    backgroundColor: cores.cartao,
    borderRadius: raios.lg,
    borderWidth: 2,
    borderColor: cores.marca,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
  },
  cardVazioTexto: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
    color: cores.marca,
  },
  botaoSOS: {
    backgroundColor: cores.sos,
    borderRadius: raios.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 240,
  },
  botaoSOSTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.extraBold,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  botaoSOSSub: {
    color: '#FFFFFF',
    fontFamily: fontes.regular,
    fontSize: 14,
    opacity: 0.9,
  },
  avisoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  aviso: {
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