export function getAuthorRoute(authorName: string) {
  return `/author/${encodeURIComponent(authorName)}`;
}

export function parseAuthorRouteParam(authorParam: string) {
  return decodeURIComponent(authorParam);
}
