class YandexApiError extends Error {
  /**
   * конструктор
   *
   * @param {Object}   info
   * @param {Number}   info.status
   * @param {String}   info.message      Сообщение
   * @param {String}   info.userMessage  Пользовательское сообщение
   * @param {Object}   info.payload      Полезные данные
   * @param {String}   info.code         Код ошибки
   * @param {Function} stopTrace
   *
   * @return {ExtendedError}
   */
  constructor(info, stopTrace) {
    super(info.message);

    this.name = this.constructor.name;
    this.status = info.status;
    this.message = info.message;
    this.userMessage = info.userMessage || this.message;
    this.payload = info.payload || {};
    this.code = info.code || '';

    if (stopTrace === void 0) {
      stopTrace = this.constructor;
    }

    Error.captureStackTrace(this, stopTrace);
  }

  toString() {
    const prefix = this.status ? `${this.status}(${this.code}) :` : '';
    const postfix = `: ${JSON.stringify(this.payload)}`;

    return `${prefix} ${this.userMessage} ${postfix}`;
  }
}

module.exports = YandexApiError;
