import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useGardens() {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [navigateToNewGarden, setNavigateToNewGarden] = useState(false);

  useEffect(() => {
    fetchGardens();
  }, []);

  useEffect(() => {
    if (navigateToNewGarden && gardens.length > 0) {
      setCurrentIndex(gardens.length - 1);
      setNavigateToNewGarden(false);
    }
  }, [gardens, navigateToNewGarden]);

  const fetchGardens = async () => {
    try {
      const { data, error } = await supabase
        .from('gardens')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGardens(data || []);
    } catch (error) {
      console.error('Error fetching gardens:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGarden = async (gardenData) => {
    try {
      const { data, error } = await supabase
        .from('gardens')
        .insert([{
          name: gardenData.name.trim(),
          description: gardenData.description?.trim() || null,
          location: gardenData.location?.trim() || null,
          background_image: gardenData.backgroundImage?.trim() || null,
        }])
        .select();

      if (error) throw error;
      await fetchGardens();
      setNavigateToNewGarden(true);
      return { success: true };
    } catch (error) {
      console.error('Error creating garden:', error);
      return { success: false, error };
    }
  };

  const updateGarden = async (gardenId, gardenData) => {
    try {
      const { error } = await supabase
        .from('gardens')
        .update({
          name: gardenData.name.trim(),
          description: gardenData.description?.trim() || null,
          location: gardenData.location?.trim() || null,
          background_image: gardenData.backgroundImage?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gardenId);

      if (error) throw error;
      await fetchGardens();
      return { success: true };
    } catch (error) {
      console.error('Error updating garden:', error);
      return { success: false, error };
    }
  };

  const deleteGarden = async (gardenId) => {
    try {
      const { error } = await supabase
        .from('gardens')
        .update({ is_active: false })
        .eq('id', gardenId);

      if (error) throw error;
      await fetchGardens();
      
      if (currentIndex >= gardens.length - 1 && gardens.length > 1) {
        setCurrentIndex(currentIndex);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting garden:', error);
      return { success: false, error };
    }
  };

  const updateGardenDefaults = async (gardenId, defaults) => {
    try {
      const { error } = await supabase
        .from('gardens')
        .update({
          default_sort: defaults.sort || null,
          default_year_planted: defaults.yearPlanted ? parseInt(defaults.yearPlanted) : null,
          default_owner: defaults.owner || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gardenId);

      if (error) throw error;
      
      setGardens(gardens.map(g => 
        g.id === gardenId 
          ? { 
              ...g, 
              default_sort: defaults.sort || null,
              default_year_planted: defaults.yearPlanted ? parseInt(defaults.yearPlanted) : null,
              default_owner: defaults.owner || null
            }
          : g
      ));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating garden defaults:', error);
      return { success: false, error };
    }
  };

  const currentGarden = gardens[currentIndex];
  const isAddNewCard = currentIndex === gardens.length;

  return {
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
  };
}
