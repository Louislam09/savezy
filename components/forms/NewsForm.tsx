import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import TagInput from './TagInput';

interface NewsFormData {
  title: string;
  url: string;
  summary: string;
  tags: string[];
}

interface NewsFormProps {
  onSubmit: (data: NewsFormData) => void;
  isLoading: boolean;
}

export default function NewsForm({ onSubmit, isLoading }: NewsFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const theme = useTheme();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(url)) {
      newErrors.url = 'Please enter a valid URL starting with http:// or https://';
    }

    if (!summary.trim()) {
      newErrors.summary = 'Summary is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        title,
        url,
        summary,
        tags,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Title *"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        error={!!errors.title}
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
      />
      {errors.title && <HelperText type="error">{errors.title}</HelperText>}

      <TextInput
        label="URL *"
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
        label="Summary *"
        value={summary}
        onChangeText={setSummary}
        mode="outlined"
        multiline
        numberOfLines={4}
        error={!!errors.summary}
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
      />
      {errors.summary && <HelperText type="error">{errors.summary}</HelperText>}

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
        Save News Article
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
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});