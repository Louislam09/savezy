import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import { ContentType } from '@/utils/pb';
import { Tag } from '@/types';

interface FilterBarProps {
  selectedType: ContentType | null;
  selectedTags: string[];
  tags: Tag[];
  onSelectType: (type: ContentType | null) => void;
  onSelectTag: (tagId: string) => void;
}

export default function FilterBar({
  selectedType,
  selectedTags,
  tags,
  onSelectType,
  onSelectTag,
}: FilterBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeFilters}>
        <Chip
          selected={selectedType === null}
          onPress={() => onSelectType(null)}
          style={[
            styles.chip,
            {
              backgroundColor: selectedType === null
                ? theme.colors.primaryContainer
                : theme.colors.surface,
            },
          ]}
          textStyle={{
            color: selectedType === null
              ? theme.colors.onPrimaryContainer
              : theme.colors.onSurface,
          }}>
          All
        </Chip>
        {Object.values(ContentType).map((type) => (
          <Chip
            key={type}
            selected={selectedType === type}
            onPress={() => onSelectType(type)}
            style={[
              styles.chip,
              {
                backgroundColor: selectedType === type
                  ? theme.colors.primaryContainer
                  : theme.colors.surface,
              },
            ]}
            textStyle={{
              color: selectedType === type
                ? theme.colors.onPrimaryContainer
                : theme.colors.onSurface,
            }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Chip>
        ))}
      </ScrollView>

      {tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagFilters}>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              selected={selectedTags.includes(tag.id)}
              onPress={() => onSelectTag(tag.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedTags.includes(tag.id)
                    ? theme.colors.secondaryContainer
                    : theme.colors.surface,
                },
              ]}
              textStyle={{
                color: selectedTags.includes(tag.id)
                  ? theme.colors.onSecondaryContainer
                  : theme.colors.onSurface,
              }}>
              {tag.name}
            </Chip>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  typeFilters: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagFilters: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
});