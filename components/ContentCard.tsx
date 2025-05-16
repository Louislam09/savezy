import { ContentItem } from "@/types";
import { ContentType } from "@/utils/contentTypes";
import {
  Globe,
  Image as ImageIcon,
  Link,
  Newspaper,
  Video,
} from "lucide-react-native";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Card, Chip, IconButton, Text, useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");

interface ContentCardProps {
  item: ContentItem;
  onDelete?: () => void;
}

export default function ContentCard({ item, onDelete }: ContentCardProps) {
  const theme = useTheme();

  const getContentTypeIcon = () => {
    const iconProps = {
      size: 20,
      color: theme.colors.primary,
      style: styles.icon,
    };

    switch (item.type) {
      case ContentType.VIDEO:
        return <Video {...iconProps} />;
      case ContentType.MEME:
        return <ImageIcon {...iconProps} />;
      case ContentType.NEWS:
        return <Newspaper {...iconProps} />;
      case ContentType.WEBSITE:
        return <Globe {...iconProps} />;
      case ContentType.IMAGE:
        return <ImageIcon {...iconProps} />;
      default:
        return <Link {...iconProps} />;
    }
  };

  const getCardTitle = () => {
    switch (item.type) {
      case ContentType.VIDEO:
      case ContentType.NEWS:
        return item.title || "Untitled";
      case ContentType.MEME:
        return item.category || "Uncategorized";
      case ContentType.WEBSITE:
        return item.title || item.url || "Untitled";
      case ContentType.IMAGE:
        return item.description || "No description";
      default:
        return "Unknown content";
    }
  };

  const getCardContent = () => {
    switch (item.type) {
      case ContentType.VIDEO:
      case ContentType.NEWS:
      case ContentType.WEBSITE:
        if (item.url) {
          return (
            <Text variant="bodyMedium" numberOfLines={2} style={styles.url}>
              {item.url}
            </Text>
          );
        }
        break;
      case ContentType.MEME:
      case ContentType.IMAGE:
        if (item.description) {
          return (
            <Text variant="bodyMedium" numberOfLines={2}>
              {item.description}
            </Text>
          );
        }
        break;
    }
    return null;
  };

  // Function to render image for memes and images
  const renderImage = () => {
    if (
      (item.type === ContentType.MEME || item.type === ContentType.IMAGE) &&
      item.imageUrl
    ) {
      return (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    return null;
  };

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]}
      contentStyle={styles.cardContent}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {getContentTypeIcon()}
            <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
              {getCardTitle()}
            </Text>
          </View>
          {onDelete && (
            <IconButton
              icon="delete"
              size={20}
              onPress={onDelete}
              iconColor={theme.colors.error}
            />
          )}
        </View>

        {renderImage()}
        {getCardContent()}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag) => (
              <Chip
                key={tag}
                style={[
                  styles.tag,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
                textStyle={{ color: theme.colors.onSecondaryContainer }}
                compact
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  cardContent: {
    padding: 8,
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  title: {
    flex: 1,
  },
  url: {
    color: "#666",
  },
  image: {
    width: "100%",
    height: width * 0.5,
    borderRadius: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    height: 24,
  },
});
