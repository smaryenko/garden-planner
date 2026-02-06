import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../../styles/GardensListScreen.styles';
import { useLanguage } from '../../contexts/LanguageContext';
import { getItemCategories } from '../../constants/itemCategories';

export default function ItemsPanel({ 
  touchDraggedItem,
  onDragStart,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onOpenGenerate,
}) {
  const { t } = useLanguage();
  const itemCategories = getItemCategories(t);
  
  return (
    <View style={styles.itemsPanel}>
      <View style={styles.itemsPanelHeader}>
        <Text style={styles.itemsPanelTitle}>{t('gardenItems')}</Text>
      </View>

      <ScrollView style={styles.itemsPanelScroll}>
        {/* Trees Category */}
        <View style={styles.itemCategory}>
          <View style={styles.categoryTitleRow}>
            <Text style={styles.categoryTitle}>{t('categoryTrees')}</Text>
            <TouchableOpacity
              style={styles.generateButtonSmall}
              onPress={onOpenGenerate}
            >
              <FontAwesome name="magic" size={12} color="#556b2f" />
              <Text style={styles.generateButtonSmallText}>Generate</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.itemsGrid}>
            {itemCategories.trees.map((item) => (
              <div
                key={item.id}
                className={`item-card-draggable ${touchDraggedItem?.id === item.id && !touchDraggedItem?.isRepositioning ? 'item-card-dragging' : ''}`}
                style={styles.itemCard}
                draggable="true"
                onDragStart={(e) => onDragStart(e, item)}
                onTouchStart={(e) => onTouchStart(e, item)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="contain" />
                <Text style={styles.itemName}>{item.name}</Text>
              </div>
            ))}
          </View>
        </View>

        {/* Buildings Category */}
        <View style={styles.itemCategory}>
          <Text style={styles.categoryTitle}>{t('categoryBuildings')}</Text>
          <View style={styles.itemsGrid}>
            {itemCategories.buildings.map((item) => (
              <div
                key={item.id}
                className={`item-card-draggable ${touchDraggedItem?.id === item.id && !touchDraggedItem?.isRepositioning ? 'item-card-dragging' : ''}`}
                style={styles.itemCard}
                draggable="true"
                onDragStart={(e) => onDragStart(e, item)}
                onTouchStart={(e) => onTouchStart(e, item)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="contain" />
                <Text style={styles.itemName}>{item.name}</Text>
              </div>
            ))}
          </View>
        </View>

        {/* Other Category */}
        <View style={styles.itemCategory}>
          <Text style={styles.categoryTitle}>{t('categoryOther')}</Text>
          <View style={styles.itemsGrid}>
            {itemCategories.other.map((item) => (
              <div
                key={item.id}
                className={`item-card-draggable ${touchDraggedItem?.id === item.id && !touchDraggedItem?.isRepositioning ? 'item-card-dragging' : ''}`}
                style={styles.itemCard}
                draggable="true"
                onDragStart={(e) => onDragStart(e, item)}
                onTouchStart={(e) => onTouchStart(e, item)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="contain" />
                <Text style={styles.itemName}>{item.name}</Text>
              </div>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
