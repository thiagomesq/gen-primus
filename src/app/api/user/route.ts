import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    return NextResponse.json({ exists: userDoc.exists(), user: userDoc.data() }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve user" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { uid, name, email, photoURL } = await request.json();

  if (!uid || !name || !email || !photoURL ) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
      uid,
      name,
      email,
      photoURL,
      admin: false,
      contributor: false,
      createdAt: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
    }),
  });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  return NextResponse.next({ status: 200 });
}

export async function PUT(request: NextRequest) {
  const { uid, name, photoURL, creationCompleted, contributor, admin } = await request.json();

  if (!uid || !name ) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
      name,
      photoURL,
      creationCompleted,
      contributor,
      admin
    }, { merge: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }

  return NextResponse.next({ status: 200 });
}