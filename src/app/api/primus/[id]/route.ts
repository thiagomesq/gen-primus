import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET: Buscar um Primus pelo ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const docRef = doc(db, 'primus', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error: any) {
    return NextResponse.json({ error: 'Falha ao buscar o perfil', details: error.message }, { status: 500 });
  }
}

// PUT: Atualizar um Primus pelo ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const docRef = doc(db, 'primus', params.id);

    // Lógica para converter datas de string para Timestamp do Firebase, se necessário
    // (O frontend deve enviar os dados no formato correto)

    await updateDoc(docRef, body);

    return NextResponse.json({ message: 'Perfil atualizado com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Falha ao atualizar o perfil', details: error.message }, { status: 500 });
  }
}
