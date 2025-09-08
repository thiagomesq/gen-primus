import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, DocumentReference } from "firebase/firestore";
import { Primus } from "@/interfaces";

type PrimusCache = Map<string, Primus>;

async function fetchPrimusById(id: string, cache: PrimusCache): Promise<Primus | null> {
  if (cache.has(id)) return cache.get(id)!;
  const ref = doc(db, "primus", id) as DocumentReference<Primus>;
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const primus = { id, ...snap.data() } as Primus;
  cache.set(id, primus);
  return primus;
}

function extractId(refOrId: unknown): string | undefined {
  if (!refOrId) return undefined;
  if (typeof refOrId === "string") return refOrId;
  if (typeof refOrId === "object" && "id" in (refOrId as any)) return (refOrId as any).id as string;
  return undefined;
}

async function populateAncestors(
  primus: Primus,
  depthLeft: number,
  cache: PrimusCache,
  visited: Set<string>
): Promise<Primus> {
  if (depthLeft <= 0) return primus;

  const fatherId = extractId(primus.father);
  if (fatherId && !visited.has(fatherId)) {
    visited.add(fatherId);
    const father = await fetchPrimusById(fatherId, cache);
    if (father) primus.father = await populateAncestors(father, depthLeft - 1, cache, visited);
  }

  const motherId = extractId(primus.mother);
  if (motherId && !visited.has(motherId)) {
    visited.add(motherId);
    const mother = await fetchPrimusById(motherId, cache);
    if (mother) primus.mother = await populateAncestors(mother, depthLeft - 1, cache, visited);
  }

  return primus;
}

async function populateList(ids: string[] | undefined, cache: PrimusCache): Promise<Primus[]> {
  if (!ids?.length) return [];
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const results = await Promise.all(unique.map(id => fetchPrimusById(id, cache)));
  return results.filter(Boolean) as Primus[];
}

export async function GET(request: NextRequest) {
  try {
    const primusId = request.nextUrl.searchParams.get("primus");
    const parsed = Number.parseInt(request.nextUrl.searchParams.get("profundidade") ?? "", 10);
    const depth = Number.isNaN(parsed) ? 5 : Math.min(5, Math.max(1, parsed));
    if (!primusId) {
      return NextResponse.json({ error: "Primus is required" }, { status: 400 });
    }

    const cache: PrimusCache = new Map();
    const visited = new Set<string>([primusId]);

    const baseRef = doc(db, "primus", primusId) as DocumentReference<Primus>;
    const baseSnap = await getDoc(baseRef);
    if (!baseSnap.exists()) {
      return NextResponse.json({ error: "Primus not found" }, { status: 404 });
    }

    let basePrimus = { id: primusId, ...baseSnap.data() } as Primus;

    // Popula ancestralidade
    basePrimus = await populateAncestors(basePrimus, depth, cache, visited);

    // ---- Novas populações (irmãos, cônjuges, filhos) ----
    // Irmãos
    if (Array.isArray((basePrimus as any).siblings)) {
      (basePrimus as any).siblings = await populateList((basePrimus as any).siblings as string[], cache);
    }

    // Filhos
    if (Array.isArray((basePrimus as any).children)) {
      (basePrimus as any).children = await populateList((basePrimus as any).children as string[], cache);
    }

    // Cônjuges (estrutura: marriedWith: [{ idPrimus, name, wedding, actual }])
    if (Array.isArray((basePrimus as any).marriedWith)) {
      const marriedWith = (basePrimus as any).marriedWith as Array<any>;
      const populatedSpouses = await Promise.all(
        marriedWith.map(async (mw) => {
          if (!mw?.idPrimus) return mw;
          const spouse = await fetchPrimusById(mw.idPrimus, cache);
            // Mantém os dados originais e adiciona objeto completo
          return { ...mw, spouse };
        })
      );
      (basePrimus as any).marriedWith = populatedSpouses;
    }

    return NextResponse.json(basePrimus);
  } catch (error) {
    console.error("Erro ao buscar primus:", error);
    return NextResponse.json({ error: "Falha ao buscar dados" }, { status: 500 });
  }
}