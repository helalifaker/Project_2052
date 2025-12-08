/**
 * Dashboard Filter Utilities
 *
 * Provides functions for filtering proposal data displayed in dashboard charts.
 * Supports:
 * - Filtering by selected proposal IDs
 * - Limiting to max proposals
 * - Recalculating winners within filtered subset
 */

/**
 * Filter data array by selected proposal IDs with max limit.
 *
 * @param data - Array of proposal data with proposalId field
 * @param selectedIds - Array of selected proposal IDs (empty = show all up to max)
 * @param maxProposals - Maximum number of proposals to return
 * @returns Filtered array respecting selection and max limit
 */
export function filterBySelectedProposals<T extends { proposalId: string }>(
  data: T[],
  selectedIds: string[],
  maxProposals: number,
): T[] {
  if (!data || data.length === 0) {
    return [];
  }

  // If no selection, return first N proposals
  if (selectedIds.length === 0) {
    return data.slice(0, maxProposals);
  }

  // Filter to selected proposals, respecting max limit
  return data
    .filter((item) => selectedIds.includes(item.proposalId))
    .slice(0, maxProposals);
}

/**
 * Recalculate winner flag within a filtered subset.
 *
 * The winner is determined by comparing a metric value across all items.
 * Only one item will have isWinner=true (the best performer).
 *
 * @param data - Array of proposal data
 * @param getValue - Function to extract the comparison metric value
 * @param higherIsBetter - If true, highest value wins; if false, lowest wins
 * @returns New array with updated isWinner flags
 */
export function recalculateWinner<
  T extends { proposalId: string; isWinner?: boolean },
>(
  data: T[],
  getValue: (item: T) => number,
  higherIsBetter: boolean = true,
): T[] {
  if (!data || data.length === 0) {
    return [];
  }

  // For single item, it's automatically the winner
  if (data.length === 1) {
    return data.map((item) => ({ ...item, isWinner: true }));
  }

  // Find the best value
  let bestValue = higherIsBetter ? -Infinity : Infinity;
  let winnerId: string | null = null;

  for (const item of data) {
    const value = getValue(item);
    const isBetter = higherIsBetter ? value > bestValue : value < bestValue;

    if (isBetter) {
      bestValue = value;
      winnerId = item.proposalId;
    }
  }

  // Update isWinner flag for all items
  return data.map((item) => ({
    ...item,
    isWinner: item.proposalId === winnerId,
  }));
}

/**
 * Combined filter and winner recalculation.
 *
 * Convenience function that applies both filtering and winner recalculation
 * in a single call.
 *
 * @param data - Array of proposal data
 * @param selectedIds - Array of selected proposal IDs
 * @param maxProposals - Maximum number of proposals
 * @param getValue - Function to extract comparison metric
 * @param higherIsBetter - Winner determination direction
 * @returns Filtered array with recalculated winners
 */
export function filterAndRecalculateWinner<
  T extends { proposalId: string; isWinner?: boolean },
>(
  data: T[],
  selectedIds: string[],
  maxProposals: number,
  getValue: (item: T) => number,
  higherIsBetter: boolean = true,
): T[] {
  const filtered = filterBySelectedProposals(data, selectedIds, maxProposals);
  return recalculateWinner(filtered, getValue, higherIsBetter);
}
