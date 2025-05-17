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

export default function NewsForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    url: "",
    summary: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = {
        type: "News",
        title: form.title,
        url: form.url,
        summary: form.summary || null,
        tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()) : null,
      };

      await pb.collection("contents").create(data);
      router.back();
    } catch (error) {
      console.error("Error saving news:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add News Article</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
            placeholder="Enter article title"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>URL *</Text>
          <TextInput
            style={styles.input}
            value={form.url}
            onChangeText={(text) => setForm({ ...form, url: text })}
            placeholder="Enter article URL"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Summary</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.summary}
            onChangeText={(text) => setForm({ ...form, summary: text })}
            placeholder="Write a brief summary of the article"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tags (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={form.tags}
            onChangeText={(text) => setForm({ ...form, tags: text })}
            placeholder="news, tech, science"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!form.title || !form.url) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!form.title || !form.url || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : "Save Article"}
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
