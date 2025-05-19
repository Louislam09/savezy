import { ThemeProvider } from "@/lib/ThemeContext";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Text, View } from "react-native";
import ToastManager from "toastify-react-native";
import { initDatabase } from "../lib/database";
import { DatabaseProvider } from "../lib/DatabaseContext";
import { LanguageProvider } from "../lib/LanguageContext";

const toastConfig = {
  success: (props: any) => (
    <View
      style={{
        backgroundColor: "#4CAF50",
        padding: 16,
        borderRadius: 10,
        width: "90%",
        marginHorizontal: 20,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
        {props.text1}
      </Text>
      {props.text2 && (
        <Text style={{ color: "white", fontSize: 14, marginTop: 4 }}>
          {props.text2}
        </Text>
      )}
    </View>
  ),
  error: (props: any) => (
    <View
      style={{
        backgroundColor: "#FF5252",
        padding: 16,
        borderRadius: 10,
        width: "90%",
        marginHorizontal: 20,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
        {props.text1}
      </Text>
      {props.text2 && (
        <Text style={{ color: "white", fontSize: 14, marginTop: 4 }}>
          {props.text2}
        </Text>
      )}
    </View>
  ),
};

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
            <ToastManager />
            {/* <ToastManager
              config={toastConfig}
              position="top"
              // visibilityTime={1000}
              autoHide={true}
            /> */}
          </DatabaseProvider>
        </SQLiteProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
