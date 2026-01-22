import type { SortDirection, SortType } from "types/site";
import { getSecureRandom } from "./numbers";

/**
 * Sorts an array of objects based on a key, direction, and data type.
 */
export function sortArrayOfObjects<T>(
  data: T[],
  key: keyof T ,
  direction: SortDirection = 'asc',
  type: SortType = 'string'
): T[] {
  return [...data].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    let comparison = 0;

    if (type === 'number') {
      comparison = Number(valA) - Number(valB);
    } else {
      comparison = String(valA).localeCompare(String(valB));
    }
    return direction === 'asc' ? comparison : -comparison;
  });
}



export function shuffleArrayOfArrays<T>(array: T[][]): T[][] {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = getSecureRandom(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



