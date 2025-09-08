'use client';
 
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';
 
export function Toaster() {
  const { resolvedTheme } = useTheme();

  return <SonnerToaster toastOptions={{classNames: {error: "!text-primus-red", success: "!text-green-500"}}} theme={resolvedTheme as ToasterProps['theme']} position="bottom-right" duration={5000} />;
}