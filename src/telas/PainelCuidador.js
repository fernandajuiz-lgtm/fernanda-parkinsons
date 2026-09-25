import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  User,
  Pill,
  Activity,
  Siren,
  FileText,
  LogOut,
  TrendingUp,
  Heart,
} from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import {
  lerUsuario,
  lerMedicamentos,
  lerRegistros,
  lerSintomas,
  lerAlertas,
  lerTremores,
} from '../servicos/armazenamento';
import { gerarCompartilharPDF } from '../servicos/pdf';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

function formatarDataHora(iso) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ehHoje(iso) {
  const d = new Date(iso);
  const hoje = new Date();
  return (
    d.getDate() === hoje.getDate() &&
    d.getMonth() === hoje.getMonth() &&
    d.getFullYear() === hoje.getFullYear()
  );
}

export default function PainelCuidador({ navigation }) {
  const { ts } = useAcessibilidade();
  const [dados, setDados] = useState(null);
  const [gerando, setGerando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        const [usuario, medicamentos, registros, sintomas, alertas, tremores] =
          await Promise.all([
            lerUsuario(),
            lerMedicamentos(),
            lerRegistros(),
            lerSintomas(),
            lerAlertas(),
            lerTremores(),
          ]);
        if (ativo) {
          setDados({ usuario, medicamentos, registros, sintomas, alertas, tremores });
        }
      })();
      return () => {
        ativo = false;
      };
    }, [])
  );

  if (!dados) return null;

  const { usuario, medicamentos, registros, sintomas, alertas, tremores } = dados;

  const tomadosHoje = registros.filter((r) => ehHoje(r.horarioTomado)).length;
  const sintomasHoje = sintomas.filter((s) => ehHoje(s.data)).length;
  const ultimoAlerta = alertas[0] || null;
  const ultimaMedicaoTremor = tremores[0] || null;

  async function compartilhar() {
    setGerando(true);
    const resultado = await gerarCompartilharPDF({
      usuario,
      registros: registros.slice(0, 30),
      sintomas: sintomas.slice(0, 30),
      periodoLabel: '30 dias',
    });
    setGerando(false);
    if (!resultado.ok) {
      Alert.alert('Erro ao gerar PDF', resultado.erro || 'Tente novamente.');
    }
  }

  function sair() {
    Alert.alert('Sair do modo cuidador', 'Voltar para a tela principal?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => navigation.replace('Principal'),
      },
    ]);
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
        {/* Cabeçalho */}
        <View style={[styles.cabecalho, { marginBottom: ts(espacos.lg) }]}>
          <View style={{ flex: 1 }}>
            <Texto style={styles.labelTopo}>PAINEL DO CUIDADOR</Texto>
            <Texto style={styles.titulo}>
              {usuario?.nome || 'Paciente'}
            </Texto>
          </View>
          <TouchableOpacity
            onPress={sair}
            style={[styles.botaoSair, sombra, { padding: ts(espacos.sm) }]}
            activeOpacity={0.8}
          >
            <Icone Icone={LogOut} tamanho={18} cor={cores.marca} />
          </TouchableOpacity>
        </View>

        {/* Resumo do dia */}
        <Texto style={styles.secaoTitulo}>Hoje</Texto>
        <View style={[styles.resumo, { marginBottom: ts(espacos.lg) }]}>
          <View style={[styles.resumoCard, sombra, { padding: ts(espacos.md) }]}>
            <Icone Icone={Pill} tamanho={22} cor={cores.medicamento} />
            <Texto style={styles.resumoNumero}>{tomadosHoje}</Texto>
            <Texto style={styles.resumoLabel}>Remédios</Texto>
          </View>
          <View style={[styles.resumoCard, sombra, { padding: ts(espacos.md) }]}>
            <Icone Icone={Activity} tamanho={22} cor={cores.sintoma} />
            <Texto style={styles.resumoNumero}>{sintomasHoje}</Texto>
            <Texto style={styles.resumoLabel}>Sintomas</Texto>
          </View>
        </View>

        {/* Último alerta SOS */}
        <Texto style={styles.secaoTitulo}>Último alerta SOS</Texto>
        {ultimoAlerta ? (
          <View
            style={[
              styles.cardAlerta,
              sombra,
              { padding: ts(espacos.md), marginBottom: ts(espacos.lg) },
            ]}
          >
            <View style={styles.linhaAlertaTopo}>
              <Icone Icone={Siren} tamanho={20} cor={cores.sos} />
              <Texto style={styles.alertaTitulo}>
                {formatarDataHora(ultimoAlerta.data)}
              </Texto>
            </View>
            <Texto style={styles.alertaDetalhe}>
              Avisou: {ultimoAlerta.contatoNome} ({ultimoAlerta.contatoTelefone})
            </Texto>
            {ultimoAlerta.localizacao ? (
              <Texto style={[styles.alertaMapa, { marginTop: ts(espacos.xs) }]}>
                Localização registrada
              </Texto>
            ) : null}
          </View>
        ) : (
          <View
            style={[
              styles.vazio,
              sombra,
              { padding: ts(espacos.md), marginBottom: ts(espacos.lg) },
            ]}
          >
            <Texto style={styles.vazioTexto}>
              Nenhum alerta disparado até agora.
            </Texto>
          </View>
        )}

        {/* Última medição de tremor */}
        <Texto style={styles.secaoTitulo}>Última medição de tremor</Texto>
        {ultimaMedicaoTremor ? (
          <View
            style={[
              styles.card,
              sombra,
              { padding: ts(espacos.md), marginBottom: ts(espacos.lg) },
            ]}
          >
            <View style={styles.linhaTopo}>
              <Icone Icone={TrendingUp} tamanho={20} cor={cores.sintoma} />
              <Texto style={styles.cardTitulo}>
                Nível: {ultimaMedicaoTremor.nivel}/4
              </Texto>
            </View>
            <Texto style={styles.cardDetalhe}>
              {formatarDataHora(ultimaMedicaoTremor.data)} · {ultimaMedicaoTremor.duracao}s
            </Texto>
          </View>
        ) : (
          <View
            style={[
              styles.vazio,
              sombra,
              { padding: ts(espacos.md), marginBottom: ts(espacos.lg) },
            ]}
          >
            <Texto style={styles.vazioTexto}>
              Nenhuma medição registrada.
            </Texto>
          </View>
        )}

        {/* Medicamentos ativos */}
        <Texto style={styles.secaoTitulo}>Medicamentos ativos</Texto>
        {medicamentos.length > 0 ? (
          medicamentos.map((m) => (
            <View
              key={m.id}
              style={[
                styles.card,
                sombra,
                { padding: ts(espacos.md), marginBottom: ts(espacos.sm) },
              ]}
            >
              <View style={styles.linhaTopo}>
                <Icone Icone={Pill} tamanho={18} cor={cores.medicamento} />
                <Texto style={styles.cardTitulo}>{m.nome}</Texto>
              </View>
              <Texto style={styles.cardDetalhe}>
                {m.dose} · {m.horarios.join(' · ')}
              </Texto>
            </View>
          ))
        ) : (
          <View
            style={[
              styles.vazio,
              sombra,
              { padding: ts(espacos.md), marginBottom: ts(espacos.lg) },
            ]}
          >
            <Texto style={styles.vazioTexto}>Nenhum medicamento cadastrado.</Texto>
          </View>
        )}

        {/* Botão de compartilhar */}
        <TouchableOpacity
          onPress={compartilhar}
          disabled={gerando}
          style={[
            styles.botaoCompartilhar,
            sombra,
            {
              padding: ts(espacos.md),
              marginTop: ts(espacos.md),
              opacity: gerando ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.85}
        >
          {gerando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icone Icone={FileText} tamanho={20} cor="#FFFFFF" strokeWidth={2} />
              <Texto style={styles.botaoCompartilharTexto}>
                Compartilhar relatório
              </Texto>
            </>
          )}
        </TouchableOpacity>

        <View style={[styles.rodapeWrap, { marginTop: ts(espacos.md) }]}>
          <Icone Icone={Heart} tamanho={14} cor={cores.inkSuave} />
          <Texto style={styles.rodape}>
            Cuide com carinho. Você faz a diferença.
          </Texto>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.papel },
  container: { flexGrow: 1 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  labelTopo: {
    fontFamily: fontes.medium,
    fontSize: 11,
    color: cores.historico,
    letterSpacing: 1.2,
  },
  titulo: {
    fontFamily: fontes.serifBold,
    fontSize: 30,
    color: cores.ink,
    letterSpacing: -0.5,
    marginTop: -2,
  },
  botaoSair: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  secaoTitulo: {
    fontFamily: fontes.serifSemiBold,
    fontSize: 20,
    color: cores.ink,
    marginBottom: 8,
  },
  resumo: { flexDirection: 'row', gap: 12 },
  resumoCard: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E8D5',
    gap: 4,
  },
  resumoNumero: {
    fontFamily: fontes.serifBold,
    fontSize: 32,
    color: cores.ink,
    lineHeight: 36,
  },
  resumoLabel: {
    fontFamily: fontes.medium,
    fontSize: 12,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardAlerta: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    borderLeftWidth: 5,
    borderLeftColor: cores.sos,
  },
  linhaAlertaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertaTitulo: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
    color: cores.sos,
  },
  alertaDetalhe: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
  },
  alertaMapa: {
    fontFamily: fontes.medium,
    fontSize: 12,
    color: cores.marca,
  },
  card: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitulo: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
    color: cores.ink,
  },
  cardDetalhe: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
  },
  vazio: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    alignItems: 'center',
  },
  vazioTexto: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  botaoCompartilhar: {
    backgroundColor: cores.historico,
    borderRadius: raios.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoCompartilharTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
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