import { inject, InjectionKey, Ref } from 'vue';

export const ScreenKey: InjectionKey<Screen> = Symbol('Screen')

export interface Screen {
  width: number;
  height: number;
}

export function detectScreen(): Screen {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export const isMobile = (screen = detectScreen()) => screen.width <= 768
export const isTablet = (screen = detectScreen()) => screen.width <= 1024
export const isDesktop = (screen = detectScreen()) => isWiderThan(screen, 1024)
export const isWiderThan = (screen = detectScreen(), width: number) => screen.width > width

export const injectScreen = () => {
  const screen = inject<Screen>(ScreenKey)

  if (!screen) {
    throw new Error('Could not get the Device.');
  }

  return screen
}
