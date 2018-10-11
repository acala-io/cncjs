class ResizeObserver {
  callback = null;
  observer = null;

  constructor(callback) {
    if (typeof callback === 'function') {
      this.callback = callback;
    }

    return this;
  }

  observe(target) {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.callback) {
      this.callback();
    }

    this.observer = new MutationObserver(mutations => {
      if (this.callback) {
        this.callback();
      }
    });

    this.observer.observe(target, {
      attributeOldValue: false,
      attributes: true,
      characterData: true,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export default ResizeObserver;
