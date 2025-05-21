import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useDatabase } from "../../lib/DatabaseContext";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";

export default function ProfileScreen() {
  const { items } = useDatabase();
  const { t } = useLanguage();
  const { colors } = useTheme();

  // Stats
  const totalItems = items.length;
  const itemsByType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Create a fixed number of animations (we'll use max 10 to be safe)
  const MAX_ANIMATIONS = 10;
  const cardAnimations = Array.from({ length: MAX_ANIMATIONS }, () =>
    useSharedValue(0)
  );

  // Shared values
  const fade = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const pulse = useSharedValue(1);

  // Animate on mount
  useEffect(() => {
    // Reset all animations
    cardAnimations.forEach((anim) => {
      anim.value = 0;
    });

    // Pulse loop
    pulse.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true // reverse
    );

    fade.value = withTiming(1, { duration: 800 });
    scale.value = withTiming(1, { duration: 800 });

    // Animate cards with a small delay
    cardAnimations.forEach((anim, index) => {
      setTimeout(() => {
        anim.value = withSpring(1, { damping: 8 });
      }, 200 + index * 100);
    });
  }, [items]); // Still keep items as dependency to reset animations when items change

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const aboutStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      {
        translateY: interpolate(fade.value, [0, 1], [30, 0], Extrapolate.CLAMP),
      },
    ],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Animated.View style={pulseStyle}>
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
            useAnimatedStyle(() => ({
              opacity: cardAnimations[0].value,
              transform: [
                {
                  translateY: interpolate(
                    cardAnimations[0].value,
                    [0, 1],
                    [50, 0],
                    Extrapolate.CLAMP
                  ),
                },
              ],
            })),
          ]}
        >
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {totalItems}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t("profile.totalItems")}
          </Text>
        </Animated.View>

        {Object.entries(itemsByType).map(([type, count], index) => {
          // Ensure we don't exceed our animation array bounds
          const animIndex = Math.min(index + 1, MAX_ANIMATIONS - 1);
          const animStyle = useAnimatedStyle(() => {
            const animValue = cardAnimations[animIndex]?.value ?? 0;
            return {
              opacity: animValue,
              transform: [
                {
                  translateY: interpolate(
                    animValue,
                    [0, 1],
                    [50, 0],
                    Extrapolate.CLAMP
                  ),
                },
              ],
            };
          });

          return (
            <Animated.View
              key={type}
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                animStyle,
              ]}
            >
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {count}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t(("contentTypes." + type.toLowerCase()) as any)}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      <Animated.View
        style={[
          styles.aboutContainer,
          { backgroundColor: colors.card },
          aboutStyle,
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
