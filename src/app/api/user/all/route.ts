// filepath: src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { User } from '@/interfaces';

export async function GET() {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList: User[] = [];
    userSnapshot.docs.forEach((doc) => {
        userList.push(doc.toJSON() as User);
    });
    return NextResponse.json(userList);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: 'Falha ao buscar dados' }, { status: 500 });
  }
}