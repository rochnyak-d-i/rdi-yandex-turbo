# rdi-yandex-turbo

## Installation

```bash
npm i rdi-yandex-turbo
```

## Usage

```js
const YandexTurbo = require('rdi-yandex-turbo');
const service = new YandexTurbo({
  key: 'The authorization token',
  userId: 'User id',
  hostID: 'Host:id:80',
  mode: 'PRODUCTION', // or 'DEBUG'
  logger: console
});
```

### First run

Need to pass the verification procedure.

```js
const ok = await service.verify(
  'http://my.host',
  '/path/to/public/dir/for/create/verify/file'
);

if (ok) {
  // save this to config
  this.userID
  this.hostID
}
```

### Send RSS

```js
const fsReadStream = fs.createReadStream('/path/to/turbo-rss.xml');

await service.turbo.sendRSS(fsReadStream, {gzip: false});
```
