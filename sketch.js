//https://editor.p5js.org/howshekilledit/sketches/P00w6cEmL
let piano_init = false;

//default function plays note on keypress

function triggerNote(note, midi = true) {
    if (piano_init == false) {
        Tone.start();
        console.log('start');
        piano_init = true;
    }
    //you can add your own functionality here.

    //displays note name in browser (you can remove this line)
    document.getElementById('txt').innerText = note.name + note.octave;

    //play note using appropriate function given input type
    if (midi) { //midi keyboard input
        try {
            playNote(note.name + note.octave);
        } catch { }
    } else { //regular keyboard input
        synth.triggerAttack(note.name + note.octave);
    }


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

//initalize keys for regular keyboard
let keynotes = [];
keynotes[68] = { name: 'C', octave: '4', number: 60 }
keynotes[70] = { name: 'D', octave: '4', number: 62 }
keynotes[71] = { name: 'E', octave: '4', number: 64 }
keynotes[72] = { name: 'F', octave: '4', number: 65 }
keynotes[74] = { name: 'G', octave: '4', number: 67 }
keynotes[75] = { name: 'A', octave: '4', number: 69 }
keynotes[76] = { name: 'B', octave: '4', number: 71 }
keynotes[186] = { name: 'C', octave: '5', number: 72 }

document.getElementById('renderCanvas').onclick = function () {
    Tone.start(); //inititializes tones to play
    document.getElementById('txt').innerText = '';
};

//outputs code to console and plays note when key is pressed
function keyPressed() {
    console.log(keyCode);
    triggerNote(keynotes[keyCode], false);
}
function keyReleased() {
    console.log(keyCode);
    stopNote(keynotes[keyCode]);
}


function setup() {
    noLoop();
    //color background white
    scene.clearColor = new BABYLON.Color3.FromHexString('#ffffff');

    //initialize camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    //initialize light
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;


    synth = new Tone.PolySynth(Tone.MonoSynth, {
        volume: -8,
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
        var inputSoftware = WebMidi.inputs[0];
        //The 0 value is the first value in the array
        //Meaning that we are going to use the first MIDI input we see
        //This can be changed to a different number,
        //or given a string to select a specific port
        inputSoftware.addListener("noteoff", "all", function (e) {
            console.log('stop');
            stopNote(e.note);
        });
        ///
        //listen to all incoming "note on" input events from MIDI input
        inputSoftware.addListener("noteon", "all", function (e) {
            triggerNote(e.note); //
        });

        //The note off functionality will need its own event listener
        //You don't need to pair every single note on with a note off


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
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);
    return scene;
}
window.initFunction = async function () {


    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();
};
initFunction().then(() => {
    sceneToRender = scene
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
