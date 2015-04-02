({
    baseUrl: 'js',
    name: '../components/almond/almond',
    include: 'main',
    out: 'dist/raymond.js',
    mainConfigFile: 'js/build/config.js',
    wrap: {
        startFile: 'js/build/start.txt',
        endFile: 'js/build/end.txt'
    },
    optimize: 'uglify2',
    preserveLicenseComments: false,
    generateSourceMaps: true
})
