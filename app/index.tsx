import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ContentType = {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  form: string;
};

const contentTypes: ContentType[] = [
  { id: "video", label: "Video", icon: "video", form: "/forms/VideoForm" },
  {
    id: "meme",
    label: "Meme",
    icon: "image",
    form: "/forms/ImageForm?type=Meme",
  },
  { id: "news", label: "News", icon: "file-text", form: "/forms/NewsForm" },
  {
    id: "website",
    label: "Website",
    icon: "globe",
    form: "/forms/WebsiteForm",
  },
  {
    id: "image",
    label: "Image",
    icon: "camera",
    form: "/forms/ImageForm?type=Image",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleAddNew = () => {
    setShowTypeSelector(true);
  };

  const handleSelectType = (form: string) => {
    setShowTypeSelector(false);
    router.push(form);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savezy</Text>
      <Text style={styles.subtitle}>
        Save interesting things you find online
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Feather name="plus-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Save New Item</Text>
      </TouchableOpacity>

      {showTypeSelector && (
        <BlurView intensity={90} style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What would you like to save?</Text>
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.typeButton}
                onPress={() => handleSelectType(type.form)}
              >
                <Feather name={type.icon} size={24} color="#007AFF" />
                <Text style={styles.typeButtonText}>{type.label}</Text>
                <Feather name="chevron-right" size={24} color="#8E8E93" />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTypeSelector(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  addButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
  },
  typeButtonText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 12,
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#FF3B30",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
