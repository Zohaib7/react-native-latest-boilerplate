import { useEffect, useRef } from "react";
import { AppState, AppStateStatic } from "react-native";

export const useAppState = (onForeground?: () => void, onBackground?: () => void) => {
    const appStateRef = useRef(AppState.currentState);
    const onForegroundRef = useRef(onForeground);
    const onBackgroundRef = useRef(onBackground);
  
    // setting refs to avoid passing the functions as dependencies to useEffect
    onForegroundRef.current = onForeground;
    onBackgroundRef.current = onBackground;
  
    useEffect(() => {
      const handleAppStateChange = (nextAppState: AppStateStatic) => {
        const prevAppState = appStateRef.current;
        if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
          onForegroundRef.current?.();
        } else if (
          prevAppState.match(/active/) &&
          (nextAppState === 'inactive' || nextAppState === 'background')
        ) {
          onBackgroundRef.current?.();
        }
        appStateRef.current = nextAppState;
      };
      const subscription = AppState.addEventListener('change', handleAppStateChange);
  
      return () => {
        if (subscription?.remove) {
          subscription.remove();
        }
      };
    }, []);
  };