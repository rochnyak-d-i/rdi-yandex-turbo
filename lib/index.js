const request = require('request');
const { format } = require('path');
const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);

const statuses = require('./statuses');
const errorFactory = require('./errors/factory');
const YandexApiError = require('./errors/error');

const TurboAPI = require('./turbo');

function htmlTemplate(verifyUIN) {
  return `
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      </head>
      <body>Verification: ${verifyUIN}</body>
    </html>
  `;
}

class YandexService {
  /**
   * @param {Object}  configs
   * @param {String}  configs.key        Авторизационный токен
   * @param {String}  configs.userID     Идентификатор пользователя
   * @param {String}  configs.hostID     Идентификатор сайта
   * @param {String}  configs.publicDir  Публичная директория
   * @param {String}  configs.mode       Режим работы api
   */
  constructor({
    key,
    userID,
    hostID,
    publicDir,
    mode,
    logger = console
  }) {
    this.key = key;
    this.userID = userID;
    this.hostID = hostID;
    this.publicDir = publicDir;
    this.mode = mode || 'PRODUCTION';

    this.logger = logger;
    this.services = {
      turbo: new TurboAPI(this)
    };
  }

  /**
   * Делает запрос к серверу
   * 
   * @returns {Promise}
   */
  async send(reqOptions = {}) {
    return new Promise((resolve, reject) => {
      const headers = Object.assign({}, {
        Authorization: `OAuth ${this.key}`
      }, reqOptions.headers);
      const options = Object.assign({
        /* default options */
      }, reqOptions);

      if (!options.url.startsWith('http') && !options.baseUrl) {
        options.baseUrl = YandexService.BASE_URL;
      }

      options.headers = headers;

      request(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }

        try {
          body = JSON.parse(body || '');
        }
        catch (error) {
          const parseError = errorFactory.create(
            `Error parsing request body api ${options.url}`);

          return reject(parseError);
        }

        if (response.statusCode >= 400) {
          const apiError = errorFactory.createFromResponse(
            response.statusCode, body);

          return reject(apiError);
        }

        resolve(body);
      });
    });
  }

  /**
   * Проверка хоста на то что он подтвержден.
   * Если нет, то запускает процедуру подтверждения.
   * 
   * @returns {Promise} true если подтвержден
   */
  async verify(hostURL) {
    /**
     * Варианты написания проверяемого хоста
     */
    const hostVariants = [hostURL, `${hostURL}/`];

    if (!this.userID) {
      const userID = await this.__getUserID();

      this.userID = userID;
    }

    const hosts = await this.__getHosts();
    const finded = hosts.find(
      host => hostVariants.includes(host.unicode_host_url));

    if (!this.hostID) {
      this.hostID = finded.host_id;
    }

    if (finded.verified) {
      return true;
    }

    const verifyInfo = await this.__getVerification();

    switch (verifyInfo.verification_state) {
      case 'VERIFIED':
        return true;

      case 'IN_PROGRESS':
        return false;

      case 'INTERNAL_ERROR':
      case 'NONE':
      case 'VERIFICATION_FAILED': {
        const verifyUIN = verifyInfo.verification_uin;
        const filepath = format({
          root: this.publicDir,
          name: `yandex_${verifyUIN}`,
          ext: '.html'
        });

        const content = htmlTemplate(verifyUIN);

        await writeFile(filepath, content);

        break;
      }
    }

    const result = await this.__postVerification();

    if (result.verification_state === 'INTERNAL_ERROR') {
      throw errorFactory.create(
        statuses.ApiVerificationFailReason[result.fail_info.reason]);
    }

    if (result.verification_state === 'VERIFIED') {
      return true;
    }
  }

  /**
   * Получить идентификатор пользователя
   * 
   * @returns {Promise}
   */
  async __getUserID() {
    const body = await this.send({
      method: 'GET',
      url: '/v3/user'
    });
    const userID = body.user_id;

    return userID;
  }

  /**
   * Получить список сайтов
   * 
   * @returns {Promise}
   */
  async __getHosts() {
    const body = await this.send({
      method: 'GET',
      url: `/v3/user/${this.userID}/hosts`
    });
    const hosts = body.hosts;

    return hosts;
  }

  /**
   * Получить код подтверждения прав доступа к сайту
   * 
   * @returns {Promise}
   */
  async __getVerification() {
    const body = await this.send({
      method: 'GET',
      url: `/v3/user/${this.userID}/hosts/${this.hostID}/verification`
    });

    return body;
  }

  /**
   * Запускает процедуру подтверждения прав на управление сайтом
   * 
   * @returns {Promise}
   */
  async __postVerification() {
    const body = await this.send({
      method: 'POST',
      url: `/v3/user/${this.userID}/hosts/${this.hostID}/verification/?verification_type=HTML_FILE`
    });

    return body;
  }
}

YandexService.BASE_URL = 'https://api.webmaster.yandex.net';
YandexService.YandexApiError = YandexApiError;

module.exports = YandexService;
