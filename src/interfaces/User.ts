import { Primus } from "./Primus";

export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  perfil?: string;
  contributor: boolean;
  admin: boolean;
  createdAt: Date;
}
