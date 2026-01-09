import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import debug from 'debug';
import { type NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';
import urlJoin from 'url-join';

import { auth } from '@/auth';
import { LOBE_LOCALE_COOKIE } from '@/const/locale';
import { isDesktop } from '@/const/version';
import { appEnv } from '@/envs/app';
import { OAUTH_AUTHORIZED , authEnv } from '@/envs/auth';
import NextAuth from '@/libs/next-auth';
import { type Locales } from '@/locales/resources';
import { parseBrowserLanguage } from '@/utils/locale';
import { RouteVariants } from '@/utils/server/routeVariants';

// Create debug logger instances
const logDefault = debug('middleware:default');
const logNextAuth = debug('middleware:next-auth');
const logClerk = debug('middleware:clerk');
const logBetterAuth = debug('middleware:better-auth');

// OIDC session pre-sync constant
const OIDC_SESSION_HEADER = 'x-oidc-session-sync';

export function defineConfig() {
  const backendApiEndpoints = ['/api', '/trpc', '/webapi', '/oidc'];

  const defaultMiddleware = (request: NextRequest) => {
    const url = new URL(request.url);
    logDefault('Processing request: %s %s', request.method, request.url);

    // skip all api requests
    if (backendApiEndpoints.some((path) => url.pathname.startsWith(path))) {
      logDefault('Skipping API request: %s', url.pathname);
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  const isPublicRoute = createRouteMatcher([
    // backend api
    '/api/auth(.*)',
    '/api/webhooks(.*)',
    '/api/workflows(.*)',
    '/api/agent(.*)',
    '/webapi(.*)',
    '/trpc(.*)',
    // next auth
    '/next-auth/(.*)',
    // clerk
    '/login',
    '/signup',
    // better auth
    '/signin',
    '/verify-email',
    '/reset-password',
    // oauth
    // Make only the consent view public (GET page), not other oauth paths
    '/oauth/consent/(.*)',
    '/oidc/handoff',
    '/oidc/token',
    // market
    '/market-auth-callback',
  ]);

  const isProtectedRoute = createRouteMatcher([
    '/settings(.*)',
    '/knowledge(.*)',
    '/onboard(.*)',
    '/oauth(.*)',
    // ↓ cloud ↓
  ]);

  // Initialize an Edge compatible NextAuth middleware
  const nextAuthMiddleware = NextAuth.auth((req) => {
    logNextAuth('NextAuth middleware processing request: %s %s', req.method, req.url);

    const response = defaultMiddleware(req);

    // when enable auth protection, only public route is not protected, others are all protected
    const isProtected = appEnv.ENABLE_AUTH_PROTECTION ? !isPublicRoute(req) : isProtectedRoute(req);

    logNextAuth('Route protection status: %s, %s', req.url, isProtected ? 'protected' : 'public');

    // Just check if session exists
    const session = req.auth;

    // Check if next-auth throws errors
    // refs: https://github.com/lobehub/lobe-chat/pull/1323
    const isLoggedIn = !!session?.expires;

    logNextAuth('NextAuth session status: %O', {
      expires: session?.expires,
      isLoggedIn,
      userId: session?.user?.id,
    });

    // Remove & amend OAuth authorized header
    response.headers.delete(OAUTH_AUTHORIZED);
    if (isLoggedIn) {
      logNextAuth('Setting auth header: %s = %s', OAUTH_AUTHORIZED, 'true');
      response.headers.set(OAUTH_AUTHORIZED, 'true');

      // If OIDC is enabled and user is logged in, add OIDC session pre-sync header
      if (authEnv.ENABLE_OIDC && session?.user?.id) {
        logNextAuth('OIDC session pre-sync: Setting %s = %s', OIDC_SESSION_HEADER, session.user.id);
        response.headers.set(OIDC_SESSION_HEADER, session.user.id);
      }
    } else {
      // If request a protected route, redirect to sign-in page
      // ref: https://authjs.dev/getting-started/session-management/protecting
      if (isProtected) {
        logNextAuth('Request a protected route, redirecting to sign-in page');
        const authUrl = authEnv.NEXT_PUBLIC_AUTH_URL;
        const callbackUrl = `${authUrl}${req.nextUrl.pathname}${req.nextUrl.search}`;
        const nextLoginUrl = new URL('/next-auth/signin', authUrl);
        nextLoginUrl.searchParams.set('callbackUrl', callbackUrl);
        const hl = req.nextUrl.searchParams.get('hl');
        if (hl) {
          nextLoginUrl.searchParams.set('hl', hl);
          logNextAuth('Preserving locale to sign-in: hl=%s', hl);
        }
        return Response.redirect(nextLoginUrl);
      }
      logNextAuth('Request a free route but not login, allow visit without auth header');
    }

    return response;
  });

  const clerkAuthMiddleware = clerkMiddleware(
    async (auth, req) => {
      logClerk('Clerk middleware processing request: %s %s', req.method, req.url);

      // when enable auth protection, only public route is not protected, others are all protected
      const isProtected = appEnv.ENABLE_AUTH_PROTECTION
        ? !isPublicRoute(req)
        : isProtectedRoute(req);

      logClerk('Route protection status: %s, %s', req.url, isProtected ? 'protected' : 'public');

      if (isProtected) {
        logClerk('Protecting route: %s', req.url);
        await auth.protect();
      }

      const response = defaultMiddleware(req);

      const data = await auth();
      logClerk('Clerk auth status: %O', {
        isSignedIn: !!data.userId,
        userId: data.userId,
      });

      // If OIDC is enabled and Clerk user is logged in, add OIDC session pre-sync header
      if (authEnv.ENABLE_OIDC && data.userId) {
        logClerk('OIDC session pre-sync: Setting %s = %s', OIDC_SESSION_HEADER, data.userId);
        response.headers.set(OIDC_SESSION_HEADER, data.userId);
      } else if (authEnv.ENABLE_OIDC) {
        logClerk('No Clerk user detected, not setting OIDC session sync header');
      }

      return response;
    },
    {
      // https://github.com/lobehub/lobe-chat/pull/3084
      clockSkewInMs: 60 * 60 * 1000,
      signInUrl: '/login',
      signUpUrl: '/signup',
    },
  );

  const betterAuthMiddleware = async (req: NextRequest) => {
    logBetterAuth('BetterAuth middleware processing request: %s %s', req.method, req.url);

    const response = defaultMiddleware(req);

    // when enable auth protection, only public route is not protected, others are all protected
    const isProtected = !isPublicRoute(req);

    logBetterAuth('Route protection status: %s, %s', req.url, isProtected ? 'protected' : 'public');

    // Skip session lookup for public routes to reduce latency
    if (!isProtected) return response;

    // Get full session with user data (Next.js 15.2.0+ feature)
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const isLoggedIn = !!session?.user;

    logBetterAuth('BetterAuth session status: %O', {
      isLoggedIn,
      userId: session?.user?.id,
    });

    if (!isLoggedIn && !isDesktop) {
      // If request a protected route, redirect to sign-in page
      if (isProtected) {
        logBetterAuth('Request a protected route, redirecting to sign-in page');
        const authUrl = authEnv.NEXT_PUBLIC_AUTH_URL;
        const callbackUrl = `${authUrl}${req.nextUrl.pathname}${req.nextUrl.search}`;
        const signInUrl = new URL('/signin', authUrl);
        signInUrl.searchParams.set('callbackUrl', callbackUrl);
        const hl = req.nextUrl.searchParams.get('hl');
        if (hl) {
          signInUrl.searchParams.set('hl', hl);
          logBetterAuth('Preserving locale to sign-in: hl=%s', hl);
        }
        return Response.redirect(signInUrl);
      }
      logBetterAuth('Request a free route but not login, allow visit without auth header');
    }

    return response;
  };

  logDefault('Middleware configuration: %O', {
    enableAuthProtection: appEnv.ENABLE_AUTH_PROTECTION,
    enableBetterAuth: authEnv.NEXT_PUBLIC_ENABLE_BETTER_AUTH,
    enableClerk: authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH,
    enableNextAuth: authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH,
    enableOIDC: authEnv.ENABLE_OIDC,
  });

  return {
    middleware: authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH
      ? clerkAuthMiddleware
      : authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
        ? nextAuthMiddleware
        : betterAuthMiddleware,
  };
}
