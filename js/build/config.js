/**
 * RequireJS alias/path configuration (http://requirejs.org/)
 *
 * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 * @author Niels Garve, niels.garve.yahoo.de
 */
requirejs.config({
    paths: {
        // require.js plugins
        hgn: '../components/requirejs-hogan-plugin/hgn',
        text: '../components/requirejs-hogan-plugin/text',
        hogan: '../components/requirejs-hogan-plugin/hogan',

        'gl-matrix': '../components/gl-matrix/dist/gl-matrix'
    },

    shim: {},

    // configure hgn! plugin
    hgn: {
        // load "*.mustache" files, set to empty string if you
        // want to specify the template extension for each individual file
        // the default value is ".mustache"
        templateExtension: '',

        // if you need to set custom options it can be done through the
        // "compilationOptions" setting, check hogan documentation:
        // https://github.com/twitter/hogan.js#compilation-options
        compilationOptions: {
            // delimiters : '<% %>',
            // sectionTags: [{o: '_foo', c: 'foo'}],
            // disableLambda : true
        }
    }
});
