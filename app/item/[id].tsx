import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
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
import { getColors, ImageColorsResult } from "react-native-image-colors";
import ImageView from "react-native-image-viewing";
import { WebView } from "react-native-webview";
import { Toast } from "toastify-react-native";
import { useDatabase } from "../../lib/DatabaseContext";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";
import { ContentItem, ContentType } from "../../lib/database";
import DirectionForm from "../forms/DirectionForm";
import ImageForm from "../forms/ImageForm";
import NewsForm from "../forms/NewsForm";
import VideoForm from "../forms/VideoForm";
import WebsiteForm from "../forms/WebsiteForm";

const ensureHttps = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const isColorLight = (color: string): boolean => {
  if (!color) return false;

  // Remove # if present
  const hex = color.replace(/^#/, "");

  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance (a common approximation)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if luminance is above a threshold
  return luminance > 0.5; // Threshold can be adjusted
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, deleteItem, updateItem } = useDatabase();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const deletedItemRef = useRef<ContentItem | null>(null);
  const [imageColors, setImageColors] = useState<ImageColorsResult | null>(
    null
  );
  const [containerBackgroundColor, setContainerBackgroundColor] = useState(
    colors.background
  );

  const getGradientColors = () => {
    if (imageColors) {
      if (imageColors.platform === "ios") {
        return [
          imageColors.background,
          imageColors.primary,
          imageColors.secondary,
        ];
      } else if (imageColors.platform === "android") {
        return [
          imageColors.dominant || imageColors.average || colors.background,
          imageColors.vibrant || imageColors.lightVibrant || colors.background,
          imageColors.darkVibrant || imageColors.muted || colors.background,
        ];
      } else if (imageColors.platform === "web") {
        return [
          (imageColors as any).dominant ||
            (imageColors as any).average ||
            colors.background,
          (imageColors as any).vibrant ||
            (imageColors as any).lightVibrant ||
            colors.background,
          (imageColors as any).darkVibrant ||
            (imageColors as any).muted ||
            colors.background,
        ];
      }
    }
    return [colors.background, colors.card, colors.cardBorder];
  };

  const [item, setItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [imageViewIndex, setImageViewIndex] = useState(0);

  const imagePreview = `https://api.microlink.io/?url=${encodeURIComponent(
    ensureHttps((item?.url || "") as string) || ""
  )}&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=500`;

  useEffect(() => {
    const foundItem = items.find((i) => i.id?.toString() === id);
    if (foundItem) {
      setItem(foundItem);
    }
  }, [id, items]);

  useEffect(() => {
    const fetchColors = async () => {
      const imageUrl =
        item?.imageUrl ||
        (item?.url && item?.type !== ContentType.IMAGE
          ? imagePreview
          : undefined);

      if (imageUrl) {
        try {
          const colorsResult = await getColors(imageUrl, {
            fallback: colors.background,
            cache: true,
            key: imageUrl,
          });
          setImageColors(colorsResult);

          if (colorsResult) {
            let bgColor = colors.background;
            if (colorsResult.platform === "ios") {
              bgColor = colorsResult.background;
            } else if (colorsResult.platform === "android") {
              bgColor =
                colorsResult.dominant ||
                colorsResult.average ||
                colors.background;
            } else if (colorsResult.platform === "web") {
              bgColor =
                colorsResult.dominant ||
                (colorsResult as any).average ||
                colors.background;
            }
            setContainerBackgroundColor(bgColor);
          } else {
            setContainerBackgroundColor(colors.background);
          }
        } catch (error) {
          console.error("Failed to get image colors:", error);
          setImageColors(null);
          setContainerBackgroundColor(colors.background);
        }
      } else {
        setImageColors(null);
        setContainerBackgroundColor(colors.background);
      }
    };

    fetchColors();
  }, [item?.imageUrl, item?.url, item?.type, imagePreview, colors.background]);

  const handleDelete = async () => {
    if (!item?.id) return;

    try {
      setShowDeleteConfirm(false);

      deletedItemRef.current = { ...item };
      await deleteItem(item.id);

      router.back();

      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: t("common.loading"),
          position: "bottom",
          visibilityTime: 1000,
        });

        Toast.show({
          type: "success",
          text1: t("common.itemDeleted"),
          position: "bottom",
          visibilityTime: 2000,
        });
      }, 100);
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
      if (item?.type === ContentType.IMAGE && item?.imageUrl) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          throw new Error("Sharing is not available on this device");
        }

        let imageUri = item.imageUrl;

        if (item.imageUrl.startsWith("http")) {
          const fileUri = FileSystem.documentDirectory + "temp_image.jpg";
          const downloadResult = await FileSystem.downloadAsync(
            item.imageUrl,
            fileUri
          );

          if (downloadResult.status === 200) {
            imageUri = downloadResult.uri;
          } else {
            throw new Error("Failed to download image");
          }
        }

        await Sharing.shareAsync(imageUri, {
          mimeType: "image/jpeg",
          dialogTitle: item?.title || t("common.untitled" as any),
          UTI: "public.jpeg", // iOS only
        });

        if (item.imageUrl.startsWith("http")) {
          try {
            await FileSystem.deleteAsync(imageUri);
          } catch (cleanupError) {
            console.warn("Failed to cleanup temporary file:", cleanupError);
          }
        }
      } else {
        const shareContent = {
          title: item?.title || t("common.untitled" as any),
          message: `${item?.title || t("common.untitled" as any)}\n\n${
            item?.description || ""
          }\n\n${item?.url || ""}`,
          url: item?.url,
        };

        await Share.share(shareContent);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Share error:", error);
      Toast.show({
        type: "error",
        text1: t("common.error" as any),
        text2: t("common.shareError" as any),
        position: "top",
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
        position: "top",
        visibilityTime: 1500,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error" as any),
        text2: t("common.copyError" as any),
        position: "top",
        visibilityTime: 1000,
      });
    }
  };

  const handleOpenUrl = async () => {
    if (!item?.url) return;

    try {
      const httpsUrl = ensureHttps(item.url);
      if (!httpsUrl) return;

      const supported = await Linking.canOpenURL(httpsUrl);
      if (supported) {
        await Linking.openURL(httpsUrl);
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

  const handleFavorite = () => {
    if (!item) return;
    const isFav = item.isFavorite;

    const updatedItem = {
      ...item,
      isFavorite: !isFav,
    };

    updateItem(updatedItem.id!, updatedItem);
    setItem(updatedItem);

    Haptics.impactAsync(
      isFav
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium
    );

    // Show toast
    Toast.show({
      type: "success",
      text1: isFav
        ? t("common.removedFromFavorites" as any)
        : t("common.addedToFavorites" as any),
      position: "top",
      visibilityTime: 1500,
    });
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

  const getFormComponent = (type: ContentType) => {
    switch (type) {
      case ContentType.VIDEO:
        return VideoForm;
      case ContentType.MEME:
      case ContentType.IMAGE:
        return ImageForm;
      case ContentType.NEWS:
        return NewsForm;
      case ContentType.WEBSITE:
        return WebsiteForm;
      case ContentType.DIRECTION:
        return DirectionForm;
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  };

  const renderForm = () => {
    if (!isEditing) return null;

    const FormComponent = getFormComponent(item.type);
    return <FormComponent item={item} onCancel={() => setIsEditing(false)} />;
  };

  const renderContent = () => {
    if (isEditing) {
      return renderForm();
    }

    const images = item.imageUrl ? [item.imageUrl] : [];
    const gradientColors = getGradientColors();

    // Determine text color based on the primary gradient color
    const primaryGradientColor = gradientColors[0] as string;
    const textColor = isColorLight(primaryGradientColor)
      ? "#000000"
      : colors.text;
    const textSecondaryColor = isColorLight(primaryGradientColor)
      ? "#333333"
      : colors.textSecondary;

    // Map HTML for direction type
    const mapHtml =
      item.type === ContentType.DIRECTION && item.latitude && item.longitude
        ? `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
              body { margin: 0; padding: 0; }
              #map { width: 100%; height: 300px; }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              const map = L.map('map').setView([${item.latitude}, ${item.longitude}], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap contributors'
              }).addTo(map);

              L.marker([${item.latitude}, ${item.longitude}]).addTo(map);
              L.circle([${item.latitude}, ${item.longitude}], {
                  color: 'red',
                  fillColor: '#f03',
                  fillOpacity: 0.1,
                  radius: 500
              }).addTo(map);
          </script>
      </body>
      </html>
    `
        : "";

    return (
      <>
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            {/* Image or Map Section */}
            <View style={styles.imageContainer}>
              {item.type === ContentType.DIRECTION &&
              item.latitude &&
              item.longitude ? (
                <WebView
                  source={{ html: mapHtml }}
                  style={styles.heroImage}
                  scrollEnabled={false}
                  zoomEnabled={false}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    if (item.imageUrl) {
                      setIsImageViewVisible(true);
                      setImageViewIndex(0);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: item.imageUrl || imagePreview }}
                    style={styles.heroImage}
                    contentFit="cover"
                    placeholder={null}
                    transition={300}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.imageOverlay}
                  >
                    {item.url && (
                      <View style={styles.sourceContainer}>
                        <Feather
                          name="download"
                          size={14}
                          color="rgba(255,255,255,0.8)"
                        />
                        <Text style={styles.sourceText}>{item.url}</Text>
                      </View>
                    )}
                    {item.category && (
                      <View style={styles.categoryTopRightContainer}>
                        <Feather name="folder" size={14} color="#FFFFFF" />
                        <Text style={styles.categoryTopRightText}>
                          {item.category}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.imageTitle}>
                      {item.title || t("common.untitled" as any)}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            <LinearGradient
              colors={gradientColors as any}
              style={styles.content}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {/* Directions Card for Direction type */}
              {item.type === ContentType.DIRECTION && item.directions && (
                <View
                  style={[styles.card, { backgroundColor: `${colors.card}B3` }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>
                      {t("common.directions" as any)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleCopyToClipboard(item.directions, "description")
                      }
                    >
                      <Feather
                        name="copy"
                        size={16}
                        color={textSecondaryColor}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[styles.cardText, { color: textSecondaryColor }]}
                  >
                    {item.directions}
                  </Text>
                </View>
              )}

              {/* Description Card */}
              {item.description && (
                <View
                  style={[styles.card, { backgroundColor: `${colors.card}B3` }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>
                      {t("common.description" as any)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleCopyToClipboard(item.description, "description")
                      }
                    >
                      <Feather
                        name="copy"
                        size={16}
                        color={textSecondaryColor}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[styles.cardText, { color: textSecondaryColor }]}
                  >
                    {item.description}
                  </Text>
                </View>
              )}

              {/* URL Card */}
              {item.url && (
                <View
                  style={[styles.card, { backgroundColor: `${colors.card}B3` }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>
                      {t("common.source" as any)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopyToClipboard(item.url, "url")}
                    >
                      <Feather
                        name="copy"
                        size={16}
                        color={textSecondaryColor}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={handleOpenUrl}>
                    <Text style={[styles.urlText, { color: textColor }]}>
                      {ensureHttps(item.url)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Tags Section */}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={[styles.tagsSectionTitle, { color: textColor }]}>
                    {t("common.tags" as any)}
                  </Text>
                  <View style={styles.tagsList}>
                    {item.tags.map((tag) => (
                      <View
                        key={tag}
                        style={[
                          styles.tag,
                          { backgroundColor: `${colors.card}B3` },
                        ]}
                      >
                        <Text style={[styles.tagText, { color: textColor }]}>
                          #{tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        {!isEditing && ( // Show bottom bar only when not editing
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={styles.bottomBar}
          >
            {item?.url && (
              <TouchableOpacity
                style={styles.bottomAction}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleCopyToClipboard(item.url, "url");
                }}
              >
                <View style={styles.bottomIconContainer}>
                  <Feather
                    name="copy"
                    size={20}
                    color={
                      isColorLight(containerBackgroundColor)
                        ? "#000000"
                        : "#FFFFFF"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.bottomActionText,
                    {
                      color: isColorLight(containerBackgroundColor)
                        ? "#000000"
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {t("common.urlCopied" as any)}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.bottomAction}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleShare();
              }}
            >
              <View style={styles.bottomIconContainer}>
                <Feather
                  name="share-2"
                  size={20}
                  color={
                    isColorLight(containerBackgroundColor)
                      ? "#000000"
                      : "#FFFFFF"
                  }
                />
              </View>
              <Text
                style={[
                  styles.bottomActionText,
                  {
                    color: isColorLight(containerBackgroundColor)
                      ? "#000000"
                      : colors.textSecondary,
                  },
                ]}
              >
                {t("actions.share" as any)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomAction}
              onPress={handleFavorite}
            >
              <View style={styles.bottomIconContainer}>
                <Feather
                  name={item.isFavorite ? "heart" : "heart"}
                  size={20}
                  color={
                    item.isFavorite
                      ? colors.accent
                      : isColorLight(containerBackgroundColor)
                      ? "#000000"
                      : "#FFFFFF"
                  }
                />
              </View>
              <Text
                style={[
                  styles.bottomActionText,
                  {
                    color: isColorLight(containerBackgroundColor)
                      ? "#000000"
                      : colors.textSecondary,
                  },
                ]}
              >
                {t("actions.favorite" as any)}
              </Text>
            </TouchableOpacity>
          </BlurView>
        )}

        <ImageView
          images={images.map((url) => ({ uri: url }))}
          imageIndex={imageViewIndex}
          visible={isImageViewVisible}
          onRequestClose={() => setIsImageViewVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          animationType="fade"
          backgroundColor="rgba(0, 0, 0, 0.9)"
        />
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: containerBackgroundColor }]}
    >
      {!isEditing && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather
              name="arrow-left"
              size={24}
              color={
                isColorLight(containerBackgroundColor) ? "#000000" : "#FFFFFF"
              }
            />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsEditing(true);
              }}
            >
              <Feather
                name="edit-2"
                size={22}
                color={
                  isColorLight(containerBackgroundColor) ? "#000000" : "#FFFFFF"
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setShowDeleteConfirm(true);
              }}
            >
              <Feather
                name="trash-2"
                size={22}
                color={
                  isColorLight(containerBackgroundColor) ? "#000000" : "#FFFFFF"
                }
              />
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
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "rgba(255,59,48,0.1)",
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom bar
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    // marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: 300,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  imageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  imageSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryOverlayContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  categoryOverlayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  categoryTopRightContainer: {
    position: "absolute",
    top: 16, // Adjust spacing from top
    right: 16, // Adjust spacing from right
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
    zIndex: 1, // Ensure it's above the image
  },
  categoryTopRightText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF", // White text
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  urlText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
  tagsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  tagsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  bottomAction: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  bottomIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  bottomActionText: {
    fontSize: 12,
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
