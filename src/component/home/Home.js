import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

const HomeScreen = ({ navigation }) => {

  return (
    <ScrollView style={styles.homeScreen}>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  homeScreen: {
    marginTop: 4,
  },
});
