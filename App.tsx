import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  FlatList,
  View,
  Button,
} from 'react-native';
import QuranKemenag from 'quran-kemenag';
import {Surah} from 'quran-kemenag/dist/intefaces';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AnimatedList} from './AnimatedList';
import notifee from '@notifee/react-native';
import { getFCM } from './notificationsHelper';

function App(): React.JSX.Element {
  const [listOfSurah, setListOfsurah]: [
    listOfSurah: Surah[],
    setListOfsurah: (value: any) => void,
  ] = React.useState([]);

  React.useEffect(() => {
    getData();
    const fcmToken = getFCM()
    console.log(fcmToken, "fcmTokenfcmTokenfcmToken")
  }, []);

  const getData = async () => {
    const quran = new QuranKemenag();
    const data = await quran.getListSurah();
    setListOfsurah(data);
  };
  // console.log(listOfSurah, 'listOfSurahlistOfSurah');

  const onDisplayNotification = async () => {
    console.log('AHMED HERE');
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main body content of the notification',
      android: {
        channelId,
        // asForegroundService: true,
        // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  return (
    //    <GestureHandlerRootView style={{ flex: 1 }}>
    //      <StatusBar barStyle={'dark-content'} />
    //     <Text>Muhammad Ahmed Khalid</Text>
    //     <FlatList
    //       data={listOfSurah}
    //       keyExtractor={s => `${s.surah_id}`}
    //       renderItem={({item, index}) => {
    //         const onPress = () => {
    //           console.log(item.surah_id, 'item.surah_id');
    //         };
    //         return <SurahItem key={index} data={item} onPress={onPress} />;
    //       }}
    //     />
    //  <Text>HELLO</Text>
    //     </GestureHandlerRootView>
    // Working Code Below
    //   <GestureHandlerRootView style={{flex: 1}}>
    //   <SafeAreaView style={{backgroundColor: '#0E0C0A'}}>
    //     <AnimatedList />
    //   </SafeAreaView>
    // </GestureHandlerRootView>
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button
        title="Display Notification"
        onPress={() => onDisplayNotification()}
      />
    </View>
  );
}

interface SurahItemProps {
  data: Surah;
  onPress: () => void;
}
const SurahItem = (props: SurahItemProps) => {
  return (
    <View key={props.data.surah_id}>
      <Text>{props.data.surah_id}</Text>
      <Text>{props.data.surah_name}</Text>
      <Text>{`${props.data.surah_verse_count} verses`}</Text>
      <Text>{props.data.surah_name_arabic}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
