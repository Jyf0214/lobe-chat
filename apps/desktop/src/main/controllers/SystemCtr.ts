import { exec } from 'node:child_process';
import { join } from 'node:path';
import process from 'node:process';

import type { ElectronAppState, ThemeMode } from '@lobechat/electron-client-ipc';
import { app, dialog, nativeTheme, shell } from 'electron';
import { macOS } from 'electron-is';
import { pathExists, readdir } from 'fs-extra';

import { legacyLocalDbDir } from '@/const/dir';
import { createLogger } from '@/utils/logger';
import {
  getAccessibilityStatus,
  getFullDiskAccessStatus,
  getMediaAccessStatus,
  openFullDiskAccessSettings,
  requestAccessibilityAccess,
  requestMicrophoneAccess,
  requestScreenCaptureAccess,
} from '@/utils/permissions';

import { ControllerModule, IpcMethod } from './index';

const logger = createLogger('controllers:SystemCtr');

interface KnownApp {
  bundleName: string;
  id: string;
  name: string;
}

export interface InstalledApp {
  icon: string;
  id: string;
  name: string;
}

const KNOWN_APPS: KnownApp[] = [
  { bundleName: 'Cursor.app', id: 'cursor', name: 'Cursor' },
  { bundleName: 'Visual Studio Code.app', id: 'vscode', name: 'VS Code' },
  { bundleName: 'Zed.app', id: 'zed', name: 'Zed' },
  { bundleName: 'Xcode.app', id: 'xcode', name: 'Xcode' },
  { bundleName: 'WebStorm.app', id: 'webstorm', name: 'WebStorm' },
  { bundleName: 'IntelliJ IDEA.app', id: 'idea', name: 'IntelliJ IDEA' },
  { bundleName: 'Ghostty.app', id: 'ghostty', name: 'Ghostty' },
  { bundleName: 'iTerm.app', id: 'iterm', name: 'iTerm' },
  { bundleName: 'Fork.app', id: 'fork', name: 'Fork' },
  { bundleName: 'Trae.app', id: 'trae', name: 'Trae' },
];

export default class SystemController extends ControllerModule {
  static override readonly groupName = 'system';
  private systemThemeListenerInitialized = false;

  /**
   * Initialize system theme listener when app is ready
   */
  afterAppReady() {
    this.initializeSystemThemeListener();
  }

  /**
   * Handles the 'getDesktopAppState' IPC request.
   * Gathers essential application and system information.
   */
  @IpcMethod()
  async getAppState(): Promise<ElectronAppState> {
    const platform = process.platform;
    const arch = process.arch;

    return {
      // System Info
      arch,
      isLinux: platform === 'linux',
      isMac: platform === 'darwin',
      isWindows: platform === 'win32',
      locale: this.app.storeManager.get('locale', 'auto'),

      platform: platform as 'darwin' | 'win32' | 'linux',
      userPath: {
        // User Paths (ensure keys match UserPathData / DesktopAppState interface)
        desktop: app.getPath('desktop'),
        documents: app.getPath('documents'),
        downloads: app.getPath('downloads'),
        home: app.getPath('home'),
        music: app.getPath('music'),
        pictures: app.getPath('pictures'),
        userData: app.getPath('userData'),
        videos: app.getPath('videos'),
      },
    };
  }

  @IpcMethod()
  requestAccessibilityAccess() {
    return requestAccessibilityAccess();
  }

  @IpcMethod()
  getAccessibilityStatus() {
    const status = getAccessibilityStatus();
    return status === 'granted';
  }

  @IpcMethod()
  getFullDiskAccessStatus(): boolean {
    const status = getFullDiskAccessStatus();
    return status === 'granted';
  }

