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
    createPlane();
    createSea();
    createSky();

    // add the mouse listener
    document.addEventListener('mousemove', handleMouseMove, false);

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
    //scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

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



/* Set up the sea
********************************************/

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


/*
To create and object
1. create a geometry
2. create a material
3. pass them into a mesh
4. add the mesh to our scene
********************************************/




/* Set up the clouds
********************************************/

Cloud = function(){
    // create an empty container that will hold the parts of the cloud
    this.mesh = new THREE.Object3D();

    // create a cube geometry (will be duplicated to create the cloud)
    var geom = new THREE.BoxGeometry(20,20,20);

    // create a material
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.white,
    });

    // duplicate the geom a random number of times
    var nBlocs = 3+Math.floor(Math.random() * 3);
    for(var i = 0; i<nBlocs; i++){

        // create the mesh by cloning the geom
        var m = new THREE.Mesh(geom, mat);

        // set a random pos & rot
        m.position.x = i*15;
        m.position.y = Math.random()*10;
        m.position.z = Math.random()*10;
        m.rotation.z = Math.random() * Math.PI*2;
        m.rotation.y = Math.random() * Math.PI*2;

        // set the size random (.1 - 1)
        var s = .1 + Math.random() * .9;
        m.scale.set(s,s,s);

        // allow each cube to cast and receive shadow
        m.castShadow = true;
        m.receiveShadow = true;

        // add to the container
        this.mesh.add(m);
    }
}

// create the sky with 20 clouds at a random z-position
Sky = function(){
    this.mesh = new THREE.Object3D();

    // number of clouds
    this.nClouds = 20;

    // To distribute the clouds consistently,
    // we need to place them according to an uniform angle
    var stepAngle = Math.PI*2 / this.nClouds;

    // create the clouds
    for(var i = 0; i<this.nClouds; i++){
        var c = new Cloud();

        // set the rotation & position of each cloud;
        var a = stepAngle*i; // this is the final angle of the cloud
        var h = 750 + Math.random()*200; // this is the distance between the center of the axis and the cloud itself
        // Trigonometry!!! I hope you remember what you've learned in Math :)
		// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
		c.mesh.position.y = Math.sin(a)*h;
        c.mesh.position.x = Math.cos(a)*h;
        
        // rotate the cloud according to its position
        c.mesh.rotation.z = a + Math.PI/2;

        // position the cloud on a different depths of field
        c.mesh.position.z = -400-Math.random()*400;

        // set a random scale
        var s = 1+Math.random()*2;
        c.mesh.scale.set(s,s,s);
        
        // add the mesh to the container
        this.mesh.add(c.mesh);

    }
}

// Now we instantiate the sky and push its center a bit
// towards the bottom of the screen

var sky;

function createSky(){
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}



/* Plane
********************************************/

var AirPlane = function(){
    this.mesh = new THREE.Object3D();

    // cockpit
    var geomCockpit = new THREE.BoxGeometry(60,50,50,1,1,1);
    var matCockpit = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true
    });
    var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // engine
    var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
    var matEngine = new THREE.MeshPhongMaterial({
        color: Colors.white, 
        flatShading: true
    });
    var engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // tail
    var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
    var matTailPlane = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true,
    });
    var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-35,25,0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow= true;
    this.mesh.add(tailPlane); 

    // wing
    var geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
    var matSideWing = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true
    });
    var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    // NB: we are linking the propeller and the blades for the animation later (rotate the propeller will rotate the blade auto)
    // propeller
    var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
    var matPropeller = new THREE.MeshPhongMaterial({
        color: Colors.brown,
        flatShading: true
    });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    // blades
    var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
    var matBlade = new THREE.MeshPhongMaterial({
        color: Colors.brownDark,
        flatShading: true
    });
    var blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(8,0,0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    this.propeller.add(blade);
    this.propeller.position.set(50,0,0);
    this.mesh.add(this.propeller);
}



var airplane;

function createPlane(){
    airplane = new AirPlane();
    airplane.mesh.scale.set(.25, .25, .25);
    airplane.mesh.position.y = 100;
    scene.add(airplane.mesh);
}


/* Mouse Move Handler
********************************************/

var mousePos = {
    x:0,
    y: 0
}

function handleMouseMove(e){
    // convert the mouse pos to a normalized value between -1 and 1
    var tx = -1 + (e.clientX / WIDTH) * 2;
    // for the y axis we need to inverse the formula because the 2D y-axis goes the opposite direction of the 3D y-axis
    var ty = 1 - (e.clientY / HEIGHT) * 2;
    mousePos = {
        x: tx,
        y: ty
    };
    console.log(mousePos);
}


/* Loop animation
********************************************/
function loop(){
    // rotate the propeller
    //airplane.propeller.rotation.x += .3;
    
    // update the plane on each frame
    updatePlane();
    
    // rotate the sea
    sea.mesh.rotation.z += .005
    //rotate the sky
    sky.mesh.rotation.z += .01;

    //render
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

function updatePlane(){
    // move the airplane between -100 & 100 on the horizontal axis,
    // and between 25 and 175 on the y
    // we will use a normalize function to achieve that

    var targetX = normalize(mousePos.x, -1, 1, -100, 100);
    var targetY = normalize(mousePos.y, -1, 1, 25, 175);

    // update the airplane position
    airplane.mesh.position.y = targetY;
    airplane.mesh.position.x = targetX;
    airplane.propeller.rotation.x += .3;
}

// Normalize function 
function normalize(v, vmin, vmax, tmin, tmax){
    // 
    var nv = Math.max(Math.min(v, vmax), vmin);
    //
    var dv = vmax - vmin;
    // 
    var pc = (nv - vmin)/dv;
    //
    var dt = tmax-tmin;
    //
    var tv = tmin + (pc*dt);
    return tv;
}