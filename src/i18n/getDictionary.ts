import 'server-only'

// Use any to bypass TS inference issues with JSON imports
const dictionaries: Record<string, () => Promise<any>> = {
    en: () => import('./en.json').then((module) => module.default),
    de: () => import('./de.json').then((module) => module.default),
    fr: () => import('./fr.json').then((module) => module.default),
    es: () => import('./es.json').then((module) => module.default),
    vi: () => import('./vi.json').then((module) => module.default),
    ja: () => import('./ja.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale): Promise<any> => {
    console.log(`[i18n] Fetching dictionary for locale: ${locale}`);

    // partial match or fallback
    if (dictionaries[locale]) {
        try {
            return await dictionaries[locale]();
        } catch (error) {
            console.error(`[i18n] Failed to load dictionary for locale: ${locale}`, error);
            return dictionaries.en();
        }
    }

    console.warn(`[i18n] Locale "${locale}" not found, falling back to "en"`);
    return dictionaries.en(); // Fallback
}
