import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { DatabaseProvider } from "../lib/DatabaseContext";
import { initDatabase } from "../lib/database";

export default function RootLayout() {
  return (
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
      </DatabaseProvider>
    </SQLiteProvider>
  );
}
