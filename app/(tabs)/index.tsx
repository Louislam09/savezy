import ContentCard from "@/components/ContentCard";
import FilterBar from "@/components/FilterBar";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/hooks/useContent";
import { ContentItem } from "@/types";
import { ContentType } from "@/utils/contentTypes";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    items,
    tags,
    isLoading,
    error,
    fetchContent,
    searchContent,
    deleteContent,
  } = useContent();
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const { isSignedIn, signIn } = useAuth();
  const isFocused = useIsFocused();

  // Refresh content when screen is focused
  React.useEffect(() => {
    console.log("isFocused", isFocused);
    if (isFocused) {
      // fetchContent();
    }
  }, [isFocused, fetchContent]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  }, [fetchContent]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      searchContent(query);
    } else {
      fetchContent();
    }
  };

  const handleSelectType = (type: ContentType | null) => {
    setSelectedType(type);
    fetchContent();
  };

  const handleSelectTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);

    // Filter content based on selected tags
    // This would typically be handled by the backend, but for this demo
    // we'll simulate it on the frontend
  };

  const handleDeleteContent = (item: ContentItem) => {
    if (item.id) {
      deleteContent(item.id);
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedType && item.type !== selectedType) {
      return false;
    }
    if (
      selectedTags.length > 0 &&
      !selectedTags.every((tag) => item.tags.includes(tag))
    ) {
      return false;
    }
    return true;
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!isSignedIn) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.messageText}>
            Please sign in to view your saved content
          </Text>
          <Button mode="contained" onPress={signIn} style={styles.signInButton}>
            Sign In
          </Button>
        </View>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.messageText}>No content found</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <ContentCard item={item} onDelete={() => handleDeleteContent(item)} />
        )}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Appbar.Header>
        <Appbar.Content title="Your Content" />
      </Appbar.Header>
      <View style={styles.searchContainer}>
        <SearchBar onSearch={handleSearch} />
        <FilterBar
          types={Object.values(ContentType)}
          tags={tags}
          selectedType={selectedType}
          selectedTags={selectedTags}
          onSelectType={handleSelectType}
          onSelectTags={setSelectedTags}
        />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  signInButton: {
    marginTop: 16,
  },
});
