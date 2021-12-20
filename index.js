import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {AppRegistry, SafeAreaView, useColorScheme} from 'react-native';
import {
  Colors,
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import {Provider as ReduxProvider} from 'react-redux';
import {name as appName} from './app.json';
import App from './src/App';
import {initializeKeys} from './src/logic/signal';
import store from './src/redux/store';

const Main = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const paperTheme = isDarkMode
    ? {
        ...PaperDarkTheme,
        colors: {
          ...PaperDarkTheme.colors,
          primary: Colors.green800,
          accent: Colors.blueGrey800,
        },
      }
    : {
        ...PaperDefaultTheme,
        colors: {
          ...PaperDefaultTheme.colors,
          primary: Colors.lightGreen200,
          accent: Colors.blueGrey200,
        },
      };
  const navigationTheme = isDarkMode
    ? NavigationDarkTheme
    : NavigationDefaultTheme;

  useEffect(() => {
    initializeKeys();
  }, []);

  const backgroundStyle = {
    flex: 1,
  };

  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaView style={backgroundStyle}>
          <NavigationContainer theme={navigationTheme}>
            <App />
          </NavigationContainer>
        </SafeAreaView>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default Main;

AppRegistry.registerComponent(appName, () => Main);
