import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDatabase } from "../../lib/DatabaseContext";

type ImageSource = "url" | "upload";

export default function ImageForm() {
  const router = useRouter();
  const { saveItem } = useDatabase();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>("url");
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setImageSource("upload");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === "Enter" && currentTag.trim()) {
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!title) {
        setError("Title is required");
        return;
      }

      if (imageSource === "url" && !imageUrl) {
        setError("Image URL is required");
        return;
      }

      if (imageSource === "upload" && !selectedImage) {
        setError("Please select an image to upload");
        return;
      }

      // Create the content item
      const content = {
        type: "Image" as const,
        title,
        description,
        imageUrl: imageSource === "url" ? imageUrl : selectedImage || "",
        tags,
      };

      await saveItem(content);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Save Image</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={loading ? styles.submitButtonDisabled : styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.sourceSelector}>
            <TouchableOpacity
              style={[
                styles.sourceButton,
                imageSource === "url" && styles.sourceButtonActive,
              ]}
              onPress={() => setImageSource("url")}
            >
              <Feather
                name="link"
                size={20}
                color={imageSource === "url" ? "#fff" : "#007AFF"}
              />
              <Text
                style={[
                  styles.sourceButtonText,
                  imageSource === "url" && styles.sourceButtonTextActive,
                ]}
              >
                URL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sourceButton,
                imageSource === "upload" && styles.sourceButtonActive,
              ]}
              onPress={() => setImageSource("upload")}
            >
              <Feather
                name="upload"
                size={20}
                color={imageSource === "upload" ? "#fff" : "#007AFF"}
              />
              <Text
                style={[
                  styles.sourceButtonText,
                  imageSource === "upload" && styles.sourceButtonTextActive,
                ]}
              >
                Upload
              </Text>
            </TouchableOpacity>
          </View>

          {imageSource === "url" ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Enter image URL"
              />
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Upload Image</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Feather name="upload" size={24} color="#007AFF" />
                <Text style={styles.uploadButtonText}>
                  {selectedImage ? "Change Image" : "Select Image"}
                </Text>
              </TouchableOpacity>
              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.preview} />
              )}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput]}
                value={currentTag}
                onChangeText={setCurrentTag}
                placeholder="Type a tag and press Enter"
                onSubmitEditing={handleAddTag}
                blurOnSubmit={false}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.addTagButton,
                  !currentTag.trim() && styles.addTagButtonDisabled,
                ]}
                onPress={handleAddTag}
                disabled={!currentTag.trim()}
              >
                <Feather
                  name="plus"
                  size={20}
                  color={currentTag.trim() ? "#fff" : "#999"}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tagChip}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <Feather name="x" size={16} color="#fff" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FFE5E5",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  sourceSelector: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  sourceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    gap: 8,
  },
  sourceButtonActive: {
    backgroundColor: "#007AFF",
  },
  sourceButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  sourceButtonTextActive: {
    color: "#fff",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    backgroundColor: "#007AFF",
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addTagButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
