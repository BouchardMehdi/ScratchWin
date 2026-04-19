export function withBase(assetPath) {
  const normalizedPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}
