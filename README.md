# RaymondJS

Given an html5 ```canvas``` RaymondJS provides an API to run a realtime pathtracing engine with webGL.

## For users - the API

### ```drawFirstFrame```
Draws the result of the first bunch of rays on the ```canvas```

### ```start```
Starts the animation. Now you can interact by holding the mouse button down and move. The longer you don't the better gets the image quality. That's because the engine continously compensates calculation errors that are necessarily needed to drive it in realtime.

### ```stop```
Stops the animation

### ```resume```
Resumes the animation

## For developers - upcoming features
The scene definition is currently hard coded. The next step will be to provide one or more setter methods allowing to render different scenes. I think the OBJ format is good to kick things off. But still, providing a scene API is quite a challenge because I or we (feel free to contribute :)) have to load different parts of shader code depending on what's given in the scene definition. So I think putting OBJ definitions into one JSON file would do a good job. I'll start a discussion in time.

## Build process

Since the engine is based on requirejs I'm using the r.js optimizer with AlmondJS to export a public API to ```window```. So simply run:

```r.js -o build.js```
