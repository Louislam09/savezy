import { Tag } from "@/types";
import { ContentType } from "@/utils/contentTypes";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, useTheme } from "react-native-paper";

interface FilterBarProps {
  types: ContentType[];
  selectedType: ContentType | null;
  selectedTags: string[];
  tags: Tag[];
  onSelectType: (type: ContentType | null) => void;
  onSelectTags: (tags: string[]) => void;
}

export default function FilterBar({
  types,
  selectedType,
  selectedTags,
  tags,
  onSelectType,
  onSelectTags,
}: FilterBarProps) {
  const theme = useTheme();

  const handleTagSelect = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    onSelectTags(newSelectedTags);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeFilters}
      >
        <Chip
          selected={selectedType === null}
          onPress={() => onSelectType(null)}
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedType === null
                  ? theme.colors.primaryContainer
                  : theme.colors.surface,
            },
          ]}
          textStyle={{
            color:
              selectedType === null
                ? theme.colors.onPrimaryContainer
                : theme.colors.onSurface,
          }}
        >
          All
        </Chip>
        {types.map((type) => (
          <Chip
            key={type}
            selected={selectedType === type}
            onPress={() => onSelectType(type)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedType === type
                    ? theme.colors.primaryContainer
                    : theme.colors.surface,
              },
            ]}
            textStyle={{
              color:
                selectedType === type
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurface,
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagFilters}
      >
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            selected={selectedTags.includes(tag.id)}
            onPress={() => handleTagSelect(tag.id)}
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
            }}
          >
            {tag.name}
          </Chip>
        ))}
      </ScrollView>
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
