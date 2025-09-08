export interface Primus {
    id?: string;
    name: string;
    gender?: string;
    photoURL?: string;
    birth?: Date;
    death?: Date;
    birthPlace?: string;
    deathPlace?: string;
    bio?: string;
    father?: Primus | string;
    mother?: Primus | string;
    siblings?: (Primus | string)[];
    married?: boolean;
    children?: (Primus | string)[];
    marriedWith?: Spouse[];
}

export interface CreatePrimus {
    idUser: string;
    name: string;
    gender: string;
    photoURL: string;
    birth: Date;
    birthPlace?: string;
    bio?: string;
    father?: string;
    fatherBirth?: Date;
    mother?: string;
    motherBirth?: Date;
    parentsMarried?: boolean;
    siblings?: string[];
    siblingsBirth?: (Date | undefined)[];
    married?: boolean;
    children?: string[];
    childrenBirth?: (Date | undefined)[];
    marriedWith?: Spouse[];
}

export interface Spouse {
    idPrimus?: string;
    name: string;
    wedding?: Date;
    actual?: boolean;
}

export const gender: Record<string, string> = {
    MASCULINO: "Masculino",
    FEMININO: "Feminino"
};

export const Kinship: Record<string, string> = {
    PAI: "Pai",
    MAE: "Mãe",
    AVO: "Avô/Avó",
    BISAVO: "Bisavô/Bisavó",
    TRISAVO: "Trisavô/Trisavó",
    TETRAVO: "Tetravô/Tetravó",
    PENTAVO: "Pentavô/Pentavó",
    IRMAO: "Irmã(o)",
    TIO: "Tio(a)",
    PRIMO: "Primo/Prima em 1º grau",
    PRIMO_SEGUNDO: "Primo/Prima em 2º grau",
    PRIMO_TERCEIRO: "Primo/Prima em 3º grau",
    PRIMO_QUARTO: "Primo/Prima em 4º grau",
    PRIMO_QUINTO: "Primo/Prima em 5º grau",
    CONJUGE: "Cônjuge",
    FILHO: "Filho(a)",
    NETO: "Neto(a)",
    BISNETO: "Bisneto(a)",
    TRINETO: "Trineto(a)",
    TETRANETO: "Tetraneto(a)",
    PENTANETO: "Pentaneto(a)",
    SOBRINHO: "Sobrinho(a)",
    SOBRINHO_NETO: "Sobrinho Neto(a)",
    SOBRINHO_BISNETO: "Sobrinho Bisneto(a)",
    SOBRINHO_TRINETO: "Sobrinho Trineto(a)",
    SOBRINHO_TETRANETO: "Sobrinho Tetraneto(a)",
    SOBRINHO_PENTANETO: "Sobrinho Pentaneto(a)",
};

export interface ExtPrimus extends Omit<Primus, 'father' | 'mother'> {
  father?: ExtPrimus | string | null;
  mother?: ExtPrimus | string | null;
}