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

interface DirectionFormProps {
  item?: ContentItem;
  onCancel?: () => void;
}

export default function DirectionForm({ item, onCancel }: DirectionFormProps) {
  const router = useRouter();
  const { saveItem, updateItem } = useDatabase();
  const { t } = useLanguage();
  const { colors, mainColor } = useTheme();
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [directions, setDirections] = useState(item?.directions || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!title) {
        setError(t("errors.titleRequired" as any));
        return;
      }

      if (!directions) {
        setError(t("errors.directionsRequired" as any));
        return;
      }

      // Create or update the content item
      const content: ContentItem = {
        type: ContentType.DIRECTION,
        title,
        description: description || undefined,
        directions,
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
        err instanceof Error ? err.message : t("errors.failedToSave" as any)
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
            {t("contentTypes.direction" as any)}
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
              value={description}
              onChangeText={setDescription}
              placeholder={t("common.description")}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("common.directions" as any) + " *"}
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
              value={directions}
              onChangeText={setDirections}
              placeholder={t("common.directions" as any)}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
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
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
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
