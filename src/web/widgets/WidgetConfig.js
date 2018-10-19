import store from '../store_old';

class WidgetConfig {
  widgetId = '';
  translateKey = key => {
    let localKey = key;
    const widgetId = this.widgetId;
    if (typeof localKey !== 'undefined') {
      localKey = `widgets["${widgetId}"].${localKey}`;
    } else {
      localKey = `widgets["${widgetId}"]`;
    }

    return localKey;
  };

  constructor(widgetId) {
    this.widgetId = widgetId;
  }

  get(key, defaultValue) {
    let localKey = key;
    if (!this.widgetId) {
      throw new Error('The widget id cannot be an empty string');
    }
    localKey = this.translateKey(localKey);

    return store.get(localKey, defaultValue);
  }

  set(key, value) {
    let localKey = key;
    if (!this.widgetId) {
      throw new Error('The widget id cannot be an empty string');
    }
    localKey = this.translateKey(localKey);

    return store.set(localKey, value);
  }

  unset(key) {
    let localKey = key;
    if (!this.widgetId) {
      throw new Error('The widget id cannot be an empty string');
    }
    localKey = this.translateKey(localKey);

    return store.unset(localKey);
  }

  replace(key, value) {
    let localKey = key;
    if (!this.widgetId) {
      throw new Error('The widget id cannot be an empty string');
    }
    localKey = this.translateKey(localKey);

    return store.replace(localKey, value);
  }
}

export default WidgetConfig;
