import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useDatabase } from "../../lib/DatabaseContext";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";

export default function ProfileScreen() {
  const { items } = useDatabase();
  const { t } = useLanguage();
  const { colors } = useTheme();

  // Calculate statistics
  const totalItems = items.length;
  const itemsByType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Feather name="bar-chart-2" size={64} color={colors.accent} />
        <Text style={[styles.title, { color: colors.text }]}>
          {t("profile.stats")}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {totalItems}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t("profile.totalItems")}
          </Text>
        </View>

        {Object.entries(itemsByType).map(([type, count]) => (
          <View
            key={type}
            style={[styles.statCard, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {count}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t(("contentTypes." + type.toLowerCase()) as any)}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.aboutContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.aboutTitle, { color: colors.text }]}>
          {t("profile.aboutTitle")}
        </Text>
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          {t("profile.aboutText")}
        </Text>
      </View>
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
