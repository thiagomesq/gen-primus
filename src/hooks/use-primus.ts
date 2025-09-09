'use cliente';

import { CreatePrimus, Primus } from "@/interfaces";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

export function usePrimus() {
    const { token } = useAuth();
    const router = useRouter();
    const [primusList, setPrimusList] = useState<Primus[]>([]);

    async function getPrimus(): Promise<void> {
        try {
            const response = await fetch("/api/primus/all");
            if (!response.ok) {
                throw new Error("Failed to fetch primus");
            }
            const data = await response.json() as Primus[];
            data.sort((a, b) => a.name.localeCompare(b.name));
            setPrimusList(data);
        } catch (error) {
            console.error("Failed to fetch primus:", error);
            toast.error("Falha ao carregar a lista de pessoas.");
        }
    }

    async function getFamilyTree(id: string, depth?: number): Promise<Primus | null> {
        try {
            const response = await fetch(`/api/primus?primus=${id}${depth ? `&profundidade=${depth}` : ''}`);
            if (!response.ok) {
                throw new Error("Failed to fetch primus");
            }
            const data = await response.json() as Primus;
            return data;
        } catch (error) {
            console.error("Failed to fetch primus:", error);
            toast.error("Erro ao buscar a árvore genealógica");
            return null;
        }
    }

    async function createPrimus(newPrimus: CreatePrimus) {
        const response = await fetch("/api/completar-perfil", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(newPrimus),
        });
        if (!response.ok) {
            const errorData = await response.json();
            toast.error("Erro ao criar perfil");
            console.error("Failed to create profile:", errorData.error);
            return;
        }
        toast.success("Cadastro feito com sucesso!");
        router.push("/minha-arvore");
    }

    async function updatePrimus(id: string, updatedData: Partial<Primus>): Promise<boolean> {
        try {
            const response = await fetch(`/api/primus/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedData),
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao atualizar o perfil');
            }

            toast.success("Perfil atualizado com sucesso!");
            return true;
        } catch (error: any) {
            console.error("Failed to update primus:", error);
            toast.error(error.message || "Erro ao atualizar o perfil");
            return false;
        }
    }

    return { primusList, createPrimus, getPrimus, getFamilyTree, updatePrimus };
}