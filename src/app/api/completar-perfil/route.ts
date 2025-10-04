import { admin, adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from "next/server";
import { CreatePrimus } from "@/interfaces";

type Rel =
  | "PAI" | "MAE" | "FILHO"
  | "IRMAO"
  | "CONJUGE"
  | "AVO" | "NETO"
  | "TIO" | "SOBRINHO";

export async function POST(request: NextRequest) {
  try {
    // Auth
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }
    const token = authorization.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Payload
    const newPrimus: CreatePrimus = await request.json();
    if (uid !== newPrimus.idUser) {
      return NextResponse.json({ error: "Unauthorized user" }, { status: 403 });
    }
    if (!newPrimus.name || !newPrimus.gender || !newPrimus.birth || (newPrimus.married && !newPrimus.marriedWith?.length)) {
      return NextResponse.json({ error: "Incomplete data" }, { status: 400 });
    }

    // Refs
    const primusRef = adminDb.collection("primus");
    const userRef = adminDb.collection("users");
    const relationshipsRef = adminDb.collection("relationships");

    // Helpers
    const relDocId = (fromPrimus: string, toPrimus: string, type: Rel) =>
      `${fromPrimus}__${toPrimus}__${type}`;

    const putRelationship = async (fromPrimus: string, toPrimus: string, type: Rel) => {
      await relationshipsRef.doc(relDocId(fromPrimus, toPrimus, type)).set(
        { fromPrimus, toPrimus, type },
        { merge: true }
      );
    };

    const addBidirectional = async (
      personA: string,
      personB: string,
      typeAB: Rel,
      typeBA: Rel
    ) => {
      await Promise.all([
        putRelationship(personA, personB, typeAB),
        putRelationship(personB, personA, typeBA),
      ]);
    };

    const getOrCreatePrimus = async (name: string, birth?: Date, gender?: "MASCULINO" | "FEMININO"): Promise<string> => {
      const snapshot = await primusRef.where("name", "==", name).limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        // Se encontramos a pessoa, mas ela não tem gênero definido, atualizamos.
        if (!doc.data().gender && gender) {
          await primusRef.doc(doc.id).set({ gender }, { merge: true });
        }
        return doc.id;
      }
      
      const docData: { name: string, birth?: Date, gender?: "MASCULINO" | "FEMININO" } = { name };
      if (birth) docData.birth = birth;
      if (gender) docData.gender = gender;
      
      const docRef = await primusRef.add(docData);
      return docRef.id;
    };

    const upsertSelf = async (): Promise<string> => {
      const snapshot = await primusRef.where("name", "==", newPrimus.name).limit(1).get();
      const docData = {
        name: newPrimus.name,
        gender: newPrimus.gender,
        birth: newPrimus.birth,
        photoURL: newPrimus.photoURL,
        birthPlace: newPrimus.birthPlace,
        bio: newPrimus.bio,
      };

      if (!snapshot.empty) {
        const id = snapshot.docs[0].id;
        await primusRef.doc(id).set(docData, { merge: true });
        return id;
      } else {
        const docRef = await primusRef.add(docData);
        return docRef.id;
      }
    };

    const updateKinshipArrays = async (personId: string, field: "children" | "siblings" | "marriedWith", ids: any[]) => {
      if (!ids.length) return;
      await primusRef.doc(personId).set(
        { [field]: admin.firestore.FieldValue.arrayUnion(...ids) },
        { merge: true }
      );
    };

    const updateParentRelationships = async (
      parentId: string,
      parentType: "PAI" | "MAE",
      selfId: string,
      siblingsIds: string[],
      childrenIds: string[],
    ) => {
      const allChildren = [selfId, ...siblingsIds];
      // Atualiza array do pai/mãe
      await updateKinshipArrays(parentId, "children", allChildren);

      // Relação pai/mãe <-> filho
      await Promise.all(
        allChildren.map(child =>
          addBidirectional(parentId, child, parentType, "FILHO")
        )
      );

      // Relações de avô/avó <-> neto
      await Promise.all(
        childrenIds.map(child => addBidirectional(parentId, child, "AVO", "NETO"))
      );
    };

    // Resolve IDs das entidades relacionadas
    const fatherId = newPrimus.father
      ? await getOrCreatePrimus(newPrimus.father, newPrimus.fatherBirth, "MASCULINO")
      : null;

    const motherId = newPrimus.mother
      ? await getOrCreatePrimus(newPrimus.mother, newPrimus.motherBirth, "FEMININO")
      : null;

    const siblingsIds = newPrimus.siblings?.length
      ? await Promise.all(
          newPrimus.siblings.map((name, i) =>
            getOrCreatePrimus(name, newPrimus.siblingsBirth?.[i])
          )
        )
      : [];

    const childrenIds = newPrimus.children?.length
      ? await Promise.all(
          newPrimus.children.map((name, i) =>
            getOrCreatePrimus(name, newPrimus.childrenBirth?.[i])
          )
        )
      : [];

    const marriedWith = (newPrimus.marriedWith || []);
    const marriedWithIds = marriedWith.length
      ? await Promise.all(marriedWith.map(s => getOrCreatePrimus(s.name)))
      : [];

    // Upsert do próprio registro (id final)
    const selfId = await upsertSelf();

    // Ligações diretas no documento do próprio primus
    await primusRef.doc(selfId).set(
      {
        father: fatherId || null,
        mother: motherId || null,
        siblings: siblingsIds,
        married: !!newPrimus.married,
        marriedWith: marriedWith.map((s, i) => ({
          idPrimus: marriedWithIds[i],
          name: s.name,
          wedding: s.wedding ? new Date(s.wedding) : undefined,
          actual: !!s.actual,
        })),
        children: childrenIds,
      },
      { merge: true }
    );

    // Relacionamentos pais
    if (fatherId) await updateParentRelationships(fatherId, "PAI", selfId, siblingsIds, childrenIds);
    if (motherId) await updateParentRelationships(motherId, "MAE", selfId, siblingsIds, childrenIds);

    // Se os pais são casados, marca o casamento e cria relação
    if (fatherId && motherId && newPrimus.parentsMarried) {
      await Promise.all([
        primusRef.doc(fatherId).set(
          {
            married: true,
            marriedWith: [{ idPrimus: motherId, name: newPrimus.mother!, actual: true }],
          },
          { merge: true }
        ),
        primusRef.doc(motherId).set(
          {
            married: true,
            marriedWith: [{ idPrimus: fatherId, name: newPrimus.father!, actual: true }],
          },
          { merge: true }
        ),
        addBidirectional(fatherId, motherId, "CONJUGE", "CONJUGE"),
      ]);
    }

    // Irmãos e sobrinhos
    await Promise.all(
      siblingsIds.map(async (sibId) => {
        await addBidirectional(selfId, sibId, "IRMAO", "IRMAO");
        await Promise.all(
          childrenIds.map(child => addBidirectional(sibId, child, "TIO", "SOBRINHO"))
        );
      })
    );

    // Cônjuge(s)
    await Promise.all(
      marriedWithIds.map(spouseId => addBidirectional(selfId, spouseId, "CONJUGE", "CONJUGE"))
    );

    // Filhos: self <-> filho e cônjuge(s) <-> filho
    await Promise.all([
      ...childrenIds.map(child =>
        addBidirectional(
          selfId,
          child,
          newPrimus.gender === "MASCULINO" ? "PAI" : "MAE",
          "FILHO"
        )
      ),
      ...(marriedWithIds.length
        ? marriedWithIds.flatMap(spouseId =>
            childrenIds.map(child =>
              addBidirectional(
                spouseId,
                child,
                newPrimus.gender === "MASCULINO" ? "MAE" : "PAI",
                "FILHO"
              )
            )
          )
        : []),
    ]);

    // Vincula perfil ao usuário
    await userRef.doc(uid).set({ perfil: selfId }, { merge: true });

    return NextResponse.json({ success: true, id: selfId });
  } catch (error: any) {
    console.error("Error creating profile:", error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error creating profile: " + error.message }, { status: 500 });
  }
}