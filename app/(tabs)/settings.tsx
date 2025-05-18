import { Feather } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
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

const MAIN_COLOR_OPTIONS = [
  { name: "Pink", value: "#F87171" },
  { name: "Blue", value: "#60A5FA" },
  { name: "Yellow", value: "#FBBF24" },
  { name: "Purple", value: "#A78BFA" },
];

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme, mainColor, setMainColor } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [colorModalVisible, setColorModalVisible] = useState(false);

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

  const handleMainColorChange = useCallback(() => {
    setColorModalVisible(true);
  }, []);

  const handleSelectColor = (color: string) => {
    setMainColor(color);
    setColorModalVisible(false);
  };

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
          <SettingItem
            icon="droplet"
            label={t("settings.mainColor")}
            value={
              MAIN_COLOR_OPTIONS.find((option) => option.value === mainColor)
                ?.name || ""
            }
            onPress={handleMainColorChange}
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

      {/* Main Color Modal */}
      <Modal
        visible={colorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setColorModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
              minWidth: 280,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              {t("settings.selectMainColor")}
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 24 }}>
              {MAIN_COLOR_OPTIONS.map((option, idx) => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: option.value,
                    borderWidth: mainColor === option.value ? 3 : 1,
                    borderColor:
                      mainColor === option.value
                        ? colors.text
                        : colors.cardBorder,
                    marginRight: idx !== MAIN_COLOR_OPTIONS.length - 1 ? 16 : 0,
                  }}
                  onPress={() => handleSelectColor(option.value)}
                />
              ))}
            </View>
            <TouchableOpacity onPress={() => setColorModalVisible(false)}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                {t("actions.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
