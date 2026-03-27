
declare global {
  interface Window {
    OneSignal?: {
      Notifications: {
        requestPermission(): Promise<boolean>;
        permission: Promise<boolean>;
      };
      User: {
        PushSubscription: {
          optIn(): Promise<void>;
          optOut(): Promise<void>;
          id: Promise<string | null>;
          optedIn: Promise<boolean>;
        };
      };
    };
    OneSignalDeferred?: Array<() => void>;
  }
}

export {};
