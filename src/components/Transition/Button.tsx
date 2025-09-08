'use client';

import * as React from 'react';
import { useLoading } from '@/providers/LoadingProvider';
import { Button as DefaultButton, buttonVariants } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';

// Estende as props do botão original para aceitar variantes (variant, size, etc.)
// e modifica o onClick para ser potencialmente assíncrono.
interface TransitionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  onClick?: () => Promise<any> | void;
}

const Button = React.forwardRef<
  HTMLButtonElement,
  TransitionButtonProps
>(({ onClick, children, ...props }, ref) => {
  const { showLoader, hideLoader } = useLoading();
  const [isPending, startTransition] = React.useTransition();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    showLoader();

    // Usamos startTransition para manter a UI responsiva durante a ação
    startTransition(async () => {
      try {
        await onClick(); // Executa a ação original passada para o botão
      } catch (error) {
        console.error('Ação do botão falhou:', error);
        // Opcional: Adicionar um toast de erro aqui
      } finally {
        hideLoader(); // Garante que o loader seja escondido, mesmo se houver um erro
      }
    });
  };

  return (
    <DefaultButton ref={ref} onClick={handleClick} {...props}>
      {children}
    </DefaultButton>
  );
});

Button.displayName = 'Button';

export default Button;