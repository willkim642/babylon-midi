//https://editor.p5js.org/howshekilledit/sketches/P00w6cEmL


let ctrls = {
    //texture beneath water
    seafloor:"https://d37zoqglehb9o7.cloudfront.net/uploads/2020/04/oehlen_1999_sohnvonhundescheisse_1-scaled.jpg",
    clr1: {r:25, g:85, b:122}, //color 1
    clr2:{ r:200, g:50, b:80}, //color 2
    d_range: {min: 1, max:10}, //range of sphere diameters
    explode_factor: 0.1, //explode distance
    light_intensity: 2
    
}


let explode_meshes = [];
let water; 
let synth;
let piano_init = false; 


function triggerNote(note) {
    
    if(piano_init == false){
        Tone.start();
        console.log('start');
        piano_init = true; 
    }

    //create sphere and position based on note and random values
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: random(ctrls.d_range.min, ctrls.d_range.max), segments: 32 }, scene);
    sphere.position.x = note.number - 65;
    sphere.position.y = Math.ceil(Math.random() * 10) - 5;
    sphere.position.z = Math.ceil(Math.random() * 10) - 5;

    //assign shere a color from between clr1 and clr2
    var mat = new BABYLON.StandardMaterial("myMaterial", scene);
    let clr1 = color(ctrls.clr1.r, ctrls.clr1.g, ctrls.clr1.b);
    let clr2 = color(ctrls.clr2.r, ctrls.clr2.g, ctrls.clr2.b);
    let clr = lerpColor(clr1, clr2, random())
    console.log(clr);
    mat.diffuseColor = new BABYLON.Color3(clr._array[0], clr._array[1], clr._array[2]);
    sphere.material = mat; 

    //add sphere to exploder and water reflection 
    explode_meshes.push(sphere);
    water.addToRenderList(sphere);

    //play note
    synth.triggerAttack(note.name + note.octave);

    //Show what we are receiving
    console.log(
        "Received 'noteon' message (" +
        note.name +
        note.octave +
        ") " +
        note.number +
        "."
    );
}

function stopNote(note) {
    //stop note
    synth.triggerRelease(note.name + note.octave);
    //run exploder
    var newExplosion = new BABYLON.MeshExploder(explode_meshes);
    newExplosion.explode(ctrls.explode_factor);
    //Show what we are receiving
    console.log(
        "Received 'noteoff' message (" +
        note.name +
        note.octave +
        ") " +
        note.number +
        "."
    );
}

//initalize keys for keyboard
let keynotes = [];
keynotes[68] = {name:'C', octave:'4', number:60}
keynotes[70] = {name:'D', octave:'4', number:62}
keynotes[71] = {name:'E', octave:'4', number:64}
keynotes[72] = {name:'F', octave:'4', number:65}
keynotes[74] = {name:'G', octave:'4', number: 67}
keynotes[75] = {name:'A', octave:'4', number: 69}
keynotes[76] = {name:'B', octave:'4', number:71}
keynotes[186] = {name:'C', octave:'5', number:72}

document.getElementById('renderCanvas').onclick = function () {
    Tone.start();
    document.getElementById('start').style.display = 'none';

};

function keyPressed() {
    console.log(keyCode); 
    //playNote(keyCode);
    triggerNote(keynotes[keyCode]);
  }
  function keyReleased() {
    console.log(keyCode); 
    stopNote(keynotes[keyCode]);
  }
function setup(){
noLoop(); 
  
synth = new Tone.PolySynth(Tone.MonoSynth, {
    volume:-8,
    oscillator: {
        type: "square8"
    },
    envelope: {
        attack: 0.05,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8,
    },
    filterEnvelope: {
        attack: 0.001,
        decay: 0.7,
        sustain: 0.1,
        release: 0.8,
        baseFrequency: 300,
        octaves: 4
    }
}).toDestination();
////
//Setting up MIDI
////
WebMidi.enable(function (err) {
    //check if WebMidi.js is enabled


    if (err) {
        console.log("WebMidi could not be enabled.", err);
    } else {
        console.log("WebMidi enabled!");
    }

    //name our visible MIDI input and output ports
    console.log("---");
    console.log("Inputs Ports: ");
    for (i = 0; i < WebMidi.inputs.length; i++) {
        console.log(i + ": " + WebMidi.inputs[i].name);
    }

    console.log("---");
    console.log("Output Ports: ");
    for (i = 0; i < WebMidi.outputs.length; i++) {
        console.log(i + ": " + WebMidi.outputs[i].name);
    }

    //Choose an input port
    inputSoftware = WebMidi.inputs[0];
    //The 0 value is the first value in the array
    //Meaning that we are going to use the first MIDI input we see
    //This can be changed to a different number,
    //or given a string to select a specific port

    ///
    //listen to all incoming "note on" input events
    inputSoftware.addListener("noteon", "all", function (e) {// Our built-in 'sphere' shape.
        triggerNote(e.note);
    });

    //The note off functionality will need its own event listener
    //You don't need to pair every single note on with a note off

    inputSoftware.addListener("noteoff", "all", function (e) {
        stopNote(e.note);
    });
    //
    //end of MIDI setup
    //
});
}

//setting up babylon scene
   
var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = ctrls.light_intensity; 
    
    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
            
    // Ground
    var groundTexture = new BABYLON.Texture(ctrls.seafloor, scene);
    groundTexture.vScale = groundTexture.uScale = 4.0;
    
    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = groundTexture;
    
    var ground = BABYLON.Mesh.CreateGround("ground", 512, 512, 32, scene, false);
    ground.position.y = -1;
    ground.material = groundMaterial;
        
    // Water
    var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);
    water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
    water.backFaceCulling = true;
    water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);
    water.windForce = -5;
    water.waveHeight = 0.5;
    water.bumpHeight = 0.1;
    water.waveLength = 0.1;
    water.colorBlendFactor = 0;
    water.addToRenderList(skybox);
    water.addToRenderList(ground);
    waterMesh.material = water;

    return scene;
}
        window.initFunction = async function() {
            
            
            var asyncEngineCreation = async function() {
                try {
                return createDefaultEngine();
                } catch(e) {
                console.log("the available createEngine function failed. Creating the default engine instead");
                return createDefaultEngine();
                }
            }

            window.engine = await asyncEngineCreation();
if (!engine) throw 'engine should not be null.';
startRenderLoop(engine, canvas);
window.scene = createScene();};
initFunction().then(() => {sceneToRender = scene                    
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
