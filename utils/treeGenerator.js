import { supabase } from '../lib/supabase';

/**
 * Generate trees in a grid pattern
 * @param {Object} params
 * @param {number} params.count - Number of trees to generate
 * @param {string} params.gardenId - Garden ID
 * @param {Object} params.defaults - Default values for trees
 * @returns {Promise<Array>} Array of inserted trees
 */
export async function generateTrees({ count, gardenId, defaults }) {
  if (!count || count < 1 || count > 1000) {
    throw new Error('Count must be between 1 and 1000');
  }

  // Calculate grid dimensions maintaining 4:3 ratio
  const ratio = 4 / 3;
  const cols = Math.ceil(Math.sqrt(count * ratio));
  const rows = Math.ceil(count / cols);

  // Calculate spacing
  const marginX = 3; // 3% margin from edges
  const marginY = 3;
  const availableWidth = 100 - (2 * marginX);
  const availableHeight = 100 - (2 * marginY);
  const spacingX = availableWidth / (cols - 1 || 1);
  const spacingY = availableHeight / (rows - 1 || 1);

  // Generate trees from bottom-left, filling rows left to right
  const trees = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Position from bottom-left
    const x = marginX + (col * spacingX);
    const y = 100 - marginY - (row * spacingY); // Start from bottom

    trees.push({
      garden_id: gardenId,
      type: defaults.type || 'olive',
      sort: defaults.sort || '',
      year_planted: defaults.yearPlanted || null,
      owner: defaults.owner || null,
      status: defaults.status || 'Available',
      x_percent: x,
      y_percent: y,
      is_active: true,
    });
  }

  // Batch insert trees
  const { data: insertedTrees, error } = await supabase
    .from('trees')
    .insert(trees)
    .select();

  if (error) throw error;

  return insertedTrees;
}
