import { Feather, Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ColorOption = {
  value: string;
  name: string;
};

const MAIN_COLOR_OPTIONS: ColorOption[] = [
  { value: "#007AFF", name: "Blue" },
  { value: "#FF2D55", name: "Pink" },
  { value: "#5856D6", name: "Purple" },
  { value: "#FF9500", name: "Orange" },
  { value: "#34C759", name: "Green" },
];

const LANGUAGES = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
  },
] as const;

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
  const { colors, isDark, toggleTheme, mainColor, setMainColor } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLanguageChange = useCallback(() => {
    setLanguageModalVisible(true);
  }, []);

  const handleSelectLanguage = (langCode: "en" | "es") => {
    setLanguage(langCode);
    // setLanguageModalVisible(false);
  };

  const handleMainColorChange = useCallback(() => {
    setColorModalVisible(true);
  }, []);

  const handleSelectColor = (color: string) => {
    setMainColor(color);
    // setColorModalVisible(false);
  };

  const renderColorModal = () => (
    <Modal
      visible={colorModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setColorModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t("settings.selectMainColor")}
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            {t("settings.mainColorDescription")}
          </Text>
          <View style={styles.colorGrid}>
            {MAIN_COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color.value}
                style={[
                  styles.colorOption,
                  { backgroundColor: color.value },
                  mainColor === color.value && styles.selectedColor,
                ]}
                onPress={() => handleSelectColor(color.value)}
              >
                {mainColor === color.value && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.colorNames}>
            {MAIN_COLOR_OPTIONS.map((color) => (
              <Text
                key={color.value}
                style={[
                  styles.colorName,
                  { color: colors.textSecondary },
                  mainColor === color.value && { color: colors.text },
                ]}
              >
                {color.name}
              </Text>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.cardBorder }]}
            onPress={() => setColorModalVisible(false)}
          >
            <Text style={[styles.modalButtonText, { color: colors.text }]}>
              {t("actions.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderLanguageModal = () => (
    <Modal
      visible={languageModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t("settings.selectLanguage")}
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            {t("settings.languageDescription")}
          </Text>
          <View style={styles.optionsContainer}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                  language === lang.code && {
                    backgroundColor: mainColor + "20",
                    borderColor: mainColor,
                  },
                ]}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    { color: colors.text },
                    language === lang.code && { color: mainColor },
                  ]}
                >
                  {t(`languages.${lang.code}`)}
                </Text>
                {language === lang.code && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={mainColor}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.cardBorder }]}
            onPress={() => setLanguageModalVisible(false)}
          >
            <Text style={[styles.modalButtonText, { color: colors.text }]}>
              {t("actions.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const openAppInStore = async (appPackage: string) => {
    await Linking.openURL(appPackage);
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
            value={LANGUAGES.find((lang) => lang.code === language)?.name}
            onPress={handleLanguageChange}
          />
          <SettingItem
            icon="moon"
            label={t("settings.darkMode")}
            onPress={toggleTheme}
            showArrow={false}
            value={isDark ? t("common.on") : t("common.off")}
          />
          {/* <SettingItem
            icon="bell"
            label={t("settings.notifications")}
            onPress={() => {}}
          /> */}
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
            onPress={() =>
              openAppInStore("market://search?q=pub:Luis_Martinez")
            }
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

      {renderColorModal()}
      {renderLanguageModal()}
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#000",
    transform: [{ scale: 1.1 }],
  },
  colorNames: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 20,
    width: SCREEN_WIDTH - 80,
    marginBottom: 24,
  },
  colorName: {
    fontSize: 14,
    width: 60,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 24,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
