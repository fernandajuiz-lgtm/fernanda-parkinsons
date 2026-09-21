import React from 'react';
import { useAcessibilidade } from '../contexto/Acessibilidade';

// Wrapper acessível para ícones Lucide.
// Escala o ícone conforme a configuração do usuário.
//
// Uso: <Icone Icone={Pill} tamanho={28} cor="#607050" />
export default function Icone({ Icone, tamanho = 24, cor, strokeWidth = 1.8 }) {
  const { ts } = useAcessibilidade();
  return (
    <Icone
      size={ts(tamanho)}
      color={cor}
      strokeWidth={strokeWidth}
    />
  );
}