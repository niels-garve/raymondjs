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

        // Generate input vectors
        var vectorLength = 30,
            UIvector1 = new Uint32Array(vectorLength),
            UIvector2 = new Uint32Array(vectorLength),
            i;

        for (i = 0; i < vectorLength; i += 1) {
            UIvector1[i] = Math.floor(Math.random() * 100); // Random number 0..99
            UIvector2[i] = Math.floor(Math.random() * 100); // Random number 0..99
        }

        log(UIvector1);
        log(UIvector2);
        log(Utils.CL_vectorAdd(UIvector1, UIvector2, vectorLength));
    })
);
