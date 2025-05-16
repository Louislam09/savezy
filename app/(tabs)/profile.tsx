import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Appbar, Text, Button, Avatar, Card, Divider, List, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/hooks/useContent';

export default function ProfileScreen() {
  const { isSignedIn, user, signIn, signOut } = useAuth();
  const { items } = useContent();
  const theme = useTheme();

  // Count items by type
  const contentCounts = items.reduce(
    (acc: { [key: string]: number }, item) => {
      const type = item.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {}
  );

  const renderAuthenticatedContent = () => {
    if (!user) return null;

    return (
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Image
              size={80}
              source={{ uri: user.avatar || 'https://i.pravatar.cc/300' }}
            />
            <View style={styles.profileInfo}>
              <Text variant="titleLarge">{user.name || 'User'}</Text>
              <Text variant="bodyMedium">{user.email}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Joined {new Date(user.created).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Title title="Your Content" />
          <Card.Content>
            <List.Item
              title="Total Items"
              description={items.length.toString()}
              left={props => <List.Icon {...props} icon="bookmark" />}
            />
            <Divider />
            {Object.entries(contentCounts).map(([type, count]) => (
              <List.Item
                key={type}
                title={`${type.charAt(0).toUpperCase() + type.slice(1)}s`}
                description={count.toString()}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={
                      type === 'video'
                        ? 'video'
                        : type === 'meme' || type === 'image'
                        ? 'image'
                        : type === 'news'
                        ? 'newspaper'
                        : 'web'
                    }
                  />
                )}
              />
            ))}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={signOut}
          style={styles.signOutButton}
          icon="logout">
          Sign Out
        </Button>
      </View>
    );
  };

  const renderUnauthenticatedContent = () => {
    return (
      <View style={styles.signInContainer}>
        <Image
          source={{ uri: 'https://i.imgur.com/9I4bqXD.png' }}
          style={styles.signInImage}
          resizeMode="contain"
        />
        <Text variant="headlineSmall" style={styles.signInTitle}>
          Sign in to view your profile
        </Text>
        <Text variant="bodyMedium" style={styles.signInSubtitle}>
          Save and organize your favorite online content with your personal account
        </Text>
        <Button
          mode="contained"
          onPress={signIn}
          style={styles.signInButton}
          icon="google">
          Sign in with Google
        </Button>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header elevated>
        <Appbar.Content title="Profile" />
      </Appbar.Header>
      
      {isSignedIn ? renderAuthenticatedContent() : renderUnauthenticatedContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statsCard: {
    marginBottom: 16,
  },
  signOutButton: {
    marginTop: 8,
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  signInImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  signInTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  signInSubtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});