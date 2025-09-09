'use client';

import { useEffect, useState } from 'react';
import { Primus, Spouse } from '@/interfaces';
import { usePrimus } from '@/hooks/use-primus';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/data-picker';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface SpousesEditSectionProps {
  primus: Primus;
  onSave: (updatedData: Partial<Primus>) => Promise<void>;
}

export default function SpousesEditSection({ primus, onSave }: SpousesEditSectionProps) {
  const { primusList, getPrimus } = usePrimus();
  const [spouses, setSpouses] = useState<Spouse[]>([]);

  useEffect(() => {
    getPrimus();
  }, []);

  useEffect(() => {
    if (primus.marriedWith) {
      const initialSpouses = primus.marriedWith.map(s => ({
        ...s,
        wedding: s.wedding ? new Date(s.wedding) : undefined,
      }));
      setSpouses(initialSpouses);
    }
  }, [primus]);

  const handleSpouseChange = (index: number, field: keyof Spouse, value: string | Date | boolean | undefined) => {
    const updatedSpouses = [...spouses];
    (updatedSpouses[index] as any)[field] = value;
    setSpouses(updatedSpouses);
  };

  const addSpouse = () => {
    setSpouses([...spouses, { name: '', actual: false }]);
  };

  const removeSpouse = (index: number) => {
    setSpouses(spouses.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ marriedWith: spouses });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Cônjuges</h2>
      <datalist id="primus-names">
        {primusList.map((p, i) => <option key={i} value={p.name} />)}
      </datalist>
      <div className="space-y-4">
        {spouses.map((spouse, index) => (
          <div key={index} className="p-4 border rounded-md space-y-2 relative">
            <Button variant="ghost" size="icon" onClick={() => removeSpouse(index)}>
              <MinusCircle className="h-5 w-5 text-red-500" />
            </Button>
            <div>
              <Label htmlFor={`spouse-name-${index}`}>Nome</Label>
              <Input id={`spouse-name-${index}`} list="primus-names" value={spouse.name} onChange={(e) => handleSpouseChange(index, 'name', e.target.value)} />
            </div>
            <div>
              <Label htmlFor={`spouse-wedding-${index}`}>Data do Casamento</Label>
              <DatePicker id={`spouse-wedding-${index}`} value={spouse.wedding} onChange={(date) => handleSpouseChange(index, 'wedding', date)} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addSpouse}><PlusCircle className="h-4 w-4 mr-2" />Adicionar Cônjuge</Button>
      </div>
      <Button onClick={handleSave} className="mt-4">Salvar Cônjuges</Button>
    </div>
  );
}
