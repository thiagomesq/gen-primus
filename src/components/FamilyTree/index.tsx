'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePrimus } from '@/hooks/use-primus';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ExtPrimus } from '@/interfaces/Primus';
import { PrimusNode } from './PrimusNode';

export default function FamilyTree() {
  const { user } = useAuth();
  const { getFamilyTree } = usePrimus();
  const [tree, setTree] = useState<ExtPrimus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const primusId = user?.perfil || localStorage.getItem('primusPerfilId');
      if (!primusId) {
        setError('Perfil genealógico não vinculado ao usuário.');
        return;
      }
      const data = await getFamilyTree(primusId, 5);
      setTree(data as ExtPrimus);
    } catch (e: any) {
      setError('Falha ao carregar a árvore.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4">
      <h1 className="text-2xl font-bold mb-8 text-primus-blue-dark md:mb-2">Minha Árvore Genealógica</h1>
      <p className="hidden text-sm text-gray-600 mb-6 md:flex">Para uma melhor visualização aperte F11 para deixar em tela cheia</p>

      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-primus-red">{error}</p>}
      {!loading && !error && tree && (
        <div className="overflow-auto w-full h-full">
          <div className="flex justify-center p-4 min-w-max">
            <PrimusNode primus={tree} depth={0} maxDepth={5} />
          </div>
        </div>
      )}
      {!loading && !error && !tree && (
        <p className="text-sm text-gray-500 mt-4">Nenhum dado para exibir.</p>
      )}
    </div>
  );
}