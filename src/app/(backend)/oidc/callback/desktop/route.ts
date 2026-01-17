import debug from 'debug';
import { type NextRequest, NextResponse, after } from 'next/server';

import { OAuthHandoffModel } from '@/database/models/oauthHandoff';
import { serverDB } from '@/database/server';
import { correctOIDCUrl } from '@/utils/server/correctOIDCUrl';

const log = debug('lobe-oidc:callback:desktop');

const errorPathname = '/oauth/callback/error';
const DESKTOP_NOTIFY_PORT_MIN = 34210;
const DESKTOP_NOTIFY_PORT_MAX = 34219;

const isAllowedNotifyPort = (value: number): boolean =>
  Number.isInteger(value) && value >= DESKTOP_NOTIFY_PORT_MIN && value <= DESKTOP_NOTIFY_PORT_MAX;

interface OAuthCallbackPayload {
  code?: string;
  error?: string;
  error_description?: string;
  state: string;
}

/**
 * 安全地构建重定向URL，使用经过验证的 correctOIDCUrl 防止开放重定向攻击
 */
const buildRedirectUrl = (req: NextRequest, pathname: string): URL => {
  // 使用 req.nextUrl 作为基础URL，然后通过 correctOIDCUrl 进行验证和修正
  const baseUrl = req.nextUrl.clone();
  baseUrl.pathname = pathname;

  // correctOIDCUrl 会验证 X-Forwarded-* 头部并防止开放重定向攻击
  return correctOIDCUrl(req, baseUrl);
};

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state'); // This `state` is the handoff ID

    if (!state || typeof state !== 'string') {
      log('Missing state in callback');

      const errorUrl = buildRedirectUrl(req, errorPathname);
      errorUrl.searchParams.set('reason', 'invalid_request');

      log('Redirecting to error URL: %s', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    if (!code && !error) {
      log('Missing code or error in callback');

      const errorUrl = buildRedirectUrl(req, errorPathname);
      errorUrl.searchParams.set('reason', 'invalid_request');

      log('Redirecting to error URL: %s', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    log('Received OIDC callback. state(handoffId): %s', state);

    // The 'client' is 'desktop' because this redirect_uri is for the desktop client.
    const client = 'desktop';
    const payload: OAuthCallbackPayload = error
      ? { error, error_description: errorDescription || undefined, state }
      : { code: code as string, state };
    const id = state;

    const authHandoffModel = new OAuthHandoffModel(serverDB);
    const existing = await authHandoffModel.findActive(id, client);
    const mergedPayload = { ...(existing?.payload || {}), ...payload };
    const notifyPort =
      typeof mergedPayload.notifyPort === 'number' ? mergedPayload.notifyPort : undefined;

    await authHandoffModel.upsertPayload(id, client, mergedPayload);
    log('Handoff record created successfully for id: %s', id);

    // cleanup expired
    after(async () => {
      const cleanedCount = await authHandoffModel.cleanupExpired();

      log('Cleaned up %d expired handoff records', cleanedCount);
    });

    if (notifyPort && isAllowedNotifyPort(notifyPort)) {
      const localNotifyUrl = new URL(`http://127.0.0.1:${notifyPort}/notify`);

      if (error) {
        localNotifyUrl.searchParams.set('error', error);
        if (errorDescription) {
          localNotifyUrl.searchParams.set('error_description', errorDescription);
        }
      } else if (code) {
        localNotifyUrl.searchParams.set('code', code);
      }

      localNotifyUrl.searchParams.set('state', state);

      return NextResponse.redirect(localNotifyUrl);
    }

    const successUrl = buildRedirectUrl(req, '/oauth/callback/success');
    const errorUrl = buildRedirectUrl(req, errorPathname);

    // 添加调试日志
    log('Request host header: %s', req.headers.get('host'));
    log('Request x-forwarded-host: %s', req.headers.get('x-forwarded-host'));
    log('Request x-forwarded-proto: %s', req.headers.get('x-forwarded-proto'));
    log('Constructed success URL: %s', successUrl.toString());

    if (error) {
      errorUrl.searchParams.set('reason', error);
      if (errorDescription) {
        errorUrl.searchParams.set('errorMessage', errorDescription);
      }

      return NextResponse.redirect(errorUrl);
    }

    return NextResponse.redirect(successUrl);
  } catch (error) {
    log('Error in OIDC callback: %O', error);

    const errorUrl = buildRedirectUrl(req, errorPathname);
    errorUrl.searchParams.set('reason', 'internal_error');

    if (error instanceof Error) {
      errorUrl.searchParams.set('errorMessage', error.message);
    }

    log('Redirecting to error URL: %s', errorUrl.toString());
    return NextResponse.redirect(errorUrl);
  }
};
