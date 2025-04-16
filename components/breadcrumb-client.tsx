'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

const BreadcrumbClient = () => {
  const pathname = usePathname(); // e.g., "/sessions/session/3b58e651-d11f-4de7-8e73-1d6c72baf877"

  // Split pathname into segments
  const pathSegments = pathname.split('/').filter(Boolean); // Remove empty parts

  // Detect and exclude empty grouping folders dynamically
  const filteredSegments = pathSegments.filter(
    (segment, index, allSegments) => {
      if (index === 0) return true; // Always keep the first segment (e.g., "sessions")

      const parentSegment = allSegments[index - 1]; // Previous segment
      return segment !== parentSegment.slice(0, -1); // Exclude if it's singular form of the parent
    }
  );

  // Capitalize function, keeping IDs unchanged
  const capitalize = (s: string) =>
    /^[a-zA-Z]+$/.test(s) ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  // Build breadcrumb items
  const breadcrumbs = filteredSegments.map((segment, index) => {
    const href = '/' + filteredSegments.slice(0, index + 1).join('/');
    return { label: capitalize(segment), href };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home Link */}
        <BreadcrumbItem key="home" className="hidden md:block">
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((breadcrumb, index) => (
          <Fragment key={breadcrumb.href}>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={breadcrumb.href}>
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbClient;
