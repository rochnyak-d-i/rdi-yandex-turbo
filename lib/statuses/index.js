/*
  По большей части это нужно для перевода кодов у статусов в
  человекочитаемый вид, для вывода в консоль
*/

const fs = require('fs');
const path = require('path');
const files = fs.readdirSync(__dirname);

module.exports = files.reduce((collector, filename) => {
  if (filename === __filename) {
    return;
  }

  const key = path.basename(filename);
  const modulePath = path.join(__dirname, filename);

  collector[key] = require(modulePath);

  return collector;
}, {});
