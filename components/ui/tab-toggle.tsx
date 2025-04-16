'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactNode } from 'react';

interface TabToggleProps {
  picklist: Array<{ label: ReactNode; value: string }>;
  defaultValue?: string;
  state: string;
  setState: (value: string) => void;
  className?: string;
}

export function TabToggle({
  picklist,
  defaultValue,
  state,
  setState,
  className,
}: TabToggleProps) {
  return (
    <Tabs
      value={state}
      onValueChange={setState}
      defaultValue={defaultValue ?? undefined}
      className={className}
    >
      <TabsList
        className="grid w-full h-full gap-1"
        style={{ gridTemplateColumns: `repeat(${picklist.length}, 1fr)` }}
      >
        {picklist.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="py-1 cursor-pointer hover:bg-muted"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
