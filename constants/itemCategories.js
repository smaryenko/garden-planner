export const getItemCategories = (t) => ({
  trees: [
    { id: 'olive', name: t('olive'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1fad2.png' },
    { id: 'orange', name: t('orange'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f34a.png' },
    { id: 'lemon', name: t('lemon'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f34b.png' },
    { id: 'fig', name: t('fig'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f96d.png' },
    { id: 'herbs', name: t('herbs'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f33f.png' },
    { id: 'other-tree', name: t('other-tree'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f334.png' },
  ],
  buildings: [
    { id: 'trullo', name: t('trullo'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6d6.png' },
    { id: 'kitchen', name: t('kitchen'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f373.png' },
    { id: 'campfire', name: t('campfire'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f525.png' },
    { id: 'toilet', name: t('toilet'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6be.png' },
    { id: 'storage', name: t('storage'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f4e6.png' },
    { id: 'custom-building', name: t('custom-building'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f3d7.png' },
  ],
  other: [
    { id: 'entrance', name: t('entrance'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6a7.png' },
    { id: 'hammock', name: t('hammock'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6cf.png' },
    { id: 'custom', name: t('custom'), imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/2b50.png' },
  ],
});

// Keep the old export for backward compatibility (uses English by default)
export const itemCategories = {
  trees: [
    { id: 'olive', name: 'Olive Tree', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1fad2.png' },
    { id: 'orange', name: 'Orange Tree', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f34a.png' },
    { id: 'lemon', name: 'Lemon Tree', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f34b.png' },
    { id: 'fig', name: 'Fig Tree', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f96d.png' },
    { id: 'herbs', name: 'Herbs', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f33f.png' },
    { id: 'other-tree', name: 'Other Tree', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f334.png' },
  ],
  buildings: [
    { id: 'trullo', name: 'Trullo', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6d6.png' },
    { id: 'kitchen', name: 'Kitchen', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f373.png' },
    { id: 'campfire', name: 'Campfire', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f525.png' },
    { id: 'toilet', name: 'Toilet', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6be.png' },
    { id: 'storage', name: 'Storage', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f4e6.png' },
    { id: 'custom-building', name: 'Custom', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f3d7.png' },
  ],
  other: [
    { id: 'entrance', name: 'Entrance', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6a7.png' },
    { id: 'hammock', name: 'Hammock', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6cf.png' },
    { id: 'custom', name: 'Custom', imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/2b50.png' },
  ],
};
