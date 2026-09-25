import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Pill, ClipboardList, Siren, BarChart3, Settings, Activity, Footprints } from 'lucide-react-native';

import Logo from '../componentes/Logo';
import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import { lerUsuario } from '../servicos/armazenamento';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Cartão de ação reutilizável — usa ícone real em vez de emoji
function CartaoAcao({ IconeLucide, titulo, subtitulo, cor, corSuave, onPress, ts }) {
  return (
    <TouchableOpacity
      style={[styles.cartao, sombra, { padding: ts(espacos.md), minHeight: ts(180) }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View
        style={[
          styles.chipIcone,
          {
            backgroundColor: corSuave,
            width: ts(52),
            height: ts(52),
            borderRadius: ts(16),
          },
        ]}
      >
        <Icone Icone={IconeLucide} tamanho={26} cor={cor} strokeWidth={1.8} />
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Texto style={styles.cartaoTitulo} numberOfLines={2}>
          {titulo}
        </Texto>
        <Texto style={[styles.cartaoSubtitulo, { color: cor }]} numberOfLines={1}>
          {subtitulo}
        </Texto>
      </View>
    </TouchableOpacity>
  );
}

export default function Principal({ navigation }) {
  const { ts } = useAcessibilidade();
  const [nome, setNome] = useState('');

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        const u = await lerUsuario();
        if (ativo && u?.nome) setNome(u.nome);
      })();
      return () => {
        ativo = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { padding: ts(espacos.md), paddingBottom: ts(espacos.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.cabecalho, { marginBottom: ts(espacos.lg) }]}>
        <Logo tamanho={89} mostrarTexto />
        </View>

        <View style={[styles.hero, { marginBottom: ts(espacos.lg) }]}>
          <Texto style={styles.heroSaudacao}>{saudacao()},</Texto>
          <Texto style={styles.heroNome}>{nome || 'visitante'}</Texto>
          <Texto style={styles.heroTexto}>Como você está se sentindo hoje?</Texto>
        </View>

        <View style={[styles.grade, { gap: ts(espacos.md) }]}>
          <View style={[styles.linha, { gap: ts(espacos.md) }]}>
            <CartaoAcao
              IconeLucide={Pill}
              titulo="Tomar remédio"
              subtitulo="Próximo: 14:00"
              cor={cores.medicamento}
              corSuave={cores.medicamentoSuave}
              onPress={() => navigation.navigate('Medicamentos')}
              ts={ts}
            />
            <CartaoAcao
              IconeLucide={ClipboardList}
              titulo="Registrar sintoma"
              subtitulo="Leva 20 segundos"
              cor={cores.sintoma}
              corSuave={cores.sintomaSuave}
              onPress={() => navigation.navigate('RegistrarSintoma')}
              ts={ts}
            />
          </View>

          <View style={[styles.linha, { gap: ts(espacos.md) }]}>
            <CartaoAcao
              IconeLucide={Siren}
              titulo="Preciso de ajuda"
              subtitulo="Enviar alerta"
              cor={cores.sos}
              corSuave={cores.sosSuave}
              onPress={() => navigation.navigate('SOS')}
              ts={ts}
            />
            <CartaoAcao
              IconeLucide={BarChart3}
              titulo="Meu histórico"
              subtitulo="Ver relatórios"
              cor={cores.historico}
              corSuave={cores.historicoSuave}
              onPress={() => navigation.navigate('Historico')}
              ts={ts}
            />
          </View>
                    <View style={[styles.linha, { gap: ts(espacos.md) }]}>
                       <CartaoAcao
              IconeLucide={Activity}
              titulo="Medir tremor"
              subtitulo="Usar sensores"
              cor={cores.sintoma}
              corSuave={cores.sintomaSuave}
              onPress={() => navigation.navigate('MedirTremor')}
              ts={ts}
            />
            <CartaoAcao
              IconeLucide={Footprints}
              titulo="Ajuda pra andar"
              subtitulo="Modo caminhada"
              cor={cores.caminhada}
              corSuave={cores.caminhadaSuave}
              onPress={() => navigation.navigate('ModoCaminhada')}
              ts={ts}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Acessibilidade')}
          style={[styles.ajuste, { marginTop: ts(espacos.lg) }]}
        >
          <Icone Icone={Settings} tamanho={18} cor={cores.marca} />
          <Texto style={styles.ajusteTexto}>Ajustar acessibilidade</Texto>
        </TouchableOpacity>

        <Texto style={[styles.rodape, { marginTop: ts(espacos.md) }]}>
          Em caso de emergência, toque em "Preciso de ajuda".
        </Texto>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.papel },
  container: { flexGrow: 1 },
  cabecalho: { marginTop: espacos.sm },
  hero: {},
  heroSaudacao: {
    fontFamily: fontes.serifRegular,
    fontSize: tamanhos.subtitulo,
    color: cores.inkSuave,
  },
  heroNome: {
    fontFamily: fontes.serifBold,
    fontSize: tamanhos.hero,
    color: cores.ink,
    letterSpacing: -1,
    marginTop: -4,
    lineHeight: 48,
  },
  heroTexto: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.corpo,
    color: cores.inkSuave,
    marginTop: espacos.xs,
  },
  grade: {},
  linha: { flexDirection: 'row' },
  cartao: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: raios.lg,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  chipIcone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartaoTitulo: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
    color: cores.ink,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  cartaoSubtitulo: {
    fontFamily: fontes.medium,
    fontSize: 12,
    marginTop: 2,
  },
  ajuste: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ajusteTexto: {
    color: cores.marca,
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
  },
  rodape: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    textAlign: 'center',
    opacity: 0.6,
  },
});