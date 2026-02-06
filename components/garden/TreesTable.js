import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../../styles/GardensListScreen.styles';
import { useLanguage } from '../../contexts/LanguageContext';
import { itemCategories } from '../../constants/itemCategories';

// Memoized table row component
const TableRow = memo(({ item, index, isSelected, isChecked, age, onToggleSelection, onOpenPhoto, onEditPhoto, isAdmin, t }) => (
  <View 
    style={[
      styles.tableRow, 
      index % 2 === 0 && styles.tableRowEven,
      isSelected && styles.tableRowSelected
    ]}
  >
    <TouchableOpacity 
      onPress={() => onToggleSelection(item.id)}
      style={styles.tableCheckboxCell}
    >
      <FontAwesome 
        name={isChecked ? 'check-square-o' : 'square-o'} 
        size={16} 
        color="#556b2f" 
      />
    </TouchableOpacity>
    <Text style={[styles.tableCell, styles.columnType]}>{item.type}</Text>
    <Text style={[styles.tableCell, styles.columnSort]}>{item.sort || '-'}</Text>
    <Text style={[styles.tableCell, styles.columnYear]}>
      {item.yearPlanted ? item.yearPlanted : '-'}
    </Text>
    <Text style={[styles.tableCell, styles.columnAge]}>
      {age !== null ? `${age} year${age !== 1 ? 's' : ''}` : '-'}
    </Text>
    <Text style={[styles.tableCell, styles.columnOwner]}>
      {item.owner || '-'}
    </Text>
    <Text style={[styles.tableCell, styles.columnStatus]}>
      {t((item.status || 'Available').toLowerCase())}
    </Text>
    <View style={[styles.tableCell, styles.columnPhoto]}>
      {item.photoUrl ? (
        <TouchableOpacity onPress={() => isAdmin ? onEditPhoto(item.id) : onOpenPhoto(item.id)}>
          <FontAwesome name="camera" size={16} color="#556b2f" />
        </TouchableOpacity>
      ) : isAdmin ? (
        <TouchableOpacity onPress={() => onEditPhoto(item.id)}>
          <FontAwesome name="camera" size={16} color="#ccc" />
        </TouchableOpacity>
      ) : (
        <FontAwesome name="camera" size={16} color="#ccc" />
      )}
    </View>
  </View>
));

