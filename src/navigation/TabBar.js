import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Vibration,
  ToastAndroid,
  Dimensions,
} from 'react-native';
import {windowHeight} from '../common';
import MiniPlayer from '../components/MiniPlayer';

const TabBar = ({state, descriptors, navigation}) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  const renderSwitch = (name, label, isFocused) => {
    switch (name) {
      case 'Home':
        return (
          <View>
            {isFocused ? (
              <Image
                style={styles.icons}
                source={require('../assets/homeFill.png')}
              />
            ) : (
              <Image
                style={styles.icons}
                source={require('../assets/home.png')}
              />
            )}
          </View>
        );
      case 'NewStack':
        return (
          <View>
            {isFocused ? (
              <Image
                style={styles.icons}
                source={require('../assets/plusFill.png')}
              />
            ) : (
              <Image
                style={styles.icons}
                source={require('../assets/plus.png')}
              />
            )}
          </View>
        );
      case 'LibraryStack':
        return (
          <View>
            {isFocused ? (
              <Image
                style={styles.icons}
                source={require('../assets/squareFIll.png')}
              />
            ) : (
              <Image
                style={styles.icons}
                source={require('../assets/square.png')}
              />
            )}
          </View>
        );
      default:
        return (
          <Text style={{color: isFocused ? '#673ab7' : 'white'}}>{label}</Text>
        );
    }
  };
  return (
    <>
      {/* <MiniPlayer /> */}

      <View style={styles.mainView}>
        <MiniPlayer />
        {state.routes.map((route, index) => {
          if (
            route.name !== 'Home' &&
            route.name !== 'NewStack' &&
            route.name !== 'LibraryStack'
          ) {
            return;
          }

          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            //console.log(screen)
            Vibration.vibrate(200);
            ToastAndroid.show(`${route.name}`, ToastAndroid.SHORT);
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.touchOpacity}
              key={index}>
              {renderSwitch(route.name, label, isFocused)}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#212326',
    flexDirection: 'row',
    height: windowHeight * 0.05,
    paddingVertical: windowHeight * 0.005,
    alignItems: 'center',
  },
  touchOpacity: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icons: {
    height: 25,
    width: 25,
  },
  iconsFocused: {
    height: 25,
    width: 25,
  },
});
