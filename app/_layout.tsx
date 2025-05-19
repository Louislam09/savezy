import { ThemeProvider } from "@/lib/ThemeContext";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ToastManager from "toastify-react-native";
import { initDatabase } from "../lib/database";
import { DatabaseProvider } from "../lib/DatabaseContext";
import { LanguageProvider } from "../lib/LanguageContext";

// Custom toast configuration
const toastConfig = {
  success: (props: any) => (
    <View style={[styles.toast, { backgroundColor: "#4CAF50" }]}>
      <Text style={styles.toastText}>{props.text1}</Text>
      {props.text2 && <Text style={styles.toastSubText}>{props.text2}</Text>}
    </View>
  ),
  error: (props: any) => (
    <View style={[styles.toast, { backgroundColor: "#FF5252" }]}>
      <Text style={styles.toastText}>{props.text1}</Text>
      {props.text2 && <Text style={styles.toastSubText}>{props.text2}</Text>}
    </View>
  ),
  info: (props: any) => (
    <View style={[styles.toast, { backgroundColor: "#2196F3" }]}>
      <View style={styles.undoContent}>
        <View style={styles.undoTextContainer}>
          <Text style={styles.toastText}>{props.text1}</Text>
        </View>
        <TouchableOpacity style={styles.undoButton} onPress={props.onPress}>
          <Text style={styles.undoButtonText}>{props.text2}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ),
  loading: (props: any) => (
    <View style={[styles.toast, { backgroundColor: "#2196F3" }]}>
      <View style={styles.loadingContent}>
        <ActivityIndicator color="white" size="small" />
        <Text style={[styles.toastText, styles.loadingText]}>
          {props.text1}
        </Text>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    padding: 16,
    borderRadius: 10,
    width: "90%",
    marginHorizontal: 20,
  },
  toastText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  toastSubText: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
  },
  undoContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  undoTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  undoButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  undoButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    marginLeft: 4,
  },
});

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <SQLiteProvider databaseName="savezy.db" onInit={initDatabase}>
          <DatabaseProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="forms"
                options={{
                  headerShown: false,
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
            <ToastManager config={toastConfig} />
          </DatabaseProvider>
        </SQLiteProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
