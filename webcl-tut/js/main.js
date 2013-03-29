requirejs.config({
    paths: {
        "jquery": [
            'http://code.jquery.com/jquery-1.9.1.min',
            'lib/jquery-1.9.1.min'],

        "underscore": "lib/underscore-min",

        "parallel": "lib/parallel.min",

        "bootstrap": "lib/bootstrap.min"
    },

    shim: {
        "jquery": {
            exports: "$"
        },

        "underscore": {
            exports: "_"
        },

        "parallel": {
            deps: ["underscore"],
            exports: "Parallel"
        },

        "bootstrap": {
            deps: ["jquery"]
        }
    }
});

define(
    ["jquery", "underscore", "parallel", "utils", "bootstrap"],
    (function ($, _, Parallel, Utils) {
        "use strict";

        Utils.webClInfo();
    })
);
