export function localize<T extends { en?: Partial<T> }>(item: T, locale: string): T {
  if (locale === "en" && item.en) {
    return { ...item, ...item.en };
  }
  return item;
}
