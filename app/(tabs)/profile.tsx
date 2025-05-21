import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useDatabase } from "../../lib/DatabaseContext";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";

export default function ProfileScreen() {
  const { items } = useDatabase();
  const { t } = useLanguage();
  const { colors } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardAnimations = useRef(items.map(() => new Animated.Value(0))).current;

  // Calculate statistics
  const totalItems = items.length;
  const itemsByType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    // Header icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in and scale up animation for the main content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered animation for stat cards
    Animated.stagger(
      100,
      cardAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Feather name="bar-chart-2" size={64} color={colors.accent} />
        </Animated.View>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("profile.stats")}
        </Text>
      </Animated.View>

      <View style={styles.statsContainer}>
        <Animated.View
          style={[
            styles.statCard,
            { backgroundColor: colors.card },
            {
              opacity: cardAnimations[0],
              transform: [
                {
                  translateY: cardAnimations[0].interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {totalItems}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t("profile.totalItems")}
          </Text>
        </Animated.View>

        {Object.entries(itemsByType).map(([type, count], index) => (
          <Animated.View
            key={type}
            style={[
              styles.statCard,
              { backgroundColor: colors.card },
              {
                opacity: cardAnimations[index + 1],
                transform: [
                  {
                    translateY: cardAnimations[index + 1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {count}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t(("contentTypes." + type.toLowerCase()) as any)}
            </Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.aboutContainer,
          { backgroundColor: colors.card },
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.aboutTitle, { color: colors.text }]}>
          {t("profile.aboutTitle")}
        </Text>
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          {t("profile.aboutText")}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
  },
  aboutContainer: {
    borderRadius: 12,
    padding: 16,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
