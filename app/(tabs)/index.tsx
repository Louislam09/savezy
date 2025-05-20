import { ContentType } from "@/utils/contentTypes";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ContentItem } from "../../lib/database";
import { useDatabase } from "../../lib/DatabaseContext";
import { useLanguage } from "../../lib/LanguageContext";
import { useStorage } from "../../lib/StorageContext";
import { useTheme } from "../../lib/ThemeContext";

type ExtendedContentItem = ContentItem & {
  date?: string;
};

type ContentTypeConfig = {
  id: ContentType;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  form: string;
};

const contentTypes: ContentTypeConfig[] = [
  {
    id: ContentType.VIDEO,
    label: "Video",
    icon: "play-circle",
    form: "/forms/VideoForm",
  },
  {
    id: ContentType.MEME,
    label: "Meme",
    icon: "smile",
    form: "/forms/ImageForm?type=Meme",
  },
  {
    id: ContentType.NEWS,
    label: "News",
    icon: "globe",
    form: "/forms/NewsForm",
  },
  {
    id: ContentType.WEBSITE,
    label: "Website",
    icon: "link-2",
    form: "/forms/WebsiteForm",
  },
  {
    id: ContentType.IMAGE,
    label: "Image",
    icon: "image",
    form: "/forms/ImageForm?type=Image",
  },
];

// Add sample data
const DEMO_ITEMS: ExtendedContentItem[] = [
  {
    id: 1,
    type: ContentType.VIDEO,
    title: "How to Master React Native in 2024",
    description:
      "A comprehensive guide to building modern mobile apps with React Native, covering the latest features and best practices.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["programming", "react-native", "tutorial"],
    date: "Mar 15, 2024",
  },
  {
    id: 2,
    type: ContentType.MEME,
    title: "When the code works on first try",
    description:
      "That rare moment when your code runs perfectly without any bugs",
    imageUrl: "https://picsum.photos/800/600",
    tags: ["programming", "funny", "coding"],
    date: "Mar 14, 2024",
  },
  {
    id: 3,
    type: ContentType.NEWS,
    title: "Apple Announces New AI Features for iOS 18",
    description:
      "Apple reveals groundbreaking AI capabilities coming to iOS 18, including enhanced Siri and new privacy-focused features.",
    url: "https://www.apple.com/newsroom/",
    tags: ["tech", "apple", "ai"],
    date: "Mar 13, 2024",
  },
  {
    id: 4,
    type: ContentType.WEBSITE,
    title: "React Native Documentation",
    description:
      "Official React Native documentation with guides, tutorials, and API references.",
    url: "https://reactnative.dev",
    tags: ["react-native", "documentation", "development"],
    date: "Mar 12, 2024",
  },
  {
    id: 5,
    type: ContentType.IMAGE,
    title: "Beautiful Mountain Landscape",
    description: "Stunning view of the Swiss Alps during sunset",
    imageUrl: "https://picsum.photos/800/600",
    tags: ["nature", "photography", "mountains"],
    date: "Mar 11, 2024",
  },
  {
    id: 6,
    type: ContentType.VIDEO,
    title: "Building a Mobile App with Expo",
    description:
      "Learn how to create a full-featured mobile app using Expo and React Native",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["expo", "mobile", "tutorial"],
    date: "Mar 10, 2024",
  },
];

