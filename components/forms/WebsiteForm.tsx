import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Chip, useTheme } from 'react-native-paper';
import TagInput from './TagInput';

interface WebsiteFormData {
  url: string;
  name?: string;
  category: string;
  tags: string[];
}

interface WebsiteFormProps {
  onSubmit: (data: WebsiteFormData) => void;
  isLoading: boolean;
}

const WEBSITE_CATEGORIES = [
  'Tool', 'Tutorial', 'Resource', 'Blog', 'Documentation',
  'Forum', 'Social Media', 'E-commerce', 'News', 'Other'
];

export default function WebsiteForm({ onSubmit, isLoading }: WebsiteFormProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const theme = useTheme();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(url)) {
      newErrors.url = 'Please enter a valid URL starting with http:// or https://';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        url,
        name: name.trim() || undefined,
        category,
        tags,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Website URL *"
        value={url}
        onChangeText={setUrl}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="url"
        error={!!errors.url}
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
      />
      {errors.url && <HelperText type="error">{errors.url}</HelperText>}

      <TextInput
        label="Name (optional)"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
      />

      <View style={styles.categoryLabel}>
        <HelperText type="info">Select a category *</HelperText>
      </View>
      <View style={styles.categories}>
        {WEBSITE_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            selected={category === cat}
            onPress={() => setCategory(cat)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: category === cat
                  ? theme.colors.primaryContainer
                  : theme.colors.surface,
              },
            ]}
            textStyle={{
              color: category === cat
                ? theme.colors.onPrimaryContainer
                : theme.colors.onSurface,
            }}>
            {cat}
          </Chip>
        ))}
      </View>
      {errors.category && <HelperText type="error">{errors.category}</HelperText>}

      <TagInput
        tags={tags}
        onChangeTags={setTags}
        label="Tags (optional)"
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}>
        Save Website
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  categoryLabel: {
    marginBottom: 8,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});