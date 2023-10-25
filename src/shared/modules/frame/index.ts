import { onBeforeUnmount, onMounted } from 'vue';

export const onMessageReceived = (callback: (event: any) => void) => {
  window.addEventListener('message', callback);

  return () => {
    window.removeEventListener('message', callback);
  };
};

export const useMessageListener = (callback: (event: any) => void) => {
  let removeListener: () => void;

  onMounted(() => {
    removeListener = onMessageReceived(callback);
  });

  onBeforeUnmount(() => {
    removeListener && removeListener();
  });
};
