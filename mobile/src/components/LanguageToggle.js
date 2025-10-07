import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Divider } from 'react-native-paper';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { 
    currentLanguage, 
    changeLanguage, 
    t, 
    isRTL,
    availableLanguages,
    getLanguageName 
  } = useLanguage();
  
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleLanguageChange = (language) => {
    changeLanguage(language);
    closeMenu();
  };

  return (
    <View style={[styles.container, isRTL && styles.rtlContainer]}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            icon="translate"
            compact
            style={[styles.button, isRTL && styles.rtlButton]}
            contentStyle={isRTL && styles.rtlButtonContent}
          >
            {getLanguageName(currentLanguage)}
          </Button>
        }
        contentStyle={styles.menuContent}
      >
        {availableLanguages.map((language) => (
          <Menu.Item
            key={language}
            onPress={() => handleLanguageChange(language)}
            title={getLanguageName(language)}
            style={[
              styles.menuItem,
              currentLanguage === language && styles.selectedMenuItem
            ]}
            titleStyle={[
              styles.menuItemText,
              isRTL && styles.rtlMenuItemText,
              currentLanguage === language && styles.selectedMenuItemText
            ]}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  rtlContainer: {
    alignItems: 'flex-start',
  },
  button: {
    minWidth: 100,
  },
  rtlButton: {
    flexDirection: 'row-reverse',
  },
  rtlButtonContent: {
    flexDirection: 'row-reverse',
  },
  menuContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedMenuItem: {
    backgroundColor: '#E8F5E8',
  },
  menuItemText: {
    fontSize: 16,
  },
  rtlMenuItemText: {
    textAlign: 'right',
  },
  selectedMenuItemText: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

