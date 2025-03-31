
import { useState, useCallback } from 'react';
import { Selection } from '@/types';

/**
 * Custom hook for managing item selections
 * Useful for multi-select functionality in lists
 */
export const useSelection = (): Selection => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.filter(item => item !== id));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedItems(ids);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedItems.includes(id);
  }, [selectedItems]);

  const someSelected = useCallback(() => {
    return selectedItems.length > 0;
  }, [selectedItems]);

  const allSelected = useCallback((totalItems: number) => {
    return selectedItems.length === totalItems && totalItems > 0;
  }, [selectedItems]);

  return {
    selectedItems,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    someSelected,
    allSelected
  };
};
