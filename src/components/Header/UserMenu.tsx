'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from '../Transition/Link';
import { useRoute } from '@/providers/RouteProvider';

interface UserMenuProps {
  className?: string;
  onLinkClick?: () => void; // Para fechar o menu mobile
}

export default function UserMenu({ className, onLinkClick }: UserMenuProps) {
  const { routes } = useRoute();
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col gap-3 items-center text-lg font-medium md:flex-row md:gap-2 md:text-sm', className)}>
      {routes.filter((route) => route.auth && route.icon !== null).map((link) => (
        <Link
          variant={'link'}
          key={link.name}
          href={link.href}
          onClick={onLinkClick}
          className={cn(
            'transition-colors hover:text-foreground',
            pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {link.icon && <link.icon className="inline-block mr-2 h-4 w-4" aria-hidden="true" />}
          {link.name}
        </Link>
      ))}
    </nav>
  );
}