import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, SegmentedButtons, useTheme, Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ContentType } from '@/utils/pb';
import { useContent } from '@/hooks/useContent';
import { useAuth } from '@/contexts/AuthContext';
import VideoForm from '@/components/forms/VideoForm';
import MemeForm from '@/components/forms/MemeForm';
import NewsForm from '@/components/forms/NewsForm';
import WebsiteForm from '@/components/forms/WebsiteForm';
import ImageForm from '@/components/forms/ImageForm';

export default function SaveScreen() {
  const [contentType, setContentType] = useState<ContentType>(ContentType.VIDEO);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { addContent, isLoading } = useContent();
  const { isSignedIn, signIn } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const handleFormSubmit = async (data: any, file?: File) => {
    try {
      await addContent(contentType, data, file);
      setSuccessMessage(`Your ${contentType} has been saved successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const renderForm = () => {
    if (!isSignedIn) {
      return (
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>
            Please sign in to save content
          </Text>
          <Button
            mode="contained"
            onPress={signIn}
            style={styles.signInButton}>
            Sign in with Google
          </Button>
        </View>
      );
    }

    switch (contentType) {
      case ContentType.VIDEO:
        return <VideoForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
      case ContentType.MEME:
        return <MemeForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
      case ContentType.NEWS:
        return <NewsForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
      case ContentType.WEBSITE:
        return <WebsiteForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
      case ContentType.IMAGE:
        return <ImageForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Save New Item" />
      </Appbar.Header>

      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={contentType}
          onValueChange={(value) => {
            setContentType(value as ContentType);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
          buttons={[
            { value: ContentType.VIDEO, label: 'Video' },
            { value: ContentType.MEME, label: 'Meme' },
            { value: ContentType.NEWS, label: 'News' },
            { value: ContentType.WEBSITE, label: 'Website' },
            { value: ContentType.IMAGE, label: 'Image' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {successMessage && (
        <View
          style={[
            styles.successMessage,
            { backgroundColor: theme.colors.secondaryContainer },
          ]}>
          <Text
            style={[styles.successText, { color: theme.colors.onSecondaryContainer }]}>
            {successMessage}
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled">
        {renderForm()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    padding: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  formContainer: {
    flexGrow: 1,
  },
  successMessage: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInText: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  signInButton: {
    minWidth: 200,
  },
});