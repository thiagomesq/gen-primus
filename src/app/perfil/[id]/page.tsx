'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePrimus } from '@/hooks/use-primus';
import { Primus } from '@/interfaces';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/data-picker';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ParentsEditSection from '@/components/Perfil/ParentsEditSection';
import SpousesEditSection from '@/components/Perfil/SpousesEditSection';
import SiblingsEditSection from '@/components/Perfil/SiblingsEditSection';
import ChildrenEditSection from '@/components/Perfil/ChildrenEditSection';

export default function PerfilPage() {
  const params = useParams();
  const { getFamilyTree, updatePrimus } = usePrimus();
  const [primus, setPrimus] = useState<Primus | null>(null);
  const [editablePrimus, setEditablePrimus] = useState<Partial<Primus>>({});
  const [loading, setLoading] = useState(true);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id) {
      const fetchPrimusData = async () => {
        setLoading(true);
        const data = await getFamilyTree(id, 1);
        setPrimus(data);
        if (data) {
          // Converte timestamps para objetos Date para o DatePicker
          const initialData = {
            ...data,
            birth: data.birth ? new Date(data.birth) : undefined,
            death: data.death ? new Date(data.death) : undefined,
          };
          setEditablePrimus(initialData);
        }
        setLoading(false);
      };

      fetchPrimusData();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditablePrimus(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined, field: 'birth' | 'death') => {
    setEditablePrimus(prev => ({ ...prev, [field]: date }));
  };

  const handleSaveChanges = async () => {
    if (!id) return;
    const success = await updatePrimus(id, editablePrimus);
    if (success) {
      const data = await getFamilyTree(id, 1);
      setPrimus(data);
      if (data) {
        setEditablePrimus(data);
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex flex-col items-center py-6 px-4"><LoadingSpinner /></div>;
  }

  if (!primus) {
    return <div className="text-center py-10">Perfil não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-primus-blue-dark dark:text-primus-blue-light mb-6">
        Perfil de {primus.name}
      </h1>

      {/* Seções de Edição serão adicionadas aqui */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" value={editablePrimus.name || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Sexo</Label>
              <RadioGroup
                className="flex gap-4 my-2"
                value={editablePrimus.gender}
                onValueChange={(value) => setEditablePrimus(prev => ({ ...prev, gender: value }))}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="MASCULINO" id="g1" />
                  <Label htmlFor="g1">Masculino</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="FEMININO" id="g2" />
                  <Label htmlFor="g2">Feminino</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="birth">Data de Nascimento</Label>
              <DatePicker id="birth" value={editablePrimus.birth} onChange={date => handleDateChange(date, 'birth')} />
            </div>
            <div>
              <Label htmlFor="birthPlace">Cidade de Nascimento</Label>
              <Input id="birthPlace" name="birthPlace" value={editablePrimus.birthPlace || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="death">Data de Falecimento</Label>
              <DatePicker id="death" value={editablePrimus.death} onChange={date => handleDateChange(date, 'death')} />
            </div>
            <div>
              <Label htmlFor="deathPlace">Local de Falecimento</Label>
              <Input id="deathPlace" name="deathPlace" value={editablePrimus.deathPlace || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea id="bio" name="bio" value={editablePrimus.bio || ''} onChange={handleInputChange} />
            </div>
            <Button type="submit">Salvar Alterações</Button>
          </form>
        </div>

        <ParentsEditSection primus={primus} onSave={handleSaveChanges} />

        <SpousesEditSection primus={primus} onSave={handleSaveChanges} />

        <SiblingsEditSection primus={primus} onSave={handleSaveChanges} />

        <ChildrenEditSection primus={primus} onSave={handleSaveChanges} />
      </div>
    </div>
  );
}
