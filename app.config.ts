import { ConfigContext, ExpoConfig } from "@expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.louislam09.savezy.dev";
  }

  if (IS_PREVIEW) {
    return "com.louislam09.savezy.preview";
  }

  return "com.louislam09.savezy";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Savezy (Dev)";
  }

  if (IS_PREVIEW) {
    return "Savezy (Preview)";
  }

  return "Savezy";
};

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: getAppName(),
    slug: "savezy",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "savezy",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#000000",
      },
      package: getUniqueIdentifier(),
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-web-browser",
        {
          experimentalLauncherActivity: true,
        },
      ],
      [
        "expo-updates",
        {
          username: "louislam09",
        },
      ],
      "expo-sqlite",
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "9887a037-24f9-41bf-b03f-fc11c3f663f9",
      },
    },
    updates: {
      url: "https://u.expo.dev/9887a037-24f9-41bf-b03f-fc11c3f663f9",
    },
    owner: "louislam09",
    runtimeVersion: {
      policy: "nativeVersion",
    },
  };
};
