/* Color palette
********************************************/
var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};


/* Init
********************************************/
window.addEventListener('load', init, false);

function init(){
    // setup the scene, camera and renderer
    createScene();

    // add the lights
    createLights();

    // add the objects
    //createPlane();
    createSea();
    createSphere();
    //createSky();
    // start a loop to update the objects
    // and render the scene on each time
    loop();
}


var scene,
    camera,
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
    HEIGHT,
    WIDTH,
    renderer,
    container;

function createScene(){
    // Get the H & W of the window
    // Use those for the ratio of the camera & the renderer size

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // create the scene
    scene = new THREE.Scene();

    // Add a fog effect to the scene
    scene.fog = new THREE.Fog(0xff0000, 100, 950);

    // Create the camera
    aspectRatio = WIDTH/HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 1000;

    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );

    // Set the position of the camera
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 100;

    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        // Allow transparency to show the gradient background from CSS
        alpha: true,

        // Activate the anti-aliasing; less performant but it's ok
        antialias: true
    });

    // Define the size of the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // Enable shadow rendering
    renderer.shadowMap.enabled = true;

    // Add the DOM element
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    // Listen to the screen, resize to update the camera & renderer
    window.addEventListener('resize', handleWindowResize, false);

}

function handleWindowResize(){
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix;
    console.log('handleWindowResize');
}


/* Set up the lights
********************************************/

var hemisphereLight,
    shadowLight;

function createLights(){
    // Hemisphere light is a gradient colored light
    // (sky color, ground color, intensity of light)
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

    // Directional light shines from a specific direction (like the sun)
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // set the direction of the light
    shadowLight.position.set(150,350,350);

    // Allow shadow casting
    shadowLight.castShadow = true;

    // define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    
    // define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

Sea = function(){
    // create the cylinder
    // (radius top, radius bottom, h, segments of the radius, number of segments 
    var geom = new THREE.CylinderGeometry(600,600,800,40,10);

    //rotate the geom on the x axis
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

    // create the material
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.blue,
        transparent: true,
        opacity: .6,
        flatShading: true
    });

    // to create an object in Three.js we need to create a mesh
    // which is a combinaison of a geometry and some material
    this.mesh = new THREE.Mesh(geom, mat);

    // Allow the see to receive shadows
    this.mesh.receiveShadow = true;
}

// Instantiate the sea and add it to the scene

var sea;

function createSea(){
    sea = new Sea();
    sea.mesh.position.y = -600;
    scene.add(sea.mesh);
}

Sphere = function(){
    var geom = new THREE.SphereGeometry(50, 320, 320);

    var mat = new THREE.MeshBasicMaterial({
        color: Colors.red,
        opacity: 1,
        flatShading: true,
        transparent: true
    });

    this.mesh = new THREE.Mesh(geom, mat);

    this.mesh.castShadow = true;
}

var sphere;

function createSphere(){
    sphere = new Sphere();
    sphere.mesh.position.y = 100;
    scene.add(sphere.mesh);
}


/*
To create and object
1. create a geometry
2. create a material
3. pass them into a mesh
4. add the mesh to our scene
********************************************/




/* Loop
********************************************/
function loop(){
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}