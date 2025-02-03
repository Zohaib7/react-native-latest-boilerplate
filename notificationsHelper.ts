import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

export const channelId = 'missedAlarm';
export const channelName = 'Missed Alarms';

export const FGSChannelId = 'foodOrderTracking';
export const FGSChannelName = 'Food Order Delivery info';

export const checkNotificationPermissionStatus = (): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      return messaging()
        .hasPermission()
        .then(enabled => {
          let granted =
            enabled === messaging.AuthorizationStatus.AUTHORIZED ||
            enabled === messaging.AuthorizationStatus.PROVISIONAL;
          return resolve(granted);
        })
        .catch(error => reject(error));
    });
  };
export const setNotificationsHandler = async () => {
    let granted = await checkNotificationPermissionStatus();
    if(!granted) return;
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    await passTokenToBackend(token);

    messaging().onTokenRefresh((token) => {
      //call api and pass the token
      passTokenToBackend(token)
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