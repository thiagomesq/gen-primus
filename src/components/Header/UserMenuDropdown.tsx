'use client';

import { useAuth } from '@/providers/AuthProvider';
import Image from 'next/image';
import { LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Supondo que você tenha este componente da Shadcn
import Button from '@/components/Transition/Button';

export default function UserMenuDropdown() {
  const { user, logOut } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt="User Avatar"
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Adicione outros itens de menu aqui, como "Perfil" ou "Configurações" */}
        <DropdownMenuItem className="text-destructive cursor-pointer">
          <Button variant="ghost" onClick={logOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}