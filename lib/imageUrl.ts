// Image URL helpers — pass through for now.
// When server-side image transforms are enabled, these can append ?width=N.

export function imageUrl(url: string | undefined): string | undefined {
  return url;
}

export const thumbUrl = (url: string | undefined) => url;
export const smallUrl = (url: string | undefined) => url;
export const mediumUrl = (url: string | undefined) => url;
export const fullUrl = (url: string | undefined) => url;
