import {
  type DataSyncConfig,
  type ElectronAppState,
  type NetworkProxySettings,
} from '@lobechat/electron-client-ipc';

import { type NavigationHistoryState } from './actions/navigationHistory';
import { navigationHistoryInitialState } from './actions/navigationHistory';
import { type RecentPagesState } from './actions/recentPages';
import { recentPagesInitialState } from './actions/recentPages';

export type RemoteServerError = 'CONFIG_ERROR' | 'AUTH_ERROR' | 'DISCONNECT_ERROR';

export const defaultProxySettings: NetworkProxySettings = {
  enableProxy: false,
  proxyBypass: 'localhost, 127.0.0.1, ::1',
  proxyPort: '',
  proxyRequireAuth: false,
  proxyServer: '',
  proxyType: 'http',
};

export interface InstalledApp {
  icon: string;
  id: string;
  name: string;
}

export interface ElectronState extends NavigationHistoryState, RecentPagesState {
  appState: ElectronAppState;
  dataSyncConfig: DataSyncConfig;
  desktopHotkeys: Record<string, string>;
  installedApps: InstalledApp[];
  isAppStateInit?: boolean;
  isConnectingServer?: boolean;
  isConnectionDrawerOpen?: boolean;
  isDesktopHotkeysInit: boolean;
  isInitRemoteServerConfig: boolean;
  isSyncActive?: boolean;
  proxySettings: NetworkProxySettings;
  remoteServerSyncError?: { message?: string; type: RemoteServerError };
  workingDirectories: Record<string, string>;
}

export const initialState: ElectronState = {
  ...navigationHistoryInitialState,
  ...recentPagesInitialState,
  appState: {},
  dataSyncConfig: { storageMode: 'cloud' },
  desktopHotkeys: {},
  installedApps: [],
  isAppStateInit: false,
  isConnectingServer: false,
  isConnectionDrawerOpen: false,
  isDesktopHotkeysInit: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
  proxySettings: defaultProxySettings,
  workingDirectories: {},
};
