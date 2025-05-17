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

const WEBSITE_CATEGORIES = [
  "Tool",
  "Tutorial",
  "Resource",
  "Blog",
  "Documentation",
  "Other",
];

export default function WebsiteForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    url: "",
    title: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = {
        type: "Website",
        url: form.url,
        title: form.title || null,
        category: form.category || null,
      };

      await pb.collection("contents").create(data);
      router.back();
    } catch (error) {
      console.error("Error saving website:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add Website</Text>

        <View style={styles.field}>
          <Text style={styles.label}>URL *</Text>
          <TextInput
            style={styles.input}
            value={form.url}
            onChangeText={(text) => setForm({ ...form, url: text })}
            placeholder="Enter website URL"
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
            placeholder="Enter website name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {WEBSITE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  form.category === category && styles.categoryButtonActive,
                ]}
                onPress={() => setForm({ ...form, category })}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    form.category === category &&
                      styles.categoryButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
            {loading ? "Saving..." : "Save Website"}
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
  categoryContainer: {
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#fff",
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
