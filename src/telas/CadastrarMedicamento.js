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
import { Plus, X, Clock } from 'lucide-react-native';

import Texto from '../componentes/Texto';
import Icone from '../componentes/Icone';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import {
  lerMedicamentos,
  salvarMedicamentos,
  gerarId,
} from '../servicos/armazenamento';
import { reagendarTodas } from '../servicos/notificacoes';
import { cores, fontes, tamanhos, espacos, raios, sombra } from '../estilos/tema';

const HORARIOS_COMUNS = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00'];

export default function CadastrarMedicamento({ navigation }) {
  const { ts } = useAcessibilidade();
  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [horarioManual, setHorarioManual] = useState('');

  // ---------- HORÁRIOS ----------

  function adicionarHorario(h) {
    if (horarios.includes(h)) return;
    setHorarios([...horarios, h].sort());
  }

  function removerHorario(h) {
    setHorarios(horarios.filter((x) => x !== h));
  }

  // MÁSCARA: formata enquanto digita
  // "8"      → "8"
  // "83"     → "83"
  // "830"    → "8:30"
  // "0830"   → "08:30"
  function aoDigitarHorario(texto) {
    const numeros = texto.replace(/[^0-9]/g, '').slice(0, 4);
    let formatado = numeros;

    if (numeros.length === 3) {
      formatado = numeros[0] + ':' + numeros.slice(1);
    } else if (numeros.length === 4) {
      formatado = numeros.slice(0, 2) + ':' + numeros.slice(2);
    }

    setHorarioManual(formatado);
  }

  function adicionarHorarioManual() {
    const numeros = horarioManual.replace(/[^0-9]/g, '');

    if (numeros.length < 1) {
      Alert.alert('Falta o horário', 'Digite um horário primeiro.');
      return;
    }

    let horas, minutos;

    if (numeros.length <= 2) {
      horas = parseInt(numeros, 10);
      minutos = 0;
    } else if (numeros.length === 3) {
      horas = parseInt(numeros[0], 10);
      minutos = parseInt(numeros.slice(1), 10);
    } else {
      horas = parseInt(numeros.slice(0, 2), 10);
      minutos = parseInt(numeros.slice(2), 10);
    }

    if (horas > 23 || minutos > 59) {
      Alert.alert(
        'Horário inválido',
        'As horas vão de 0 a 23 e os minutos de 0 a 59.'
      );
      return;
    }

    const h = String(horas).padStart(2, '0');
    const m = String(minutos).padStart(2, '0');
    const formatado = `${h}:${m}`;

    if (horarios.includes(formatado)) {
      Alert.alert('Já adicionado', `${formatado} já está na lista.`);
      return;
    }

    adicionarHorario(formatado);
    setHorarioManual('');
    Keyboard.dismiss(); // fecha o teclado
  }

  // ---------- SALVAR ----------

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Falta o nome', 'Digite o nome do remédio.');
      return;
    }
    if (!dose.trim()) {
      Alert.alert('Falta a dose', 'Digite a dose (ex: 100mg).');
      return;
    }
    if (horarios.length === 0) {
      Alert.alert('Falta o horário', 'Escolha pelo menos um horário.');
      return;
    }

    const novo = {
      id: gerarId(),
      nome: nome.trim(),
      dose: dose.trim(),
      horarios,
      criadoEm: new Date().toISOString(),
    };

        const lista = await lerMedicamentos();
    const novaLista = [novo, ...lista];
    await salvarMedicamentos(novaLista);

    // Reagenda todas as notificações com base na lista atualizada
    await reagendarTodas(novaLista);

    Alert.alert('Cadastrado!', `${novo.nome} foi adicionado.`, [
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
          <Texto style={[styles.titulo, { marginBottom: ts(espacos.lg) }]}>
            Novo remédio
          </Texto>

          <Texto style={styles.label}>Nome do remédio</Texto>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Levodopa"
            placeholderTextColor={cores.inkSuave}
            style={[
              styles.input,
              sombra,
              { fontSize: ts(tamanhos.corpo), padding: ts(espacos.md), marginBottom: ts(espacos.md) },
            ]}
            maxLength={60}
          />

          <Texto style={styles.label}>Dose</Texto>
          <TextInput
            value={dose}
            onChangeText={setDose}
            placeholder="Ex: 100mg"
            placeholderTextColor={cores.inkSuave}
            style={[
              styles.input,
              sombra,
              { fontSize: ts(tamanhos.corpo), padding: ts(espacos.md), marginBottom: ts(espacos.md) },
            ]}
            maxLength={30}
          />

          <Texto style={styles.label}>Horários comuns</Texto>
          <Texto style={[styles.subLabel, { marginBottom: ts(espacos.sm) }]}>
            Toque para adicionar
          </Texto>
          <View style={[styles.gradeHorarios, { marginBottom: ts(espacos.md) }]}>
            {HORARIOS_COMUNS.map((h) => {
              const selecionado = horarios.includes(h);
              return (
                <TouchableOpacity
                  key={h}
                  onPress={() => adicionarHorario(h)}
                  disabled={selecionado}
                  style={[
                    styles.botaoHorario,
                    {
                      paddingVertical: ts(espacos.sm),
                      paddingHorizontal: ts(espacos.md),
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: selecionado ? cores.medicamento : cores.cartao,
                      borderColor: selecionado ? cores.medicamento : '#F0E8D5',
                    },
                    sombra,
                  ]}
                  activeOpacity={0.7}
                >
                  <Texto
                    style={[
                      styles.botaoHorarioTexto,
                      { color: selecionado ? '#FFFFFF' : cores.ink },
                    ]}
                  >
                    {h}
                  </Texto>
                </TouchableOpacity>
              );
            })}
          </View>

          <Texto style={styles.label}>Ou digite outro horário</Texto>
          <View style={[styles.linhaInput, { marginBottom: ts(espacos.sm) }]}>
            <TextInput
              value={horarioManual}
              onChangeText={aoDigitarHorario}
              placeholder="Ex: 830 vira 8:30"
              placeholderTextColor={cores.inkSuave}
              keyboardType="number-pad"
              style={[
                styles.input,
                sombra,
                { flex: 1, fontSize: ts(tamanhos.corpo), padding: ts(espacos.md) },
              ]}
              maxLength={5}
              returnKeyType="done"
              onSubmitEditing={adicionarHorarioManual}
            />
            <TouchableOpacity
              onPress={adicionarHorarioManual}
              style={[styles.botaoAdd, sombra, { padding: ts(espacos.md), marginLeft: ts(espacos.sm) }]}
              activeOpacity={0.85}
            >
              <Icone Icone={Plus} tamanho={24} cor="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <Texto style={[styles.dica, { marginBottom: ts(espacos.lg) }]}>
            Só números, sem ":" — o app formata sozinho. Ex: 8, 830 ou 1430.
          </Texto>

          {horarios.length > 0 && (
            <>
              <View style={[styles.linhaTitulo, { marginBottom: ts(espacos.sm) }]}>
                <Icone Icone={Clock} tamanho={16} cor={cores.medicamento} />
                <Texto style={styles.labelSemMargem}>Horários escolhidos</Texto>
              </View>
              <View style={[styles.horariosWrap, { marginBottom: ts(espacos.lg) }]}>
                {horarios.map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => removerHorario(h)}
                    style={[
                      styles.chip,
                      { paddingVertical: 10, paddingHorizontal: ts(espacos.sm), marginRight: 8, marginBottom: 8 },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Texto style={styles.chipTexto}>{h}</Texto>
                    <Icone Icone={X} tamanho={14} cor={cores.medicamento} strokeWidth={2.2} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            onPress={salvar}
            style={[styles.botaoSalvar, sombra, { padding: ts(espacos.md) }]}
            activeOpacity={0.85}
          >
            <Texto style={styles.botaoSalvarTexto}>Salvar remédio</Texto>
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
  label: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelSemMargem: {
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subLabel: {
    fontFamily: fontes.regular,
    fontSize: 13,
    color: cores.inkSuave,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    fontFamily: fontes.semiBold,
    color: cores.ink,
    borderWidth: 1,
    borderColor: '#F0E8D5',
  },
  linhaInput: { flexDirection: 'row', alignItems: 'stretch' },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  botaoAdd: {
    backgroundColor: cores.marca,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 62,
  },
  gradeHorarios: { flexDirection: 'row', flexWrap: 'wrap' },
  botaoHorario: { borderRadius: raios.pill, borderWidth: 1 },
  botaoHorarioTexto: { fontFamily: fontes.bold, fontSize: tamanhos.corpo },
  horariosWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: cores.medicamentoSuave,
    borderRadius: raios.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipTexto: {
    color: cores.medicamento,
    fontFamily: fontes.bold,
    fontSize: tamanhos.label,
  },
  dica: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.label,
    color: cores.inkSuave,
    fontStyle: 'italic',
  },
  botaoSalvar: {
    backgroundColor: cores.medicamento,
    borderRadius: raios.md,
    alignItems: 'center',
  },
  botaoSalvarTexto: {
    color: '#FFFFFF',
    fontFamily: fontes.semiBold,
    fontSize: tamanhos.corpo,
  },
});