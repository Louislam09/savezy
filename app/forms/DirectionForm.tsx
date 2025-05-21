import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useDatabase } from "../../lib/DatabaseContext";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";
import { ContentItem, ContentType } from "../../lib/database";

interface DirectionFormProps {
  item?: ContentItem;
  onCancel?: () => void;
}

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        const map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        let marker = null;
        let circle = null;

        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            if (marker) {
                map.removeLayer(marker);
                map.removeLayer(circle);
            }

            marker = L.marker(e.latlng).addTo(map);
            circle = L.circle(e.latlng, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.1,
                radius: 500
            }).addTo(map);

            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'location',
                latitude: lat,
                longitude: lng
            }));
        });

        // Initial location if provided
        if (window.initialLocation) {
            const { lat, lng } = window.initialLocation;
            map.setView([lat, lng], 13);
            marker = L.marker([lat, lng]).addTo(map);
            circle = L.circle([lat, lng], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.1,
                radius: 500
            }).addTo(map);
        }
    </script>
</body>
</html>
`;

export default function DirectionForm({ item, onCancel }: DirectionFormProps) {
  const router = useRouter();
  const { saveItem, updateItem } = useDatabase();
  const { t } = useLanguage();
  const { colors, mainColor } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [directions, setDirections] = useState(item?.directions || "");
  const [latitude, setLatitude] = useState(item?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(item?.longitude?.toString() || "");
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "location") {
        const lat = data.latitude.toString();
        const lng = data.longitude.toString();
        setLatitude(lat);
        setLongitude(lng);

        // Automatically fill directions with coordinates
        const directionsText = `Location: ${lat}, ${lng}\n\n${
          directions || ""
        }`;
        setDirections(directionsText);

        setShowMap(false);
      }
    } catch (err) {
      console.error("Failed to parse map message:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!title) {
        setError(t("errors.titleRequired" as any));
        return;
      }

      if (!directions) {
        setError(t("errors.directionsRequired" as any));
        return;
      }

      // Validate coordinates if provided
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (latitude && (isNaN(lat) || lat < -90 || lat > 90)) {
        setError(t("errors.invalidLatitude" as any));
        return;
      }
      if (longitude && (isNaN(lng) || lng < -180 || lng > 180)) {
        setError(t("errors.invalidLongitude" as any));
        return;
      }

      // Create or update the content item
      const content: ContentItem = {
        type: ContentType.DIRECTION,
        title,
        description: description || undefined,
        directions,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      };

      if (item?.id) {
        await updateItem(item.id, content);
      } else {
        await saveItem(content);
      }

      if (onCancel) {
        onCancel();
      } else {
        router.back();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.failedToSave" as any)
      );
    } finally {
      setLoading(false);
    }
  };

  if (showMap) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => setShowMap(false)}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("common.selectLocation" as any)}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <WebView
          ref={webViewRef}
          source={{ html: MAP_HTML }}
          onMessage={handleMapMessage}
          injectedJavaScript={
            latitude && longitude
              ? `
            window.initialLocation = { lat: ${latitude}, lng: ${longitude} };
            true;
          `
              : "true;"
          }
          style={styles.map}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={onCancel || (() => router.back())}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {item ? t("actions.edit") : t("actions.add")}{" "}
            {t("contentTypes.direction" as any)}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={
              loading
                ? [
                    styles.submitButtonDisabled,
                    { backgroundColor: colors.cardBorder },
                  ]
                : [styles.submitButton, { backgroundColor: mainColor }]
            }
          >
            <Text style={styles.submitButtonText}>
              {item ? t("actions.update") : t("actions.save")}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("common.title") + " *"}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.searchBackground,
                  color: colors.text,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder={t("common.title")}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("common.description")}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.searchBackground,
                  color: colors.text,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder={t("common.description")}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("common.directions" as any) + " *"}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.searchBackground,
                  color: colors.text,
                },
              ]}
              value={directions}
              onChangeText={setDirections}
              placeholder={t("common.directions" as any)}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("common.location" as any)}
            </Text>
            <View style={styles.locationContainer}>
              <View style={styles.coordinatesContainer}>
                <View style={styles.coordinateInput}>
                  <Text
                    style={[styles.coordinateLabel, { color: colors.text }]}
                  >
                    {t("common.latitude" as any)}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.searchBackground,
                        color: colors.text,
                      },
                    ]}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="0.000000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    editable={false}
                  />
                </View>
                <View style={styles.coordinateInput}>
                  <Text
                    style={[styles.coordinateLabel, { color: colors.text }]}
                  >
                    {t("common.longitude" as any)}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.searchBackground,
                        color: colors.text,
                      },
                    ]}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="0.000000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    editable={false}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: mainColor }]}
                onPress={() => setShowMap(true)}
              >
                <Feather name="map-pin" size={20} color="#fff" />
                <Text style={styles.locationButtonText}>
                  {latitude && longitude
                    ? t("actions.changeLocation")
                    : t("common.selectLocation")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  locationContainer: {
    gap: 12,
  },
  coordinatesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FFE5E5",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
