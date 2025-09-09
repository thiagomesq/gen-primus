'use client';

import { useEffect, useState } from 'react';
import { Primus } from '@/interfaces';
import { usePrimus } from '@/hooks/use-primus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface ChildrenEditSectionProps {
  primus: Primus;
  onSave: (updatedData: Partial<Primus>) => Promise<void>;
}

export default function ChildrenEditSection({ primus, onSave }: ChildrenEditSectionProps) {
  const { primusList, getPrimus } = usePrimus();
  const [children, setChildren] = useState<string[]>([]);

  useEffect(() => {
    getPrimus();
  }, []);

  useEffect(() => {
    if (primus.children) {
      const childrenNames = primus.children.map(c => (typeof c === 'object' ? c.name : c));
      setChildren(childrenNames);
    }
  }, [primus]);

  const handleChildChange = (index: number, value: string) => {
    const updatedChildren = [...children];
    updatedChildren[index] = value;
    setChildren(updatedChildren);
  };

  const addChild = () => {
    setChildren([...children, '']);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const childrenIds = children
      .map(name => primusList.find(p => p.name === name)?.id)
      .filter((id): id is string => !!id);
    onSave({ children: childrenIds });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Filhos</h2>
      <datalist id="primus-names">
        {primusList.map((p, i) => <option key={i} value={p.name} />)}
      </datalist>
      <div className="space-y-4">
        {children.map((childName, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input list="primus-names" value={childName} onChange={(e) => handleChildChange(index, e.target.value)} />
            <Button variant="ghost" size="icon" onClick={() => removeChild(index)}>
              <MinusCircle className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addChild}><PlusCircle className="h-4 w-4 mr-2" />Adicionar Filho</Button>
      </div>
      <Button onClick={handleSave} className="mt-4">Salvar Filhos</Button>
    </div>
  );
}
