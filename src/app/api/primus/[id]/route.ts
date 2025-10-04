import { Primus } from '@/interfaces';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// Função auxiliar para encontrar ou criar um primus e retornar seu ID
async function findOrCreatePrimus(primusData: any): Promise<string> {
  if (!primusData || !primusData.name) {
    throw new Error('Dados do Primus inválidos');
  }

  const primusCollection = adminDb.collection('primus');
  const querySnapshot = await primusCollection.where('name', '==', primusData.name).get();

  // Remove o ID para não tentar gravá-lo no documento
  const { id, ...dataToSave } = primusData;

  if (!querySnapshot.empty) {
    // Primus encontrado, atualiza e retorna o ID
    const docRef = querySnapshot.docs[0].ref;
    await docRef.set(dataToSave, { merge: true });
    return docRef.id;
  } else {
    // Primus não encontrado, cria um novo
    const newDocRef = await primusCollection.add({
      ...dataToSave
    });
    return newDocRef.id;
  }
}

// GET: Buscar um Primus pelo ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const docRef = adminDb.collection('primus').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error: any) {
    return NextResponse.json({ error: 'Falha ao buscar o perfil', details: error.message }, { status: 500 });
  }
}

// PUT: Atualizar um Primus pelo ID
export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;

    // Auth
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }
    const token = authorization.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    const primus:Partial<Primus> = await request.json();

    // Lida com a criação/atualização aninhada de pai e mãe
    if (primus.father && typeof primus.father === 'object') {
      primus.father = await findOrCreatePrimus(primus.father);
    }
    if (primus.mother && typeof primus.mother === 'object') {
      primus.mother = await findOrCreatePrimus(primus.mother);
    }

    // Lógica para converter outras datas de string para Timestamp do Firebase, se necessário
    if (primus.birth) primus.birth = new Date(primus.birth);
    if (primus.death) primus.death = new Date(primus.death);
    if (primus.marriedWith) {
      primus.marriedWith = primus.marriedWith.map((spouse: any) => ({
        ...spouse,
        wedding: spouse.wedding ? new Date(spouse.wedding) : undefined,
      }));
    }
    
    const docRef = adminDb.collection('primus').doc(id);
    await docRef.update(primus);

    return NextResponse.json({ message: 'Perfil atualizado com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Falha ao atualizar o perfil', details: error.message }, { status: 500 });
  }
}
