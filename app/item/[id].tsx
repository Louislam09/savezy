import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import { useDatabase } from "../../lib/DatabaseContext";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";
import { ContentItem, ContentType } from "../../lib/database";
import ImageForm from "../forms/ImageForm";
import NewsForm from "../forms/NewsForm";
import VideoForm from "../forms/VideoForm";
import WebsiteForm from "../forms/WebsiteForm";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, deleteItem, saveItem } = useDatabase();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const deletedItemRef = useRef<ContentItem | null>(null);

  const [item, setItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const imagePreview = `https://api.microlink.io/?url=${encodeURIComponent(
    (item?.url || "") as string
  )}&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=500`;

  useEffect(() => {
    const foundItem = items.find((i) => i.id?.toString() === id);
    if (foundItem) {
      setItem(foundItem);
    }
  }, [id, items]);

  const handleDelete = async () => {
    if (!item?.id) return;

    try {
      setShowDeleteConfirm(false);

      // Show loading state
      Toast.show({
        type: "info",
        text1: t("common.loading"),
        position: "bottom",
        visibilityTime: 1000,
      });

      // Store the item before deleting
      deletedItemRef.current = { ...item };
      await deleteItem(item.id);

      Toast.show({
        type: "info",
        text1: t("common.itemDeleted"),
        text2: t("common.undoButton"),
        onPress: async () => {
          if (deletedItemRef.current) {
            try {
              // Show loading state while restoring
              Toast.show({
                type: "info",
                text1: t("common.loading"),
                position: "bottom",
                visibilityTime: 1000,
              });

              await saveItem(deletedItemRef.current);

              Toast.show({
                type: "success",
                text1: t("common.itemRestored"),
                position: "bottom",
                visibilityTime: 2000,
              });
              router.back();
            } catch (error) {
              Toast.show({
                type: "error",
                text1: t("common.restoreError"),
                position: "bottom",
                visibilityTime: 2000,
              });
            }
          }
        },
        position: "bottom",
        visibilityTime: 3000,
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("common.deleteError"),
        position: "bottom",
        visibilityTime: 1000,
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        title: item?.title || t("common.untitled" as any),
        message: `${item?.title || t("common.untitled" as any)}\n\n${
          item?.description || ""
        }\n\n${item?.url || ""}`,
        url: item?.url,
      };

      await Share.share(shareContent);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error" as any),
        text2: t("common.shareError" as any),
        position: "bottom",
        visibilityTime: 1000,
      });
    }
  };

  const handleCopyToClipboard = async (
    text: string | undefined,
    type: "url" | "description"
  ) => {
    if (!text) return;

    try {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: t("common.success" as any),
        text2:
          type === "url"
            ? t("common.urlCopied" as any)
            : t("common.descriptionCopied" as any),
        position: "bottom",
        visibilityTime: 1500,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error" as any),
        text2: t("common.copyError" as any),
        position: "bottom",
        visibilityTime: 1000,
      });
    }
  };

  const handleOpenUrl = async () => {
    if (!item?.url) return;

    try {
      const supported = await Linking.canOpenURL(item.url);
      if (supported) {
        await Linking.openURL(item.url);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Toast.show({
          type: "error",
          text1: t("common.error" as any),
          text2: t("common.invalidUrl" as any),
          position: "top",
          visibilityTime: 1000,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error" as any),
        text2: t("common.openUrlError" as any),
        position: "top",
        visibilityTime: 1000,
      });
    }
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

  const renderForm = () => {
    if (!isEditing) return null;

    switch (item.type) {
      case ContentType.IMAGE:
      case ContentType.MEME:
        return <ImageForm item={item} onCancel={() => setIsEditing(false)} />;
      case ContentType.WEBSITE:
        return <WebsiteForm item={item} onCancel={() => setIsEditing(false)} />;
      case ContentType.NEWS:
        return <NewsForm item={item} onCancel={() => setIsEditing(false)} />;
      case ContentType.VIDEO:
        return <VideoForm item={item} onCancel={() => setIsEditing(false)} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return renderForm();
    }

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                contentFit="cover"
                placeholder={null}
                transition={200}
              />
            ) : item.url ? (
              <Image
                source={imagePreview || undefined}
                style={[styles.image]}
                contentFit="cover"
                placeholder={null}
                transition={200}
              />
            ) : item.imageUrl ? (
              <Image
                source={item.imageUrl}
                style={[styles.image]}
                contentFit="cover"
                placeholder={null}
                transition={200}
              />
            ) : null}
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {item.title || t("common.untitled" as any)}
          </Text>

          {item.url && (
            <View style={styles.urlContainer}>
              <TouchableOpacity
                style={styles.urlButton}
                onPress={handleOpenUrl}
              >
                <Text style={[styles.url, { color: colors.accent }]}>
                  {item.url}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {item.description && (
            <View style={styles.descriptionContainer}>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {item.description}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() =>
                  handleCopyToClipboard(item.description, "description")
                }
              >
                <Feather name="copy" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
        </View>
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {!isEditing && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsEditing(true);
              }}
            >
              <Feather name="edit" size={24} color={colors.text} />
            </TouchableOpacity>
            {item?.url && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleCopyToClipboard(item.url, "url");
                }}
              >
                <Feather name="copy" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleShare();
              }}
            >
              <Feather name="share-2" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setShowDeleteConfirm(true);
              }}
            >
              <Feather name="trash-2" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {renderContent()}

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
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
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
  url: {
    fontSize: 16,
    marginBottom: 16,
    textDecorationLine: "underline",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
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
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    padding: 8,
  },
  urlButton: {
    flex: 1,
  },
  descriptionContainer: {
    position: "relative",
    marginBottom: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    padding: 12,
  },
  copyButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  previewContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.05)",
    aspectRatio: 16 / 9,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  imageUrlInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  clearImageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
