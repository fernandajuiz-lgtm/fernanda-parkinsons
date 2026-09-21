import React from 'react';
import { View, StyleSheet } from 'react-native';
import Texto from './Texto';
import { useAcessibilidade } from '../contexto/Acessibilidade';
import { cores, fontes, tamanhos, espacos, raios } from '../estilos/tema';

// Cores de cada sintoma no gráfico
const CORES_BARRAS = {
  tremor: '#C77B2E',       // laranja queimado
  rigidez: '#8B1C1C',      // vermelho profundo
  congelamento: '#5B8BB8', // azul calmo
};

// Altura da área do gráfico (px base, será escalada)
const ALTURA_GRAFICO = 120;

// Máximo da escala (0 a 4)
const MAX_ESCALA = 4;

// Componente de gráfico de barras agrupadas
//
// Props:
//   dados: array de { diaSemana, tremor, rigidez, congelamento, total }
//   mostrarLegenda: bool (default true)
//
export default function GraficoSintomas({ dados = [], mostrarLegenda = true }) {
  const { ts } = useAcessibilidade();

  if (!dados || dados.length === 0) {
    return (
      <View style={[styles.vazio, { padding: ts(espacos.md) }]}>
        <Texto style={styles.vazioTexto}>
          Sem dados suficientes para mostrar o gráfico.
        </Texto>
      </View>
    );
  }

  const alturaBarra = ts(ALTURA_GRAFICO);

  return (
    <View>
      {/* Área do gráfico */}
      <View style={[styles.grafico, { height: alturaBarra, marginBottom: ts(espacos.sm) }]}>
        {/* Linhas guias horizontais (níveis 1, 2, 3) */}
        {[1, 2, 3].map((nivel) => (
          <View
            key={nivel}
            style={[
              styles.linhaGuia,
              {
                bottom: (nivel / MAX_ESCALA) * alturaBarra,
              },
            ]}
          />
        ))}

        {/* Barras por dia */}
        <View style={styles.linhasWrap}>
          {dados.map((dia, idx) => (
            <View key={idx} style={styles.colunaDia}>
              <View style={[styles.barrasWrap, { height: alturaBarra }]}>
                {renderBarra(dia.tremor, CORES_BARRAS.tremor, alturaBarra)}
                {renderBarra(dia.rigidez, CORES_BARRAS.rigidez, alturaBarra)}
                {renderBarra(dia.congelamento, CORES_BARRAS.congelamento, alturaBarra)}
              </View>
              <Texto style={[styles.labelDia, { marginTop: ts(espacos.xs) }]}>
                {dia.diaSemana}
              </Texto>
            </View>
          ))}
        </View>
      </View>

      {/* Legenda */}
      {mostrarLegenda && (
        <View style={[styles.legenda, { gap: ts(espacos.md) }]}>
          <LegendaItem cor={CORES_BARRAS.tremor} label="Tremor" />
          <LegendaItem cor={CORES_BARRAS.rigidez} label="Rigidez" />
          <LegendaItem cor={CORES_BARRAS.congelamento} label="Congel." />
        </View>
      )}
    </View>
  );
}

// Renderiza uma barra individual
function renderBarra(valor, cor, alturaMax) {
  const altura = (valor / MAX_ESCALA) * alturaMax;
  // Altura mínima visual pra mostrar que existe dado
  const alturaFinal = valor > 0 ? Math.max(4, altura) : 0;

  return (
    <View
      style={[
        styles.barra,
        {
          height: alturaFinal,
          backgroundColor: cor,
        },
      ]}
    />
  );
}

// Item da legenda
function LegendaItem({ cor, label }) {
  const { ts } = useAcessibilidade();
  return (
    <View style={styles.legendaItem}>
      <View
        style={[
          styles.legendaQuadrado,
          {
            backgroundColor: cor,
            width: ts(10),
            height: ts(10),
          },
        ]}
      />
      <Texto style={styles.legendaTexto}>{label}</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  grafico: {
    backgroundColor: cores.cartao,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: '#F0E8D5',
    padding: 8,
    position: 'relative',
  },
  linhaGuia: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: '#F0E8D5',
    zIndex: 0,
  },
  linhasWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    zIndex: 1,
  },
  colunaDia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barrasWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barra: {
    width: 6,
    borderRadius: 3,
    minWidth: 4,
  },
  labelDia: {
    fontFamily: fontes.semiBold,
    fontSize: 10,
    color: cores.inkSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendaQuadrado: {
    borderRadius: 2,
  },
  legendaTexto: {
    fontFamily: fontes.medium,
    fontSize: 11,
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
    fontSize: 13,
    color: cores.inkSuave,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});