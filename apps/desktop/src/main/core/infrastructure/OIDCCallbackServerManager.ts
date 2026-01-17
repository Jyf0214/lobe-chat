import { getPort } from 'get-port-please';
import { IncomingMessage, ServerResponse, createServer } from 'node:http';

import { createLogger } from '@/utils/logger';

import type { App } from '../App';

const logger = createLogger('core:OIDCCallbackServerManager');

const CALLBACK_PORT_MIN = 34_210;
const CALLBACK_PORT_MAX = 34_219;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

interface PendingCallback {
  expectedState: string;
  reject: (error: Error) => void;
  resolve: (result: OIDCCallbackResult) => void;
  timeoutId: NodeJS.Timeout;
}

export interface OIDCCallbackResult {
  code?: string;
  error?: string;
  errorDescription?: string;
  state: string;
}

export class OIDCCallbackServerManager {
  private httpServer: ReturnType<typeof createServer> | null = null;
  private serverPort = 0;
  private pendingCallback: PendingCallback | null = null;

  constructor() {
    logger.debug('OIDCCallbackServerManager initialized');
  }

  async startCallbackServer(
    expectedState: string,
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ): Promise<{ port: number; waitForCallback: Promise<OIDCCallbackResult> }> {
    await this.stopCallbackServer();

    this.serverPort = await getPort({
      host: '127.0.0.1',
      port: CALLBACK_PORT_MIN,
      ports: Array.from({ length: CALLBACK_PORT_MAX - CALLBACK_PORT_MIN }, (_, index) => {
        return CALLBACK_PORT_MIN + index + 1;
      }),
    });

    const waitForCallback = new Promise<OIDCCallbackResult>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.pendingCallback) {
          this.pendingCallback = null;
        }

        reject(new Error('Local callback timed out'));
        void this.stopCallbackServer();
      }, timeoutMs);

      this.pendingCallback = {
        expectedState,
        reject,
        resolve,
        timeoutId,
      };
    });

    await new Promise<void>((resolve, reject) => {
      const server = createServer(async (req, res) => {
        try {
          await this.handleHttpRequest(req, res);
        } catch (error) {
          logger.error('Unhandled error in OIDC callback server:', error);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          }
        }
      });

      server.on('error', (error) => {
        logger.error('OIDC callback server error:', error);
        reject(error);
      });

      server.listen(this.serverPort, '127.0.0.1', () => {
        this.httpServer = server;
        logger.info(`OIDC callback server started on port ${this.serverPort}`);
        resolve();
      });
    });

    return { port: this.serverPort, waitForCallback };
  }

  async stopCallbackServer(): Promise<void> {
    if (this.pendingCallback) {
      clearTimeout(this.pendingCallback.timeoutId);
      this.pendingCallback.reject(new Error('Local callback server stopped'));
      this.pendingCallback = null;
    }

    if (!this.httpServer) {
      this.serverPort = 0;
      return;
    }

    await new Promise<void>((resolve) => {
      this.httpServer?.close(() => resolve());
    });

    this.httpServer = null;
    this.serverPort = 0;
    logger.info('OIDC callback server stopped');
  }

  destroy() {
    void this.stopCallbackServer();
  }

  getPort(): number {
    return this.serverPort;
  }

  private resolvePendingCallback(result: OIDCCallbackResult) {
    if (!this.pendingCallback) return;

    clearTimeout(this.pendingCallback.timeoutId);
    this.pendingCallback.resolve(result);
    this.pendingCallback = null;
  }

  private async handleHttpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://127.0.0.1:${this.serverPort}`);

    if (req.method !== 'GET' || url.pathname !== '/notify') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const state = url.searchParams.get('state');

    if (!state || state !== this.pendingCallback?.expectedState) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.getErrorPageHtml('Invalid state or missing state'));
      return;
    }

    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const code = url.searchParams.get('code');

    if (error) {
      this.resolvePendingCallback({
        error,
        errorDescription: errorDescription || undefined,
        state,
      });

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.getErrorPageHtml(errorDescription || error));
      void this.stopCallbackServer();
      return;
    }

    if (code) {
      this.resolvePendingCallback({ code, state });
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.getSuccessPageHtml());
      void this.stopCallbackServer();
      return;
    }

    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(this.getErrorPageHtml('Missing code'));
  }

  private getSuccessPageHtml(): string {
    return `<!DOCTYPE html>
<html>
<head><title>Authorization complete</title></head>
<body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
  <div style="text-align: center;">
    <h1 style="color: #2e7d32;">Authorization complete</h1>
    <p>You can close this window and return to LobeHub Desktop.</p>
  </div>
</body>
</html>`;
  }

  private getErrorPageHtml(message: string): string {
    return `<!DOCTYPE html>
<html>
<head><title>Authorization failed</title></head>
<body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
  <div style="text-align: center;">
    <h1 style="color: #d32f2f;">Authorization failed</h1>
    <p>${message}</p>
    <p>Please close this window and return to LobeHub Desktop.</p>
  </div>
</body>
</html>`;
  }
}
