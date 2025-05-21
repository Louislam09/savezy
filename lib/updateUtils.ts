import * as Updates from "expo-updates";
import { Alert } from "react-native";
import { Toast } from "toastify-react-native";

export async function checkForUpdates() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking for updates:", error);
    return false;
  }
}

export async function fetchUpdate() {
  try {
    const update = await Updates.fetchUpdateAsync();
    if (update.isNew) {
      // Notify user that update is ready to be installed
      Alert.alert(
        "Update Available",
        "A new version is ready to install. Would you like to restart now?",
        [
          {
            text: "Later",
            style: "cancel",
          },
          {
            text: "Restart",
            onPress: async () => {
              await Updates.reloadAsync();
            },
          },
        ]
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error fetching update:", error);
    Toast.error("Failed to fetch update");
    return false;
  }
}

export async function checkAndFetchUpdate() {
  const hasUpdate = await checkForUpdates();
  if (hasUpdate) {
    Toast.info("Update available");
    return await fetchUpdate();
  }
  return false;
}
