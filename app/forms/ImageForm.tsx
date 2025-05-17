import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import PocketBase from "pocketbase";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const pb = new PocketBase("https://tick-dynamic-trout.ngrok-free.app");

export default function ImageForm() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: "Image" | "Meme" }>();

  const [form, setForm] = useState({
    imageUrl: "",
    description: "",
    category: "",
    tags: "",
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let imageUrl = form.imageUrl;

      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", {
          uri: selectedImage,
          name: "image.jpg",
          type: "image/jpeg",
        } as any);

        const record = await pb.collection("contents").create({
          type,
          description: form.description || null,
          category: type === "Meme" ? form.category : null,
          tags: form.tags
            ? form.tags.split(",").map((tag) => tag.trim())
            : null,
        });

        const file = await pb
          .collection("contents")
          .update(record.id, formData);
        imageUrl = pb.getFileUrl(file, "file");
      }

      if (!selectedImage) {
        const data = {
          type,
          imageUrl: imageUrl || null,
          description: form.description || null,
          category: type === "Meme" ? form.category : null,
          tags: form.tags
            ? form.tags.split(",").map((tag) => tag.trim())
            : null,
        };

        await pb.collection("contents").create(data);
      }

      router.back();
    } catch (error) {
      console.error("Error saving image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add {type}</Text>

        <View style={styles.imageSection}>
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Feather name="upload" size={32} color="#007AFF" />
              <Text style={styles.uploadText}>Upload Image</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={form.imageUrl}
              onChangeText={(text) => setForm({ ...form, imageUrl: text })}
              placeholder="Enter image URL"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            placeholder={`Describe this ${type.toLowerCase()}`}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {type === "Meme" && (
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={form.category}
              onChangeText={(text) => setForm({ ...form, category: text })}
              placeholder="funny, sarcastic, etc."
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Tags (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={form.tags}
            onChangeText={(text) => setForm({ ...form, tags: text })}
            placeholder="funny, cute, inspiration"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedImage && !form.imageUrl && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={(!selectedImage && !form.imageUrl) || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : `Save ${type}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
  imageSection: {
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
  },
  uploadText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  selectedImageContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: 200,
  },
  changeImageButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  changeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5EA",
  },
  dividerText: {
    color: "#8E8E93",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#FF3B30",
    fontSize: 18,
    fontWeight: "600",
  },
});
