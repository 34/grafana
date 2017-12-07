const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join('..', '..', 'i18n');

function I18nPlugin(options) {
  this.i18npath = options.i18npath || I18N_DIR;
  this.filename = options.filename;
  this.template = options.template;

  this.langs = {};
}

I18nPlugin.prototype.apply = function (compiler) {
  var self = this;

  compiler.plugin("compile", function (params) {
    console.log("The compiler is starting to compile...");
  });

  compiler.plugin("compilation", function (params) {
    console.log("The compiler is starting to compile...");
    var files = fs.readdirSync(self.i18npath);
    files.forEach(file => {
      var lang = path.parse(file).name;
      self.langs[lang] = require(self.i18npath + '/' + file);
    });

    var template = fs.readFileSync(self.template, {
      encoding: 'utf8'
    });
    console.log('i18n file', self.langs, template);
    template = template.replace('{{LANGS}}', JSON.stringify(self.langs, null, 2));
    console.log('i18n content', template)
    fs.writeFileSync(self.filename, template, {
      encoding: 'utf8'
    });
  });
};

module.exports = I18nPlugin;
