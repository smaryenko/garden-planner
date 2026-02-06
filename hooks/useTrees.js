import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { itemCategories } from '../constants/itemCategories';

// Cache for storing fetched garden data
const gardenCache = new Map();

export function useTrees(gardenId) {
  const [droppedItems, setDroppedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(new Set());

  useEffect(() => {
    if (gardenId) {
      fetchTrees(gardenId);
    } else {
      setDroppedItems([]);
    }
  }, [gardenId]);

  const fetchTrees = async (gId, forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh && gardenCache.has(gId)) {
      setDroppedItems(gardenCache.get(gId));
      return;
    }

    // Prevent duplicate fetches
    if (fetchingRef.current.has(gId)) {
      return;
    }

    fetchingRef.current.add(gId);
    setLoading(true);

    try {
      const { data: treesData, error: treesError } = await supabase
        .from('trees')
        .select('*')
        .eq('garden_id', gId)
        .eq('is_active', true)
        .order('y_percent', { ascending: false })
        .order('x_percent', { ascending: true });

      if (treesError) throw treesError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('garden_id', gId)
        .eq('is_active', true)
        .order('y_percent', { ascending: false })
        .order('x_percent', { ascending: true });

      if (itemsError) throw itemsError;
      
      const allPredefinedTypes = [
        ...itemCategories.trees.map(t => t.id),
        ...itemCategories.buildings.map(b => b.id),
        ...itemCategories.other.map(o => o.id),
      ];
      
      const trees = (treesData || []).map(tree => {
        const isPredefinedType = allPredefinedTypes.includes(tree.type);
        
        let imageUrl = itemCategories.trees.find(t => t.id === tree.type)?.imageUrl;
        
        if (!imageUrl) {
          imageUrl = itemCategories.trees.find(t => t.id === 'other-tree')?.imageUrl || 
                     'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f333.png';
        }
        
        return {
          id: tree.id,
          name: tree.type,
          imageUrl: imageUrl,
          x: tree.x_percent,
          y: tree.y_percent,
          type: tree.type,
          category: 'tree',
          sort: tree.sort,
          yearPlanted: tree.year_planted,
          owner: tree.owner || null,
          status: tree.status || 'Available',
          isCustomType: !isPredefinedType,
          photoUrl: tree.photo_url || null,
        };
      });

      const items = (itemsData || []).map(item => {
        const isPredefinedType = allPredefinedTypes.includes(item.type);
        
        let imageUrl = itemCategories.buildings.find(b => b.id === item.type)?.imageUrl ||
                      itemCategories.other.find(o => o.id === item.type)?.imageUrl;
        
        if (!imageUrl) {
          imageUrl = 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/2b50.png';
        }
        
        let category = 'other';
        if (itemCategories.buildings.some(b => b.id === item.type)) {
          category = 'building';
        }
        
        return {
          id: item.id,
          name: item.type,
          imageUrl: imageUrl,
          x: item.x_percent,
          y: item.y_percent,
          type: item.type,
          category: category,
          description: item.description,
          isCustomType: !isPredefinedType,
        };
      });
      
      const allItems = [...trees, ...items];
      
      // Store in cache
      gardenCache.set(gId, allItems);
      
      setDroppedItems(allItems);
    } catch (error) {
      console.error('Error fetching trees and items:', error);
    } finally {
      setLoading(false);
      fetchingRef.current.delete(gId);
    }
  };

  const invalidateCache = (gId) => {
    gardenCache.delete(gId);
  };

  const preloadGarden = async (gId) => {
    if (!gardenCache.has(gId) && !fetchingRef.current.has(gId)) {
      fetchTrees(gId);
    }
  };

  const addItem = async (gardenId, item, position, defaults = {}) => {
    try {
      const currentYear = new Date().getFullYear();
      
      let category = 'tree';
      let tableName = 'trees';
      
      if (itemCategories.buildings.some(b => b.id === item.id)) {
        category = 'building';
        tableName = 'items';
      } else if (itemCategories.other.some(o => o.id === item.id)) {
        category = 'other';
        tableName = 'items';
      }
      
      if (tableName === 'trees') {
        // Use defaults only if they are set (not empty)
        const owner = defaults.default_owner || null;
        const yearPlanted = defaults.default_year_planted || null;
        const sort = defaults.default_sort || null;
        
        // Determine status based on owner
        // Only set to Unavailable if owner is set
        const status = owner ? 'Unavailable' : 'Available';
        
        const { data, error } = await supabase
          .from('trees')
          .insert([{
            garden_id: gardenId,
            type: item.id,
            sort: sort,
            year_planted: yearPlanted,
            owner: owner,
            status: status,
            x_percent: position.x,
            y_percent: position.y,
          }])
          .select()
          .single();

        if (error) throw error;

        const newItem = {
          id: data.id,
          name: item.name,
          imageUrl: item.imageUrl,
          x: position.x,
          y: position.y,
          type: item.id,
          category: 'tree',
          sort: sort,
          yearPlanted: yearPlanted,
          owner: owner,
          status: status,
        };
        
        const updatedItems = [...droppedItems, newItem];
        setDroppedItems(updatedItems);
        gardenCache.set(gardenId, updatedItems);
        
        return { success: true, item: newItem };
      } else {
        const { data, error } = await supabase
          .from('items')
          .insert([{
            garden_id: gardenId,
            type: item.id,
            x_percent: position.x,
            y_percent: position.y,
          }])
          .select()
          .single();

        if (error) throw error;

        const newItem = {
          id: data.id,
          name: item.name,
          imageUrl: item.imageUrl,
          x: position.x,
          y: position.y,
          type: item.id,
          category: category,
        };
        
        const updatedItems = [...droppedItems, newItem];
        setDroppedItems(updatedItems);
        gardenCache.set(gardenId, updatedItems);
        
        return { success: true, item: newItem };
      }
    } catch (error) {
      console.error('Error adding item:', error);
      return { success: false, error };
    }
  };

  const updateItemPosition = async (itemId, position, category) => {
    try {
      const tableName = category === 'tree' ? 'trees' : 'items';
      
      const { error } = await supabase
        .from(tableName)
        .update({ 
          x_percent: position.x, 
          y_percent: position.y,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      const updatedItems = droppedItems.map(item => 
        item.id === itemId ? { ...item, x: position.x, y: position.y } : item
      );
      
      setDroppedItems(updatedItems);
      if (gardenId) gardenCache.set(gardenId, updatedItems);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating item position:', error);
      return { success: false, error };
    }
  };

  const updateItemField = async (itemId, field, value, category) => {
    try {
      const tableName = category === 'tree' ? 'trees' : 'items';
      
      let dbField = field;
      if (tableName === 'items' && field === 'sort') {
        dbField = 'description';
      }

      const updateData = {
        [dbField]: value || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', itemId);

      if (error) {
        console.error('DB update error:', error);
        throw error;
      }

      const fieldName = field === 'year_planted' ? 'yearPlanted' : field === 'description' ? 'description' : field;
      
      // Use functional update to get the latest state
      setDroppedItems(prevItems => {
        const updatedItems = prevItems.map(item =>
          item.id === itemId ? { ...item, [fieldName]: value || null } : item
        );
        
        // Update cache with new items
        if (gardenId) gardenCache.set(gardenId, updatedItems);
        
        return updatedItems;
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating item field:', error);
      return { success: false, error };
    }
  };

  const deleteItem = async (itemId, category) => {
    try {
      const tableName = category === 'tree' ? 'trees' : 'items';

      const { error } = await supabase
        .from(tableName)
        .update({ is_active: false })
        .eq('id', itemId);

      if (error) throw error;

      const deletedItem = droppedItems.find(item => item.id === itemId);
      const updatedItems = droppedItems.filter(item => item.id !== itemId);
      
      setDroppedItems(updatedItems);
      if (gardenId) gardenCache.set(gardenId, updatedItems);
      
      return { success: true, item: deletedItem };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, error };
    }
  };

  const updateItemAvatar = async (itemId, avatarUrl, category) => {
    try {
      const tableName = category === 'tree' ? 'trees' : 'items';
      
      const { error } = await supabase
        .from(tableName)
        .update({ 
          custom_avatar: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      const newImageUrl = avatarUrl || droppedItems.find(item => item.id === itemId)?.imageUrl;

      const updatedItems = droppedItems.map(item =>
        item.id === itemId
          ? { ...item, customAvatar: avatarUrl || null, imageUrl: newImageUrl }
          : item
      );
      
      setDroppedItems(updatedItems);
      if (gardenId) gardenCache.set(gardenId, updatedItems);

      return { success: true };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { success: false, error };
    }
  };

  const updateTreePhoto = async (itemId, photoUrl) => {
    try {
      const { error } = await supabase
        .from('trees')
        .update({ 
          photo_url: photoUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      const updatedItems = droppedItems.map(item =>
        item.id === itemId
          ? { ...item, photoUrl: photoUrl || null }
          : item
      );
      
      setDroppedItems(updatedItems);
      if (gardenId) gardenCache.set(gardenId, updatedItems);

      return { success: true };
    } catch (error) {
      console.error('Error updating photo:', error);
      return { success: false, error };
    }
  };

  return {
    droppedItems,
    setDroppedItems,
    loading,
    fetchTrees,
    preloadGarden,
    invalidateCache,
    addItem,
    updateItemPosition,
    updateItemField,
    deleteItem,
    updateItemAvatar,
    updateTreePhoto,
  };
}
