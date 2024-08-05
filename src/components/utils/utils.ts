export function getNameRepository(url: string): string {
  return encodeURIComponent(url.replace('https://github.com/', ''))
}
