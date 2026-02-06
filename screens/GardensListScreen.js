import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  ImageBackground,
  Linking,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../styles/GardensListScreen.styles';
import { itemCategories } from '../constants/itemCategories';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import AvatarModal from '../components/modals/AvatarModal';
import DefaultsModal from '../components/modals/DefaultsModal';
import TreePhotoModal from '../components/modals/TreePhotoModal';
import EditPhotoModal from '../components/modals/EditPhotoModal';
import ItemsPanel from '../components/garden/ItemsPanel';
import TreesTable from '../components/garden/TreesTable';
import GardenHeader from '../components/garden/GardenHeader';
import GardenForm from '../components/garden/GardenForm';
import TreeEditCard from '../components/garden/TreeEditCard';
import { useGardens } from '../hooks/useGardens';
import { useTrees } from '../hooks/useTrees';
import { useUndo } from '../hooks/useUndo';
import { useTableFilters } from '../hooks/useTableFilters';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { generateTrees } from '../utils/treeGenerator';
import { calculateCardPosition } from '../utils/treeCardPosition';
import { shouldHighlightItem } from '../utils/filterHelpers';
import DroppedItem from '../components/garden/DroppedItem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GardensListScreen({ navigation }) {
  // Auth
  const { user, logout, isAdmin } = useAuth();
  const isAdminUser = isAdmin();
  
  // Language
  const { t } = useLanguage();

  // Custom hooks
  const {
    gardens,
    loading,
    currentIndex,
    setCurrentIndex,
    currentGarden,
    isAddNewCard,
    createGarden,
    updateGarden,
    deleteGarden,
    updateGardenDefaults,
    fetchGardens,
  } = useGardens();

  const {
    droppedItems,
    setDroppedItems,
    loading: treesLoading,
    fetchTrees,
    preloadGarden,
    addItem,
    updateItemPosition,
    updateItemField,
    deleteItem,
    updateItemAvatar,
    updateTreePhoto,
  } = useTrees(currentGarden?.id);

  const {
    undoStack,
    addToUndoStack,
    clearUndoStack,
    undo,
    canUndo,
  } = useUndo();

  const {
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
  } = useTableFilters();

  // Local UI state
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGardenId, setEditingGardenId] = useState(null);
  const flipAnim = useRef(new Animated.Value(0)).current;
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gardenToDelete, setGardenToDelete] = useState(null);
  
  // Tree edit modal state
  const [editingTreeId, setEditingTreeId] = useState(null);
  const [treeType, setTreeType] = useState('');
  const [treeSort, setTreeSort] = useState('');
  const [treeYearPlanted, setTreeYearPlanted] = useState('');
  const [treeOwner, setTreeOwner] = useState('');
  const [treeStatus, setTreeStatus] = useState('Available');
  
  // Custom avatar state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editingAvatarItemId, setEditingAvatarItemId] = useState(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  
  // Default values modal state
  const [showDefaultsModal, setShowDefaultsModal] = useState(false);
  const [defaultSort, setDefaultSort] = useState('');
  const [defaultYearPlanted, setDefaultYearPlanted] = useState('');
  const [defaultOwner, setDefaultOwner] = useState('');
  
  // Generate trees modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Photo modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoTreeId, setPhotoTreeId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  
  // Edit photo modal state (admin only)
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const [editPhotoTreeId, setEditPhotoTreeId] = useState(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  
  // Table selection state
  const [selectedTreeIds, setSelectedTreeIds] = useState([]);
  
  // Show Available Only toggle
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const dragImageRef = useRef(null);
  
  // Touch state for mobile
  const [touchDraggedItem, setTouchDraggedItem] = useState(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef(null);
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const gardenCardRef = useRef(null);
  
  // Pan state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);

  useEffect(() => {
    clearUndoStack();
    setSelectedTreeIds([]); // Clear selection when changing gardens
    resetAllFilters(); // Clear filters when changing gardens
  }, [currentIndex]);

  // Sync toggle with table status filter (one-way: filter -> toggle)
  useEffect(() => {
    const statusFilter = tableFilters.status || [];
    const isOnlyAvailable = statusFilter.length === 1 && statusFilter[0] === 'Available';
    const isEmpty = statusFilter.length === 0;
    
    if (isOnlyAvailable && !showAvailableOnly) {
      setShowAvailableOnly(true);
    } else if (!isOnlyAvailable && showAvailableOnly) {
      setShowAvailableOnly(false);
    }
  }, [tableFilters.status]);

  useEffect(() => {
    const currentGarden = gardens[currentIndex];
    if (currentGarden?.id) {
      fetchTrees(currentGarden.id);
    } else {
      setDroppedItems([]);
    }
    // Clear undo stack when changing gardens
  }, [currentIndex, gardens]);

  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnim, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    
    const gardenData = {
      name,
      description,
      location,
      backgroundImage,
    };

    let result;
    if (isEditMode && editingGardenId) {
      result = await updateGarden(editingGardenId, gardenData);
    } else {
      result = await createGarden(gardenData);
    }

    if (result.success) {
      // Reset form
      setName('');
      setDescription('');
      setLocation('');
      setBackgroundImage('');
      setIsEditMode(false);
      setEditingGardenId(null);

      // Flip back
      flipCard();
    }
    
    setSaving(false);
  };

  const handleEdit = (garden) => {
    setIsEditMode(true);
    setEditingGardenId(garden.id);
    setName(garden.name);
    setDescription(garden.description || '');
    setLocation(garden.location || '');
    setBackgroundImage(garden.background_image || '');
    flipCard();
  };

  const handleDelete = (garden) => {
    setGardenToDelete(garden);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!gardenToDelete) return;
    
    const result = await deleteGarden(gardenToDelete.id);
    if (result.success) {
      setShowDeleteModal(false);
      setGardenToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setGardenToDelete(null);
  };

  const handleCancelEdit = () => {
    setName('');
    setDescription('');
    setLocation('');
    setBackgroundImage('');
    setIsEditMode(false);
    setEditingGardenId(null);
    flipCard();
  };

  const goToPrevious = () => {
    if (isFlipped) {
      setIsEditMode(false);
      setEditingGardenId(null);
      setName('');
      setDescription('');
      setLocation('');
      setBackgroundImage('');
      flipCard();
    }
    
    // Reset zoom and pan
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    
    // For viewers, loop through only existing gardens
    if (!isAdminUser) {
      const newIndex = currentIndex === 0 ? gardens.length - 1 : currentIndex - 1;
      setCurrentIndex(newIndex);
      
      // Preload next garden
      const nextIndex = newIndex === 0 ? gardens.length - 1 : newIndex - 1;
      if (gardens[nextIndex]?.id) {
        preloadGarden(gardens[nextIndex].id);
      }
      return;
    }
    
    // For admins: Loop: if at start, go to end (including "Add New" card)
    const newIndex = currentIndex === 0 ? gardens.length : currentIndex - 1;
    setCurrentIndex(newIndex);
    
    // Preload next garden for admins
    if (newIndex > 0 && newIndex < gardens.length) {
      const nextIndex = newIndex === 0 ? gardens.length : newIndex - 1;
      if (gardens[nextIndex]?.id) {
        preloadGarden(gardens[nextIndex].id);
      }
    }
  };

  const goToNext = () => {
    if (isFlipped) {
      setIsEditMode(false);
      setEditingGardenId(null);
      setName('');
      setDescription('');
      setLocation('');
      setBackgroundImage('');
      flipCard();
    }
    
    // Reset zoom and pan
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    
    // For viewers, loop through only existing gardens
    if (!isAdminUser) {
      const newIndex = currentIndex === gardens.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
      
      // Preload next garden
      const nextIndex = newIndex === gardens.length - 1 ? 0 : newIndex + 1;
      if (gardens[nextIndex]?.id) {
        preloadGarden(gardens[nextIndex].id);
      }
      return;
    }
    
    // For admins: Loop: if at end, go to start
    const newIndex = currentIndex === gardens.length ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    
    // Preload next garden for admins
    if (newIndex < gardens.length) {
      const nextIndex = newIndex === gardens.length ? 0 : newIndex + 1;
      if (gardens[nextIndex]?.id) {
        preloadGarden(gardens[nextIndex].id);
      }
    }
  };

  const handleCardPress = (garden) => {
    if (!isFlipped) {
      navigation.navigate('GardenDetail', { gardenId: garden.id });
    }
  };

  const openLocation = (locationStr) => {
    if (!locationStr) return;
    
    // Check if it's coordinates (lat,lng format)
    const coordsMatch = locationStr.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordsMatch) {
      const url = `https://www.google.com/maps?q=${coordsMatch[1]},${coordsMatch[2]}`;
      Linking.openURL(url);
    } else if (locationStr.startsWith('http')) {
      // It's already a URL
      Linking.openURL(url);
    } else {
      // Search for the location
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationStr)}`;
      Linking.openURL(url);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    
    // Use the hidden drag image element
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 12.5, 12.5);
    }
    
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    const itemData = e.dataTransfer.getData('application/json');
    if (!itemData) return;
    
    const item = JSON.parse(itemData);

    // Get drop position relative to the card
    const cardRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - cardRect.left) / cardRect.width) * 100;
    const y = ((e.clientY - cardRect.top) / cardRect.height) * 100;

    // Add item using hook
    const result = await addItem(currentGarden.id, item, { x, y }, currentGarden);
    if (result.success) {
      addToUndoStack({
        type: 'add',
        item: result.item,
      });
    }
    
    setDraggedItem(null);
  };

  const handleRemoveItem = async (itemId) => {
    const itemToDelete = droppedItems.find(item => item.id === itemId);
    if (!itemToDelete) return;

    const result = await deleteItem(itemId, itemToDelete.category);
    if (result.success) {
      setEditingTreeId(null);
      addToUndoStack({
        type: 'delete',
        item: result.item,
      });
    }
  };

  const handleEditAvatar = (itemId) => {
    const item = droppedItems.find(i => i.id === itemId);
    if (item) {
      setEditingAvatarItemId(itemId);
      setCustomAvatarUrl(item.customAvatar || '');
      setShowAvatarModal(true);
    }
  };

  const handleSaveAvatar = async () => {
    if (!editingAvatarItemId) return;

    // Get old avatar for undo
    const currentItem = droppedItems.find(item => item.id === editingAvatarItemId);
    if (!currentItem) return;
    
    const oldAvatar = currentItem.customAvatar || null;
    const oldImageUrl = currentItem.imageUrl;

    // Only update if value changed
    if (oldAvatar === (customAvatarUrl || null)) {
      setShowAvatarModal(false);
      setEditingAvatarItemId(null);
      setCustomAvatarUrl('');
      return;
    }

    const result = await updateItemAvatar(editingAvatarItemId, customAvatarUrl, currentItem.category);
    if (result.success) {
      addToUndoStack({
        type: 'avatar',
        item: currentItem,
        oldAvatar: oldAvatar,
        oldImageUrl: oldImageUrl,
        newAvatar: customAvatarUrl || null,
        newImageUrl: customAvatarUrl || oldImageUrl,
      });

      setShowAvatarModal(false);
      setEditingAvatarItemId(null);
      setCustomAvatarUrl('');
    }
  };

  const handleOpenDefaults = () => {
    const currentGarden = gardens[currentIndex];
    if (currentGarden) {
      setDefaultSort(currentGarden.default_sort || '');
      setDefaultYearPlanted(currentGarden.default_year_planted ? currentGarden.default_year_planted.toString() : '');
      setDefaultOwner(currentGarden.default_owner || '');
      setShowDefaultsModal(true);
    }
  };

  const handleSaveDefaults = async () => {
    if (!currentGarden) return;

    const result = await updateGardenDefaults(currentGarden.id, {
      sort: defaultSort,
      yearPlanted: defaultYearPlanted,
      owner: defaultOwner,
    });

    if (result.success) {
      setShowDefaultsModal(false);
    }
  };
  
  const handleOpenPhoto = (treeId) => {
    const tree = droppedItems.find(item => item.id === treeId);
    if (tree && tree.photoUrl) {
      setPhotoTreeId(treeId);
      setPhotoUrl(tree.photoUrl);
      setShowPhotoModal(true);
    }
  };

  const handleEditPhoto = (treeId) => {
    const tree = droppedItems.find(item => item.id === treeId);
    if (tree) {
      setEditPhotoTreeId(treeId);
      setEditPhotoUrl(tree.photoUrl || '');
      setShowEditPhotoModal(true);
    }
  };

  const handleSavePhoto = async (newPhotoUrl) => {
    if (!editPhotoTreeId) return;

    const result = await updateTreePhoto(editPhotoTreeId, newPhotoUrl);

    if (result.success) {
      setShowEditPhotoModal(false);
      setEditPhotoTreeId(null);
      setEditPhotoUrl('');
    }
  };
  
  const handleGenerateTrees = async () => {
    const count = parseInt(generateCount);
    if (!count || count < 1 || count > 1000) {
      alert('Please enter a number between 1 and 1000');
      return;
    }

    setIsGenerating(true);

    try {
      // Use garden's default values
      const defaults = {
        type: 'olive',
        sort: currentGarden.default_sort || '',
        yearPlanted: currentGarden.default_year_planted || null,
        owner: currentGarden.default_owner || null,
        status: currentGarden.default_owner ? 'Unavailable' : 'Available',
      };

      // Generate trees using helper
      const insertedTrees = await generateTrees({
        count,
        gardenId: currentGarden.id,
        defaults,
      });

      // Refresh the garden
      await fetchTrees(currentGarden.id, true);

      // Add all generated trees to undo stack as a single batch action
      addToUndoStack({
        type: 'generate',
        items: insertedTrees,
        count: insertedTrees.length,
      });

      setShowGenerateModal(false);
      setGenerateCount('');
    } catch (error) {
      console.error('Error generating trees:', error);
      alert(error.message || 'Failed to generate trees');
    } finally {
      setIsGenerating(false);
    }
  };

  // Undo last action using hook
  const handleUndo = async () => {
    const result = await undo(async () => {
      if (currentGarden?.id) {
        await fetchTrees(currentGarden.id, true); // Force refresh
      }
    });
    
    if (result.success) {
      // Clear the editing state
      setEditingTreeId(null);
      
      // Always refresh from database after undo to ensure we have latest data
      if (currentGarden?.id) {
        await fetchTrees(currentGarden.id, true); // Force refresh
      }
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e, item) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setTouchDraggedItem(item);
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!touchDraggedItem) return;
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = async (e) => {
    if (!touchDraggedItem) return;
    
    const touch = e.changedTouches[0];
    const cardElement = gardenCardRef.current;
    
    if (cardElement) {
      const cardRect = cardElement.getBoundingClientRect();
      
      // Check if touch ended within the card
      if (
        touch.clientX >= cardRect.left &&
        touch.clientX <= cardRect.right &&
        touch.clientY >= cardRect.top &&
        touch.clientY <= cardRect.bottom
      ) {
        const x = ((touch.clientX - cardRect.left) / cardRect.width) * 100;
        const y = ((touch.clientY - cardRect.top) / cardRect.height) * 100;

        // Add item using hook
        const result = await addItem(currentGarden.id, touchDraggedItem, { x, y }, currentGarden);
        if (result.success) {
          addToUndoStack({
            type: 'add',
            item: result.item,
          });
        }
      }
    }
    
    setTouchDraggedItem(null);
    setTouchPosition({ x: 0, y: 0 });
    touchStartRef.current = null;
  };

  const handleDroppedItemTouchStart = (e, item) => {
    e.stopPropagation();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, item };
    setTouchDraggedItem({ ...item, isRepositioning: true });
    setTouchPosition({ x: touch.clientX, y: touch.clientY + window.scrollY });
    setIsDraggingItem(true);
  };
  
  const handleDroppedItemTouchMove = (e) => {
    if (!touchDraggedItem || !touchDraggedItem.isRepositioning) return;
    e.stopPropagation();
    const touch = e.touches[0];
    
    // Update touch position for visual feedback (account for page scroll)
    setTouchPosition({ 
      x: touch.clientX, 
      y: touch.clientY + window.scrollY 
    });
  };

  const handleDroppedItemTouchEnd = async (e) => {
    if (!touchDraggedItem || !touchDraggedItem.isRepositioning) return;
    e.stopPropagation();
    
    const touch = e.changedTouches[0];
    const cardElement = gardenCardRef.current;
    
    if (cardElement) {
      const cardRect = cardElement.getBoundingClientRect();
      
      // Get touch position relative to card
      const touchX = touch.clientX - cardRect.left;
      const touchY = touch.clientY - cardRect.top;
      
      let x, y;
      
      if (zoomLevel === 1 && panOffset.x === 0 && panOffset.y === 0) {
        // No zoom/pan - simple calculation
        x = (touchX / cardRect.width) * 100;
        y = (touchY / cardRect.height) * 100;
      } else {
        // Account for zoom and pan transformations
        // Reverse the zoom and pan to get content coordinates
        const contentX = (touchX - cardRect.width / 2 - panOffset.x) / zoomLevel + cardRect.width / 2;
        const contentY = (touchY - cardRect.height / 2 - panOffset.y) / zoomLevel + cardRect.height / 2;
        
        // Convert to percentage
        x = (contentX / cardRect.width) * 100;
        y = (contentY / cardRect.height) * 100;
      }
      
      // Clamp to card boundaries (with small margin for item size)
      x = Math.max(2, Math.min(98, x));
      y = Math.max(2, Math.min(98, y));

      // Get old position for undo
      const currentItem = droppedItems.find(di => di.id === touchDraggedItem.id);
      const oldPosition = currentItem ? { x: currentItem.x, y: currentItem.y } : null;

      // Update position using hook
      const result = await updateItemPosition(touchDraggedItem.id, { x, y }, currentItem?.category);
      if (result.success && oldPosition) {
        addToUndoStack({
          type: 'move',
          item: touchDraggedItem,
          oldPosition: oldPosition,
          newPosition: { x, y },
        });
      }
    }
    
    setTouchDraggedItem(null);
    setTouchPosition({ x: 0, y: 0 });
    touchStartRef.current = null;
    setIsDraggingItem(false);
  };

  const handleTreeClick = (item) => {
    if (editingTreeId === item.id) {
      setEditingTreeId(null);
    } else {
      setEditingTreeId(item.id);
      setTreeType(item.type || '');
      setTreeSort(item.sort || '');
      // Set year planted - convert to string, or use empty string if null/undefined
      const yearValue = item.yearPlanted != null ? item.yearPlanted.toString() : '';
      setTreeYearPlanted(yearValue);
      setTreeOwner(item.owner || '');
      setTreeStatus(item.status || 'Available');
    }
  };

  const handleToggleTreeSelection = (treeId) => {
    setSelectedTreeIds(prev => {
      if (prev.includes(treeId)) {
        return prev.filter(id => id !== treeId);
      } else {
        return [...prev, treeId];
      }
    });
  };

  const handleSelectAllTrees = (treeIds) => {
    setSelectedTreeIds(treeIds);
  };

  const handleClearSelection = () => {
    setSelectedTreeIds([]);
  };

  const handleUpdateTreeField = async (field, value) => {
    if (!editingTreeId) return;

    const currentItem = droppedItems.find(item => item.id === editingTreeId);
    if (!currentItem) return;
    
    const fieldName = field === 'year_planted' ? 'yearPlanted' : field === 'description' ? 'description' : field;
    const oldValue = currentItem[fieldName];

    // Only update if value changed
    if (oldValue === value) return;

    // If updating owner, automatically update status
    if (field === 'owner' && currentItem.category === 'tree') {
      // Treat empty string as null for status determination
      const ownerValue = value && value.trim() !== '' ? value : null;
      const newStatus = ownerValue ? 'Unavailable' : 'Available';
      
      // Update both owner and status
      const ownerResult = await updateItemField(editingTreeId, 'owner', ownerValue, currentItem.category);
      const statusResult = await updateItemField(editingTreeId, 'status', newStatus, currentItem.category);
      
      if (ownerResult.success && statusResult.success) {
        setTreeStatus(newStatus);
        setTreeOwner(ownerValue || '');
        
        addToUndoStack({
          type: 'edit',
          item: currentItem,
          field: field,
          oldValue: oldValue,
          newValue: ownerValue,
        });
      }
      return;
    }

    const result = await updateItemField(editingTreeId, field, value, currentItem.category);
    if (result.success) {
      addToUndoStack({
        type: 'edit',
        item: currentItem,
        field: field,
        oldValue: oldValue,
        newValue: value,
      });
    }
  };

  useEffect(() => {
    const cardElement = gardenCardRef.current;
    if (cardElement) {
      const wheelHandler = (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const rect = cardElement.getBoundingClientRect();
          
          // Get mouse position relative to card
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          const delta = -e.deltaY * 0.015;
          setZoomLevel(prev => {
            const newZoom = Math.max(1, Math.min(3, prev + delta));
            
            // Adjust pan offset to zoom towards mouse position
            if (newZoom === 1) {
              panOffsetRef.current = { x: 0, y: 0 };
              setPanOffset({ x: 0, y: 0 });
            } else {
              const maxPanX = (rect.width * (newZoom - 1)) / 2;
              const maxPanY = (rect.height * (newZoom - 1)) / 2;
              
              // Calculate the point in the content that's under the mouse
              // Before zoom: contentX = (mouseX - rect.width/2 - panOffset.x) / prevZoom
              // After zoom: we want the same contentX to be under the mouse
              // So: contentX = (mouseX - rect.width/2 - newPanOffset.x) / newZoom
              
              const contentX = (mouseX - rect.width / 2 - panOffsetRef.current.x) / prev;
              const contentY = (mouseY - rect.height / 2 - panOffsetRef.current.y) / prev;
              
              const newX = mouseX - rect.width / 2 - contentX * newZoom;
              const newY = mouseY - rect.height / 2 - contentY * newZoom;
              
              const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
              const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));
              
              panOffsetRef.current = { x: clampedX, y: clampedY };
              setPanOffset({ x: clampedX, y: clampedY });
            }
            
            return newZoom;
          });
        }
      };
      
      const mouseDownHandler = (e) => {
        if (zoomLevel > 1 && !e.target.closest('[draggable="true"]') && !e.target.closest('[data-tree-item]')) {
          setIsPanning(true);
          setPanStart({ 
            x: e.clientX - panOffsetRef.current.x, 
            y: e.clientY - panOffsetRef.current.y 
          });
          cardElement.style.cursor = 'grabbing';
        }
      };
      
      const mouseMoveHandler = (e) => {
        if (isPanning) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          
          animationFrameRef.current = requestAnimationFrame(() => {
            const rect = cardElement.getBoundingClientRect();
            const maxPanX = (rect.width * (zoomLevel - 1)) / 2;
            const maxPanY = (rect.height * (zoomLevel - 1)) / 2;
            
            const newX = e.clientX - panStart.x;
            const newY = e.clientY - panStart.y;
            
            const clampedOffset = {
              x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
              y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
            };
            
            panOffsetRef.current = clampedOffset;
            setPanOffset(clampedOffset);
          });
        }
      };
      
      const mouseUpHandler = () => {
        setIsPanning(false);
        cardElement.style.cursor = zoomLevel > 1 ? 'grab' : 'default';
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      // Touch handlers for mobile panning
      const touchStartHandler = (e) => {
        if (zoomLevel > 1 && e.touches.length === 1 && !e.target.closest('[data-tree-item]')) {
          const touch = e.touches[0];
          setIsPanning(true);
          setPanStart({ 
            x: touch.clientX - panOffsetRef.current.x, 
            y: touch.clientY - panOffsetRef.current.y 
          });
        }
      };

      const touchMoveHandler = (e) => {
        if (isPanning && e.touches.length === 1) {
          e.preventDefault();
          const touch = e.touches[0];
          
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          
          animationFrameRef.current = requestAnimationFrame(() => {
            const rect = cardElement.getBoundingClientRect();
            const maxPanX = (rect.width * (zoomLevel - 1)) / 2;
            const maxPanY = (rect.height * (zoomLevel - 1)) / 2;
            
            const newX = touch.clientX - panStart.x;
            const newY = touch.clientY - panStart.y;
            
            const clampedOffset = {
              x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
              y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
            };
            
            panOffsetRef.current = clampedOffset;
            setPanOffset(clampedOffset);
          });
        }
      };

      const touchEndHandler = () => {
        setIsPanning(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      // Pinch-to-zoom for mobile
      let lastTouchDistance = 0;
      let pinchCenter = { x: 0, y: 0 };
      
      const touchPinchHandler = (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );

          // Calculate pinch center point
          const rect = cardElement.getBoundingClientRect();
          const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
          const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
          
          pinchCenter = { x: centerX, y: centerY };

          if (lastTouchDistance > 0) {
            const delta = (distance - lastTouchDistance) * 0.015;
            setZoomLevel(prev => {
              const newZoom = Math.max(1, Math.min(3, prev + delta));
              
              if (newZoom === 1) {
                panOffsetRef.current = { x: 0, y: 0 };
                setPanOffset({ x: 0, y: 0 });
              } else {
                const maxPanX = (rect.width * (newZoom - 1)) / 2;
                const maxPanY = (rect.height * (newZoom - 1)) / 2;
                
                // Calculate the point in the content that's under the pinch center
                const contentX = (pinchCenter.x - rect.width / 2 - panOffsetRef.current.x) / prev;
                const contentY = (pinchCenter.y - rect.height / 2 - panOffsetRef.current.y) / prev;
                
                const newX = pinchCenter.x - rect.width / 2 - contentX * newZoom;
                const newY = pinchCenter.y - rect.height / 2 - contentY * newZoom;
                
                const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
                const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));
                
                panOffsetRef.current = { x: clampedX, y: clampedY };
                setPanOffset({ x: clampedX, y: clampedY });
              }
              
              return newZoom;
            });
          }
          
          lastTouchDistance = distance;
        }
      };

      const touchPinchEndHandler = () => {
        lastTouchDistance = 0;
      };
      
      cardElement.addEventListener('wheel', wheelHandler, { passive: false });
      cardElement.addEventListener('mousedown', mouseDownHandler);
      cardElement.addEventListener('touchstart', touchStartHandler, { passive: true });
      cardElement.addEventListener('touchmove', touchMoveHandler, { passive: false });
      cardElement.addEventListener('touchend', touchEndHandler);
      cardElement.addEventListener('touchmove', touchPinchHandler, { passive: false });
      cardElement.addEventListener('touchend', touchPinchEndHandler);
      window.addEventListener('mousemove', mouseMoveHandler);
      window.addEventListener('mouseup', mouseUpHandler);
      
      return () => {
        cardElement.removeEventListener('wheel', wheelHandler);
        cardElement.removeEventListener('mousedown', mouseDownHandler);
        cardElement.removeEventListener('touchstart', touchStartHandler);
        cardElement.removeEventListener('touchmove', touchMoveHandler);
        cardElement.removeEventListener('touchend', touchEndHandler);
        cardElement.removeEventListener('touchmove', touchPinchHandler);
        cardElement.removeEventListener('touchend', touchPinchEndHandler);
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [currentIndex, gardens.length, zoomLevel, isPanning, panStart]);

  const handleDroppedItemDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ ...item, isRepositioning: true }));
    
    // Use the hidden drag image element
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 12.5, 12.5);
    }
    
    setDraggedItem(item);
    setIsDraggingItem(true);
  };

  const handleRepositionDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    setIsDraggingItem(false);
    
    const itemData = e.dataTransfer.getData('application/json');
    if (!itemData) return;
    
    const item = JSON.parse(itemData);

    // Get drop position relative to the card
    const cardRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - cardRect.left) / cardRect.width) * 100;
    const y = ((e.clientY - cardRect.top) / cardRect.height) * 100;

    if (item.isRepositioning) {
      // Moving existing item
      const currentItem = droppedItems.find(di => di.id === item.id);
      const oldPosition = currentItem ? { x: currentItem.x, y: currentItem.y } : null;

      const result = await updateItemPosition(item.id, { x, y }, currentItem?.category);
      if (result.success && oldPosition) {
        addToUndoStack({
          type: 'move',
          item: item,
          oldPosition: oldPosition,
          newPosition: { x, y },
        });
      }
    } else {
      // Adding new item
      const result = await addItem(currentGarden.id, item, { x, y }, currentGarden);
      if (result.success) {
        addToUndoStack({
          type: 'add',
          item: result.item,
        });
      }
    }
    
    setDraggedItem(null);
  };

  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 90.01, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 90.01, 180],
    outputRange: [0, 0, 1, 1],
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      {/* Left Navigation Area */}
      {!showPhotoModal && (
        <TouchableOpacity
          style={[styles.navArea, styles.navAreaLeft]}
          onPress={goToPrevious}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
      )}

      {/* Right Navigation Area */}
      {!showPhotoModal && (
        <TouchableOpacity
          style={[styles.navArea, styles.navAreaRight]}
          onPress={goToNext}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Content Area - Card + Items Panel */}
          <View style={[styles.contentArea, !isAdminUser && styles.contentAreaFullWidth]}>
            {/* Card Container */}
            <View style={styles.cardContainer}>
        {/* Title, Description, and Buttons Above Card */}
        {!isAddNewCard && gardens.length > 0 && currentGarden && (
          <GardenHeader
            garden={currentGarden}
            onOpenLocation={openLocation}
            onEdit={handleEdit}
            onOpenDefaults={handleOpenDefaults}
            onDelete={handleDelete}
            isAdmin={isAdminUser}
            showAvailableOnly={showAvailableOnly}
            onToggleAvailableOnly={() => {
              if (showAvailableOnly) {
                // Turn off - clear status filter
                clearFilters('status');
              } else {
                // Turn on - set filter to only Available
                selectAllFilters('status', ['Available']);
              }
            }}
          />
        )}

        {/* Front of Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ rotateY: frontRotation }],
              opacity: frontOpacity,
            },
          ]}
        >
          {gardens.length === 0 && !isAdminUser ? (
            <View style={styles.emptyCard}>
              <View style={styles.gardenBackground}>
                <View style={styles.grassPattern} />
                <View style={styles.stoneWall} />
              </View>
              <View style={styles.emptyContent}>
                <Text style={styles.emptyText}>{t('noGardens')}</Text>
              </View>
            </View>
          ) : gardens.length === 0 ? (
            <TouchableOpacity style={styles.emptyCard} onPress={flipCard}>
              <View style={styles.gardenBackground}>
                <View style={styles.grassPattern} />
                <View style={styles.stoneWall} />
              </View>
              <View style={styles.emptyContent}>
                <Text style={styles.plusButton}>+</Text>
                <Text style={styles.emptyText}>{t('addFirstGarden')}</Text>
              </View>
            </TouchableOpacity>
          ) : isAddNewCard && isAdminUser ? (
            <TouchableOpacity style={styles.addCard} onPress={flipCard}>
              <View style={styles.gardenBackground}>
                <View style={styles.grassPattern} />
                <View style={styles.stoneWall} />
              </View>
              <View style={styles.addContent}>
                <Text style={styles.plusButton}>+</Text>
                <Text style={styles.addCardText}>{t('addNewGarden')}</Text>
              </View>
            </TouchableOpacity>
          ) : isAddNewCard ? (
            <View style={styles.emptyCard}>
              <View style={styles.gardenBackground}>
                <View style={styles.grassPattern} />
                <View style={styles.stoneWall} />
              </View>
              <View style={styles.emptyContent}>
                <Text style={styles.emptyText}>{t('noMoreGardens')}</Text>
              </View>
            </View>
          ) : (
            <div
              ref={gardenCardRef}
              className="garden-zoom-container"
              style={styles.gardenCard}
              onDragOver={isAdminUser ? handleDragOver : undefined}
              onDragLeave={isAdminUser ? handleDragLeave : undefined}
              onDrop={isAdminUser ? handleRepositionDrop : undefined}
            >
              <div 
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  transition: isPanning ? 'none' : 'transform 0.08s ease-out',
                  transformOrigin: 'center center',
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                }}
                onClick={(e) => {
                  // Close tree edit card when clicking outside of tree items and tree card
                  if (!e.target.closest('[data-tree-item]') && !e.target.closest('[data-tree-card]')) {
                    setEditingTreeId(null);
                  }
                }}
              >
                {currentGarden?.background_image ? (
                  <ImageBackground
                    source={{ uri: currentGarden.background_image }}
                    style={styles.backgroundImage}
                    imageStyle={styles.backgroundImageStyle}
                  >
                    <View style={styles.imageOverlay} />
                  </ImageBackground>
                ) : (
                  <View style={styles.gardenBackground}>
                    <View style={styles.grassPattern} />
                    <View style={styles.stoneWall} />
                  </View>
                )}
                
                {/* Dropped Items */}
                {droppedItems.map((item) => {
                  const isEditing = editingTreeId === item.id;
                  const shouldHighlight = shouldHighlightItem(item, tableFilters, selectedTreeIds);
                  
                  return (
                    <DroppedItem
                      key={item.id}
                      item={item}
                      isEditing={isEditing}
                      shouldHighlight={shouldHighlight}
                      touchDraggedItem={touchDraggedItem}
                      isAdminUser={isAdminUser}
                      isDraggingItem={isDraggingItem}
                      treeType={treeType}
                      treeSort={treeSort}
                      treeYearPlanted={treeYearPlanted}
                      treeOwner={treeOwner}
                      treeStatus={treeStatus}
                      onTreeClick={handleTreeClick}
                      onDragStart={handleDroppedItemDragStart}
                      onTouchStart={handleDroppedItemTouchStart}
                      onTouchMove={handleDroppedItemTouchMove}
                      onTouchEnd={handleDroppedItemTouchEnd}
                      onRemoveItem={handleRemoveItem}
                      onEditAvatar={handleEditAvatar}
                      setTreeType={setTreeType}
                      setTreeSort={setTreeSort}
                      setTreeYearPlanted={setTreeYearPlanted}
                      setTreeOwner={setTreeOwner}
                      setTreeStatus={setTreeStatus}
                      onUpdateField={handleUpdateTreeField}
                      setEditingTreeId={setEditingTreeId}
                      onOpenPhoto={() => handleOpenPhoto(item.id)}
                      onEditPhoto={() => handleEditPhoto(item.id)}
                    />
                  );
                })}
              </div>
              
              {isDraggingOver && (
                <View style={styles.dropIndicator}>
                  <Text style={styles.dropIndicatorText}>{t('dropHere')}</Text>
                </View>
              )}
            </div>
          )}
        </Animated.View>

        {/* Back of Card (Form) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              transform: [{ rotateY: backRotation }],
              opacity: backOpacity,
            },
          ]}
        >
          <GardenForm
            isEditMode={isEditMode}
            name={name}
            description={description}
            location={location}
            backgroundImage={backgroundImage}
            saving={saving}
            onChangeName={setName}
            onChangeDescription={setDescription}
            onChangeLocation={setLocation}
            onChangeBackgroundImage={setBackgroundImage}
            onSave={handleSave}
            onCancel={handleCancelEdit}
          />
        </Animated.View>
      </View>

        {/* Items Panel - Admin only */}
        {isAdminUser && !isAddNewCard && gardens.length > 0 && currentGarden && (
          <ItemsPanel
            touchDraggedItem={touchDraggedItem}
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onOpenGenerate={() => setShowGenerateModal(true)}
          />
        )}
      </View>

      {/* Indicator */}
      {!isAddNewCard && gardens.length > 0 && (
        <View style={styles.indicator}>
          <Text style={styles.indicatorText}>
            {currentIndex + 1} / {gardens.length}
          </Text>
        </View>
      )}

      {/* Undo Button */}
      {isAdminUser && canUndo && !isAddNewCard && gardens.length > 0 && (
        <TouchableOpacity
          style={styles.undoButton}
          onPress={handleUndo}
          activeOpacity={0.7}
        >
          <FontAwesome name="undo" size={16} color="#fff" />
          <Text style={styles.undoButtonText}>{t('undo')}</Text>
        </TouchableOpacity>
      )}

      {/* Trees Table */}
      {!isAddNewCard && gardens.length > 0 && currentGarden && (
        <TreesTable
          droppedItems={droppedItems}
          tableSortColumn={tableSortColumn}
          tableSortDirection={tableSortDirection}
          tableFilters={tableFilters}
          showFilterDropdown={showFilterDropdown}
          editingTreeId={editingTreeId}
          selectedTreeIds={selectedTreeIds}
          onSort={handleSort}
          onToggleFilterDropdown={toggleFilterDropdown}
          onToggleFilterValue={toggleFilterValue}
          onSelectAllFilters={(column) => {
            const values = new Set();
            droppedItems.forEach(item => {
              if (item.category !== 'tree') return;
              let value;
              switch (column) {
                case 'type': value = item.type; break;
                case 'sort': value = item.sort || '-'; break;
                case 'year': value = item.yearPlanted ? item.yearPlanted.toString() : '-'; break;
                case 'age':
                  if (item.yearPlanted != null) {
                    const parsedYear = parseInt(item.yearPlanted);
                    value = !isNaN(parsedYear) ? (new Date().getFullYear() - parsedYear).toString() : '-';
                  } else {
                    value = '-';
                  }
                  break;
                case 'owner': value = item.owner || '-'; break;
                case 'status': value = item.status || 'Available'; break;
              }
              if (value) values.add(value);
            });
            selectAllFilters(column, Array.from(values).sort());
          }}
          onClearFilters={clearFilters}
          onCloseFilterDropdown={closeFilterDropdown}
          onToggleTreeSelection={handleToggleTreeSelection}
          onSelectAllTrees={handleSelectAllTrees}
          onClearSelection={handleClearSelection}
          onOpenPhoto={handleOpenPhoto}
          onEditPhoto={handleEditPhoto}
          isAdmin={isAdminUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={showDeleteModal}
        gardenName={gardenToDelete?.name}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Custom Avatar Modal */}
      <AvatarModal
        visible={showAvatarModal}
        avatarUrl={customAvatarUrl}
        onChangeUrl={setCustomAvatarUrl}
        onSave={handleSaveAvatar}
        onCancel={() => {
          setShowAvatarModal(false);
          setEditingAvatarItemId(null);
          setCustomAvatarUrl('');
        }}
      />

      {/* Default Values Modal */}
      <DefaultsModal
        visible={showDefaultsModal}
        defaultSort={defaultSort}
        defaultYearPlanted={defaultYearPlanted}
        defaultOwner={defaultOwner}
        onChangeSort={setDefaultSort}
        onChangeYear={setDefaultYearPlanted}
        onChangeOwner={setDefaultOwner}
        onSave={handleSaveDefaults}
        onCancel={() => setShowDefaultsModal(false)}
      />

      {/* Tree Photo Modal */}
      <TreePhotoModal
        visible={showPhotoModal}
        photoUrl={photoUrl}
        onClose={() => {
          setShowPhotoModal(false);
          setPhotoTreeId(null);
          setPhotoUrl('');
        }}
        isAdminUser={isAdminUser}
      />

      {/* Edit Photo Modal (Admin Only) */}
      <EditPhotoModal
        visible={showEditPhotoModal}
        photoUrl={editPhotoUrl}
        onSave={handleSavePhoto}
        onClose={() => {
          setShowEditPhotoModal(false);
          setEditPhotoTreeId(null);
          setEditPhotoUrl('');
        }}
      />

      {/* Touch Drag Preview */}
      {touchDraggedItem && touchDraggedItem.isRepositioning && (
        <div
          className="touch-drag-preview"
          style={{
            left: touchPosition.x - 12.5,
            top: touchPosition.y - 12.5,
            pointerEvents: 'none',
          }}
        >
          <Image 
            source={{ uri: touchDraggedItem.imageUrl }} 
            style={styles.touchDragPreviewImage}
          />
        </div>
      )}

      {/* Hidden drag image for desktop - must be visible but off-screen */}
      <div
        ref={dragImageRef}
        className="hidden-drag-image"
      >
        {draggedItem && (
          <img 
            src={draggedItem.imageUrl}
            alt=""
            className="hidden-drag-image-img"
          />
        )}
      </div>
      
      {/* Generate Trees Modal */}
      {showGenerateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Trees</Text>
            <Text style={styles.modalMessage}>
              Enter the number of trees to generate (1-1000). Trees will be placed in a grid pattern starting from the bottom-left corner.
            </Text>
            <TextInput
              style={styles.input}
              value={generateCount}
              onChangeText={setGenerateCount}
              placeholder="Number of trees"
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowGenerateModal(false);
                  setGenerateCount('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton, isGenerating && styles.buttonDisabled]}
                onPress={handleGenerateTrees}
                disabled={isGenerating}
              >
                <Text style={styles.modalButtonText}>
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
    </ScrollView>
    </>
  );
}
