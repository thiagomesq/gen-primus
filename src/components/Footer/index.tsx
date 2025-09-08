import { FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t-2 border-border/40 bg-background/95">
      <div className="container mx-auto flex h-16 flex-col items-center justify-between gap-4 px-4 text-center md:h-24 md:flex-row md:px-6">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2025 Thiago Mesquita. Todos os direitos reservados.
        </p>
        <Link
          href="https://www.instagram.com/turmaprimus"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <FaInstagram className="h-4 w-4" />
          turmaprimus
        </Link>
      </div>
    </footer>
  );
}