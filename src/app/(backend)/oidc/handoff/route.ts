import debug from 'debug';
import { type NextRequest, NextResponse } from 'next/server';

import { OAuthHandoffModel } from '@/database/models/oauthHandoff';
import { serverDB } from '@/database/server';

const log = debug('lobe-oidc:handoff');

const DESKTOP_NOTIFY_PORT_MIN = 34210;
const DESKTOP_NOTIFY_PORT_MAX = 34219;

interface HandoffRegistrationBody {
  client: string;
  id: string;
  notifyPort: number;
}

const isAllowedNotifyPort = (value: number): boolean =>
  Number.isInteger(value) && value >= DESKTOP_NOTIFY_PORT_MIN && value <= DESKTOP_NOTIFY_PORT_MAX;

/**
 * GET /oidc/handoff?id=xxx&client=xxx
 * 轮询获取并消费认证凭证
 */
export async function GET(request: NextRequest) {
  log('Received GET request for /oidc/handoff');

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const client = searchParams.get('client');

    if (!id || !client) {
      return NextResponse.json(
        { error: 'Missing required parameters: id and client' },
        { status: 400 },
      );
    }

    log('Fetching handoff record - id=%s, client=%s', id, client);

    const authHandoffModel = new OAuthHandoffModel(serverDB);
    const result = await authHandoffModel.fetchAndConsume(id, client);

    if (!result) {
      log('Handoff record not found or expired - id=%s', id);
      return NextResponse.json({ error: 'Handoff record not found or expired' }, { status: 404 });
    }

    log('Handoff record found and consumed - id=%s', id);

    return NextResponse.json({ data: result, success: true });
  } catch (error) {
    log('Error fetching handoff record: %O', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /oidc/handoff
 * Register desktop notifyPort for a given handoff id (state)
 */
export async function POST(request: NextRequest) {
  log('Received POST request for /oidc/handoff');

  let body: HandoffRegistrationBody;

  try {
    body = (await request.json()) as HandoffRegistrationBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { client, id, notifyPort } = body;

  if (!id || !client) {
    return NextResponse.json(
      { error: 'Missing required parameters: id and client' },
      { status: 400 },
    );
  }

  if (client !== 'desktop') {
    return NextResponse.json({ error: 'Unsupported client type' }, { status: 400 });
  }

  if (!isAllowedNotifyPort(notifyPort)) {
    return NextResponse.json({ error: 'Invalid notifyPort' }, { status: 400 });
  }

  try {
    const authHandoffModel = new OAuthHandoffModel(serverDB);
    const existing = await authHandoffModel.findActive(id, client);
    const payload = { ...(existing?.payload || {}), notifyPort };

    await authHandoffModel.upsertPayload(id, client, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    log('Error registering notifyPort: %O', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
