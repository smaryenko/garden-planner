import { useState } from 'react';

export function useTableFilters() {
  const [tableSortColumn, setTableSortColumn] = useState(null);
  const [tableSortDirection, setTableSortDirection] = useState('asc');
  const [tableFilters, setTableFilters] = useState({
    type: [],
    sort: [],
    year: [],
    age: [],
    owner: [],
    status: [],
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);

  const handleSort = (column) => {
    if (tableSortColumn === column) {
      setTableSortDirection(tableSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortColumn(column);
      setTableSortDirection('asc');
    }
  };

  const toggleFilterDropdown = (column) => {
    setShowFilterDropdown(showFilterDropdown === column ? null : column);
  };

  const toggleFilterValue = (column, value) => {
    const currentFilters = tableFilters[column];
    if (currentFilters.includes(value)) {
      setTableFilters({
        ...tableFilters,
        [column]: currentFilters.filter(v => v !== value)
      });
    } else {
      setTableFilters({
        ...tableFilters,
        [column]: [...currentFilters, value]
      });
    }
  };

  const selectAllFilters = (column, allValues) => {
    setTableFilters({
      ...tableFilters,
      [column]: allValues
    });
  };

  const clearFilters = (column) => {
    setTableFilters({
      ...tableFilters,
      [column]: []
    });
  };

  const closeFilterDropdown = () => {
    setShowFilterDropdown(null);
  };

  const resetAllFilters = () => {
    setTableFilters({
      type: [],
      sort: [],
      year: [],
      age: [],
      owner: [],
      status: [],
    });
    setTableSortColumn(null);
    setTableSortDirection('asc');
    setShowFilterDropdown(null);
  };

  return {
    tableSortColumn,
    tableSortDirection,
    tableFilters,
    showFilterDropdown,
    handleSort,
    toggleFilterDropdown,
    toggleFilterValue,
    selectAllFilters,
    clearFilters,
    closeFilterDropdown,
    resetAllFilters,
  };
}
