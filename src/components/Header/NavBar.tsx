'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

import LoginButton from './LoginButton';
import ThemeSwitch from './ThemeSwitch';
import UserMenu from './UserMenu';
import UserMenuDropdown from './UserMenuDropdown'; // O novo componente de dropdown
import Link from '../Transition/Link'; // Importa o componente de link com transição

export default function NavBar() {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex flex-col items-center gap-4 border-b border-border/40 bg-background/95 p-4 shadow-md backdrop-blur-md md:px-6 md:flex-row">
      <nav className="hidden text-lg font-medium md:flex md:items-center md:gap-2 md:text-sm lg:gap-6">
        <Link href="/" variant={'link'} className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Image src="/images/logo_primus.svg" alt="Logo" width={60} height={60} />
          <span>Genealogia Primus</span>
        </Link>
        {/* Menu de navegação para Desktop, só aparece se logado */}
        <UserMenu />
      </nav>

      {/* Menu para Mobile */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        {/* O botão de trigger só aparece no mobile se o usuário estiver logado */}
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium pt-6">
            <Link href="/" variant={'link'} className="flex items-center gap-2 text-lg font-semibold">
              <Image src="/images/logo_primus.svg" alt="Logo" width={50} height={50} />
              <span>Genealogia Primus</span>
            </Link>
            {/* Reutiliza o UserMenu, que agora é uma lista de links */}
            <UserMenu onLinkClick={() => setIsMobileMenuOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Espaçador para empurrar os itens da direita */}
      <div className="flex-1"></div>

      {/* Itens da Direita */}
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <ThemeSwitch />
        {loading ? (
          <Skeleton className="h-9 w-9 rounded-full" />
        ) : user ? (
          <UserMenuDropdown />
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  );
}