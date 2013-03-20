/*
 *
 * Author: Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 * (C)opyright 2011-2012 by Hartmut Schirmacher, all rights reserved. 
 * This module is inspired by an example in the respective 
 * W3 specification: http://www.w3.org/TR/FileAPI/
 *
 */

/* using require js to define a module with dependencies */ 
define(["jquery", "util"], 
       (function($,Util) {
       
              
    var loadFile = function(fileInputID,progBarID,onLoad) {  
      
      this.file = $("#"+fileInputId).files[0];
      if(this.file) {
        getAsText(this.file);
      };
      
      this.onLoad = onLoad;
      
    }

  
    loadFile.protoype. getAsText = function(readFile) {
            
      var reader = new FileReader();
      
      // Read file into memory as UTF-16      
      reader.readAsText(readFile, "UTF-16");
      
      // Handle progress, success, and errors
      reader.onprogress = updateProgress;
      reader.onload = loaded;
      reader.onerror = errorHandler;
    }

    var updateProgress = function(evt) {
      if (evt.lengthComputable) {
        // evt.loaded and evt.total are ProgressEvent properties
        var loaded = (evt.loaded / evt.total);
        if (loaded < 1) {
          // Increase the prog bar length
          // style.width = (loaded * 200) + "px";
        }
      }
    }

    var loaded = function(evt) {  
      // Obtain the read file data    
      var fileString = evt.target.result;
      
    }

    var errorHandler = function(evt) {
      if(evt.target.error.name == "NotReadableErr") {
        throw new Util.RuntimeError("could not read file!"); 
      };
    }:
        
    // module only exports loadFile
    return loadFile
        
})); // define

    
