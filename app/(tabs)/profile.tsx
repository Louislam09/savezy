import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/hooks/useContent";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Image, StyleSheet, useColorScheme, View } from "react-native";
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { isSignedIn, user, signIn, signOut } = useAuth();
  const { items } = useContent();
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const contentCounts = items.reduce((acc: { [key: string]: number }, item) => {
    const type = item.type || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const avatarUrl = useMemo(() => {
    if (!user) return "https://api.dicebear.com/7.x/avataaars/png";

    // If user has an avatar from PocketBase
    if (user.avatar) {
      // Assuming your PocketBase instance is at process.env.EXPO_PUBLIC_POCKETBASE_URL
      return `${process.env.EXPO_PUBLIC_POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`;
    }

    // Generate a consistent avatar using Dicebear
    const seed = user.id || user.email;
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(
      seed
    )}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=solid&style=${
      colorScheme === "dark" ? "transparent" : "circle"
    }`;
  }, [user, colorScheme]);

  const renderAuthenticatedContent = () => {
    if (!user) return null;

    return (
      <View style={styles.content}>
        <Surface style={styles.headerSection} elevation={2}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryContainer]}
            style={styles.gradientHeader}
          >
            <Avatar.Image
              size={100}
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineMedium" style={styles.nameText}>
                {user.name || "User"}
              </Text>
              <Text variant="bodyLarge" style={styles.emailText}>
                {user.email}
              </Text>
              <Text variant="bodySmall" style={styles.joinedText}>
                Joined {new Date(user.created).toLocaleDateString()}
              </Text>
            </View>
          </LinearGradient>
        </Surface>

        <Card style={styles.statsCard} mode="outlined">
          <Card.Title
            title="Content Statistics"
            titleVariant="titleLarge"
            style={styles.cardTitle}
          />
          <Card.Content>
            <View style={styles.totalStatsContainer}>
              <Surface style={styles.statItem} elevation={0} mode="flat">
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {items.length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Total Items
                </Text>
              </Surface>
              {Object.entries(contentCounts).map(([type, count]) => (
                <Surface
                  key={type}
                  style={styles.statItem}
                  elevation={0}
                  mode="flat"
                >
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {count}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </Text>
                </Surface>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={signOut}
          style={styles.signOutButton}
          icon="logout"
          contentStyle={styles.signOutButtonContent}
        >
          Sign Out
        </Button>
      </View>
    );
  };

  const renderUnauthenticatedContent = () => {
    return (
      <View style={styles.signInContainer}>
        <Surface style={styles.signInCard} elevation={2}>
          <Image
            source={{ uri: "https://i.imgur.com/9I4bqXD.png" }}
            style={styles.signInImage}
            resizeMode="contain"
          />
          <Text variant="headlineMedium" style={styles.signInTitle}>
            Welcome to Savezy
          </Text>
          <Text variant="bodyLarge" style={styles.signInSubtitle}>
            Save and organize your favorite online content with your personal
            account
          </Text>
          <Button
            mode="contained"
            onPress={signIn}
            style={styles.signInButton}
            icon="google"
            contentStyle={styles.signInButtonContent}
          >
            Sign in with Google
          </Button>
        </Surface>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <Appbar.Header elevated mode="center-aligned">
        <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {isSignedIn
        ? renderAuthenticatedContent()
        : renderUnauthenticatedContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    marginBottom: 20,
  },
  gradientHeader: {
    padding: 24,
    alignItems: "center",
  },
  avatar: {
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "white",
  },
  profileInfo: {
    alignItems: "center",
  },
  nameText: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  emailText: {
    color: "white",
    opacity: 0.9,
    marginBottom: 4,
  },
  joinedText: {
    color: "white",
    opacity: 0.7,
  },
  headerTitle: {
    fontWeight: "bold",
  },
  statsCard: {
    margin: 16,
    borderRadius: 12,
  },
  cardTitle: {
    paddingHorizontal: 8,
  },
  totalStatsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 16,
    padding: 8,
  },
  statItem: {
    alignItems: "center",
    minWidth: 100,
    padding: 12,
    borderRadius: 8,
  },
  statNumber: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  signOutButton: {
    margin: 16,
    borderRadius: 8,
  },
  signOutButtonContent: {
    paddingVertical: 8,
  },
  signInContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  signInCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  signInImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  signInTitle: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  signInSubtitle: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  signInButton: {
    width: "100%",
    borderRadius: 8,
  },
  signInButtonContent: {
    paddingVertical: 8,
  },
});
