// @todo create DOM tree and webgl context
//var jsdom = require('jsdom'),
//    document = jsdom.jsdom('<!DOCTYPE html><html><body></body></html>');
//
//global.document = document;

var WebGL = require('node-webgl');

global.document = WebGL.document();

var Engine = require('./engine.js'),
    engine = new Engine().render();

var http = require('http');

// @todo send canvas data
//http.createServer(function( req, res ) {
//    clock(ctx);
//    res.writeHead(200, { 'Content-Type': 'text/html' });
//    res.end(''
//    + '<meta http-equiv="refresh" content="1;" />'
//    + '<img src="' + canvas.toDataURL() + '" />');
//}).listen(3000);
//console.log('Server started on port 3000');
