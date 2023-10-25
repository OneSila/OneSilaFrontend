import { useToast } from 'vue-toastification';

const toast = useToast();

export class Toast {
  static info(text: string) {
    toast.info(text);
  }

  static success(content: string | Record<string, any>) {
    toast.success(content);
  }

  static error(text: string) {
    toast.error(text);
  }

  static warning(
    text: string,
    options: { duration?: number | false } = { duration: 5000 },
  ) {
    toast.warning(text, {
      timeout: options?.duration || false,
    });
  }

  static dismissAll() {
    toast.clear();
  }
}
