import { useIsFocused } from '@react-navigation/native';
import { useNetInfo } from '@react-native-community/netinfo';
import notifee, {
  AndroidColor,
  AndroidForegroundServiceType,
  AndroidLaunchActivityFlag,
} from '@notifee/react-native';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { checkNotificationPermissionStatus } from './checkPermission';
import { FGSChannelId } from './notificationsHelper';
import { requestNotificationsPermission } from './smallDevicePermissons';
import { useAppState } from './anotherService';

const isFocused = useIsFocused();
const internetState = useNetInfo();
export const FGSNotificationId = 'FGSNotificationId';

const resetForegroundService = useCallback(async () => {
  //remove displayed notification (if any) and stop foreground service (if any).
  await notifee.cancelNotification(FGSChannelId);
  await notifee.stopForegroundService();
}, []);

const showNotification = async (isOnline: boolean, orderStatus: string, percentageCompleted: number) => {
  let isGranted = await checkNotificationPermissionStatus();
  if (isGranted) {
    //permission granted
    if (isOnline) {
      //if internet is connected, show notification with order data
      notifee.displayNotification({
        id: FGSNotificationId,
        title: `<p style="color: #4caf50;"><b>${orderStatus}</b></p>`,
        android: {
          foregroundServiceTypes: [
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
          ],
          progress: {
            max: 100,
            current: percentageCompleted,
          },
          smallIcon: 'ic_small_icon',
          color: AndroidColor.BLACK,
          ongoing: false,
          autoCancel: false, // Defaults to true
          onlyAlertOnce: true,
          asForegroundService: true,
          channelId: FGSChannelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
          actions: [
            {
              title: '<b>Pay</b>;',
              pressAction: { id: 'pay' },
            },
            {
              title: '<p style="color: #f44336;"><b>Change address</b></p>',
              pressAction: { 
               id: 'changeAddress',
               launchActivity: 'default',
               launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
              },
            },
          ],
        },
      });
    } else {
      //if no internet, show lost connectivity status
      notifee.displayNotification({
        id: FGSNotificationId,
        title: '<p style="color: #4caf50;"><b>No Internet</p></b></p>',
        body: '<p style="color: #4caf50;">Please connect to internet to get latest data from server</p></p>',
        android: {
          foregroundServiceTypes: [
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
          ],
          smallIcon: 'ic_small_icon',
          color: AndroidColor.BLACK,
          ongoing: false,
          autoCancel: false, // Defaults to true
          onlyAlertOnce: true,
          asForegroundService: true,
          channelId: FGSChannelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });
    }
  } else {
    //permission denied
    /*
       Cancel the previous notification and stop service if any.
       Because maybe previously user had granted permission, and notification was shown.
       But now as user don't have permission, we shouldn't show notification
     */
    await resetForegroundService();
    /*
       (OPTIONAL) if permission is denied, ask notification permission once again.
    */
    setTimeout(() => {
      if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
        //ask permissions in case of android 13 only.
        requestNotificationsPermission(
          () => {
            //if notification permission granted
            showNotification(isOnline, orderStatus, percentageCompleted);
          },
          () => {
            //if notification permission denied
            showNotification(isOnline, orderStatus, percentageCompleted);
          },
        );
      }
    }, 2000);
  }
};

useEffect(() => {
  if (Platform.OS === 'ios') {
    //we dont need foreground service in case of IOS
    return;
  }
  if (isFocused) {
    showNotification(internetState.isConnected, orderStatus, percentageCompleted);
  }
}, [isFocused, internetState.isConnected, orderStatus, percentageCompleted]);

useAppState(() => {
    if (Platform.OS === 'ios') {
      //we dont need foreground service in case of IOS
      return;
    }
    //app comes to foreground
    showNotification(internetState.isConnected, orderStatus, percentageCompleted);
});