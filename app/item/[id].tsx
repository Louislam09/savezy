import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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
import { ContentItem } from "../../lib/database";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, saveItem, deleteItem, updateItem } = useDatabase();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [item, setItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const foundItem = items.find((i) => i.id?.toString() === id);
    if (foundItem) {
      setItem(foundItem);
      setTitle(foundItem.title || "");
      setDescription(foundItem.description || "");
      setUrl(foundItem.url || "");
      setTags(foundItem.tags || []);
    }
  }, [id, items]);

  const handleSave = async () => {
    if (!item?.id) return;

    try {
      const updatedItem: ContentItem = {
        ...item,
        title,
        description,
        url,
        tags,
      };

      await updateItem(item.id, updatedItem);
      setIsEditing(false);
    } catch (error) {
      Alert.alert(t("common.error" as any), t("common.saveError" as any));
    }
  };

  const handleDelete = async () => {
    if (!item?.id) return;

    try {
      await deleteItem(item.id);
      router.back();
    } catch (error) {
      Alert.alert(t("common.error" as any), t("common.deleteError" as any));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {t("common.itemNotFound" as any)}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            {!isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Feather name="edit" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowDeleteConfirm(true)}
                >
                  <Feather name="trash-2" size={24} color={colors.text} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsEditing(false)}
                >
                  <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleSave}
                >
                  <Feather name="check" size={24} color={colors.text} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit="cover"
              placeholder={null}
              transition={200}
            />
          )}

          {isEditing ? (
            <>
              <TextInput
                style={[styles.titleInput, { color: colors.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder={t("common.title" as any)}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.urlInput, { color: colors.text }]}
                value={url}
                onChangeText={setUrl}
                placeholder={t("common.url" as any)}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.descriptionInput, { color: colors.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder={t("common.description" as any)}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />

              <View style={styles.tagsContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("common.tags" as any)}
                </Text>
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={[styles.tagInput, { color: colors.text }]}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder={t("common.addTag" as any)}
                    placeholderTextColor={colors.textSecondary}
                    onSubmitEditing={addTag}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addTagButton,
                      { backgroundColor: colors.accent },
                    ]}
                    onPress={addTag}
                  >
                    <Feather name="plus" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.tagsList}>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tag, { backgroundColor: colors.card }]}
                      onPress={() => removeTag(tag)}
                    >
                      <Text style={[styles.tagText, { color: colors.text }]}>
                        #{tag}
                      </Text>
                      <Feather
                        name="x"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                {item.title || t("common.untitled" as any)}
              </Text>
              {item.url && (
                <Text style={[styles.url, { color: colors.accent }]}>
                  {item.url}
                </Text>
              )}
              {item.description && (
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                >
                  {item.description}
                </Text>
              )}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsList}>
                  {item.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[styles.tag, { backgroundColor: colors.card }]}
                    >
                      <Text style={[styles.tagText, { color: colors.text }]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {showDeleteConfirm && (
        <BlurView intensity={90} style={styles.modal}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("common.confirmDelete" as any)}
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {t("common.deleteConfirmation" as any)}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.buttonBackground },
                ]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {t("actions.cancel" as any)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDelete}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  {t("actions.delete" as any)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  url: {
    fontSize: 16,
    marginBottom: 16,
    textDecorationLine: "underline",
  },
  urlInput: {
    fontSize: 16,
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  descriptionInput: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    minHeight: 100,
    textAlignVertical: "top",
  },
  tagsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  tagInputContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginRight: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 60,
  },
});
