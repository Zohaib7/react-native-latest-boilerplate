import {AppRegistry, AppState} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, { AndroidColor, AndroidForegroundServiceType, EventType } from '@notifee/react-native';
import NetInfo from '@react-native-community/netinfo';
import { checkNotificationPermissionStatus } from './checkPermission';
import { FGSNotificationId } from './thridService';
import { FGSChannelId } from './notificationsHelper';


notifee.registerForegroundService(notification => {
  return new Promise(resolve => {
    let prevAppState = AppState.currentState;
    let appStateSubscription = null;
    let unsubscribeNetworkUpdate = null;
    let permissionCheckInterval = null;

    const stopService = async () => {
      console.warn('Stopping service.');
      if (notification?.id) {
        await notifee.cancelNotification(notification?.id);
      }
      await notifee.stopForegroundService();
      if (typeof unsubscribeNetworkUpdate === 'function') {
        unsubscribeNetworkUpdate();
      }
      if (appStateSubscription) {
        if (typeof appStateSubscription.remove === 'function') {
          appStateSubscription.remove();
        }
        appStateSubscription = null;
      }
      if (permissionCheckInterval) {
        clearInterval(permissionCheckInterval);
        permissionCheckInterval = null;
      }
      return resolve();
    };

    const handleNoInternet = async () => {
      //when internet is off, display no internet notification.
      let granted = await checkNotificationPermissionStatus();
      if (granted) {
        //if no internet and notification permission granted, show lost connectivity status
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
      } else {
        stopService();
      }
    };

    appStateSubscription = AppState.addEventListener('change', nextAppState => {
      //console.log('app state changed');
      if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
        //console.log('App came foreground');
        if (typeof unsubscribeNetworkUpdate === 'function') {
          unsubscribeNetworkUpdate();
        }
        if (permissionCheckInterval) {
          clearInterval(permissionCheckInterval);
          permissionCheckInterval = null;
        }
      } else if (
        prevAppState.match(/active/) &&
        (nextAppState === 'inactive' || nextAppState === 'background')
      ) {
        // console.log('App goes background/quit');
        permissionCheckInterval = setInterval(async () => {
          //if app is in background check latest permission status every 1 min.
          let granted = await checkNotificationPermissionStatus();
          if (!granted) {
            //if notification permission is denied, stop FG service.
            stopService();
          }
        }, 60000);

        //Subscribe to network state updates
        unsubscribeNetworkUpdate = NetInfo.addEventListener(state => {
          if (state.isConnected) {
            // console.log('Internet connected');
            //if internet is on, get updated data from server and show updated notification using notifee.displayNotification
          } else {
            handleNoInternet();
          }
        });
      }
      prevAppState = nextAppState;
    });
  });
});

AppRegistry.registerComponent(appName, () => App);

// Set background event handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Background Event:', type, detail);
    
    if (type === EventType.PRESS) {
      console.log('User pressed the notification', detail.notification);
    }
  });

AppRegistry.registerComponent(appName, () => App);
