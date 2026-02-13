'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import type { MainBroadcastEventKey, MainBroadcastParams } from './events';

interface ElectronAPI {
  ipcRenderer: {
    on: (event: MainBroadcastEventKey, listener: (e: any, data: any) => void) => void;
    removeListener: (event: MainBroadcastEventKey, listener: (e: any, data: any) => void) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

type BroadcastHandler<T extends MainBroadcastEventKey> = (data: MainBroadcastParams<T>) => void;
type SharedBroadcastHandler = BroadcastHandler<MainBroadcastEventKey>;

const eventHandlerMap = new Map<MainBroadcastEventKey, Set<SharedBroadcastHandler>>();
const eventListenerMap = new Map<MainBroadcastEventKey, (e: any, data: any) => void>();

const getIpcRenderer = () => {
  if (typeof window === 'undefined') return;
  return window.electron?.ipcRenderer;
};

const ensureEventListener = (event: MainBroadcastEventKey) => {
  const ipcRenderer = getIpcRenderer();
  if (!ipcRenderer) return;
  if (eventListenerMap.has(event)) return;

  const listener = (_e: any, data: unknown) => {
    const handlers = eventHandlerMap.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(data as MainBroadcastParams<typeof event>);
    }
  };

  eventListenerMap.set(event, listener);
  ipcRenderer.on(event, listener);
};

const cleanupEventListener = (event: MainBroadcastEventKey) => {
  const handlers = eventHandlerMap.get(event);
  if (handlers && handlers.size > 0) return;

  const ipcRenderer = getIpcRenderer();
  const listener = eventListenerMap.get(event);

  if (!ipcRenderer || !listener) return;

  ipcRenderer.removeListener(event, listener);
  eventListenerMap.delete(event);
};

export const useWatchBroadcast = <T extends MainBroadcastEventKey>(
  event: T,
  handler: (data: MainBroadcastParams<T>) => void,
) => {
  const handlerRef = useRef<typeof handler>(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const ipcRenderer = getIpcRenderer();
    if (!ipcRenderer) return;

    let handlers = eventHandlerMap.get(event);
    if (!handlers) {
      handlers = new Set<SharedBroadcastHandler>();
      eventHandlerMap.set(event, handlers);
    }

    const sharedHandler: SharedBroadcastHandler = (data) => {
      handlerRef.current(data as MainBroadcastParams<T>);
    };

    handlers.add(sharedHandler);
    ensureEventListener(event);

    return () => {
      const nextHandlers = eventHandlerMap.get(event);
      if (!nextHandlers) return;

      nextHandlers.delete(sharedHandler);

      if (nextHandlers.size === 0) {
        eventHandlerMap.delete(event);
      }

      cleanupEventListener(event);
    };
  }, [event]);
};
