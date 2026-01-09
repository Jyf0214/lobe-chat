// Mock resolvePublicAuthUrl logic
const resolvePublicAuthUrl = () => {
  if (process.env.NEXT_PUBLIC_AUTH_URL) return process.env.NEXT_PUBLIC_AUTH_URL;
  // Simplified client side logic, browser handles window.location anyway usually
  return undefined;
};

export const authEnv = {
  // ---------------------------------- clerk ----------------------------------
  NEXT_PUBLIC_ENABLE_CLERK_AUTH:
    process.env.NEXT_PUBLIC_ENABLE_CLERK_AUTH === '1' ||
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

  // ---------------------------------- better auth ----------------------------------
  NEXT_PUBLIC_ENABLE_BETTER_AUTH: process.env.NEXT_PUBLIC_ENABLE_BETTER_AUTH === '1',
  NEXT_PUBLIC_AUTH_URL: resolvePublicAuthUrl(),

  // ---------------------------------- next auth ----------------------------------
  NEXT_PUBLIC_ENABLE_NEXT_AUTH: process.env.NEXT_PUBLIC_ENABLE_NEXT_AUTH === '1',
};

// Auth flags
export const enableClerk =
  process.env.NEXT_PUBLIC_ENABLE_CLERK_AUTH === '1'
    ? true
    : !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const enableBetterAuth = process.env.NEXT_PUBLIC_ENABLE_BETTER_AUTH === '1';
export const enableNextAuth = process.env.NEXT_PUBLIC_ENABLE_NEXT_AUTH === '1';
export const enableAuth = enableClerk || enableBetterAuth || enableNextAuth || false;

// Auth headers and constants
export const LOBE_CHAT_AUTH_HEADER = 'X-lobe-chat-auth';
export const LOBE_CHAT_OIDC_AUTH_HEADER = 'Oidc-Auth';
export const OAUTH_AUTHORIZED = 'X-oauth-authorized';
export const SECRET_XOR_KEY = 'LobeHub · LobeHub';
