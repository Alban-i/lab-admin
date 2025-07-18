import { Database } from './types_db';

export type Roles = Database['public']['Tables']['roles']['Row'];
export type Role = 'admin' | 'author' | 'reader' | 'banned';

export type ArticleStatus = 'Draft' | 'Published' | 'Archived';
export type Articles = Omit<
  Database['public']['Tables']['articles']['Row'],
  'status' | 'category_id'
> & {
  status: ArticleStatus;
  category_id: string | null;
  is_published: boolean;
};

export type Posts = Database['public']['Tables']['posts']['Row'];

export type Users = Database['public']['Tables']['profiles']['Row'];
export type Profiles = Database['public']['Tables']['profiles']['Row'];

export type ProfilesWithRoles = Profiles & {
  role_id: Roles;
};

export type Tags = Database['public']['Tables']['tags']['Row'];

export type Tasks = Omit<
  Database['public']['Tables']['tasks']['Row'],
  'owner_id'
> & {
  owner_id: null | {
    id: string;
    full_name: string;
  };
};

export type Classification =
  | 'individual'
  | 'organization'
  | 'institution'
  | 'collective';

export type Type = Database['public']['Tables']['types']['Row'] & {
  classification: Classification;
};
