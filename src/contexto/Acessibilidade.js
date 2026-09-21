import React, { createContext, useContext, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

const AcessibilidadeContext = createContext(null);

// Curva sublinear: cresce mais devagar que o linear
function curvaSublinear(x) {
  return 1 + (x - 1) * 0.65;
}

const ESCALA_MAXIMA = 1.7;
const ESCALA_MINIMA = 0.9;

export function AcessibilidadeProvider({ children }) {
  const { fontScale } = useWindowDimensions();
  const [preferencia, setPreferencia] = useState(1);

  const valor = useMemo(() => {
    const escalaSistema = curvaSublinear(fontScale);
    const escalaBruta = escalaSistema * preferencia;
    const escala = Math.max(ESCALA_MINIMA, Math.min(escalaBruta, ESCALA_MAXIMA));

    const ts = (tamanhoBase) => Math.round(tamanhoBase * escala);

    return {
      escala,
      ts,
      preferencia,
      setPreferencia,
      fontScaleSistema: fontScale,
    };
  }, [fontScale, preferencia]);

  return (
    <AcessibilidadeContext.Provider value={valor}>
      {children}
    </AcessibilidadeContext.Provider>
  );
}

export function useAcessibilidade() {
  const ctx = useContext(AcessibilidadeContext);
  if (!ctx) {
    throw new Error('useAcessibilidade precisa estar dentro de <AcessibilidadeProvider>');
  }
  return ctx;
}