// Inicializa o contexto do Tone.js
Tone.start();

var mousedown = false;
var oscillator = new Tone.Oscillator().toDestination();
var isReverbActive = false;

var reverb = new Tone.Reverb().toDestination();
var gainNode = new Tone.Gain();
oscillator.connect(gainNode);


const kickSampler = new Tone.Sampler({
    C4: './samples/kick.wav'
}).toDestination();
const snareSampler = new Tone.Sampler({
    C4: './samples/snare.wav'
}).toDestination();
const hi_hatSampler = new Tone.Sampler({
    C4: './samples/hi-hat.wav'
}).toDestination();
const clapSampler = new Tone.Sampler({
    C4: './samples/clap.wav'
}).toDestination();
const tomSampler = new Tone.Sampler({
    C4: './samples/tom.wav'
}).toDestination();
const digital_tomSampler = new Tone.Sampler({
    C4: './samples/digital-tom.wav'
}).toDestination();


var reverbBTN = document.getElementById('reverb-btn');
const circle = document.getElementById('circle');
const kickBTN = document.getElementById('kick-btn');
const snareBTN = document.getElementById('snare-btn');
const hi_hatBTN = document.getElementById('hi_hat-btn');
const clapBTN = document.getElementById('clap-btn');
const tomBTN = document.getElementById('tom-btn');
const digital_tomBTN = document.getElementById('digital_tom-btn');


kickBTN.addEventListener('click', function() {
    kickSampler.triggerAttack('C4');
});

snareBTN.addEventListener('click', function() {
    snareSampler.triggerAttack('C4');
});

hi_hatBTN.addEventListener('click', function() {
    hi_hatSampler.triggerAttack('C4');
});

clapBTN.addEventListener('click', function() {
    clapSampler.triggerAttack('C4');
});

tomBTN.addEventListener('click', function(){
    tomSampler.triggerAttack('C4');
});

digital_tomBTN.addEventListener('click', function() {
    digital_tomSampler.triggerAttack('C4');
});

reverbBTN.addEventListener("click", function(e) {
    isReverbActive = !isReverbActive;
    console.log(isReverbActive);

    if (isReverbActive) {
        oscillator.disconnect();
        oscillator.connect(gainNode);
        gainNode.connect(reverb);
        reverb.toDestination();
    } else {
        reverb.disconnect();
        oscillator.disconnect();
        oscillator.connect(gainNode);
        gainNode.toDestination();
    }
});

circle.addEventListener('mousedown', function (e) {
    if (mousedown) return;

    oscillator.frequency.value = calculateFrequency(e.clientX, circle);
    gainNode.gain.value = calculateGain(e.clientY, circle);

    oscillator.start();
    mousedown = true;
});

circle.addEventListener('mouseup', function() {
    if (mousedown) {
        oscillator.stop();
        mousedown = false;
    }
});

circle.addEventListener('mousemove', function (e) {
    if (mousedown) {
        oscillator.frequency.value = calculateFrequency(e.clientX, circle);
        gainNode.gain.value = calculateGain(e.clientY, circle);
    }
});

function calculateFrequency(mouseXPosition, circle) {
    var minFrequency = 20,
        maxFrequency = 2000;
    
    // dimensões do círculo
    var circleRect = circle.getBoundingClientRect();
    var circleWidth = circleRect.width;
    var circleLeft = circleRect.left;

    // posição relativa do rato dentro do círculo
    var relativeX = mouseXPosition - circleLeft;
    
    // o rato está dentro do círculo
    if (relativeX >= 0 && relativeX <= circleWidth) {
        //mapear o rato para uma frequência dentro do círculo
        return ((relativeX / circleWidth) * maxFrequency) + minFrequency;
    } else {
        // fora do círculo
        return -1;
    }
}

function calculateGain(mouseYPosition, circle) {
    var minGain = 0,
        maxGain = 1;
    
    // dimensões do círculo
    var circleRect = circle.getBoundingClientRect();
    var circleHeight = circleRect.height;
    var circleTop = circleRect.top;

    // posição relativa do mouse dentro do círculo
    var relativeY = mouseYPosition - circleTop;
    
    //o rato está dentro do círculo
    if (relativeY >= 0 && relativeY <= circleHeight) {
        // mapear o rato para um ganho dentro do círculo
        return 1 - (relativeY / circleHeight) * maxGain;
    } else {
        // fora do circulo
        return minGain;
    }
}
