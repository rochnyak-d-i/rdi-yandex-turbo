const zlib = require('zlib');
const { URLSearchParams } = require('url');

class YandexTurboAPI {
  /**
   * @param {YandexAPI} driver  драйвер для работы с Yandex API
   */
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Возвращает адрес для добавления RSS-канала
   * 
   * @returns {Promise}
   */
  async getUploadAddress() {
    const body = await this.driver.send({
      method: 'GET',
      url: `/v3.2/user/${this.driver.userID}/hosts/${this.driver.hostID}/turbo/uploadAddress/?mode=${this.driver.mode}`
    });

    const uploadAddress = body.upload_address;

    return uploadAddress;
  }

  /**
   * Добавляет RSS-канал
   * 
   * @param {String}      uploadAddress   Адрес добавления rss-канала
   * @param {ReadStream}  content         Данные rss-канала
   * @param {Object}      options
   * @param {Boolean}     options.gzip    Включить сжатие данных
   * 
   * @returns {Promise}   возвращает id задачи
   */
  async postRSS(uploadAddress, content, {gzip = false}) {
    const headers = {
      'Content-Type': 'application/rss+xml'
    };

    if (gzip) {
      const gzip = zlib.createGzip();

      content = content.pipe(gzip);

      headers['Content-Encoding'] = 'gzip';
    }

    const body = await this.driver.send({
      method: 'POST',
      url: uploadAddress,
      headers,
      body: content
    });
    const taskID = body.task_id;

    return taskID;
  }

  /**
   * Возвращает информацию об обработке задачи
   * 
   * @param {String}  taskID  Идентификатор задачи
   * 
   * @returns {Promise}
   */
  async getTaskInfo(taskID) {
    const body = await this.driver.send({
      method: 'GET',
      url: `/v3.2/user/${this.driver.userID}/hosts/${this.driver.hostID}/turbo/tasks/${taskID}`
    });

    return body;
  }

  /**
   * Возвращает информацию о задачах за последний месяц
   * 
   * @param {Object} options
   * @param {String} options.type     TaskTypeFilter
   * @param {String} options.status   LoadStatus
   * @param {Number} options.limit    Смещение в списке
   * @param {Number} options.offset   Кол-во элементов в списке (до 100)
   * 
   * @returns {Promise}
   */
  async getTasks({type, status, offset = 0, limit = 100} = {}) {
    const params = new URLSearchParams([
      ['task_type_filter', type],
      ['load_status_filter', status],
      ['offset', offset],
      ['limit', limit]
    ].filter(ar => ar[1] !== void 0));

    const body = await this.driver.send({
      method: 'GET',
      url: `/v3.2/user/${this.driver.userID}/hosts/${this.driver.hostID}/turbo/tasks/?${params.toString()}`
    });

    return body;
  }

  /**
   * Фасадный метод для загрузки RSS
   * 
   * @see postRSS
   */
  async sendRSS(rss, options) {
    const uploadAddress = await this.getUploadAddress();
    const taskID = await this.postRSS(uploadAddress, rss, options);
    const info = await this.getTaskInfo(taskID);

    return info;
  }
}

module.exports = YandexTurboAPI;
