import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.replace("/login");
    }
  }, [isSignedIn, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
