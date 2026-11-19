// OWNER: Aarabdh. Reads the number of clothes a student typed, for handing in and for changing the count.
// Only whole numbers from 1 to MAX_CLOTHES pass. Returns the number, or null when it is not valid.

export const MAX_CLOTHES = 100;

/** @param {unknown} value */
export function parseClothesCount(value) {
  const text = String(value ?? "").trim();
  if (!/^[0-9]{1,3}$/.test(text)) return null;
  const count = Number(text);
  return count >= 1 && count <= MAX_CLOTHES ? count : null;
}
