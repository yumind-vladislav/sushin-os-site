export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sushin.dev').replace(
  /\/$/,
  '',
);

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, `${siteUrl}/`).toString();
}
