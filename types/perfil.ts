export type Role = 'cliente' | 'vendedor';

export interface Perfil {
  user_id: string;
  role: Role;
  created_at: string;
}
