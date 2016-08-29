import * as escape from 'escape-html';

export default class BTWrapper {

    data;

    constructor(options?) {
      this.data = options || {};
    }

    set(data) {
      this.data = data;
    }

    property(name) {
      return this.data[name] || '';
    }

    propertyHTML(name) {
      return escape(this.property(name));
    }
}
