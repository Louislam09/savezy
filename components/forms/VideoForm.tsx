import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import TagInput from './TagInput';

interface VideoFormData {
  url: string;
  title?: string;
  comment?: string;
  tags: string[];
}

interface VideoFormProps {
  onSubmit: (data: VideoFormData) => void;
  isLoading: boolean;
}

export default function VideoForm({ onSubmit, isLoading }: VideoFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        url,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        tags,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Video URL *"
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
        label="Title (optional)"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
      />

      <TextInput
        label="Comment (optional)"
        value={comment}
        onChangeText={setComment}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
      />

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
        Save Video
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