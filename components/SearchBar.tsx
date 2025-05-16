import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <Searchbar
      placeholder="Search your saved content"
      onChangeText={setSearchQuery}
      value={searchQuery}
      onSubmitEditing={handleSearch}
      onClear={handleClear}
      style={[styles.searchBar, { backgroundColor: theme.colors.elevation.level1 }]}
      placeholderTextColor={theme.colors.outline}
      iconColor={theme.colors.primary}
      inputStyle={{ color: theme.colors.onSurface }}
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 1,
    borderRadius: 8,
  },
});