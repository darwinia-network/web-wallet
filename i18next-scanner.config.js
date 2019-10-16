const fs = require('fs');
const path = require('path');
const typescript = require('typescript');

module.exports = {
  input: [
    'packages/*/src/**/*.{ts,tsx}',
    // Use ! to filter out files or directories
    '!packages/*/src/**/*.spec.{ts,tsx}',
    '!packages/*/src/i18n/**',
    '!**/node_modules/**'
  ],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t', 'i18next.t', 'i18n.t'],
      extensions: ['.tsx']
    },
    trans: {
      component: 'Trans'
    },
    lngs: ['en', 'zh'],
    defaultLng: 'en',
    ns: [
      'app-123code',
      'app-accounts',
      'app-address-book',
      'app-contracts',
      'app-dashboard',
      'app-democracy',
      'app-explorer',
      'app-extrinsics',
      'app-js',
      'app-settings',
      'app-staking',
      'app-storage',
      'app-sudo',
      'apps',
      'ui-signer',
      'app-toolbox',
      'ui-app',

      'app-claims',
      'app-council',
      'app-treasury',
      'apps-routing',
     
      'ui-params'
    ],
    defaultNs: 'ui',
    resource: {
      loadPath: 'packages/apps/public/locales/{{lng}}/{{ns}}.json',
      savePath: 'packages/apps/public/locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false, // namespace separator
    keySeparator: false // key separator
  },
  transform: function transform (file, enc, done) {
    const { ext } = path.parse(file.path);

    if (ext === '.tsx') {
      const content = fs.readFileSync(file.path, enc);

      const { outputText } = typescript.transpileModule(content, {
        compilerOptions: {
          target: 'es2018'
        },
        fileName: path.basename(file.path)
      });

      const parserHandler = (key, options) => {
        options.defaultValue = key;
        options.ns = /packages\/(.*?)\/src/g.exec(file.path)[1];
        this.parser.set(key, options);
      };

      this.parser.parseFuncFromString(outputText, parserHandler);
    }

    done();
  }
};