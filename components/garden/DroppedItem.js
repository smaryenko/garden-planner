import React, { memo } from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../../styles/GardensListScreen.styles';
import { itemCategories } from '../../constants/itemCategories';
import TreeEditCard from './TreeEditCard';
import { calculateCardPosition } from '../../utils/treeCardPosition';

// Pre-compute predefined types once (outside component)
const allPredefinedTypes = [
  ...itemCategories.trees.map(t => t.id),
  ...itemCategories.buildings.map(b => b.id),
  ...itemCategories.other.map(o => o.id),
];

const DroppedItem = memo(({
  item,
  isEditing,
  shouldHighlight,
  touchDraggedItem,
  isAdminUser,
  isDraggingItem,
  treeType,
  treeSort,
  treeYearPlanted,
  treeOwner,
  treeStatus,
  onTreeClick,
  onDragStart,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onRemoveItem,
  onEditAvatar,
  setTreeType,
  setTreeSort,
  setTreeYearPlanted,
  setTreeOwner,
  setTreeStatus,
  onUpdateField,
  setEditingTreeId,
  onOpenPhoto,
  onEditPhoto,
}) => {
  const { left: cardLeft, top: cardTop } = calculateCardPosition(item, isAdminUser);
  const isCustomType = !allPredefinedTypes.includes(item.type);
  const isDragging = touchDraggedItem?.id === item.id && touchDraggedItem?.isRepositioning;

  // Compute container style
  const containerStyle = {
    position: 'absolute',
    left: `${item.x}%`,
    top: `${item.y}%`,
    transform: 'translate(-50%, -50%)',
  };

  // Compute item style
  const itemStyle = {
    ...styles.droppedItem,
    ...(isEditing && styles.droppedItemEditing),
    ...(isDragging && styles.droppedItemDragging),
    ...(!shouldHighlight && styles.droppedItemDimmed),
  };

  const handleDragStart = isAdminUser ? (e) => {
    setEditingTreeId(null);
    onDragStart(e, item);
  } : undefined;

  const handleTouchStart = isAdminUser ? (e) => {
    setEditingTreeId(null);
    onTouchStart(e, item);
  } : undefined;

  const handleClick = () => onTreeClick(item);

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div
      className={`dropped-item-container ${isEditing ? 'dropped-item-container-editing' : ''}`}
      style={containerStyle}
      data-tree-item="true"
    >
      <div
        className="dropped-item-inner"
        style={itemStyle}
        draggable={isAdminUser ? "true" : "false"}
        onDragStart={handleDragStart}
        onTouchStart={handleTouchStart}
        onTouchMove={isAdminUser ? onTouchMove : undefined}
        onTouchEnd={isAdminUser ? onTouchEnd : undefined}
        onClick={handleClick}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.droppedItemImage} resizeMode="contain" />
        {isAdminUser && !isDraggingItem && (
          <>
            <TouchableOpacity
              style={styles.removeItemButton}
              onPress={(e) => { stopPropagation(e); onRemoveItem(item.id); }}
              onStartShouldSetResponder={() => true}
              onResponderGrant={stopPropagation}
              onTouchStart={stopPropagation}
              onTouchEnd={stopPropagation}
            >
              <Text style={styles.removeItemText}>×</Text>
            </TouchableOpacity>
            
            {isCustomType && (
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={(e) => { stopPropagation(e); onEditAvatar(item.id); }}
                onStartShouldSetResponder={() => true}
                onResponderGrant={stopPropagation}
                onTouchStart={stopPropagation}
                onTouchEnd={stopPropagation}
              >
                <FontAwesome name="pencil" size={8} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        )}
      </div>
      
      {isEditing && (
        <TreeEditCard
          item={item}
          position={{ left: cardLeft, top: cardTop }}
          treeType={treeType}
          treeSort={treeSort}
          treeYearPlanted={treeYearPlanted}
          treeOwner={treeOwner}
          treeStatus={treeStatus}
          onChangeType={setTreeType}
          onChangeSort={setTreeSort}
          onChangeYear={setTreeYearPlanted}
          onChangeOwner={setTreeOwner}
          onChangeStatus={setTreeStatus}
          onUpdateField={onUpdateField}
          isReadOnly={!isAdminUser}
          onOpenPhoto={onOpenPhoto}
          onEditPhoto={onEditPhoto}
          hasPhoto={!!item.photoUrl}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render when these specific props change
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.x === nextProps.item.x &&
    prevProps.item.y === nextProps.item.y &&
    prevProps.item.imageUrl === nextProps.item.imageUrl &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.shouldHighlight === nextProps.shouldHighlight &&
    prevProps.touchDraggedItem?.id === nextProps.touchDraggedItem?.id &&
    prevProps.isDraggingItem === nextProps.isDraggingItem &&
    prevProps.treeType === nextProps.treeType &&
    prevProps.treeSort === nextProps.treeSort &&
    prevProps.treeYearPlanted === nextProps.treeYearPlanted &&
    prevProps.treeOwner === nextProps.treeOwner &&
    prevProps.treeStatus === nextProps.treeStatus
  );
});

export default DroppedItem;