// Add helper function to ensure URL has https prefix
const ensureHttps = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const EmptyState = ({ onAddNew }: { onAddNew: () => void }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Feather name="inbox" size={64} color="#E5E5EA" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t("home.emptyTitle")}
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        {t("home.emptyDescription")}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.accent }]}
        onPress={onAddNew}
      >
        <Feather name="plus-circle" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>{t("home.addNewButton")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { items: dbItems, loading, deleteItem } = useDatabase();
  const { config } = useStorage();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isGridView, setIsGridView] = useState(true);
  const [isDemoMode] = useState(false); // Set to true for demo mode
  const windowWidth = Dimensions.get("window").width;
  const numColumns = isGridView ? 2 : 1;
  const cardWidth = isGridView ? (windowWidth - 48) / 2 : windowWidth - 40;

  // Use demo items when in demo mode
  const items = isDemoMode ? DEMO_ITEMS : dbItems;

  // Generate preview URLs in useEffect
  useEffect(() => {
    const newPreviews: Record<string, string> = {};
    items.forEach((item) => {
      if (item.url && item.id && !previews[item.id]) {
        const httpsUrl = ensureHttps(item.url);
        if (httpsUrl) {
          newPreviews[
            item.id
          ] = `https://api.microlink.io/?url=${encodeURIComponent(
            httpsUrl
          )}&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=500`;
        }
      }
    });
    if (Object.keys(newPreviews).length > 0) {
      setPreviews((prev) => ({ ...prev, ...newPreviews }));
    }
  }, [items]);

  const getPreviewUrl = (item: ExtendedContentItem) => {
    if (!item.url || !item.id) return null;
    return previews[item.id] || null;
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesType = !selectedType || item.type === selectedType;

    return matchesSearch && matchesType;
  });

  const handleAddNew = () => {
    setShowTypeSelector(true);
  };

  const handleSelectType = (form: string) => {
    setShowTypeSelector(false);
    router.push(form);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const renderItem = ({ item }: { item: ExtendedContentItem }) => {
    const renderTags = () => {
      if (!item.tags || item.tags.length === 0) return null;
      return (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tagChip,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                #{tag.toLowerCase()}
              </Text>
            </View>
          ))}
        </View>
      );
    };

    const renderDate = () => {
      return (
        <View style={styles.dateContainer}>
          <Feather
            name="calendar"
            size={14}
            color={colors.textSecondary}
            style={styles.dateIcon}
          />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {item.date || "Apr 30, 2025"}
          </Text>
        </View>
      );
    };

    return (
      <TouchableOpacity
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.card,
            width: cardWidth,
            marginHorizontal: isGridView ? 4 : 0,
          },
        ]}
        onPress={() => router.push(`/item/${item.id}`)}
      >
        <View
          style={[
            styles.contentTypeIndicator,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.5)"
                : "rgba(255, 255, 255, 0.9)",
              borderWidth: isDark ? 0 : 1,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Feather
            name={contentTypes.find((t) => t.id === item.type)?.icon || "file"}
            size={16}
            color={colors.text}
          />
          <Text style={[styles.contentTypeText, { color: colors.text }]}>
            {item.type}
          </Text>
        </View>

        {item.url ? (
          <Image
            source={getPreviewUrl(item) || undefined}
            style={[styles.itemImage, { height: isGridView ? 120 : 200 }]}
            contentFit="cover"
            placeholder={null}
            transition={200}
          />
        ) : item.imageUrl ? (
          <Image
            source={item.imageUrl}
            style={[styles.itemImage, { height: isGridView ? 120 : 200 }]}
            contentFit="cover"
            placeholder={null}
            transition={200}
          />
        ) : null}

        <View style={[styles.itemContent, { padding: isGridView ? 12 : 20 }]}>
          <Text
            style={[
              styles.itemTitle,
              {
                color: colors.text,
                fontSize: isGridView ? 16 : 20,
                lineHeight: isGridView ? 22 : 28,
              },
            ]}
            numberOfLines={2}
          >
            {item.title || "Untitled"}
          </Text>

          {item.url && (
            <Text
              style={[styles.itemUrl, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {ensureHttps(item.url)}
            </Text>
          )}

          {item.description && !isGridView && (
            <Text
              style={[styles.itemDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}

          <View style={styles.itemFooter}>
            {renderDate()}
            {renderTags()}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("home.title")}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[
                styles.headerButton,
                { backgroundColor: colors.buttonBackground },
              ]}
              onPress={() => setIsGridView(!isGridView)}
            >
              <Feather
                name={isGridView ? "list" : "grid"}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.headerButton,
                { backgroundColor: colors.buttonBackground },
              ]}
              onPress={toggleTheme}
            >
              <Feather
                name={isDark ? "sun" : "moon"}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.searchBackground },
          ]}
        >
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("common.search")}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: colors.buttonBackground },
              !selectedType && { backgroundColor: colors.accent },
            ]}
            onPress={() => setSelectedType(null)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: colors.textSecondary },
                !selectedType && { color: colors.text },
              ]}
            >
              {t("common.all")}
            </Text>
          </TouchableOpacity>
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterButton,
                { backgroundColor: colors.buttonBackground },
                selectedType === type.id && { backgroundColor: colors.accent },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: colors.textSecondary },
                  selectedType === type.id && { color: colors.text },
                ]}
              >
                {t(("contentTypes." + type.id.toLowerCase()) as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={{ color: colors.text }}>{t("common.loading")}</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <EmptyState onAddNew={handleAddNew} />
      ) : (
        <FlatList
          key={isGridView + ""}
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={[
            styles.list,
            { paddingHorizontal: isGridView ? 16 : 20 },
          ]}
          showsVerticalScrollIndicator={false}
          numColumns={numColumns}
          columnWrapperStyle={isGridView ? styles.gridRow : undefined}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.accent }]}
        onPress={handleAddNew}
      >
        <Feather name="plus" size={32} color="#fff" />
      </TouchableOpacity>

      {showTypeSelector && (
        <BlurView intensity={90} style={styles.modal}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("common.addNewItem")}
            </Text>
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  { backgroundColor: colors.buttonBackground },
                ]}
                onPress={() => handleSelectType(type.form)}
              >
                <Feather name={type.icon} size={24} color={colors.accent} />
                <Text style={[styles.typeButtonText, { color: colors.text }]}>
                  {t(("contentTypes." + type.id.toLowerCase()) as any)}
                </Text>
                <Feather
                  name="chevron-right"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.buttonBackground },
              ]}
              onPress={() => setShowTypeSelector(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.accent }]}>
                {t("actions.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#0A84FF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#0A84FF",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  list: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  itemCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contentTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contentTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemImage: {
    width: "100%",
    height: 200,
  },
  itemContent: {
    padding: 20,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 28,
  },
  itemDescription: {
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  itemFooter: {
    marginTop: 12,
    gap: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 13,
    opacity: 0.8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#FFFFFF",
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
    marginBottom: 12,
  },
  typeButtonText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 12,
    color: "#FFFFFF",
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
  },
  cancelButtonText: {
    color: "#FF3B30",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#FFFFFF",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gridRow: {
    justifyContent: "space-between",
  },
  itemUrl: {
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.8,
  },
});
