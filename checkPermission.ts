import messaging from '@react-native-firebase/messaging';

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