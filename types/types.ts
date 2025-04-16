import { Database } from './types_db';

export type Roles = Database['public']['Tables']['roles']['Row'];
export type Role = 'admin' | 'author' | 'reader' | 'banned';

export type ArticleStatus = 'Draft' | 'Published' | 'Archived';
export type Articles = Omit<
  Database['public']['Tables']['articles']['Row'],
  'status'
> & {
  status: ArticleStatus;
};

export type Users = Database['public']['Tables']['profiles']['Row'];
export type Profiles = Database['public']['Tables']['profiles']['Row'];

export type ProfilesWithRoles = Profiles & {
  role_id: Roles;
};

export type Tags = Database['public']['Tables']['tags']['Row'];
