'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { MonitorCog, MoonIcon, SunIcon } from 'lucide-react';

export function DarkModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
      <DropdownMenuRadioItem value="light" className="flex gap-2">
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
        <span>Light</span>
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="dark" className="flex gap-2">
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
        <span>Dark</span>
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="system" className="flex gap-2">
        <MonitorCog className="h-[1.2rem] w-[1.2rem]" />
        <span>System</span>
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}
