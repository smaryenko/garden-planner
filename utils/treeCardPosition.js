/**
 * Calculate TreeEditCard position based on item position
 * @param {Object} item - Item with x and y coordinates
 * @param {boolean} isAdmin - Whether user is admin (affects card height)
 * @returns {Object} Position with left and top offsets
 */
export function calculateCardPosition(item, isAdmin = false) {
  let cardLeft = 25; // Default center-right (reduced from 35)
  let cardTop = -60; // Default middle

  // Horizontal positioning
  if (item.x < 30) {
    // Near left edge - show on right
    cardLeft = 35;
  } else if (item.x > 70) {
    // Near right edge - show on left (220px card + small gap)
    cardLeft = -240;
  }

  // Vertical positioning
  if (item.y < 25) {
    // Near top
    cardTop = 0;
  } else if (item.y > 75) {
    // Near bottom - different offset for admin (taller card) vs viewer
    cardTop = isAdmin ? -180 : -120;
  } else {
    // Middle
    cardTop = -60;
  }

  return { left: cardLeft, top: cardTop };
}
