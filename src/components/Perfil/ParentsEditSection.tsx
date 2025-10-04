'use client';

import { useEffect, useState } from 'react';
import { Primus } from '@/interfaces';
import { usePrimus } from '@/hooks/use-primus';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/data-picker';
import { Textarea } from '../ui/textarea';

interface ParentsEditSectionProps {
  primus: Primus;
  onSave: (updatedData: Partial<Primus>) => Promise<void>;
}

interface ParentDetails {
  name: string;
  birth?: Date;
  birthPlace?: string;
  death?: Date;
  deathPlace?: string;
  bio?: string;
}

export default function ParentsEditSection({ primus, onSave }: ParentsEditSectionProps) {
  const { primusList, getPrimus } = usePrimus();
  const [father, setFather] = useState<Partial<ParentDetails>>({});
  const [mother, setMother] = useState<Partial<ParentDetails>>({});

  useEffect(() => {
    getPrimus();
  }, []);

  useEffect(() => {
    if (primus.father && typeof primus.father === 'object') {
      setFather({ ...primus.father, birth: primus.father.birth ? new Date(primus.father.birth) : undefined, death: primus.father.death ? new Date(primus.father.death) : undefined });
    }
    if (primus.mother && typeof primus.mother === 'object') {
      setMother({ ...primus.mother, birth: primus.mother.birth ? new Date(primus.mother.birth) : undefined, death: primus.mother.death ? new Date(primus.mother.death) : undefined });
    }
  }, [primus]);

  const handleParentChange = (parent: 'father' | 'mother', field: keyof ParentDetails, value: any) => {
    const setter = parent === 'father' ? setFather : setMother;
    setter(prev => ({ ...prev, [field]: value }));

    if (field === 'name') {
      const existingPrimus = primusList.find(p => p.name === value);
      if (existingPrimus) {
        setter({ ...existingPrimus, birth: existingPrimus.birth ? new Date(existingPrimus.birth) : undefined, death: existingPrimus.death ? new Date(existingPrimus.death) : undefined });
      }
    }
  };

  const handleSave = () => {
    const dataToSave: Partial<Primus> = {};
    if (father.name) dataToSave.father = father as Primus;
    if (mother.name) dataToSave.mother = mother as Primus;
    onSave(dataToSave);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
      <h2 className="text-xl font-semibold mb-4">Pais</h2>
      <datalist id="primus-names">
        {primusList.map((p, i) => <option key={i} value={p.name} />)}
      </datalist>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna do Pai */}
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="font-medium">Pai</h3>
          <div>
            <Label>Nome</Label>
            <Input list="primus-names" value={father.name || ''} onChange={(e) => handleParentChange('father', 'name', e.target.value)} />
          </div>
          <div>
            <Label>Data de Nascimento</Label>
            <DatePicker value={father.birth ? new Date(father.birth) : undefined} onChange={(date) => handleParentChange('father', 'birth', date)} />
          </div>
          <div>
            <Label>Cidade de Nascimento</Label>
            <Input value={father.birthPlace || ''} onChange={(e) => handleParentChange('father', 'birthPlace', e.target.value)} />
          </div>
          <div>
            <Label>Data de Falecimento</Label>
            <DatePicker value={father.death ? new Date(father.death) : undefined} onChange={(date) => handleParentChange('father', 'death', date)} />
          </div>
          <div>
            <Label>Local de Falecimento</Label>
            <Input value={father.deathPlace || ''} onChange={(e) => handleParentChange('father', 'deathPlace', e.target.value)} />
          </div>
          <div>
            <Label>Biografia</Label>
            <Textarea value={father.bio || ''} onChange={(e) => handleParentChange('father', 'bio', e.target.value)} />
          </div>
        </div>

        {/* Coluna da Mãe */}
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="font-medium">Mãe</h3>
          <div>
            <Label>Nome</Label>
            <Input list="primus-names" value={mother.name || ''} onChange={(e) => handleParentChange('mother', 'name', e.target.value)} />
          </div>
          <div>
            <Label>Data de Nascimento</Label>
            <DatePicker value={mother.birth ? new Date(mother.birth) : undefined} onChange={(date) => handleParentChange('mother', 'birth', date)} />
          </div>
          <div>
            <Label>Cidade de Nascimento</Label>
            <Input value={mother.birthPlace || ''} onChange={(e) => handleParentChange('mother', 'birthPlace', e.target.value)} />
          </div>
          <div>
            <Label>Data de Falecimento</Label>
            <DatePicker value={mother.death ? new Date(mother.death) : undefined} onChange={(date) => handleParentChange('mother', 'death', date)} />
          </div>
          <div>
            <Label>Local de Falecimento</Label>
            <Input value={mother.deathPlace || ''} onChange={(e) => handleParentChange('mother', 'deathPlace', e.target.value)} />
          </div>
          <div>
            <Label>Biografia</Label>
            <Textarea value={mother.bio || ''} onChange={(e) => handleParentChange('mother', 'bio', e.target.value)} />
          </div>
        </div>
      </div>
      <Button onClick={handleSave} className="mt-6">Salvar Pais</Button>
    </div>
  );
}
