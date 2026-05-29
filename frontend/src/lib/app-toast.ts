export type AppToastType = 'success' | 'error' | 'info' | 'warning';

type ToastHandler = (message: string, type?: AppToastType) => void;

let toastHandler: ToastHandler | null = null;

export function registerAppToast(handler: ToastHandler) {
  toastHandler = handler;
}

export function appToast(message: string, type: AppToastType = 'info') {
  toastHandler?.(message, type);
}
