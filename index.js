/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, { EventType } from '@notifee/react-native';


notifee.registerForegroundService((notification) => {
    return new Promise(() => {
      // Long running task...
      console.log('Foreground Service:', notification);
    });
  });


// Set background event handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Background Event:', type, detail);
    
    if (type === EventType.PRESS) {
      console.log('User pressed the notification', detail.notification);
    }
  });

AppRegistry.registerComponent(appName, () => App);
