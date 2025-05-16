import React, { useState } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { TextInput, Button, HelperText, Chip, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import TagInput from './TagInput';

interface MemeFormData {
  imageUrl?: string;
  file?: File;
  category: string;
  tags: string[];
}

interface MemeFormProps {
  onSubmit: (data: MemeFormData, file?: File) => void;
  isLoading: boolean;
}

const MEME_CATEGORIES = [
  'Funny', 'Sarcastic', 'Reaction', 'Gaming', 'Movies',
  'TV Shows', 'Animals', 'Tech', 'Sports', 'Other'
];

export default function MemeForm({ onSubmit, isLoading }: MemeFormProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const theme = useTheme();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageFile(result.assets[0].uri);
      setImageUrl(''); // Clear URL when file is selected
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!imageUrl && !imageFile) {
      newErrors.image = 'Please provide an image URL or upload an image';
    } else if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      newErrors.image = 'Please enter a valid URL starting with http:// or https://';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      let file: File | undefined;
      
      // Convert image file to File object for web
      if (imageFile && Platform.OS === 'web') {
        try {
          const response = await fetch(imageFile);
          const blob = await response.blob();
          const filename = imageFile.split('/').pop() || 'meme.jpg';
          file = new File([blob], filename, { type: blob.type });
        } catch (error) {
          console.error('Error converting image to File:', error);
          setErrors({ image: 'Failed to process image. Please try again.' });
          return;
        }
      }

      onSubmit({
        imageUrl: imageUrl || undefined,
        file,
        category,
        tags,
      }, file);
    }
  };

  return (
    <View style={styles.container}>
      {imageFile && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageFile }} style={styles.previewImage} />
          <Button
            mode="outlined"
            onPress={() => setImageFile(null)}
            style={styles.removeButton}>
            Remove
          </Button>
        </View>
      )}

      <Button
        mode="outlined"
        onPress={pickImage}
        icon="image"
        style={styles.imagePickerButton}>
        Select Image
      </Button>

      <TextInput
        label="Or paste image URL"
        value={imageUrl}
        onChangeText={setImageUrl}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="url"
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
        disabled={!!imageFile}
      />
      {errors.image && <HelperText type="error">{errors.image}</HelperText>}

      <View style={styles.categoryLabel}>
        <HelperText type="info">Select a category *</HelperText>
      </View>
      <View style={styles.categories}>
        {MEME_CATEGORIES.map((cat) => (
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
        Save Meme
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
  imagePickerButton: {
    marginBottom: 16,
  },
  imagePreview: {
    marginBottom: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeButton: {
    marginTop: 8,
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