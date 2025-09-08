'use client';

import { usePrimus } from "@/hooks/use-primus";
import { CreatePrimus, Primus } from "@/interfaces";
import { useAuth } from "@/providers/AuthProvider";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MinusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import TransitionButton from "@/components/Transition/Button";
import { DatePicker } from "@/components/ui/data-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Chave para o localStorage
const FORM_STORAGE_KEY = 'completarPerfilForm';

// Estrutura auxiliar para gerenciar listas na UI
interface Person {
    name: string;
    birth?: string;
}

export default function CompletarPerfilPage() {
    const { user } = useAuth();
    const { primusList, getPrimus, createPrimus } = usePrimus();
    const [newPrimus, setNewPrimus] = useState<CreatePrimus>({
        idUser: user?.uid || '',
        name: '',
        gender: 'MASCULINO',
        photoURL: user?.photoURL || '',
        birth: new Date(),
        marriedWith: [],
        bio: '',
        married: false
    });
    console.log("Primus List:", primusList);

    // Estados locais para gerenciar a UI de listas
    const [siblings, setSiblings] = useState<Person[]>([]);
    const [children, setChildren] = useState<Person[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createPrimus(newPrimus);
        // Limpa o localStorage após o envio bem-sucedido
        localStorage.removeItem(FORM_STORAGE_KEY);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "name") {
            const found = primusList.find(p => p.name === value);
            if (found) {
                const sib = found.siblings;
                if (sib && sib.length > 0) {
                    const siblingObjects = sib.filter((s): s is Primus => typeof s === 'object');
                    if (siblingObjects.length > 0) {
                        setSiblings(siblingObjects.map(s => ({ name: s.name, birth: s.birth ? new Date(s.birth).toISOString() : undefined })));
                    }
                }
                const child = found.children;
                if (child && child.length > 0 && typeof child[0] === "object") {
                    const childObjects = child.filter((c): c is Primus => typeof c === 'object');
                    if (childObjects.length > 0) {
                        setChildren(childObjects.map(c => ({ name: c.name, birth: c.birth ? new Date(c.birth).toISOString() : undefined })));
                    }
                }
                setNewPrimus({
                    idUser: user?.uid || '',
                    name: found.name,
                    gender: found.gender || 'MASCULINO',
                    photoURL: found.photoURL || user?.photoURL || '',
                    birth: found.birth ? new Date(found.birth) : new Date(),
                    birthPlace: found.birthPlace || '',
                    bio: found.bio || '',
                    father: (typeof found.father === 'object' ? found.father.name : ''),
                    fatherBirth: (typeof found.father === 'object' ? (found.father.birth ? new Date(found.father.birth) : undefined) : undefined),
                    mother: (typeof found.mother === 'object' ? found.mother.name : ''),
                    motherBirth: (typeof found.mother === 'object' ? (found.mother.birth ? new Date(found.mother.birth) : undefined) : undefined),
                    married: found.married !== undefined || false,
                    marriedWith: found.marriedWith || [],
                });
            } else {
                setNewPrimus(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setNewPrimus(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleListChange = (index: number, field: 'siblings' | 'children', subField: 'name' | 'birth', value: string) => {
        const list = field === 'siblings' ? [...siblings] : [...children];
        const setList = field === 'siblings' ? setSiblings : setChildren;

        if (list[index]) {
            if (subField === 'name') {
                const found = primusList.find(p => p.name === value);
                if (found) {
                    (list[index] as any)['name'] = found.name;
                    (list[index] as any)['birth'] = found.birth ? found.birth : undefined;
                }
            }
            (list[index] as any)[subField] = value;
            setList(list);
        }
    };

    const addToList = (field: 'siblings' | 'children') => {
        const setList = field === 'siblings' ? setSiblings : setChildren;
        setList(prev => [...prev, { name: '' }]);
    };

    const removeFromList = (indexToRemove: number, field: 'siblings' | 'children') => {
        const setList = field === 'siblings' ? setSiblings : setChildren;
        setList(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSpouseChange = (index: number, subField: 'name' | 'wedding', value: string) => {
        const list = [...(newPrimus.marriedWith || [])];
        if (list[index]) {
            const dateValue = subField === 'wedding' ? new Date(value) : undefined;
            (list[index] as any)[subField] = dateValue || value;
            setNewPrimus(prev => ({ ...prev, marriedWith: list }));
        }
    };

    // Carrega os dados do localStorage na montagem do componente
    useEffect(() => {
        const savedDataJSON = localStorage.getItem(FORM_STORAGE_KEY);
        if (savedDataJSON) {
            const savedData = JSON.parse(savedDataJSON);
            // Restaura o estado principal do formulário, convertendo strings de data para objetos Date
            setNewPrimus({
                ...savedData.newPrimus,
                birth: savedData.newPrimus.birth ? new Date(savedData.newPrimus.birth) : new Date(),
                fatherBirth: savedData.newPrimus.fatherBirth ? new Date(savedData.newPrimus.fatherBirth) : undefined,
                motherBirth: savedData.newPrimus.motherBirth ? new Date(savedData.newPrimus.motherBirth) : undefined,
                marriedWith: (savedData.newPrimus.marriedWith || []).map((spouse: any) => ({
                    ...spouse,
                    wedding: spouse.wedding ? new Date(spouse.wedding) : undefined
                }))
            });
            // Restaura os estados da UI para as listas
            if (savedData.siblings) setSiblings(savedData.siblings);
            if (savedData.children) setChildren(savedData.children);
        }
    }, []); // O array vazio garante que isso rode apenas uma vez

    // Salva os dados no localStorage sempre que houver uma alteração
    useEffect(() => {
        const dataToSave = { newPrimus, siblings, children };
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    }, [newPrimus, siblings, children]);

    useEffect(() => {
        if (user) {
            setNewPrimus(prev => ({ ...prev, idUser: user.uid, photoURL: user.photoURL || '' }));
        }
    }, [user]);

    useEffect(() => {
        const handleFetchPrimus = async () => {
            await getPrimus();
        };
        handleFetchPrimus();
        console.log("Primus list fetched:", primusList);
    }, []);

    useEffect(() => {
        if (newPrimus.married && (!newPrimus.marriedWith || newPrimus.marriedWith.length === 0)) {
            setNewPrimus(prev => ({ ...prev, marriedWith: [{ name: '', actual: true }] }));
        } else if (!newPrimus.married) {
            setNewPrimus(prev => ({ ...prev, marriedWith: [] }));
        }
    }, [newPrimus.married]);

    // Sincroniza os estados da UI com o estado principal do formulário
    useEffect(() => {
        setNewPrimus(prev => ({
            ...prev,
            siblings: siblings.map(s => s.name),
            siblingsBirth: siblings.map(s => s.birth ? new Date(s.birth) : undefined).filter(Boolean) as Date[]
        }));
    }, [siblings]);

    useEffect(() => {
        setNewPrimus(prev => ({
            ...prev,
            children: children.map(c => c.name),
            childrenBirth: children.map(c => c.birth ? new Date(c.birth) : undefined).filter(Boolean) as Date[]
        }));
    }, [children]);

    return (
        <div className="min-h-screen flex flex-col items-center py-8">
            <div className="flex flex-col w-xs m-auto p-6 items-center border-1 rounded-lg border-gray-200 dark:border-gray-700 shadow-lg bg-gray-100 dark:bg-gray-800 sm:w-sm md:w-md">
                <h1 className="text-2xl text-primus-blue-dark dark:text-primus-blue-light font-bold mb-4">Completar Perfil</h1>
                <p className="text-primus-blue-light dark:text-gray-300 mb-6">Por favor, preencha os campos abaixo para completar seu perfil.</p>
                <p className="w-full text-right text-sm text-primus-red dark:text-red-400 mb-4">Campos obrigatórios *</p>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    <datalist id="primus-names">
                        {primusList.map((p, i) => <option key={i} value={p.name} label={p.name} />)}
                    </datalist>

                    {/* Nome Completo */}
                    <div>
                        <Label htmlFor="name" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Nome Completo <span className="text-primus-red dark:text-red-400">*</span></Label>
                        <Input type="text" id="name" name="name" list="primus-names" value={newPrimus.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primus-blue-light dark:focus:ring-primus-blue-dark focus:border-primus-blue-light dark:focus:border-primus-blue-dark sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                    </div>

                    {/* Sexo */}
                    <div>
                        <Label htmlFor="gender" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Sexo <span className="text-primus-red dark:text-red-400">*</span></Label>
                        <RadioGroup id="gender" className="flex gap-4 my-4" defaultValue="MASCULINO" onValueChange={value => setNewPrimus(p => ({ ...p, gender: value }))} required>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="MASCULINO" id="g1" />
                                <Label htmlFor="g1">Masculino</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="FEMININO" id="g2" />
                                <Label htmlFor="g2">Feminino</Label>
                            </div>
                        </RadioGroup>

                    </div>

                    {/* Data de Nascimento */}
                    <div>
                        <Label htmlFor="birth" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Data de Nascimento <span className="text-primus-red dark:text-red-400">*</span></Label>
                        <DatePicker id="birth" value={newPrimus.birth} onChange={date => date && setNewPrimus(p => ({ ...p, birth: date }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primus-blue-light dark:focus:ring-primus-blue-dark focus:border-primus-blue-light dark:focus:border-primus-blue-dark sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>

                    {/* Cidade de Nascimento */}
                    <div>
                        <Label htmlFor="birthPlace" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Cidade de Nascimento</Label>
                        <Input type="text" id="birthPlace" name="birthPlace" value={newPrimus.birthPlace || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primus-blue-light dark:focus:ring-primus-blue-dark focus:border-primus-blue-light dark:focus:border-primus-blue-dark sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>

                    {/* Bio */}
                    <div>
                        <Label htmlFor="bio" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Bio</Label>
                        <Textarea id="bio" name="bio" value={newPrimus.bio || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primus-blue-light dark:focus:ring-primus-blue-dark focus:border-primus-blue-light dark:focus:border-primus-blue-dark sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>

                    {/* Pai e Mãe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div>
                                <Label htmlFor="father" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Pai</Label>
                                <Input type="text" id="father" name="father" placeholder="Nome do pai" list="primus-names" onChange={handleInputChange} className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
                            </div>
                            <div>
                                <Label htmlFor="fatherBirth" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Data de Nascimento</Label>
                                <DatePicker id="fatherBirth" name="fatherBirth" value={newPrimus.fatherBirth} onChange={date => date && setNewPrimus(p => ({ ...p, fatherBirth: date }))} className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <Label htmlFor="mother" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Mãe</Label>
                                <Input type="text" id="mother" name="mother" placeholder="Nome da mãe" list="primus-names" onChange={handleInputChange} className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
                            </div>
                            <div>
                                <Label htmlFor="motherBirth" className="block text-sm font-medium text-primus-blue dark:text-gray-200">Data de Nascimento</Label>
                                <DatePicker id="motherBirth" name="motherBirth" value={newPrimus.motherBirth} onChange={date => date && setNewPrimus(p => ({ ...p, motherBirth: date }))} className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
                            </div>
                        </div>
                    </div>

                    {/* Pais Casados */}
                    {newPrimus.father && newPrimus.mother && (
                        <div className="flex items-center gap-2">
                            <Checkbox id="parentsMarried" checked={newPrimus.parentsMarried} onCheckedChange={(checked) => setNewPrimus(prev => ({ ...prev, parentsMarried: !!checked }))} />
                            <Label htmlFor="parentsMarried" className="text-sm font-medium text-primus-blue dark:text-gray-200">Pais Casados</Label>
                        </div>
                    )}

                    {/* Irmãos */}
                    <div>
                        <Label className="block text-sm font-medium text-primus-blue dark:text-gray-200">Irmãos</Label>
                        {siblings.map((sibling, index) => (
                            <div key={index} className="flex items-center gap-2 mt-1">
                                <Input
                                    type="text"
                                    placeholder="Nome do irmão/irmã"
                                    list="primus-names"
                                    value={sibling.name}
                                    onChange={(e) => handleListChange(index, 'siblings', 'name', e.target.value)}
                                    className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                />
                                <DatePicker
                                    value={sibling.birth ? new Date(sibling.birth) : undefined}
                                    onChange={(date) => handleListChange(index, 'siblings', 'birth', date?.toISOString() || '')}
                                    className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeFromList(index, 'siblings')}>
                                    <MinusCircle className="h-5 w-5 text-primus-red dark:text-red-400" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="link" onClick={() => addToList('siblings')} className="text-sm text-primus-blue dark:text-primus-blue-light p-0 h-auto mt-1">+ Adicionar irmão</Button>
                    </div>

                    {/* Casado */}
                    <div className="flex items-center gap-2">
                        <Checkbox id="married" checked={newPrimus.married} onCheckedChange={(checked) => setNewPrimus(prev => ({ ...prev, married: !!checked }))} />
                        <Label htmlFor="married" className="text-sm font-medium text-primus-blue dark:text-gray-200">Casado(a)</Label>
                    </div>

                    {newPrimus.married && newPrimus.marriedWith?.map((spouse, index) => (
                        <div key={index} className="flex flex-col gap-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                            <Label className="block text-sm font-medium text-primus-blue dark:text-gray-200">Cônjuge <span className="text-primus-red dark:text-red-400">*</span></Label>
                            <Input type="text" placeholder="Nome do cônjuge" list="primus-names" value={spouse.name} onChange={(e) => handleSpouseChange(index, 'name', e.target.value)} required={newPrimus.married} className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
                            <Label className="block text-sm font-medium text-primus-blue dark:text-gray-200 mt-2">Data do Casamento</Label>
                            <DatePicker value={spouse.wedding} onChange={(date) => handleSpouseChange(index, 'wedding', date?.toISOString() || '')} className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
                        </div>
                    ))}

                    {/* Filhos */}
                    <div>
                        <Label className="block text-sm font-medium text-primus-blue dark:text-gray-200">Filhos</Label>
                        {children.map((child, index) => (
                            <div key={index} className="flex w-full items-center gap-2 mt-1">
                                <Input
                                    type="text"
                                    placeholder="Nome do filho/filha"
                                    list="primus-names"
                                    value={child.name}
                                    onChange={(e) => handleListChange(index, 'children', 'name', e.target.value)}
                                    className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                />
                                <DatePicker
                                    value={child.birth ? new Date(child.birth) : undefined}
                                    onChange={(date) => handleListChange(index, 'children', 'birth', date?.toISOString() || '')}
                                    className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeFromList(index, 'children')}>
                                    <MinusCircle className="h-5 w-5 text-primus-red dark:text-red-400" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="link" onClick={() => addToList('children')} className="text-sm text-primus-blue dark:text-primus-blue-light p-0 h-auto mt-1">+ Adicionar filho</Button>
                    </div>

                    <TransitionButton type="submit" className="w-full bg-primus-blue hover:bg-primus-blue-dark dark:bg-primus-blue-dark dark:hover:bg-primus-blue text-white py-2 px-4 rounded-md transition-colors mt-4">Salvar</TransitionButton>
                </form>
            </div>
        </div>
    );
}