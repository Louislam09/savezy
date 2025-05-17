import { useRouter } from "expo-router";
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

export default function VideoForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    url: "",
    title: "",
    tags: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = {
        type: "Video",
        url: form.url,
        title: form.title || null,
        tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()) : null,
        comment: form.comment || null,
      };

      await pb.collection("contents").create(data);
      router.back();
    } catch (error) {
      console.error("Error saving video:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add Video</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Video URL *</Text>
          <TextInput
            style={styles.input}
            value={form.url}
            onChangeText={(text) => setForm({ ...form, url: text })}
            placeholder="Enter video URL"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Title (optional)</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
            placeholder="Enter video title"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tags (optional, comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={form.tags}
            onChangeText={(text) => setForm({ ...form, tags: text })}
            placeholder="funny, tutorial, music"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Personal Comment (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.comment}
            onChangeText={(text) => setForm({ ...form, comment: text })}
            placeholder="Add your thoughts about this video"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !form.url && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!form.url || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : "Save Video"}
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
