import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../../styles/GardensListScreen.styles';
import { useLanguage } from '../../contexts/LanguageContext';
import Tooltip from '../Tooltip';

export default function TreeEditCard({
  item,
  position,
  treeType,
  treeSort,
  treeYearPlanted,
  treeOwner,
  treeStatus,
  onChangeType,
  onChangeSort,
  onChangeYear,
  onChangeOwner,
  onChangeStatus,
  onUpdateField,
  isReadOnly = false,
  onOpenPhoto,
  onEditPhoto,
  hasPhoto = false,
}) {
  const { t } = useLanguage();
  const isTree = item.category === 'tree';
  
  // Determine tooltip position based on item Y position
  const tooltipPosition = item.y > 75 ? 'top' : 'bottom';

  const handleBuyClick = () => {
    console.log('Buy button clicked for:', treeType);
  };

  const showBuyButton = isTree && isReadOnly && (treeStatus === 'Available' || item.status === 'Available');
  const showPhotoButtonViewer = isTree && isReadOnly;
  const showEditPhotoButton = isTree && !isReadOnly;

  return (
    <View 
      style={[
        styles.treeEditCard, 
        { 
          left: position.left, 
          top: position.top
        }
      ]} 
      data-tree-card="true"
    >
      {showBuyButton && (
        <div className="buy-button-tooltip-wrapper">
          <Tooltip text={t('tooltipBuy')} position={tooltipPosition}>
            <TouchableOpacity
              style={styles.buyButtonSquare}
              onPress={handleBuyClick}
              activeOpacity={0.7}
              className="buy-button-square"
            >
              <FontAwesome name="shopping-cart" size={16} color="#fff" />
            </TouchableOpacity>
          </Tooltip>
        </div>
      )}

      {showPhotoButtonViewer && (
        <div className="photo-button-tooltip-wrapper">
          <Tooltip text={hasPhoto ? t('tooltipViewPhoto') : t('tooltipNoPhoto')} position={tooltipPosition}>
            <TouchableOpacity
              style={[
                styles.photoButtonSquare,
                !hasPhoto && styles.photoButtonSquareDisabled
              ]}
              onPress={hasPhoto ? onOpenPhoto : undefined}
              activeOpacity={hasPhoto ? 0.7 : 1}
              disabled={!hasPhoto}
              className="photo-button-square"
            >
              <FontAwesome name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </Tooltip>
        </div>
      )}

      {showEditPhotoButton && (
        <div className="photo-button-tooltip-wrapper">
          <Tooltip text={hasPhoto ? t('tooltipEditPhoto') : t('tooltipAddPhoto')} position={tooltipPosition}>
            <TouchableOpacity
              style={styles.photoButtonSquare}
              onPress={onEditPhoto}
              activeOpacity={0.7}
              className="photo-button-square"
            >
              <FontAwesome name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </Tooltip>
        </div>
      )}

      {isTree ? (
        <>
          <View style={styles.treeEditFieldHorizontal}>
            <Text style={styles.treeEditLabelHorizontal}>{t('type')}:</Text>
            {isReadOnly || !item.isCustomType ? (
              <Text style={styles.treeEditValueHorizontal}>{treeType || '-'}</Text>
            ) : (
              <TextInput
                style={styles.treeEditInputHorizontal}
                className="tree-edit-input-horizontal"
                value={treeType}
                onChangeText={onChangeType}
                onBlur={() => onUpdateField('type', treeType)}
                placeholder={t('placeholderType')}
                placeholderTextColor="#999"
              />
            )}
          </View>
          
          <View style={styles.treeEditFieldHorizontal}>
            <Text style={styles.treeEditLabelHorizontal}>{t('sort')}:</Text>
            {isReadOnly ? (
              <Text style={styles.treeEditValueHorizontal}>{treeSort || '-'}</Text>
            ) : (
              <TextInput
                style={styles.treeEditInputHorizontal}
                className="tree-edit-input-horizontal"
                value={treeSort}
                onChangeText={onChangeSort}
                onBlur={() => onUpdateField('sort', treeSort)}
                placeholder={t('placeholderSort')}
                placeholderTextColor="#999"
              />
            )}
          </View>
          
          <View style={styles.treeEditFieldHorizontal}>
            <Text style={styles.treeEditLabelHorizontal}>{t('year')}:</Text>
            {isReadOnly ? (
              <Text style={styles.treeEditValueHorizontal}>{treeYearPlanted || '-'}</Text>
            ) : (
              <TextInput
                style={styles.treeEditInputHorizontal}
                className="tree-edit-input-horizontal"
                value={treeYearPlanted}
                onChangeText={onChangeYear}
                onBlur={() => onUpdateField('year_planted', treeYearPlanted ? parseInt(treeYearPlanted) : null)}
                placeholder={t('placeholderYear')}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            )}
          </View>
          
          <View style={styles.treeEditFieldHorizontal}>
            <Text style={styles.treeEditLabelHorizontal}>{t('age')}:</Text>
            <Text style={styles.treeEditValueHorizontal}>
              {(() => {
                let year = null;
                if (treeYearPlanted && treeYearPlanted.trim() !== '') {
                  const parsedYear = parseInt(treeYearPlanted);
                  if (!isNaN(parsedYear)) year = parsedYear;
                }
                if (year === null && item.yearPlanted != null) {
                  const parsedYear = parseInt(item.yearPlanted);
                  if (!isNaN(parsedYear)) year = parsedYear;
                }
                if (year !== null) {
                  return `${new Date().getFullYear() - year} ${t('years')}`;
                }
                return '-';
              })()}
            </Text>
          </View>
          
          <View style={styles.treeEditFieldHorizontal}>
            <Text style={styles.treeEditLabelHorizontal}>{t('owner')}:</Text>
            {isReadOnly ? (
              <Text style={styles.treeEditValueHorizontal}>{treeOwner || '-'}</Text>
            ) : (
              <TextInput
                style={styles.treeEditInputHorizontal}
                className="tree-edit-input-horizontal"
                value={treeOwner}
                onChangeText={onChangeOwner}
                onBlur={() => onUpdateField('owner', treeOwner)}
                placeholder={t('placeholderOwner')}
                placeholderTextColor="#999"
              />
            )}
          </View>

          <View style={styles.treeEditFieldHorizontal}>
            <Text style={styles.treeEditLabelHorizontal}>{t('status')}:</Text>
            {isReadOnly ? (
              <Text style={styles.treeEditValueHorizontal}>{treeStatus ? t(treeStatus.toLowerCase()) : t('available')}</Text>
            ) : (
              <select
                className="tree-edit-select"
                value={treeStatus || 'Available'}
                onChange={(e) => {
                  onChangeStatus(e.target.value);
                  onUpdateField('status', e.target.value);
                }}
              >
                <option value="Available">{t('available')}</option>
                <option value="Unavailable">{t('unavailable')}</option>
                <option value="Reserved">{t('reserved')}</option>
              </select>
            )}
          </View>
        </>
      ) : (
        <>
          <View style={styles.treeEditFieldHorizontal}>
            <Text style={styles.treeEditLabelHorizontal}>{t('type')}:</Text>
            {isReadOnly || !item.isCustomType ? (
              <Text style={styles.treeEditValueHorizontal}>{treeType || '-'}</Text>
            ) : (
              <TextInput
                style={styles.treeEditInputHorizontal}
                className="tree-edit-input-horizontal"
                value={treeType}
                onChangeText={onChangeType}
                onBlur={() => onUpdateField('type', treeType)}
                placeholder={t('placeholderShed')}
                placeholderTextColor="#999"
              />
            )}
          </View>
          
          <View style={styles.treeEditFieldHorizontal}>
            <Text style={styles.treeEditLabelHorizontal}>{t('description')}:</Text>
            {isReadOnly ? (
              <Text style={styles.treeEditValueHorizontal}>{treeSort || '-'}</Text>
            ) : (
              <TextInput
                style={styles.treeEditInputHorizontal}
                className="tree-edit-input-horizontal"
                value={treeSort}
                onChangeText={onChangeSort}
                onBlur={() => onUpdateField('description', treeSort)}
                placeholder={t('placeholderToolStorage')}
                placeholderTextColor="#999"
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}
