# RaymondJS

RaymondJS is a realtime pathtracing (basically raytracing) engine that runs on GPU via WebGL. I'm currently working on a headless version (no canvas) that runs on Node.js and streams its generated pixel arrays to clients in the hope of increasing performance.

At present the engine is based on THREE.js which works fine on browsers. 

Once the streaming engine is set up correctly, I dream of a distributed backend implementation: many RaymondJS instances could render small parts of the same scene (somehow connected via websockets), which should further increase performance.

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

## Developing
At first run ```npm install``` and ```bower install```, then run ```gulp``` to see a small debug page.

## Build process

Since the engine is based on requirejs I'm using the r.js optimizer with AlmondJS to export a public API to ```window```. The command ```r.js -o build.js``` gets called from within a gulp task:

```gulp build```
