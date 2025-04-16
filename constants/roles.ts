import { Role } from '@/types/types';

// Role constants
export const ROLE_ADMIN: Role = 'admin';
export const ROLE_AUTHOR: Role = 'author';
export const ROLE_READER: Role = 'reader';
export const ROLE_BANNED: Role = 'banned';

// Role permissions
type Permissions = string[];

interface RolePermissions {
  admin: Permissions;
  author: Permissions;
  reader: Permissions;
  banned: Permissions;
}

// Not used yet
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: ['view_dashboard', 'manage_users', 'edit_stocks'],
  author: ['view_dashboard', 'manage_users', 'edit_stocks'],
  reader: ['view_dashboard', 'edit_stocks'],
  banned: [],
};
