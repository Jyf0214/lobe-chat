/// <reference types="vite/client" />
export interface LoadI18nNamespaceModuleParams {
  defaultLang: string;
  lng: string;
  normalizeLocale: (locale?: string) => string;
  ns: string;
}

export const loadI18nNamespaceModule = async (params: LoadI18nNamespaceModuleParams) => {
  const { defaultLang, normalizeLocale, lng, ns } = params;

  if (lng === defaultLang) return loadDefault(ns);

  try {
    const path = `../../../locales/${normalizeLocale(lng)}/${ns}.json`;
    const importer = localeResources[path];
    if (importer) return importer();
    throw new Error('Locale file not found');
  } catch {
    return loadDefault(ns);
  }
};

export interface LoadI18nNamespaceModuleWithFallbackParams extends LoadI18nNamespaceModuleParams {
  onFallback?: (params: { error: unknown; lng: string; ns: string }) => void;
}

export const loadI18nNamespaceModuleWithFallback = async (
  params: LoadI18nNamespaceModuleWithFallbackParams,
) => {
  const { onFallback, ...rest } = params;

  try {
    return await loadI18nNamespaceModule(rest);
  } catch (error) {
    onFallback?.({ error, lng: rest.lng, ns: rest.ns });
    return loadDefault(rest.ns);
  }
};

const defaultResources = import.meta.glob('../../locales/default/*.ts');
const localeResources = import.meta.glob('../../../locales/*/*.json');

const loadDefault = (ns: string) => {
  const path = `../../locales/default/${ns}.ts`;
  const importer = defaultResources[path];
  return importer ? importer() : import(`@/locales/default/${ns}`);
};
