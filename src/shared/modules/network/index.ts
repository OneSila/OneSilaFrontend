import { inject, InjectionKey, Ref } from 'vue';

import { Toast } from '../toast';

export const NetworkKey: InjectionKey<Network> = Symbol('Network');

export interface Network {
  connected: boolean;
}

export const injectNetwork = () => {
  const network = inject<Network>(NetworkKey);

  if (!network) {
    throw new Error('Could not get Network.');
  }

  return network;
};

export const useDelayedRequestHandler = () => {
  let submitStart: number | null = null;
  let submitTimer: number | null = null;

  const ignoreDelayedRequestHandler = (dismissToast = false) => {
    submitStart = null;

    if (submitTimer) {
      clearInterval(submitTimer as number);
      submitTimer = null;
    }

  };

  return () => {
    submitStart = new Date().getTime();

    submitTimer = setInterval(() => {
      if (submitStart && new Date().getTime() - submitStart >= 5000) {
        Toast.warning('Taking longer than usual...');
        ignoreDelayedRequestHandler();
      }
    }, 1000) as any;

    return ignoreDelayedRequestHandler;
  };
};

export const useSafeRequest = (errors: Ref<any[]>, validate?: () => void) => {
  const handleDelayedRequest = useDelayedRequestHandler();

  const handleErrors = () => {
    errors.value.forEach((error) => Toast.error(error));
  };

  return async (callback: () => Promise<any>) => {
    errors.value = [];

    validate && validate();

    if (!errors.value.length) {
      const ignoreDelayedRequestHandler = handleDelayedRequest();

      try {
        const { error, data } = await callback();

        errors.value = (
          error?.value?.graphQLErrors ||
          error?.graphQLErrors ||
          []
        ).map((error) => error.message);

        if (!errors.value.length) {
          return data;
        }
      } catch (error: any) {
        errors.value.push(error.message);
      } finally {
        ignoreDelayedRequestHandler(true);
      }
    }

    handleErrors();
  };
};