  /**
   * Prompt the user with a native dialog if Full Disk Access is not granted.
   *
   * @param options - Dialog options
   * @returns 'granted' if already granted, 'opened_settings' if user chose to open settings,
   *          'skipped' if user chose to skip, 'cancelled' if dialog was cancelled
   */
  @IpcMethod()
  async promptFullDiskAccessIfNotGranted(options?: {
    message?: string;
    openSettingsButtonText?: string;
    skipButtonText?: string;
    title?: string;
  }): Promise<'cancelled' | 'granted' | 'opened_settings' | 'skipped'> {
    // Check if already granted
    const status = getFullDiskAccessStatus();
    if (status === 'granted') {
      logger.info('[FullDiskAccess] Already granted, skipping prompt');
      return 'granted';
    }

    if (!macOS()) {
      logger.info('[FullDiskAccess] Not macOS, returning granted');
      return 'granted';
    }

    const mainWindow = this.app.browserManager.getMainWindow()?.browserWindow;

    // Get localized strings
    const t = this.app.i18n.ns('dialog');
    const title = options?.title || t('fullDiskAccess.title');
    const message = options?.message || t('fullDiskAccess.message');
    const openSettingsButtonText =
      options?.openSettingsButtonText || t('fullDiskAccess.openSettings');
    const skipButtonText = options?.skipButtonText || t('fullDiskAccess.skip');

    logger.info('[FullDiskAccess] Showing native prompt dialog');

    const result = await dialog.showMessageBox(mainWindow!, {
      buttons: [openSettingsButtonText, skipButtonText],
      cancelId: 1,
      defaultId: 0,
      message,
      title,
      type: 'info',
    });

    if (result.response === 0) {
      // User chose to open settings
      logger.info('[FullDiskAccess] User chose to open settings');
      await this.openFullDiskAccessSettings();
      return 'opened_settings';
    } else {
      // User chose to skip or cancelled
      logger.info('[FullDiskAccess] User chose to skip');
      return 'skipped';
    }
  }

  @IpcMethod()
  async getMediaAccessStatus(mediaType: 'microphone' | 'screen'): Promise<string> {
    return getMediaAccessStatus(mediaType);
  }

  @IpcMethod()
  async requestMicrophoneAccess(): Promise<boolean> {
    return requestMicrophoneAccess();
  }

  @IpcMethod()
  async requestScreenAccess(): Promise<boolean> {
    return requestScreenCaptureAccess();
  }

  @IpcMethod()
  async openFullDiskAccessSettings() {
    return openFullDiskAccessSettings();
  }

  @IpcMethod()
  openExternalLink(url: string) {
    return shell.openExternal(url);
  }

