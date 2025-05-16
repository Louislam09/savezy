import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Chip, HelperText, useTheme } from 'react-native-paper';

interface TagInputProps {
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  label: string;
}

export default function TagInput({ tags, onChangeTags, label }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const theme = useTheme();

  const addTag = () => {
    const trimmedTag = inputValue.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChangeTags([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChangeTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    addTag();
  };

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={inputValue}
        onChangeText={setInputValue}
        onSubmitEditing={handleSubmit}
        mode="outlined"
        right={
          <TextInput.Icon
            icon="plus"
            onPress={addTag}
            disabled={!inputValue.trim()}
          />
        }
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
      />
      <HelperText type="info">Press Enter or '+' to add a tag</HelperText>

      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              onClose={() => removeTag(tag)}
              style={[styles.tag, { backgroundColor: theme.colors.secondaryContainer }]}
              textStyle={{ color: theme.colors.onSecondaryContainer }}>
              {tag}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
});