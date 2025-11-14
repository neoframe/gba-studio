export default class EventEmitter extends EventTarget {
  listeners = new Map<string, Set<(data?: any) => any>>();

  emit (eventName: string, data?: any) {
    const listeners = this.listeners.get(eventName);

    if (listeners) {
      for (const listener of listeners) {
        listener({ detail: data });
      }
    }
  }

  on (eventName: string, listener: (data?: any) => any) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(listener);
  }

  off (eventName: string, listener: (data?: any) => any) {
    const listeners = this.listeners.get(eventName);

    if (listeners) {
      listeners.delete(listener);

      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  addEventListener (eventName: string, listener: (data?: any) => any) {
    this.on(eventName, listener);
  }

  removeEventListener (eventName: string, listener: (data?: any) => any) {
    this.off(eventName, listener);
  }
}
