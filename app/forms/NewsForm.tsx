import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";
import { ContentItem, ContentType } from "../../lib/database";

interface NewsFormProps {
  item?: ContentItem;
  onCancel?: () => void;
}

export default function NewsForm({ item, onCancel }: NewsFormProps) {
  const router = useRouter();
  const { saveItem, updateItem } = useDatabase();
  const { t } = useLanguage();
  const { colors, mainColor } = useTheme();
  const [title, setTitle] = useState(item?.title || "");
  const [url, setUrl] = useState(item?.url || "");
  const [summary, setSummary] = useState(item?.summary || "");
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!title) {
        setError("Title is required");
        return;
      }

      if (!url) {
        setError("URL is required");
        return;
      }

      // Create or update the content item
      const content: ContentItem = {
        type: ContentType.NEWS,
        title,
        url,
        summary: summary || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      if (item?.id) {
        await updateItem(item.id, content);
      } else {
        await saveItem(content);
      }

      if (onCancel) {
        onCancel();
      } else {
        router.back();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save news article"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={onCancel || (() => router.back())}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {item ? t("actions.edit") : t("actions.add")}{" "}
            {t("contentTypes.news" as any)}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={
              loading
                ? [
                    styles.submitButtonDisabled,
                    { backgroundColor: colors.cardBorder },
                  ]
                : [styles.submitButton, { backgroundColor: mainColor }]
            }
          >
            <Text style={styles.submitButtonText}>
              {item ? t("actions.update") : t("actions.save")}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("common.title") + " *"}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.searchBackground,
                  color: colors.text,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder={t("common.title")}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("contentTypes.news") + " " + t("common.url") + " *"}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.searchBackground,
                  color: colors.text,
                },
              ]}
              value={url}
              onChangeText={setUrl}
              placeholder={t("contentTypes.news") + " " + t("common.url")}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("common.description")}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.searchBackground,
                  color: colors.text,
                },
              ]}
              value={summary}
              onChangeText={setSummary}
              placeholder={t("common.description")}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("common.tags")}
            </Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.tagInput,
                  {
                    backgroundColor: colors.searchBackground,
                    color: colors.text,
                  },
                ]}
                value={currentTag}
                onChangeText={setCurrentTag}
                placeholder={t("common.addTag")}
                placeholderTextColor={colors.textSecondary}
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
                  color={currentTag.trim() ? "#fff" : colors.textSecondary}
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
    minHeight: 120,
    textAlignVertical: "top",
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
});
