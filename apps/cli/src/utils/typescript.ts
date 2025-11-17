import * as fs from "fs-extra";

/**
 * Add compiler options to a tsconfig.json file by manipulating it as text
 */
export async function addCompilerOptions(
  filePath: string,
  options: Record<string, any>
): Promise<void> {
  let content = await fs.readFile(filePath, "utf-8");

  // Find the compilerOptions section
  const compilerOptionsMatch = content.match(/"compilerOptions"\s*:\s*\{/);

  if (!compilerOptionsMatch) {
    // If no compilerOptions exist, we need to add it
    // Find the first { and add compilerOptions after it
    content = content.replace(/(\{)/, '$1\n  "compilerOptions": {},');
  }

  // Now find the closing brace of compilerOptions
  // We need to find the matching closing brace
  const startIndex = content.indexOf('"compilerOptions"');
  if (startIndex === -1) return;

  const openBraceIndex = content.indexOf("{", startIndex);
  let depth = 0;
  let closeBraceIndex = -1;

  for (let i = openBraceIndex; i < content.length; i++) {
    if (content[i] === "{") depth++;
    if (content[i] === "}") {
      depth--;
      if (depth === 0) {
        closeBraceIndex = i;
        break;
      }
    }
  }

  if (closeBraceIndex === -1) return;

  // Check what's before the closing brace (skip whitespace)
  let insertIndex = closeBraceIndex;
  let beforeCloseBrace = content.substring(0, closeBraceIndex).trimEnd();
  const needsComma =
    !beforeCloseBrace.endsWith("{") && !beforeCloseBrace.endsWith(",");

  // Build the options string
  const optionsEntries = Object.entries(options);
  let optionsText = "";

  for (let i = 0; i < optionsEntries.length; i++) {
    const entry = optionsEntries[i];
    if (!entry) continue;

    const [key, value] = entry;
    const isLast = i === optionsEntries.length - 1;

    if (i === 0 && needsComma) {
      optionsText += ",";
    }

    optionsText += `\n    "${key}": ${JSON.stringify(value)}`;
    if (!isLast) {
      optionsText += ",";
    }
  }

  // Insert the options before the closing brace
  content =
    content.substring(0, insertIndex) +
    optionsText +
    "\n  " +
    content.substring(insertIndex);

  await fs.writeFile(filePath, content, "utf-8");
}
