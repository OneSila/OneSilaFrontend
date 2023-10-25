import { InjectionKey, Ref } from 'vue';

export const DeviceKey: InjectionKey<Ref<Device>> = Symbol('Device')

export class Device {
  private _size: { width: number; height: number; } = saveSize();

  public constructor() {}

  get size() {
    return this._size
  }

  get width(): number {
    return this._size.width
  }

  get height(): number {
    return this._size.height
  }

  get isMobile(): boolean {
    return this._size.width <= 768
  }

  get isTablet(): boolean {
    return this._size.width <= 1024
  }

  get isDesktop(): boolean {
    return this._size.width > 1024
  }

  public updateSize() {
    this._size = saveSize()
  }
}

function saveSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}
