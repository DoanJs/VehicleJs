export {};

declare global {
  interface Window {
    updater?: {
      getState: () => Promise<{
        checking: boolean;
        available: boolean;
        downloaded: boolean;
        downloading: boolean;
        progress: number;
        version: string | null;
        error: string | null;
      }>;
      check: () => Promise<unknown>;
      download: () => Promise<{ ok: true }>;
      install: () => Promise<{ ok: true }>;
      onStateChange: (
        callback: (state: {
          checking: boolean;
          available: boolean;
          downloaded: boolean;
          downloading: boolean;
          progress: number;
          version: string | null;
          error: string | null;
        }) => void
      ) => () => void;
    };
  }
}