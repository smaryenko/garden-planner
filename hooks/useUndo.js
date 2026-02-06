import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useUndo(maxStackSize = 10) {
  const [undoStack, setUndoStack] = useState([]);

  const addToUndoStack = (action) => {
    setUndoStack(prev => {
      const newStack = [action, ...prev];
      return newStack.slice(0, maxStackSize);
    });
  };

  const clearUndoStack = () => {
    setUndoStack([]);
  };

  const undo = async (onRefresh) => {
    if (undoStack.length === 0) return { success: false };

    const lastAction = undoStack[0];
    const remainingStack = undoStack.slice(1);

    const getTableName = (item) => item?.category === 'tree' ? 'trees' : 'items';

    try {
      if (lastAction.type === 'delete') {
        const tableName = getTableName(lastAction.item);
        const { error } = await supabase
          .from(tableName)
          .update({ is_active: true })
          .eq('id', lastAction.item.id);

        if (error) throw error;
        
        if (onRefresh) await onRefresh();
      } else if (lastAction.type === 'add') {
        const tableName = getTableName(lastAction.item);
        const { error } = await supabase
          .from(tableName)
          .update({ is_active: false })
          .eq('id', lastAction.item.id);

        if (error) throw error;
      } else if (lastAction.type === 'generate') {
        // Delete all generated trees in batch
        const treeIds = lastAction.items.map(item => item.id);
        const { error } = await supabase
          .from('trees')
          .update({ is_active: false })
          .in('id', treeIds);

        if (error) throw error;
        
        if (onRefresh) await onRefresh();
      } else if (lastAction.type === 'move') {
        const tableName = getTableName(lastAction.item);
        const { error } = await supabase
          .from(tableName)
          .update({ 
            x_percent: lastAction.oldPosition.x, 
            y_percent: lastAction.oldPosition.y,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lastAction.item.id);

        if (error) throw error;
      } else if (lastAction.type === 'edit') {
        const tableName = getTableName(lastAction.item);
        const { error } = await supabase
          .from(tableName)
          .update({ 
            [lastAction.field]: lastAction.oldValue,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lastAction.item.id);

        if (error) throw error;
      } else if (lastAction.type === 'avatar') {
        const tableName = getTableName(lastAction.item);
        const { error } = await supabase
          .from(tableName)
          .update({ 
            custom_avatar: lastAction.oldAvatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lastAction.item.id);

        if (error) throw error;
      }

      setUndoStack(remainingStack);
      return { success: true, action: lastAction };
    } catch (error) {
      console.error('Error undoing action:', error);
      return { success: false, error };
    }
  };

  return {
    undoStack,
    addToUndoStack,
    clearUndoStack,
    undo,
    canUndo: undoStack.length > 0,
  };
}
