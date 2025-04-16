'use client';

import * as React from 'react';
import {
  Activity,
  AtSign,
  BookCopy,
  BookOpen,
  BookOpenCheck,
  Bot,
  CircleHelp,
  Command,
  FileUser,
  Frame,
  GraduationCap,
  Hash,
  LifeBuoy,
  ListCheck,
  Map,
  MessageCircleQuestion,
  PieChart,
  Send,
  Settings2,
  Signature,
  SquareTerminal,
  StickyNote,
  TableOfContents,
  Tag,
  University,
  UserRoundPen,
  Users,
} from 'lucide-react';

import { NavMain } from '@/components/layout/nav-main';
import { NavProjects } from '@/components/layout/nav-projects';
import { NavSecondary } from '@/components/layout/nav-secondary';
import { NavUser } from '@/components/layout/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';
import { DarkModeToggle } from '../dark-mode-toggle';

const navMainData = [
  {
    title: 'Admin',
    url: '#',
    icon: Activity,
    isActive: true,
    items: [
      {
        title: 'Profiles',
        icon: GraduationCap,
        url: '/profiles',
      },
      {
        title: 'Roles',
        icon: ListCheck,
        url: '/roles',
      },
    ],
  },
  {
    title: 'Contents',
    url: '#',
    icon: TableOfContents,
    isActive: true,
    items: [
      {
        title: 'Articles',
        icon: StickyNote,
        url: '/articles',
      },
      {
        title: 'Categories',
        icon: Tag,
        url: '/categories',
      },
      {
        title: 'Tags',
        icon: Hash,
        url: '/tags',
      },
      {
        title: 'Individuals',
        icon: FileUser,
        url: '/individuals',
      },
    ],
  },
];

const navSecondaryData = [
  {
    title: 'Support',
    url: '#',
    icon: LifeBuoy,
  },
  {
    title: 'Feedback',
    url: '#',
    icon: Send,
  },
];

const projectsData = [
  {
    name: 'Emails',
    url: '/emails',
    icon: AtSign,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/" className="cursor-pointer">
                <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/images/symbol_white.svg"
                    alt="Obs Admin"
                    width={32}
                    height={32}
                    className="p-[2px]"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold font-fira uppercase">
                    Obs Admin
                  </span>
                  <span className="truncate text-xs">Centre de recherche</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
        <NavProjects projects={projectsData} />
        <NavSecondary items={navSecondaryData} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
