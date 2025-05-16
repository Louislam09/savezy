import React, { useState } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import TagInput from './TagInput';

interface ImageFormData {
  imageUrl?: string;
  file?: File;
  description: string;
  tags: string[];
}

interface ImageFormProps {
  onSubmit: (data: ImageFormData, file?: File) => void;
  isLoading: boolean;
}

export default function ImageForm({ onSubmit, isLoading }: ImageFormProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [description, setDescription] = useState('');
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

    if (!description.trim()) {
      newErrors.description = 'Description is required';
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
          const filename = imageFile.split('/').pop() || 'image.jpg';
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
        description,
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

      <TextInput
        label="Description *"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        error={!!errors.description}
        style={styles.input}
        placeholderTextColor={theme.colors.outline}
      />
      {errors.description && <HelperText type="error">{errors.description}</HelperText>}

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
        Save Image
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
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});