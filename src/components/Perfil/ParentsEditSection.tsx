'use client';

import { useEffect, useState } from 'react';
import { Primus } from '@/interfaces';
import { usePrimus } from '@/hooks/use-primus';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ParentsEditSectionProps {
  primus: Primus;
  onSave: (updatedData: Partial<Primus>) => Promise<void>;
}

export default function ParentsEditSection({ primus, onSave }: ParentsEditSectionProps) {
  const { primusList, getPrimus } = usePrimus();
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');

  useEffect(() => {
    getPrimus(); // Carrega a lista de primus para o datalist
  }, []);

  useEffect(() => {
    if (primus.father && typeof primus.father === 'object') {
      setFatherName(primus.father.name);
    }
    if (primus.mother && typeof primus.mother === 'object') {
      setMotherName(primus.mother.name);
    }
  }, [primus]);

  const handleSave = () => {
    // Encontra o ID do pai e da mãe com base nos nomes
    const fatherId = primusList.find(p => p.name === fatherName)?.id;
    const motherId = primusList.find(p => p.name === motherName)?.id;

    onSave({ father: fatherId, mother: motherId });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Pais</h2>
      <datalist id="primus-names">
        {primusList.map((p, i) => <option key={i} value={p.name} />)}
      </datalist>
      <div className="space-y-4">
        <div>
          <Label htmlFor="father">Pai</Label>
          <Input id="father" list="primus-names" value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="mother">Mãe</Label>
          <Input id="mother" list="primus-names" value={motherName} onChange={(e) => setMotherName(e.target.value)} />
        </div>
        <Button onClick={handleSave}>Salvar Pais</Button>
      </div>
    </div>
  );
}
