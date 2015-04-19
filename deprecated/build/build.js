({
    baseUrl: 'dev',
    name: '../bower_components/almond/almond',
    include: 'main',
    out: 'dist/raymond.js',
    mainConfigFile: 'dev/build/config.js',
    wrap: {
        startFile: 'dev/build/start.txt',
        endFile: 'dev/build/end.txt'
    },
    optimize: 'uglify2',
    preserveLicenseComments: false,
    generateSourceMaps: true
})
