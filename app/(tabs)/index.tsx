import { ContentType } from "@/utils/contentTypes";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDatabase } from "../../lib/DatabaseContext";
import { useTheme } from "../../lib/ThemeContext";
import { ContentItem } from "../../lib/database";

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

const EmptyState = ({ onAddNew }: { onAddNew: () => void }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Feather name="inbox" size={64} color="#E5E5EA" />
      </View>
      <Text style={styles.emptyTitle}>No items saved yet</Text>
      <Text style={styles.emptyDescription}>
        Start saving interesting content you find online
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAddNew}>
        <Feather name="plus-circle" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Save New Item</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { items, loading, deleteItem } = useDatabase();
  const { colors, isDark, toggleTheme } = useTheme();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  // Generate preview URLs in useEffect
  useEffect(() => {
    const newPreviews: Record<string, string> = {};
    items.forEach((item) => {
      if (item.url && item.id && !previews[item.id]) {
        newPreviews[
          item.id
        ] = `https://api.microlink.io/?url=${encodeURIComponent(
          item.url
        )}&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=500`;
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
        <View style={styles.tagsRow}>
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
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {item.date || "Apr 30, 2025"}
        </Text>
      );
    };

    return (
      <TouchableOpacity
        style={[styles.itemCard, { backgroundColor: colors.card }]}
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
            style={styles.itemImage}
            contentFit="cover"
            placeholder={null}
            transition={200}
          />
        ) : item.imageUrl ? (
          <Image
            source={item.imageUrl}
            style={styles.itemImage}
            contentFit="cover"
            placeholder={null}
            transition={200}
          />
        ) : null}

        <View style={styles.itemContent}>
          <Text
            style={[styles.itemTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title || "Untitled"}
          </Text>

          {item.description && (
            <Text
              style={[styles.itemDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}

          <View style={styles.itemFooter}>
            {renderTags()}
            {renderDate()}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Savezy</Text>
          <TouchableOpacity
            style={[
              styles.themeButton,
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
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.searchBackground },
          ]}
        >
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search saved items..."
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
              All
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
                {type.label}
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
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <EmptyState onAddNew={handleAddNew} />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.accent }]}
        onPress={handleAddNew}
      >
        <Feather name="plus-circle" size={32} color="#fff" />
      </TouchableOpacity>

      {showTypeSelector && (
        <BlurView intensity={90} style={styles.modal}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              What would you like to save?
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
                  {type.label}
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
                Cancel
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 14,
    opacity: 0.8,
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
    backgroundColor: "#0A84FF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
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
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
