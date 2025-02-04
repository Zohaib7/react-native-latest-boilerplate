import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  RESULTS,
  requestNotifications,
} from 'react-native-permissions';

export const isIos = () => Platform.OS === 'ios';
export const isAndroid = () => Platform.OS === 'android';
export const getPlatformVersion = () => Number(Platform.Version);

export const requestNotificationsPermission = (onGranted: () => void, onBlocked?: () => void) => {
  requestNotifications(['alert', 'sound', 'badge']).then(({ status }) => {
    if (status === RESULTS.GRANTED) {
      onGranted();
    } else {
      onBlocked();
    }
  });
};

useEffect(() => {
   if(isIos() || (isAndroid() && getPlatformVersion() >= 33)){
      requestNotificationsPermission(() => {
         //notification granted tasks
        }, () => {
         //notification denied tasks
       });
   }
}, [])