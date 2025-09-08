import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date?: any): string {
  if (!date) return '—';
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

/** Calcula a idade com base no nascimento e, opcionalmente, na morte. */
export function calcAge(birth?: any, death?: any): number | undefined {
  if (!birth) return undefined;
  const b = new Date(birth);
  const end = death ? new Date(death) : new Date();
  if (Number.isNaN(b.getTime()) || Number.isNaN(end.getTime())) return undefined;
  let age = end.getFullYear() - b.getFullYear();
  const m = end.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < b.getDate())) age--;
  return age;
}