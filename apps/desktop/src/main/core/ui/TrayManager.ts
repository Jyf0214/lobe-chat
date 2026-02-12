import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';
import { nativeTheme } from 'electron';

import { name } from '@/../../package.json';
import { isMac } from '@/const/env';
import { createLogger } from '@/utils/logger';

import type { App } from '../App';
import { Tray, TrayOptions } from './Tray';

// Create logger
const logger = createLogger('core:TrayManager');

/**
 * Tray identifier type
 */
export type TrayIdentifiers = 'main';

export class TrayManager {
  app: App;

  /**
   * Store all tray instances
   */
  trays: Map<TrayIdentifiers, Tray> = new Map();

  /**
   * Constructor
   * @param app Application instance
   */
  constructor(app: App) {
    logger.debug('Initialize TrayManager');
    this.app = app;
  }

  /**
   * Initialize all trays
   */
  initializeTrays() {
    logger.debug('Initialize application tray');

    // Initialize main tray
    this.initializeMainTray();
  }

  /**
   * Get main tray
   */
  getMainTray() {
    return this.retrieveByIdentifier('main');
  }

  /**
   * Initialize main tray
   */
  initializeMainTray() {
    logger.debug('Initialize main tray');
    return this.retrieveOrInitialize({
      iconPath: isMac
        ? nativeTheme.shouldUseDarkColorsForSystemIntegratedUI
          ? 'tray-dark.png'
          : 'tray-light.png'
        : 'tray.png',
      identifier: 'main', // Use app icon, ensure this file exists in resources directory
      tooltip: name, // Can use app.getName() or localized string
    });
  }

  /**
   * Retrieve tray instance by identifier
   * @param identifier Tray identifier
   */
  retrieveByIdentifier(identifier: TrayIdentifiers) {
    logger.debug(`Retrieve tray by identifier: ${identifier}`);
    return this.trays.get(identifier);
  }

  /**
   * Broadcast message to all trays
   * @param event Event name
   * @param data Event data
   */
  broadcastToAllTrays = <T extends MainBroadcastEventKey>(
    event: T,
    data: MainBroadcastParams<T>,
  ) => {
    logger.debug(`Broadcast event to all trays: ${event}`);
    this.trays.forEach((tray) => {
      tray.broadcast(event, data);
    });
  };

  /**
   * Broadcast message to specified tray
   * @param identifier Tray identifier
   * @param event Event name
   * @param data Event data
   */
  broadcastToTray = <T extends MainBroadcastEventKey>(
    identifier: TrayIdentifiers,
    event: T,
    data: MainBroadcastParams<T>,
  ) => {
    logger.debug(`Broadcast event to tray ${identifier}: ${event}`);
    this.trays.get(identifier)?.broadcast(event, data);
  };

  /**
   * Retrieve or initialize tray instance
   * @param options Tray options
   */
  private retrieveOrInitialize(options: TrayOptions) {
    let tray = this.trays.get(options.identifier as TrayIdentifiers);
    if (tray) {
      logger.debug(`Retrieve existing tray: ${options.identifier}`);
      return tray;
    }

    logger.debug(`Create new tray: ${options.identifier}`);
    tray = new Tray(options, this.app);

    this.trays.set(options.identifier as TrayIdentifiers, tray);

    return tray;
  }

  /**
   * Destroy all trays
   */
  destroyAll() {
    logger.debug('Destroy all trays');
    this.trays.forEach((tray) => {
      tray.destroy();
    });
    this.trays.clear();
  }
}
