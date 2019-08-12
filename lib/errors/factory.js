const httpCodes = require('http').STATUS_CODES;
const YandexApiError = require('./error');
const errors = require('./errors');

/**
 * Возвращает данные ошибки
 * 
 * @param {Number} status
 * @param {Object} body
 * 
 * @returns {Object}
 */
function getInfo(status, body) {
  let info = Reflect.has(errors, status) ?
    errors[status] : {};
  
  if (Reflect.has(body, 'error_code')) {
    info = info[body.error_code] || {};
    info.code = body.error_code;
  }

  return (typeof info === 'function') ? info(body) : info;
}

module.exports = {
  create(message) {
    return new YandexApiError({
      message
    });
  },

  /**
   * Создает ошибку по ответу от сервера
   * 
   * @param {Number}  status  Статус ответа
   * @param {Object}  body    Тело ответа
   * 
   * @returns {YandexApiError}
   */
  createFromResponse(status, body = {}) {
    const defaultInfo = {
      status,
      message: body.error_message || httpCodes[status]
    };
    const additionalInfo = getInfo(status, body);
    const info = Object.assign(defaultInfo, additionalInfo);

    return new YandexApiError(info);
  }
};
