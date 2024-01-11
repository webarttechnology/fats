const handlebars = require('handlebars');
const he = require('he');

module.exports = {
  decodeEntities: function (options) {
    return new handlebars.SafeString(he.decode(options.fn(this)));
  }
};