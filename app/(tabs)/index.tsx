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
import { ContentItem } from "../../lib/database";

type ContentType = {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  form: string;
};

const contentTypes: ContentType[] = [
  { id: "video", label: "Video", icon: "video", form: "/forms/VideoForm" },
  {
    id: "meme",
    label: "Meme",
    icon: "image",
    form: "/forms/ImageForm?type=Meme",
  },
  { id: "news", label: "News", icon: "file-text", form: "/forms/NewsForm" },
  {
    id: "website",
    label: "Website",
    icon: "globe",
    form: "/forms/WebsiteForm",
  },
  {
    id: "image",
    label: "Image",
    icon: "camera",
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

  const getPreviewUrl = (item: ContentItem) => {
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

  const renderItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity style={styles.itemCard}>
      {item.url ? (
        <Image
          source={getPreviewUrl(item) || undefined}
          style={styles.itemImage}
          contentFit="cover"
        />
      ) : item.imageUrl ? (
        <Image
          source={item.imageUrl}
          style={styles.itemImage}
          contentFit="cover"
        />
      ) : null}
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title || "Untitled"}</Text>
          <Text style={styles.itemType}>{item.type}</Text>
        </View>
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.url && (
          <Text style={styles.itemUrl} numberOfLines={1}>
            {item.url}
          </Text>
        )}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => item.id && handleDelete(item.id)}
        >
          <Feather name="trash-2" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Savezy</Text>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["All", "Video", "Meme", "News", "Website", "Image"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(type === "All" ? null : type)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedType === type && styles.filterButtonTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
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

      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Feather name="plus-circle" size={32} color="#fff" />
      </TouchableOpacity>

      {showTypeSelector && (
        <BlurView intensity={90} style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What would you like to save?</Text>
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.typeButton}
                onPress={() => handleSelectType(type.form)}
              >
                <Feather name={type.icon} size={24} color="#007AFF" />
                <Text style={styles.typeButtonText}>{type.label}</Text>
                <Feather name="chevron-right" size={24} color="#8E8E93" />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTypeSelector(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007AFF",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  itemType: {
    fontSize: 14,
    color: "#007AFF",
    backgroundColor: "#E5F1FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  itemUrl: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 4,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  deleteButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
  },
  typeButtonText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 12,
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
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
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#007AFF",
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
  },
});
