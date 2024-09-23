export const getSupabaseAuthRedirectURL = (original: string, queryParam?: string) => {
  let url: string;

  if (process.env.NODE_ENV === 'production') {
    // Production environment
    url = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || original || '';
    // Ensure https:// is included
    url = url.startsWith('http') ? url : `https://${url}`;
  } else {
    // Development environment
    url = 'http://127.0.0.1:3000';
  }

  // Ensure trailing slash
  url = url.endsWith('/') ? url : `${url}/`;

  // Add auth callback path
  url += 'auth/callback';

  // Add query parameters if provided
  if (queryParam) {
    url += `?${queryParam}`;
  }
  return url;
}