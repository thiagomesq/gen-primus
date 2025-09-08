import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, getDocs, doc, getDoc, DocumentReference } from 'firebase/firestore';
import { Primus } from '@/interfaces';

/**
 * Esta rota busca todos os registros de 'primus' e popula os campos
 * 'father' e 'mother' com os objetos correspondentes (profundidade 1).
 * Utiliza um cache para minimizar as leituras do Firestore.
 */
export async function GET() {
  try {
    const primusCol = collection(db, 'primus');
    const primusSnapshot = await getDocs(primusCol);

    // Converte a snapshot inicial para um array de Primus com IDs
    const primusList = primusSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Primus[];

    // Cache para armazenar pais já buscados e evitar leituras repetidas
    const parentsCache = new Map<string, Primus>();

    // Função auxiliar para buscar um pai (do cache ou do Firestore)
    const getPrimus = async (id: string): Promise<Primus | null> => {
      if (parentsCache.has(id)) {
        return parentsCache.get(id)!;
      }
      const parentRef = doc(db, 'primus', id) as DocumentReference<Primus>;
      const parentSnap = await getDoc(parentRef);
      if (parentSnap.exists()) {
        const parentData = { id: parentSnap.id, ...parentSnap.data() };
        parentsCache.set(id, parentData); // Salva no cache para uso futuro
        return parentData;
      }
      return null;
    };

    // Itera sobre a lista e substitui os IDs de pai/mãe pelos objetos populados
    for (const primus of primusList) {
      if (primus.father && typeof primus.father === 'string') {
        primus.father = (await getPrimus(primus.father))!;
      }
      if (primus.mother && typeof primus.mother === 'string') {
        primus.mother = (await getPrimus(primus.mother))!;
      }
      if (primus.siblings) {
        primus.siblings = await Promise.all(
          primus.siblings.map(async (sibling) => {
            if (typeof sibling === 'string') {
              return (await getPrimus(sibling))!;
            }
            return sibling;
          })
        );
      }
      if (primus.children) {
        primus.children = await Promise.all(
          primus.children.map(async (child) => {
            if (typeof child === 'string') {
              return (await getPrimus(child))!;
            }
            return child;
          })
        );
      }
    }

    return NextResponse.json(primusList);

  } catch (error) {
    console.error("Erro ao buscar e popular a lista de primus:", error);
    return NextResponse.json({ error: 'Falha ao processar os dados' }, { status: 500 });
  }
}