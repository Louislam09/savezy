import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useDatabase } from "../../lib/DatabaseContext";

export default function ProfileScreen() {
  const { items } = useDatabase();

  // Calculate statistics
  const totalItems = items.length;
  const itemsByType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="bar-chart-2" size={64} color="#007AFF" />
        <Text style={styles.title}>Savezy Stats</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>

        {Object.entries(itemsByType).map(([type, count]) => (
          <View key={type} style={styles.statCard}>
            <Text style={styles.statValue}>{count}</Text>
            <Text style={styles.statLabel}>{type}s</Text>
          </View>
        ))}
      </View>

      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTitle}>About Savezy</Text>
        <Text style={styles.aboutText}>
          Savezy helps you save and organize interesting content you find
          online. Save videos, memes, news articles, websites, and images all in
          one place.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
  },
  aboutContainer: {
    backgroundColor: "#f5f5f5",
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
    color: "#666",
    lineHeight: 24,
  },
});
