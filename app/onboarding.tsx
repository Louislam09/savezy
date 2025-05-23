import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  BounceIn,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "../lib/LanguageContext";
import { useTheme } from "../lib/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ColorOption = {
  value: string;
  name: string;
};

const OnboardingScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    isDark,
    toggleTheme,
    mainColor,
    setMainColor,
    colors,
    completeOnboarding,
  } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedColor, setSelectedColor] = useState(mainColor);
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);

  const colorOptions: ColorOption[] = [
    { value: "#007AFF", name: "Blue" },
    { value: "#FF2D55", name: "Pink" },
    { value: "#5856D6", name: "Purple" },
    { value: "#FF9500", name: "Orange" },
    { value: "#34C759", name: "Green" },
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ] as const;

  React.useEffect(() => {
    progress.value = withSpring(currentStep / 3);
  }, [currentStep]);

  const renderProgressDots = () => {
    return (
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.progressDots}
      >
        {[0, 1, 2, 3].map((step) => (
          <Animated.View
            key={step}
            entering={FadeIn.delay(step * 100)}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  step === currentStep ? mainColor : colors.cardBorder,
                width: step === currentStep ? 20 : 8,
              },
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.stepContainer}
          >
            <Animated.View
              entering={ZoomIn.delay(300).springify()}
              style={styles.logoContainer}
            >
              <Image
                source={require("../assets/images/icon.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <Animated.Text
                entering={FadeInUp.delay(500).springify()}
                style={[styles.appName, { color: colors.text }]}
              >
                Savezy
              </Animated.Text>
            </Animated.View>
            <Animated.Text
              entering={FadeInUp.delay(700).springify()}
              style={[styles.title, { color: colors.text }]}
            >
              {t("onboarding.welcome")}
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(900).springify()}
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {t("onboarding.welcomeDescription")}
            </Animated.Text>
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View
            entering={SlideInRight.springify()}
            exiting={SlideOutLeft}
            style={styles.stepContainer}
          >
            <Animated.Text
              entering={FadeInDown.delay(200).springify()}
              style={[styles.title, { color: colors.text }]}
            >
              {t("onboarding.colorTitle")}
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(400).springify()}
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {t("settings.mainColorDescription")}
            </Animated.Text>
            <Animated.View
              entering={FadeInUp.delay(600).springify()}
              style={styles.colorGrid}
            >
              {colorOptions.map((color, index) => (
                <Animated.View
                  key={color.value}
                  entering={ZoomIn.delay(800 + index * 100).springify()}
                >
                  <Pressable
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.value },
                      selectedColor === color.value && styles.selectedColor,
                    ]}
                    onPress={() => {
                      setSelectedColor(color.value);
                      setMainColor(color.value);
                      scale.value = withSpring(1.1, {}, () => {
                        scale.value = withSpring(1);
                      });
                    }}
                  >
                    {selectedColor === color.value && (
                      <Animated.View entering={BounceIn.delay(200)}>
                        <Ionicons name="checkmark" size={24} color="white" />
                      </Animated.View>
                    )}
                  </Pressable>
                </Animated.View>
              ))}
            </Animated.View>
            <View style={styles.colorNames}>
              {colorOptions.map((color) => (
                <Text
                  key={color.value}
                  style={[
                    styles.colorName,
                    { color: colors.textSecondary },
                    selectedColor === color.value && { color: colors.text },
                  ]}
                >
                  {color.name}
                </Text>
              ))}
            </View>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View
            entering={SlideInRight.springify()}
            exiting={SlideOutLeft}
            style={styles.stepContainer}
          >
            <Animated.Text
              entering={FadeInDown.delay(200).springify()}
              style={[styles.title, { color: colors.text }]}
            >
              {t("onboarding.languageTitle")}
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(400).springify()}
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {t("settings.languageDescription")}
            </Animated.Text>
            <Animated.View
              entering={FadeInUp.delay(600).springify()}
              style={styles.optionsContainer}
            >
              {languages.map((lang, index) => (
                <Animated.View
                  key={lang.code}
                  entering={SlideInRight.delay(800 + index * 200).springify()}
                >
                  <Pressable
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
                    onPress={() => setLanguage(lang.code)}
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
                  </Pressable>
                </Animated.View>
              ))}
            </Animated.View>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View
            entering={SlideInRight.springify()}
            exiting={SlideOutLeft}
            style={styles.stepContainer}
          >
            <Animated.Text
              entering={FadeInDown.delay(200).springify()}
              style={[styles.title, { color: colors.text }]}
            >
              {t("onboarding.themeTitle")}
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(400).springify()}
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {t("settings.themeDescription")}
            </Animated.Text>
            <Animated.View entering={ZoomIn.delay(600).springify()}>
              <Pressable
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                  isDark && {
                    backgroundColor: mainColor + "20",
                    borderColor: mainColor,
                  },
                ]}
                onPress={toggleTheme}
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={24}
                  color={isDark ? mainColor : colors.text}
                />
                <Text
                  style={[
                    styles.themeText,
                    { color: colors.text },
                    isDark && { color: mainColor },
                  ]}
                >
                  {isDark ? t("common.on") : t("common.off")}
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
      router.replace("/(tabs)");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {renderProgressDots()}
      {renderStep()}
      <Animated.View
        entering={FadeInUp.delay(1000).springify()}
        style={[styles.navigation, { borderTopColor: colors.cardBorder }]}
      >
        {currentStep > 0 && (
          <Pressable
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        )}
        <Pressable
          style={[styles.nextButton, { backgroundColor: mainColor }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 3
              ? t("actions.save")
              : currentStep === 0
              ? t("onboarding.getStarted")
              : t("onboarding.next")}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
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
    width: SCREEN_WIDTH - 40,
  },
  colorName: {
    fontSize: 14,
    width: 60,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    gap: 16,
    paddingHorizontal: 20,
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
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
    maxWidth: 300,
    justifyContent: "center",
    gap: 12,
  },
  themeText: {
    fontSize: 18,
    fontWeight: "600",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OnboardingScreen;