export default function TreesTable({
  droppedItems,
  tableSortColumn,
  tableSortDirection,
  tableFilters,
  showFilterDropdown,
  editingTreeId,
  selectedTreeIds,
  onSort,
  onToggleFilterDropdown,
  onToggleFilterValue,
  onSelectAllFilters,
  onClearFilters,
  onCloseFilterDropdown,
  onToggleTreeSelection,
  onSelectAllTrees,
  onClearSelection,
  onOpenPhoto,
  onEditPhoto,
  isAdmin,
}) {
  const { t } = useLanguage();
  
  // Get distinct values for each column (only from trees)
  const getDistinctValues = (column) => {
    const values = new Set();
    droppedItems.forEach(item => {
      const isTree = item.category === 'tree';
      
      // Skip non-tree items
      if (!isTree) return;
      
      let value;
      
      switch (column) {
        case 'type':
          value = item.type;
          break;
        case 'sort':
          value = item.sort || '-';
          break;
        case 'year':
          value = item.yearPlanted ? item.yearPlanted.toString() : '-';
          break;
        case 'age':
          if (item.yearPlanted != null) {
            const parsedYear = parseInt(item.yearPlanted);
            if (!isNaN(parsedYear)) {
              value = (new Date().getFullYear() - parsedYear).toString();
            } else {
              value = '-';
            }
          } else {
            value = '-';
          }
          break;
        case 'owner':
          value = item.owner || '-';
          break;
        case 'status':
          value = item.status || 'Available';
          break;
      }
      
      if (value) values.add(value);
    });
    
    return Array.from(values).sort();
  };

  // Filter items (only trees)
  let filteredItems = droppedItems.filter(item => {
    const isTree = item.category === 'tree';
    
    // Only include trees in the table
    if (!isTree) return false;
    
    let age = null;
    if (item.yearPlanted != null) {
      const parsedYear = parseInt(item.yearPlanted);
      if (!isNaN(parsedYear)) {
        age = new Date().getFullYear() - parsedYear;
      }
    }

    const typeMatch = tableFilters.type.length === 0 || tableFilters.type.includes(item.type);
    const sortMatch = tableFilters.sort.length === 0 || tableFilters.sort.includes(item.sort || '-');
    const yearMatch = tableFilters.year.length === 0 || tableFilters.year.includes(item.yearPlanted ? item.yearPlanted.toString() : '-');
    const ageMatch = tableFilters.age.length === 0 || tableFilters.age.includes(age !== null ? age.toString() : '-');
    const ownerMatch = tableFilters.owner.length === 0 || tableFilters.owner.includes(item.owner || '-');
    const statusMatch = tableFilters.status.length === 0 || tableFilters.status.includes(item.status || 'Available');

    return typeMatch && sortMatch && yearMatch && ageMatch && ownerMatch && statusMatch;
  });

  // Sort items
  if (tableSortColumn) {
    filteredItems = [...filteredItems].sort((a, b) => {
      let aVal, bVal;
      const isTreeA = itemCategories.trees.some(t => t.id === a.type);
      const isTreeB = itemCategories.trees.some(t => t.id === b.type);

      switch (tableSortColumn) {
        case 'type':
          aVal = a.type || '';
          bVal = b.type || '';
          break;
        case 'sort':
          aVal = a.sort || '';
          bVal = b.sort || '';
          break;
        case 'year':
          aVal = isTreeA && a.yearPlanted ? parseInt(a.yearPlanted) : 0;
          bVal = isTreeB && b.yearPlanted ? parseInt(b.yearPlanted) : 0;
          break;
        case 'age':
          aVal = isTreeA && a.yearPlanted ? new Date().getFullYear() - parseInt(a.yearPlanted) : 0;
          bVal = isTreeB && b.yearPlanted ? new Date().getFullYear() - parseInt(b.yearPlanted) : 0;
          break;
        case 'owner':
          aVal = isTreeA ? (a.owner || '-') : '';
          bVal = isTreeB ? (b.owner || '-') : '';
          break;
        case 'status':
          aVal = isTreeA ? (a.status || 'Available') : '';
          bVal = isTreeB ? (b.status || 'Available') : '';
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return tableSortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return tableSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  }

  const renderFilterButton = (column, style) => {
    const hasActiveFilter = tableFilters[column].length > 0;
    const sortIcon = tableSortColumn === column ? (tableSortDirection === 'asc' ? '↑' : '↓') : null;
    
    return (
      <View style={[styles.tableHeaderCell, style]}>
        <View style={styles.tableHeaderContent}>
          <TouchableOpacity 
            onPress={() => onSort(column)}
            style={styles.tableHeaderSortButton}
          >
            <Text style={styles.tableHeaderText}>
              {t(column)}
            </Text>
            {sortIcon && (
              <Text style={styles.tableSortIcon}>{sortIcon}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onToggleFilterDropdown(column)}>
            <FontAwesome 
              name="filter" 
              size={12} 
              color={hasActiveFilter ? '#fff' : 'rgba(255,255,255,0.6)'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.treesTable}>
      {/* Header with sort and filter buttons */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderCell}>
          <TouchableOpacity 
            onPress={() => {
              const allTreeIds = droppedItems
                .filter(item => item.category === 'tree')
                .map(item => item.id);
              if (selectedTreeIds.length === allTreeIds.length) {
                onClearSelection();
              } else {
                onSelectAllTrees(allTreeIds);
              }
            }}
            style={styles.checkboxContainer}
          >
            <FontAwesome 
              name={selectedTreeIds.length > 0 ? 'check-square-o' : 'square-o'} 
              size={16} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        {renderFilterButton('type', styles.columnType)}
        {renderFilterButton('sort', styles.columnSort)}
        {renderFilterButton('year', styles.columnYear)}
        {renderFilterButton('age', styles.columnAge)}
        {renderFilterButton('owner', styles.columnOwner)}
        {renderFilterButton('status', styles.columnStatus)}
        <View style={[styles.tableHeaderCell, styles.columnPhoto]}>
          <Text style={styles.tableHeaderText}>{t('photo')}</Text>
        </View>
      </View>

      {/* Filter dropdown */}
      {showFilterDropdown && (() => {
        // Calculate position based on column
        const columnPositions = {
          type: 0,
          sort: 2 * (100 / 8), // 2 flex units
          year: 4 * (100 / 8), // 4 flex units (2+2)
          age: 5 * (100 / 8),  // 5 flex units (2+2+1)
          owner: 6 * (100 / 8), // 6 flex units (2+2+1+1)
          status: 7 * (100 / 8), // 7 flex units (2+2+1+1+1)
        };
        
        const leftPosition = columnPositions[showFilterDropdown] || 0;
        
        return (
          <View style={[styles.filterDropdown, { left: `${leftPosition}%` }]}>
            <View style={styles.filterDropdownHeader}>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => onSelectAllFilters(showFilterDropdown)}
              >
                <Text style={styles.filterButtonText}>{t('selectAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => onClearFilters(showFilterDropdown)}
              >
                <Text style={styles.filterButtonText}>{t('clearAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={onCloseFilterDropdown}
              >
                <Text style={styles.filterButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterDropdownScroll}>
              {getDistinctValues(showFilterDropdown).map(value => {
                const isSelected = tableFilters[showFilterDropdown].includes(value);
                // Translate status values
                const displayValue = showFilterDropdown === 'status' && value !== '-' 
                  ? t(value.toLowerCase()) 
                  : value;
                
                return (
                  <TouchableOpacity
                    key={value}
                    style={styles.filterOption}
                    onPress={() => onToggleFilterValue(showFilterDropdown, value)}
                  >
                    <FontAwesome 
                      name={isSelected ? 'check-square-o' : 'square-o'} 
                      size={16} 
                      color="#6B8E23" 
                    />
                    <Text style={styles.filterOptionText}>{displayValue}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      })()}

      {/* Data rows */}
      <View>
        {filteredItems.length === 0 ? (
          <Text style={styles.emptyTableText}>
            {droppedItems.length === 0 ? t('noTrees') : t('noTrees')}
          </Text>
        ) : (
          filteredItems.map((item, index) => {
            // Calculate age
            let age = null;
            if (item.yearPlanted != null) {
              const parsedYear = parseInt(item.yearPlanted);
              if (!isNaN(parsedYear)) {
                age = new Date().getFullYear() - parsedYear;
              }
            }
            
            return (
              <TableRow
                key={item.id}
                item={item}
                index={index}
                isSelected={editingTreeId === item.id}
                isChecked={selectedTreeIds.includes(item.id)}
                age={age}
                onToggleSelection={onToggleTreeSelection}
                onOpenPhoto={onOpenPhoto}
                onEditPhoto={onEditPhoto}
                isAdmin={isAdmin}
                t={t}
              />
            );
          })
        )}
      </View>
    </View>
  );
}
