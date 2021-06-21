import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../redux/actions/index';
import {useIsFocused} from '@react-navigation/native';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import RNBackgroundDownloader from 'react-native-background-downloader';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-spinkit';
import analytics from '@react-native-firebase/analytics';
import TextTicker from 'react-native-text-ticker';

import {API} from '@env';
import {windowWidth, windowHeight} from '../common';

const perm = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Required to download files',
        message: 'Needs to save the mp3 files',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      //console.log('You can use the Storage');
      return true;
    } else {
      //console.log('Storage permission denied');
      return false;
    }
  } catch (error) {
    //console.log(error);
    return false;
  }
};

const Playlist = ({navigation, route}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [responseData, setResponseData] = useState({});

  const [visible, setVisible] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [curentDownloading, setCurentDownloading] = useState(null);

  const isFocused = useIsFocused();
  const URlID = useSelector((state) => state.playlist);

  const dispatch = useDispatch();

  const checkExists = async (single) => {
    // const path = `${RNBackgroundDownloader.directories.documents}/${playlistData.playlistId}/${single.name}.mp3`;
    const path = `${RNBackgroundDownloader.directories.documents}/${single.title}.mp3`;
    const exists = await RNFetchBlob.fs.exists(path);

    //console.log(exists, path)
    if (exists) {
      const stats = await RNFetchBlob.fs.stat(path);

      if (stats.size === 0) return {...single};
      else return {...single, downloaded: true, path: path};
    } else {
      return {...single};
    }

    // console.log(exists)
  };

  const checkData = (data) => {
    return Promise.all(data.map((item) => checkExists(item)));
  };

  const fetchData = async () => {
    try {
      let api = `${API}/redirect?id=${URlID}`;
      const response = await fetch(api, {
        method: 'GET',
      });

      if (response.status === 200) {
        response
          .json()
          .then((res) => {
            setResponseData(res.responseInfo);
            checkData(res.tracks).then(async (data) => {
              // console.log(data)
              setTracks(data);
              setLoading(false);
              setError(false);
              await analytics().logEvent('playlist_view', {
                id: responseData.id,
                name: responseData.name,
                type: responseData.type,
              });
            });
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
            setError(true);
            //navigation.goBack();
            Alert.alert(
              'Server Error',
              'Server Error',
              [{text: 'OK', onPress: () => {}}],
              {cancelable: true},
            );
          });
      } else {
        setLoading(false);
        setError(true);
        navigation.navigate('Error', {error: error});
      }
    } catch (error) {
      setTimeout(() => {
        Alert.alert(
          'Please check if Internet is available',
          'Internet is required to fetch the tracks and other data. \nYou can listen to Downloaded Tracks while being OFFLINE',
          [
            {
              text: 'Open settings',
              onPress: () => {
                Linking.openURL('');
              },
            },
          ],
          {cancelable: true},
        );
        navigation.goBack();
      }, 2000);
    }
  };

  useEffect(() => {
    setLoading(true);

    fetchData();
  }, [isFocused]);

  const downloader = async (single) => {
    const api = `${API}/download?passedQuery=`;
    const req = perm();
    const fileStatus = await checkExists(single);
    if (req) {
      if (!fileStatus.path) {
        setVisible(true);
        setCurentDownloading(single.id);
        let artistsString = single.artist.map((item) => item.name).join();
        let passedQuery =
          single.title + ' ' + single.album + ' ' + artistsString;

        const response = await fetch(api + encodeURIComponent(passedQuery));

        response.json().then((res) => {
          //  console.log('link fetched ....');
          let link = res.url;
          let duration = res.duration;

          let promise = new Promise((resolve, reject) => {
            if (link) {
              let task = RNBackgroundDownloader.download({
                id: single.title,
                url: `${link}`,
                destination: `${RNBackgroundDownloader.directories.documents}/${single.title}.mp3`,
              })
                .begin((expectedBytes) => {
                  // console.log(`Going to download ${expectedBytes} bytes!`);
                  setVisible(true);
                  setDownloadPercent(0);
                })
                .progress((percent) => {
                  // console.log(`Downloaded: ${percent * 100}%`);
                  setDownloadPercent(percent);
                })
                .done(async () => {
                  //console.log('Download is done!');

                  const path = `${RNBackgroundDownloader.directories.documents}/${single.title}.mp3`;

                  setTracks((prev) => {
                    const nextState = prev.map((item) =>
                      item.id == single.id
                        ? {
                            ...item,
                            downloaded: true,
                            path: path,
                            duration: duration,
                          }
                        : item,
                    );

                    return nextState;
                  });

                  try {
                    const newDownload = {
                      id: single.id,
                      title: single.title,
                      artist: single.artist[0].name,
                      album: single.album,
                      artwork: single.artwork,
                      url: path,
                      duration: duration,
                    };
                    const storedValue = await AsyncStorage.getItem(
                      `@downloads`,
                    );
                    const prevList = await JSON.parse(storedValue);

                    if (!prevList) {
                      const newList = [newDownload];
                      await AsyncStorage.setItem(
                        `@downloads`,
                        JSON.stringify(newList),
                      );
                      //console.log(newDownload)
                      Snackbar.show({
                        text: 'First Track added to Downloads',
                        duration: Snackbar.LENGTH_SHORT,
                        backgroundColor: 'red',
                      });
                    } else {
                      prevList.push(newDownload);
                      await AsyncStorage.setItem(
                        `@downloads`,
                        JSON.stringify(prevList),
                      );
                      Snackbar.show({
                        text: 'Track added to Downloads',
                        duration: Snackbar.LENGTH_SHORT,
                        backgroundColor: 'red',
                      });
                    }
                  } catch (err) {
                    //console.log(err);
                  }

                  // dispatch(allActions.downloadOne(single, path));

                  setVisible(false);
                  resolve(path);
                  setDownloadPercent(1);
                  setCurentDownloading(null);
                })
                .error((error) => {
                  console.log('Download canceled due to error: ', error);
                  setDownloadPercent(0);
                  setVisible(false);
                  Snackbar.show({
                    text:
                      'Pardon!  Could not download this particular file due to Youtube policies',
                    duration: Snackbar.LENGTH_SHORT,
                    backgroundColor: 'red',
                  });
                  resolve('Failed');
                });
            } else {
              Snackbar.show({
                text: 'Server Error',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'red',
              });
            }
          });

          return promise;
        });
      }
    } else {
      Alert.alert(
        'Storage Permision Denied',
        'Unable to save',
        [{text: 'OK', onPress: () => {}}],
        {cancelable: false},
      );
    }
  };

  const downloadAll = async () => {
    let promise = new Promise(async (resolve, reject) => {
      for (let i = 0; i < tracks.length; i++) {
        let result = await downloader(tracks[i]);
      }
      // setPlaylistData(prev => ({...prev, downloaded : true}) )
      resolve('Playlist Downloaded');
    });

    return promise;
  };

  const handleDownloadAll = async () => {
    try {
      if (true) {
        let downloaded = await downloadAll();
        savePlaylist();
      } else {
        Snackbar.show({
          text: 'Playlist already exists in Download Library',
          duration: Snackbar.LENGTH_LONG,
          backgroundColor: 'red',
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const savePlaylist = async () => {
    if (responseData.saved == false) {
      try {
        const playlistToAdd = {
          id: responseData.id,
          name: responseData.name,
          image: responseData.image,
        };

        const storedValue = await AsyncStorage.getItem(`@saved_playlists`);
        const prevList = await JSON.parse(storedValue);
        // console.log(storedValue)
        if (!prevList) {
          const newList = [playlistToAdd];
          await AsyncStorage.setItem(
            '@saved_playlists',
            JSON.stringify(newList),
          );
          Snackbar.show({
            text: 'First Playlist added to Library',
            duration: Snackbar.LENGTH_LONG,
            backgroundColor: 'red',
          });
          setResponseData((item) =>
            !item.saved ? {...item, saved: true} : item,
          );
        } else {
          const exists = prevList.some((item) => item.id === responseData.id);

          if (!exists) {
            prevList.push(playlistToAdd);
            await AsyncStorage.setItem(
              '@saved_playlists',
              JSON.stringify(prevList),
            );

            Snackbar.show({
              text: 'Playlist added to Library',
              duration: Snackbar.LENGTH_LONG,
              backgroundColor: 'red',
            });
            setResponseData((item) =>
              !item.saved ? {...item, saved: true} : item,
            );
          } else {
            Snackbar.show({
              text: 'Playlist already exists in Library',
              duration: Snackbar.LENGTH_LONG,
              backgroundColor: 'red',
            });
            setResponseData((item) =>
              !item.saved ? {...item, saved: true} : item,
            );
          }
          // console.log(prevList)
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const openFile = (single) => {
    navigation.navigate('LibraryStack', {screen: 'Downloads'});
  };

  const onRequestClose = () => null;

  return (
    <>
      {loading ? (
        <View style={styles.wholeScreen}>
          <Spinner
            style={{marginBottom: 7}}
            size={72}
            type={'ThreeBounce'}
            color={'#FFF'}
          />
          <Text style={{color: 'white', fontSize: 20}}>Fetching...</Text>
        </View>
      ) : (
        <>
          <View style={styles.wholeScreen}>
            <View style={styles.playlistHeader}>
              <View
                style={{
                  flex: 0.9,
                  flexDirection: 'column',
                }}>
                {responseData.image ? (
                  <Image
                    source={{uri: responseData.image}}
                    style={{
                      height: '100%',
                      aspectRatio: 1 / 1,
                      borderRadius: 10,
                      alignSelf: 'center',
                    }}
                  />
                ) : (
                  <Image
                    source={require('../assets/defaultPlaylist.png')}
                    style={{
                      height: '100%',
                      width: '60%',
                      borderRadius: 10,
                      alignSelf: 'center',
                    }}
                  />
                )}
                <View
                  style={{
                    alignContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TextTicker
                    style={[styles.playlistId, {}]}
                    duration={10000}
                    scroll={false}
                    repeatSpacer={150}
                    marqueeDelay={2000}>
                    {responseData.name}
                  </TextTicker>
                </View>
              </View>
              <View
                style={{
                  flex: 0.1,
                  marginTop: 50,
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={styles.downloadAllButton}
                  onPress={() => {
                    handleDownloadAll();
                  }}>
                  <Text style={styles.downloadAllButtonText}>Download All</Text>
                </TouchableOpacity>
                <View style={{}}>
                  <TouchableOpacity
                    onPress={() => {
                      savePlaylist();
                    }}
                    onLongPress={() => {
                      Snackbar.show({
                        text: 'Save  this playlist in Library',
                        duration: Snackbar.LENGTH_LONG,
                        backgroundColor: 'red',
                      });
                    }}>
                    {responseData.saved ? (
                      <Image
                        source={require('../assets/red-heart.png')}
                        style={{height: 30, width: 30}}
                      />
                    ) : (
                      <Image
                        source={require('../assets/heart.png')}
                        style={{height: 30, width: 30}}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scroller}>
              {/* <Text style={{color :'white'}}> {JSON.stringify(tracks)} </Text> */}
              {tracks.map((item, index) => {
                return (
                  <View key={index} style={styles.list}>
                    {item.downloaded ? (
                      <View style={{flex: 0.7}}>
                        <TouchableOpacity
                          onPress={() => {
                            openFile(item);
                          }}>
                          <Text style={styles.trackTitle}>{item.title}</Text>
                          <Text style={styles.trackInfo}>
                            {item?.artist[0].name} - {item.album}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{flex: 0.7}}>
                        <Text style={styles.trackTitle}>{item.title}</Text>
                        <Text style={styles.trackInfo}>
                          {item?.artist[0].name} - {item.album}
                        </Text>
                      </View>
                    )}
                    {item.downloaded ? (
                      <TouchableOpacity
                        style={{
                          flex: 0.3,
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          openFile(item);
                        }}>
                        <Image
                          source={require('../assets/check.png')}
                          style={{
                            height: 25,
                            width: 25,
                            borderRadius: 25 / 2,
                            backgroundColor: '#1DB954',
                          }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{
                          flex: 0.3,
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                        }}
                        onPress={() => downloader(item)}>
                        {visible && curentDownloading === item.id ? (
                          <Spinner
                            style={{marginBottom: 7, justifyContent: 'center'}}
                            size={30}
                            type={'Circle'}
                            color={'#FFF'}
                          />
                        ) : (
                          <Image
                            source={require('../assets/down.png')}
                            style={{
                              height: 25,
                              width: 25,
                              borderRadius: 25 / 2,
                              justifyContent: 'center',
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              <View style={{height: windowHeight * 0.06}} />
            </ScrollView>
          </View>
        </>
      )}
    </>
  );
};

export default Playlist;

const styles = StyleSheet.create({
  wholeScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
  },
  container: {
    flex: 1,
    top: 30,
  },
  header: {
    marginTop: 20,
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
  },

  playlistId: {
    color: 'white',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 25,
    fontFamily: 'Montserrat-Regular',
    fontWeight: 'bold',
  },
  trackTitle: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'GothamMedium',
  },
  trackInfo: {
    color: '#6C7A89',
    fontSize: 12,
    fontFamily: 'GothamMedium',
  },
  downloadAllButton: {
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: '#1DB954',
    marginVertical: 20,
    height: windowHeight * 0.07,
    width: windowWidth * 0.3,
    alignSelf: 'center',
  },
  downloadAllButtonText: {
    color: 'white',
    alignSelf: 'center',
    fontFamily: 'GothamMedium',
  },
  playlistHeader: {
    flex: 0.6,
    marginVertical: 15,
    marginTop: 25,
    justifyContent: 'space-evenly',
    width: '90%',
  },
  scroller: {
    flex: 0.54,
    margin: 10,
    width: '95%',

    marginBottom: 0,
  },
  list: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 10,
  },
});
