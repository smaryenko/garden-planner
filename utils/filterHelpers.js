/**
 * Check if an item matches the current filters
 * @param {Object} item - The item to check
 * @param {Object} tableFilters - Current table filters
 * @param {Array} selectedTreeIds - Currently selected tree IDs
 * @returns {boolean} Whether the item should be highlighted
 */
export function shouldHighlightItem(item, tableFilters, selectedTreeIds) {
  const isTree = item.category === 'tree';
  
  // Calculate age if needed
  let age = null;
  if (isTree && item.yearPlanted != null) {
    const parsedYear = parseInt(item.yearPlanted);
    if (!isNaN(parsedYear)) {
      age = new Date().getFullYear() - parsedYear;
    }
  }
  
  const hasActiveFilters = 
    tableFilters.type.length > 0 || 
    tableFilters.sort.length > 0 || 
    tableFilters.year.length > 0 || 
    tableFilters.age.length > 0 || 
    tableFilters.owner.length > 0 ||
    tableFilters.status.length > 0;
  
  // Check if item matches filters
  const matchesFilters = !hasActiveFilters || (
    isTree && (
      (tableFilters.type.length === 0 || tableFilters.type.includes(item.type)) &&
      (tableFilters.sort.length === 0 || tableFilters.sort.includes(item.sort || '-')) &&
      (tableFilters.year.length === 0 || tableFilters.year.includes(item.yearPlanted ? item.yearPlanted.toString() : '-')) &&
      (tableFilters.age.length === 0 || tableFilters.age.includes(age !== null ? age.toString() : '-')) &&
      (tableFilters.owner.length === 0 || tableFilters.owner.includes(item.owner || '-')) &&
      (tableFilters.status.length === 0 || tableFilters.status.includes(item.status || 'Available'))
    )
  );
  
  // Check if item matches selection
  const hasSelection = selectedTreeIds.length > 0;
  const matchesSelection = !hasSelection || selectedTreeIds.includes(item.id);
  
  return matchesFilters && matchesSelection;
}
