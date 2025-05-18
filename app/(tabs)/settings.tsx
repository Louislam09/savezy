import { Feather } from "@expo/vector-icons";
import { useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";

type SettingItemProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  showArrow?: boolean;
};

const SettingItem = ({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
}: SettingItemProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.cardBorder }]}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <Feather
          name={icon}
          size={22}
          color={colors.text}
          style={styles.settingIcon}
        />
        <Text style={[styles.settingLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingItemRight}>
        {value && (
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {value}
          </Text>
        )}
        {showArrow && (
          <Feather
            name="chevron-right"
            size={22}
            color={colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = useCallback(() => {
    Alert.alert(
      t("settings.selectLanguage"),
      "",
      [
        {
          text: t("languages.en"),
          onPress: () => setLanguage("en"),
        },
        {
          text: t("languages.es"),
          onPress: () => setLanguage("es"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  }, [setLanguage, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("settings.title")}
      </Text>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <SettingItem
            icon="globe"
            label={t("settings.language")}
            value={t(`languages.${language}`)}
            onPress={handleLanguageChange}
          />
          <SettingItem
            icon="moon"
            label={t("settings.darkMode")}
            onPress={toggleTheme}
            showArrow={false}
            value={isDark ? t("common.on") : t("common.off")}
          />
          <SettingItem
            icon="bell"
            label={t("settings.notifications")}
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon="info"
            label={t("settings.about")}
            onPress={() => {}}
          />
          <SettingItem
            icon="tag"
            label={t("settings.version")}
            value="1.0.0"
            onPress={() => {}}
            showArrow={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: "400",
  },
  settingItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 17,
  },
});
