import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Trash2, Check, Clock } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import {
  lerMedicamentos,
  salvarMedicamentos,
  lerRegistros,
  salvarRegistros,
  gerarId,
} from '../servicos/armazenamento';
import { reagendarTodas } from '../servicos/notificacoes';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

export default function Medicamentos({ navigation }) {
  const { ts } = useAcessibilidade();
  const [medicamentos, setMedicamentos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        const lista = await lerMedicamentos();
        if (ativo) setMedicamentos(lista);
      })();
      return () => {
        ativo = false;
      };
    }, [])
  );

  async function marcarComoTomado(med) {
    const agora = new Date().toISOString();
    const registros = await lerRegistros();
    const novoRegistro = {
      id: gerarId(),
      medicamentoId: med.id,
      medicamentoNome: med.nome,
      dose: med.dose,
      horarioTomado: agora,
    };
    await salvarRegistros([novoRegistro, ...registros]);

    Alert.alert(
      'Remédio registrado',
      `${med.nome} ${med.dose} foi registrado às ${new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}.`
    );
  }

  function confirmarExclusao(med) {
    Alert.alert(
      'Excluir medicamento',
      `Tem certeza que quer excluir "${med.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
                    onPress: async () => {
            const novaLista = medicamentos.filter((m) => m.id !== med.id);
            await salvarMedicamentos(novaLista);
            await reagendarTodas(novaLista);
            setMedicamentos(novaLista);
          },
        },
      ]
    );
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
        <Texto style={[styles.titulo, { marginBottom: ts(espacos.sm) }]}>
          Meus remédios
        </Texto>
        <Texto style={[styles.subtitulo, { marginBottom: ts(espacos.lg) }]}>
          {medicamentos.length === 0
            ? 'Você ainda não cadastrou nenhum remédio.'
            : `${medicamentos.length} remédio${medicamentos.length > 1 ? 's' : ''} cadastrado${medicamentos.length > 1 ? 's' : ''}.`}
        </Texto>

        {medicamentos.map((med) => (
          <View
            key={med.id}
            style={[
              styles.card,
              sombra,
              { padding: ts(espacos.md), marginBottom: ts(espacos.md) },
            ]}
          >
            <View style={styles.cardTopo}>
              <View style={{ flex: 1 }}>
                <Texto style={styles.cardNome}>{med.nome}</Texto>
                <Texto style={styles.cardDose}>{med.dose}</Texto>

                <View style={[styles.linhaHorarios, { marginTop: ts(espacos.xs) }]}>
                  <Icone Icone={Clock} tamanho={14} cor={cores.inkSuave} />
                  <Texto style={styles.cardHorarios}>
                    {med.horarios.join('  ·  ')}
                  </Texto>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => confirmarExclusao(med)}
                style={styles.lixeira}
                accessibilityLabel="Excluir"
              >
                <Icone Icone={Trash2} tamanho={20} cor={cores.inkSuave} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => marcarComoTomado(med)}
              style={[
                styles.botaoTomar,
                { padding: ts(espacos.sm), marginTop: ts(espacos.md) },
              ]}
              activeOpacity={0.85}
            >
              <Icone Icone={Check} tamanho={20} cor="#FFFFFF" strokeWidth={2.2} />
              <Texto style={styles.botaoTomarTexto}>Tomei agora</Texto>
            </TouchableOpacity>
          </View>
        ))}
     
        <TouchableOpacity
          onPress={() => navigation.navigate('CadastrarMedicamento')}
          style={[
            styles.botaoAdicionar,
            sombra,
            { padding: ts(espacos.md), marginTop: ts(espacos.sm) },
          ]}
          activeOpacity={0.85}
        >
          <Icone Icone={Plus} tamanho={22} cor="#FFFFFF" strokeWidth={2.2} />
          <Texto style={styles.botaoAdicionarTexto}>Cadastrar remédio</Texto>
        </TouchableOpacity>
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
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardNome: {
    fontFamily: fontes.serifSemiBold,
    fontSize: 26,
    color: cores.ink,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  cardDose: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
    color: cores.medicamento,
    marginTop: 2,
  },
  linhaHorarios: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHorarios: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
  },
  lixeira: {
    padding: 6,
  },
  botaoTomar: {
    backgroundColor: cores.medicamento,
    borderRadius: raios.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoTomarTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
  botaoAdicionar: {
    backgroundColor: cores.marca,
    borderRadius: raios.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoAdicionarTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
});