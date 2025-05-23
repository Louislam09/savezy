import * as Updates from "expo-updates";
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
      // Automatically reload the app when update is ready
      await Updates.reloadAsync();
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
