'use client';

import { useLoading } from '@/providers/LoadingProvider';
import NextLink, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button'; // Importe as variantes
import { cn } from '@/lib/utils';

interface TransitionLinkProps extends LinkProps, VariantProps<typeof buttonVariants> {
  children: ReactNode;
  className?: string;
}

export default function Link({ children, href, className, variant, size, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    showLoader();
    setTimeout(() => {
      router.push(href.toString());
    }, 50);
    setTimeout(() => {
      hideLoader();
    }, 3000);
  };

  // Aplica as classes de variante de botão ao link
  return (
    <NextLink href={href} onClick={handleClick} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </NextLink>
  );
}