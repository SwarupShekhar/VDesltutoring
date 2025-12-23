import 'server-only'

const dictionaries = {
    en: () => import('./en.json').then((module) => module.default),
    de: () => import('./de.json').then((module) => module.default),
    fr: () => import('./fr.json').then((module) => module.default),
    es: () => import('./es.json').then((module) => module.default),
    vi: () => import('./vi.json').then((module) => module.default),
    ja: () => import('./ja.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
    // partial match or fallback
    if (dictionaries[locale]) {
        return dictionaries[locale]();
    }
    return dictionaries.en(); // Fallback
}
