
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
          id: Promise<string | null>;
        };
      };
    };
    OneSignalDeferred?: Array<() => void>;
  }
}

export {};
