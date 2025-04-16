'use client';

import { LogOutIcon } from 'lucide-react';
import { DropdownMenuItem } from './ui/dropdown-menu';

const LogoutBtn = () => {
  return (
    <form action="/api/auth/signout" method="post">
      <button type="submit" className="text-destructive w-full">
        <DropdownMenuItem>
          <LogOutIcon className="text-destructive" />
          Log out
        </DropdownMenuItem>
      </button>
    </form>
  );
};

export default LogoutBtn;
