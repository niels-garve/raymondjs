# RaymondJS

RaymondJS is a realtime pathtracing (basically a raytracing) engine that runs on GPU. It is based on WebGL and [three.js](https://github.com/mrdoob/three.js/) so you can use it on your website as described [below](#user-content-for-users---the-window-api). I'm currently working on a **headless** version (with no canvas) that runs on Node.js. The RaymondJS server will generate pixel arrays and **streams** them (encoded or not?) to its clients in the hope to increase performance.

Once the streaming engine is set up correctly, I will try to implement a distributed engine: many RaymondJS instances (somehow connected via websockets) could render small parts of the same scene, which could once again increase performance.

# For users - the ```window```-API

## Constructor

### ```Raymond()```
This constructor sets the following properties:

- ```context``` This is the webgl context (optional)
- ```canvas``` This is the canvas (optional, RaymondJS will create one and, for now, append it to ```<body>```)

## Methods

### ```.render()```
Draws the result of the first bunch of rays on the ```canvas```

### ```.setRenderCallback( callback )```

- ```callback``` This function gets called at the beginning of a render pass

### ```.setControls( controls )```

- ```controls``` This is the camera manipulating object

### ```.getCamera()```
Returns a camera of type ```THREE.Camera```. This could be usefull to initialize your controls

### ```.resetSampleCounter()```
This method resets the sample counter to zero, which tells the engine to ignore the result of former rays and restart the blending process. This is especially interessting on camera movements.

## For developers - upcoming features
The scene definition is currently hard coded. The next step will be to provide one or more setter methods allowing to render different scenes. I think the OBJ format is good enough to kick things off. But still, providing a scene API is quite challenging for I have to load different parts of shader code depending on what's given in the scene definition. So I think putting OBJ definitions into one JSON file would do a good job. I'll start a discussion in time.

## Developing
First run ```$ npm install```.

```$ gulp js``` will bundle the node modules and place one minified javascript-file and a seperate sourcemaps-file into the ```client/server``` folder. With ```$ gulp connect``` you'll start a small local webserver pointing to ```client```.

You could also just execute: ```$ browserify --standalone Raymond -t brfs server/engine.js > client/bundle.js``` to bundle the application.
