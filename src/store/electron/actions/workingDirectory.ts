import isEqual from 'fast-deep-equal';
import { type SWRResponse } from 'swr';
import useSWR from 'swr';

import { mutate } from '@/libs/swr';
import { electronSystemService } from '@/services/electron/system';
import { type InstalledApp } from '@/store/electron/initialState';
import { type StoreSetter } from '@/store/types';

import { type ElectronStore } from '../store';

const ELECTRON_WORKING_DIRECTORIES_KEY = 'electron:getWorkingDirectories';
const ELECTRON_INSTALLED_APPS_KEY = 'electron:getInstalledApps';

type Setter = StoreSetter<ElectronStore>;
export const workingDirectorySlice = (set: Setter, get: () => ElectronStore, _api?: unknown) =>
  new WorkingDirectoryActionImpl(set, get, _api);

export class WorkingDirectoryActionImpl {
  readonly #get: () => ElectronStore;
  readonly #set: Setter;

  constructor(set: Setter, get: () => ElectronStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
  }

  refreshWorkingDirectories = async (): Promise<void> => {
    await mutate(ELECTRON_WORKING_DIRECTORIES_KEY);
  };

  setWorkingDirectory = async (key: string, path: string): Promise<void> => {
    const current = this.#get().workingDirectories;
    this.#set({ workingDirectories: { ...current, [key]: path } });
    await electronSystemService.setWorkingDirectory(key, path);
  };

  removeWorkingDirectory = async (key: string): Promise<void> => {
    const { [key]: _, ...rest } = this.#get().workingDirectories;
    this.#set({ workingDirectories: rest });
    await electronSystemService.removeWorkingDirectory(key);
  };

  openDirectoryInApp = async (appId: string, path: string): Promise<void> => {
    await electronSystemService.openDirectoryInApp(appId, path);
  };

  useFetchInstalledApps = (): SWRResponse => {
    return useSWR<InstalledApp[]>(
      ELECTRON_INSTALLED_APPS_KEY,
      async () => electronSystemService.getInstalledApps(),
      {
        onSuccess: (data: InstalledApp[]) => {
          if (!isEqual(data, this.#get().installedApps)) {
            this.#set({ installedApps: data });
          }
        },
        revalidateOnFocus: false,
      },
    );
  };

  useFetchWorkingDirectories = (): SWRResponse => {
    return useSWR<Record<string, string>>(
      ELECTRON_WORKING_DIRECTORIES_KEY,
      async () => electronSystemService.getWorkingDirectories(),
      {
        onSuccess: (data) => {
          if (!isEqual(data, this.#get().workingDirectories)) {
            this.#set({ workingDirectories: data });
          }
        },
      },
    );
  };
}

export type WorkingDirectoryAction = Pick<
  WorkingDirectoryActionImpl,
  keyof WorkingDirectoryActionImpl
>;
