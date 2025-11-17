export function getCSSVariable(variableName: string): string {
  if (typeof window === "undefined") return "";

  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}
