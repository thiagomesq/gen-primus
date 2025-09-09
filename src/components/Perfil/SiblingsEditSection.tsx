'use client';

import { useEffect, useState } from 'react';
import { Primus } from '@/interfaces';
import { usePrimus } from '@/hooks/use-primus';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface SiblingsEditSectionProps {
  primus: Primus;
  onSave: (updatedData: Partial<Primus>) => Promise<void>;
}

export default function SiblingsEditSection({ primus, onSave }: SiblingsEditSectionProps) {
  const { primusList, getPrimus } = usePrimus();
  const [siblings, setSiblings] = useState<string[]>([]);

  useEffect(() => {
    getPrimus();
  }, []);

  useEffect(() => {
    if (primus.siblings) {
      const siblingNames = primus.siblings.map(s => (typeof s === 'object' ? s.name : s));
      setSiblings(siblingNames);
    }
  }, [primus]);

  const handleSiblingChange = (index: number, value: string) => {
    const updatedSiblings = [...siblings];
    updatedSiblings[index] = value;
    setSiblings(updatedSiblings);
  };

  const addSibling = () => {
    setSiblings([...siblings, '']);
  };

  const removeSibling = (index: number) => {
    setSiblings(siblings.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const siblingIds = siblings
      .map(name => primusList.find(p => p.name === name)?.id)
      .filter((id): id is string => !!id);
    onSave({ siblings: siblingIds });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Irmãos</h2>
      <datalist id="primus-names">
        {primusList.map((p, i) => <option key={i} value={p.name} />)}
      </datalist>
      <div className="space-y-4">
        {siblings.map((siblingName, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input list="primus-names" value={siblingName} onChange={(e) => handleSiblingChange(index, e.target.value)} />
            <Button variant="ghost" size="icon" onClick={() => removeSibling(index)}>
              <MinusCircle className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addSibling}><PlusCircle className="h-4 w-4 mr-2" />Adicionar Irmão</Button>
      </div>
      <Button onClick={handleSave} className="mt-4">Salvar Irmãos</Button>
    </div>
  );
}
