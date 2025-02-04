import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { checkNotificationPermissionStatus } from './checkPermission';

export const channelId = 'missedAlarm';
export const channelName = 'Missed Alarms';

export const FGSChannelId = 'foodOrderTracking';
export const FGSChannelName = 'Food Order Delivery info';

export const getFCM = async () => {
  const token = await messaging().getToken();
  return token;
}

export const setNotificationsHandler = async () => {
    let granted = await checkNotificationPermissionStatus();
    if(!granted) return;
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();

    console.log(token, "tokentokentokentoken")
    // await passTokenToBackend(token);

    messaging().onTokenRefresh((token) => {
      //call api and pass the token
      // passTokenToBackend(token)
    });
    
    notifee.isChannelCreated(channelId).then(isCreated => {
      if (!isCreated) {
        notifee.createChannel({
          id: channelId,
          name: channelName,
          sound: 'default',
        });
      }
    });
    
    //add this
    notifee.isChannelCreated(FGSChannelId).then(isCreated => {
      if (!isCreated) {
        notifee.createChannel({
          id: FGSChannelId,
          name: FGSChannelName,
          sound: 'default',
        });
      }
    });

    messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived in foreground!', JSON.stringify(remoteMessage));
    });
}