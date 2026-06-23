import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
const loaders = { en: () => import("./dictionaries/en"), zh: () => import("./dictionaries/zh") } as const;
export async function getDictionary(lang: Locale): Promise<Dictionary> {
  return (await loaders[lang]()).default;
}
