import React from 'react';
import { View, StyleSheet, Image, Dimensions, Pressable } from 'react-native';
import { Card, Text, Chip, useTheme, IconButton } from 'react-native-paper';
import { ContentUnion } from '@/types';
import { ContentType } from '@/utils/pb';
import { Link, Video, Newspaper, Globe, Image as ImageIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ContentCardProps {
  item: ContentUnion;
  onPress: () => void;
  onDelete?: () => void;
}

export default function ContentCard({ item, onPress, onDelete }: ContentCardProps) {
  const theme = useTheme();

  const getContentTypeIcon = () => {
    switch (item.type) {
      case ContentType.VIDEO:
        return <Video size={20} color={theme.colors.primary} />;
      case ContentType.MEME:
        return <ImageIcon size={20} color={theme.colors.secondary} />;
      case ContentType.NEWS:
        return <Newspaper size={20} color={theme.colors.tertiary} />;
      case ContentType.WEBSITE:
        return <Globe size={20} color={theme.colors.primary} />;
      case ContentType.IMAGE:
        return <ImageIcon size={20} color={theme.colors.secondary} />;
      default:
        return <Link size={20} color={theme.colors.primary} />;
    }
  };

  const getCardTitle = () => {
    switch (item.type) {
      case ContentType.VIDEO:
        return item.title || 'Untitled Video';
      case ContentType.MEME:
        return `Meme: ${item.category}`;
      case ContentType.NEWS:
        return item.title;
      case ContentType.WEBSITE:
        return item.name || item.url;
      case ContentType.IMAGE:
        return item.description || 'Untitled Image';
      default:
        return 'Saved Content';
    }
  };

  const getCardContent = () => {
    switch (item.type) {
      case ContentType.VIDEO:
        return item.comment ? (
          <Text variant="bodyMedium" numberOfLines={2} style={styles.comment}>
            {item.comment}
          </Text>
        ) : null;
      case ContentType.NEWS:
        return (
          <Text variant="bodyMedium" numberOfLines={3} style={styles.summary}>
            {item.summary}
          </Text>
        );
      case ContentType.WEBSITE:
        return (
          <Text variant="bodyMedium" numberOfLines={1} style={styles.url}>
            {item.url}
          </Text>
        );
      default:
        return null;
    }
  };

  // Function to render image for memes and images
  const renderImage = () => {
    if (
      (item.type === ContentType.MEME || item.type === ContentType.IMAGE) &&
      (item.imageUrl || item.file)
    ) {
      const imageSource = item.imageUrl
        ? { uri: item.imageUrl }
        : { uri: `${pb.baseUrl}/api/files/${item.collection}/${item.id}/${item.file}` };

      return (
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }
    
    return null;
  };

  return (
    <Pressable onPress={onPress}>
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.elevation.level1 }
        ]}
        contentStyle={styles.cardContent}>
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
                  style={[styles.tag, { backgroundColor: theme.colors.secondaryContainer }]}
                  textStyle={{ color: theme.colors.onSecondaryContainer }}
                  compact>
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  cardContent: {
    padding: 0,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    marginLeft: 8,
    flex: 1,
  },
  comment: {
    marginTop: 8,
  },
  summary: {
    marginTop: 8,
  },
  url: {
    marginTop: 4,
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: width * 0.4,
    borderRadius: 8,
    marginVertical: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    marginRight: 8,
  },
});