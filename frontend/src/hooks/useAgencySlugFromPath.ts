'use client';

import { useParams } from 'next/navigation';

/** Returns `/agency/:slug` when the current route is under an agency, else null. */
export function useAgencySlugFromPath(): string | null {
  const params = useParams();
  const slug = params?.slug;
  return typeof slug === 'string' ? slug : null;
}

export function useAgencyBasePath(): string | null {
  const slug = useAgencySlugFromPath();
  return slug ? `/agency/${slug}` : null;
}
