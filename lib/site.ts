export const localDevelopmentSiteUrl = 'http://localhost:3000';

export function resolveSiteUrl(configuredUrl?: string): string {
  const candidate = configuredUrl?.trim() || localDevelopmentSiteUrl;
  const url = new URL(candidate);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new TypeError('NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin');
  }
  return url.origin;
}

export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, `${siteUrl}/`).toString();
}
