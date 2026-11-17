// OWNER: Dhruv. Turns what staff type in the pickup search into a bag number and prefix.
// "B1054", "b 1054", "1054" and "G-12" all work. Returns null when it is not a bag number.

/**
 * @param {unknown} text
 * @returns {{ prefix: "B" | "G" | null, number: number } | null}
 */
export function parseBagSearch(text) {
  const match = String(text ?? "")
    .trim()
    .toUpperCase()
    .match(/^([BG])?[\s-]*([0-9]{1,5})$/);
  if (!match) return null;
  const number = Number(match[2]);
  if (number < 1) return null;
  return { prefix: match[1] ?? null, number };
}