  @IpcMethod()
  async selectFolder(payload?: {
    defaultPath?: string;
    title?: string;
  }): Promise<string | undefined> {
    const mainWindow = this.app.browserManager.getMainWindow()?.browserWindow;

    const result = await dialog.showOpenDialog(mainWindow!, {
      defaultPath: payload?.defaultPath,
      properties: ['openDirectory', 'createDirectory'],
      title: payload?.title || 'Select Folder',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return undefined;
    }

    return result.filePaths[0];
  }

  @IpcMethod()
  getSystemLocale(): string {
    return app.getLocale();
  }

  @IpcMethod()
  async updateLocale(locale: string) {
    this.app.storeManager.set('locale', locale);

    await this.app.i18n.changeLanguage(locale === 'auto' ? app.getLocale() : locale);
    this.app.browserManager.broadcastToAllWindows('localeChanged', { locale });

    return { success: true };
  }

  @IpcMethod()
  async updateThemeModeHandler(themeMode: ThemeMode) {
    this.app.storeManager.set('themeMode', themeMode);
    this.app.browserManager.broadcastToAllWindows('themeChanged', { themeMode });
    this.setSystemThemeMode(themeMode);
    this.app.browserManager.handleAppThemeChange();
  }

  @IpcMethod()
  async getSystemThemeMode() {
    return nativeTheme.themeSource;
  }

  /**
   * Detect whether user used the legacy local database in older desktop versions.
   * Legacy path: {app.getPath('userData')}/lobehub-storage/lobehub-local-db
   */
  @IpcMethod()
  async hasLegacyLocalDb(): Promise<boolean> {
    if (!(await pathExists(legacyLocalDbDir))) return false;

    try {
      const entries = await readdir(legacyLocalDbDir);
      return entries.length > 0;
    } catch {
      // If directory exists but cannot be read, treat as "used" to surface guidance.
      return true;
    }
  }

  @IpcMethod()
  getWorkingDirectories(): Record<string, string> {
    return this.app.storeManager.get('workingDirectories', {});
  }

  @IpcMethod()
  setWorkingDirectory(payload: { key: string; path: string }): void {
    const current = this.app.storeManager.get('workingDirectories', {});
    this.app.storeManager.set('workingDirectories', { ...current, [payload.key]: payload.path });
  }

  @IpcMethod()
  removeWorkingDirectory(payload: { key: string }): void {
    const current = this.app.storeManager.get('workingDirectories', {});
    const { [payload.key]: _, ...rest } = current;
    this.app.storeManager.set('workingDirectories', rest);
  }

  @IpcMethod()
  async getInstalledApps(): Promise<InstalledApp[]> {
    if (process.platform !== 'darwin') return [];

    const results: InstalledApp[] = [];

    // Finder is always available on macOS
    const finderPath = '/System/Library/CoreServices/Finder.app';
    try {
      const finderIcon = await app.getFileIcon(finderPath, { size: 'small' });
      results.push({ icon: finderIcon.toDataURL(), id: 'finder', name: 'Finder' });
    } catch {
      results.push({ icon: '', id: 'finder', name: 'Finder' });
    }

    // Terminal.app is always available
    const terminalPaths = [
      '/System/Applications/Utilities/Terminal.app',
      '/Applications/Utilities/Terminal.app',
    ];
    for (const tp of terminalPaths) {
      if (await pathExists(tp)) {
        try {
          const icon = await app.getFileIcon(tp, { size: 'small' });
          results.push({ icon: icon.toDataURL(), id: 'terminal', name: 'Terminal' });
        } catch {
          results.push({ icon: '', id: 'terminal', name: 'Terminal' });
        }
        break;
      }
    }

    // Check known apps
    for (const knownApp of KNOWN_APPS) {
      const appPath = join('/Applications', knownApp.bundleName);
      if (await pathExists(appPath)) {
        try {
          const icon = await app.getFileIcon(appPath, { size: 'small' });
          results.push({ icon: icon.toDataURL(), id: knownApp.id, name: knownApp.name });
        } catch {
          results.push({ icon: '', id: knownApp.id, name: knownApp.name });
        }
      }
    }

    return results;
  }

  @IpcMethod()
  async openDirectoryInApp(payload: { appId: string; path: string }): Promise<void> {
    const { appId, path: dirPath } = payload;

    if (appId === 'finder') {
      await shell.openPath(dirPath);
      return;
    }

    if (process.platform !== 'darwin') return;

    // Find app name from known apps or built-in
    let appName: string | undefined;
    if (appId === 'terminal') {
      appName = 'Terminal';
    } else {
      const known = KNOWN_APPS.find((a) => a.id === appId);
      appName = known?.name;
    }

    if (!appName) return;

    return new Promise<void>((resolve, reject) => {
      exec(`open -a "${appName}" "${dirPath}"`, (error) => {
        if (error) {
          logger.error(`Failed to open directory in ${appName}:`, error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private async setSystemThemeMode(themeMode: ThemeMode) {
    nativeTheme.themeSource = themeMode;
  }

  private initializeSystemThemeListener() {
    if (this.systemThemeListenerInitialized) {
      logger.debug('System theme listener already initialized');
      return;
    }

    logger.info('Initializing system theme listener');

    // Listen for system theme changes
    nativeTheme.on('updated', () => {
      const isDarkMode = nativeTheme.shouldUseDarkColors;
      const systemTheme: ThemeMode = isDarkMode ? 'dark' : 'light';

      logger.info(`System theme changed to: ${systemTheme}`);

      // Broadcast system theme change to all renderer processes
      this.app.browserManager.broadcastToAllWindows('systemThemeChanged', {
        themeMode: systemTheme,
      });
    });

    this.systemThemeListenerInitialized = true;
    logger.info('System theme listener initialized successfully');
  }
}
