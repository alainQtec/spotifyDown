import React, {useEffect, useState} from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import Library from '../components/Library';

import SavedPlaylists from '../components/SavedPlaylists';
import {IronSourceBanner} from '@wowmaking/react-native-iron-source';
import {useIsFocused} from '@react-navigation/core';
import DownloadStack from './DownloadStack';
import {Text, View} from 'react-native';
// import Donations from '../components/Donation';

const Stack = createStackNavigator();

const LibraryStack = () => {
  const [height, setHeight] = useState(0);
  const [isShowing, setIsShowing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    console.log('hello');
    IronSourceBanner.loadBanner('BANNER', {
      position: 'top',
      scaleToFitWidth: true,
    })
      .then((response) => {
        console.log(`width: ${response.width}, height: ${response.height}`);
        setHeight(response.height);
      })
      .catch((err) => {
        console.log(err.message);
      });

    IronSourceBanner.addEventListener('ironSourceBannerDidLoad', () => {
      // console.log('Iron Source banner loaded');
      if (isFocused) {
        IronSourceBanner.showBanner();
        setIsShowing(true);
      } else {
        // console.log('else hide');
        IronSourceBanner.hideBanner();
        setIsShowing(false);
      }
    });

    IronSourceBanner.addEventListener('ironSourceDidClickBanner', () => {
      // console.log('Banner clicked');
    });

    if (!isFocused) IronSourceBanner.hideBanner();

    return () => {
      // console.log('unmount hide');

      IronSourceBanner.hideBanner();
      setIsShowing(false);
    };
  }, [isFocused]);
  return (
    <>
      {isShowing ? (
        <View style={{height: height}}>
          <Text style={{alignSelf: 'center', color: 'gray'}}>Banner Ad</Text>
        </View>
      ) : null}

      <Stack.Navigator
        initialRouteName="Library"
        // headerMode={'none'}
        screenOptions={{
          cardOverlayEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}>
        <Stack.Screen
          component={Library}
          name="Library"
          options={{headerShown: false}}
        />
        <Stack.Screen
          component={SavedPlaylists}
          name="SavedPlaylists"
          options={{
            headerTitle: 'Saved Playlists',
            headerStyle: {backgroundColor: '#181818', elevation: 0},
            headerTintColor: 'white',
            headerTitleStyle: {color: 'white', fontFamily: 'OpenSans-SemiBold'},
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          component={DownloadStack}
          name="Downloads"
          options={{headerShown: false}}
        />
        {/* <Stack.Screen
        component={Donations}
        name="Donations"
        options={{headerShown: false}}
      /> */}
      </Stack.Navigator>
    </>
  );
};

export default LibraryStack;
