Tone.start();

// To prevent the context menu
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// Animate the canvas color change when clicking
function AnimateCanvas() {
  var c = document.getElementById("c");
  var ctx = c.getContext("2d");
  var cH;
  var cW;
  var bgColor = "#FF6138";
  var animations = [];
  var circles = [];

  var colorPicker = (function () {
    //laranja, amarelo,  azul claro, azul lig. escuro
    var colors = ["#FF6138", "#FFBE53", "#2980B9", "#282741"]; //282741
    var index = 0;
    function next() {
      index = index++ < colors.length - 1 ? index : 0;
      return colors[index];
    }
    function current() {
      return colors[index];
    }
    return {
      next: next,
      current: current,
    };
  })();

  function removeAnimation(animation) {
    var index = animations.indexOf(animation);
    if (index > -1) animations.splice(index, 1);
  }

  function calcPageFillRadius(x, y) {
    var l = Math.max(x - 0, cW - x);
    var h = Math.max(y - 0, cH - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
  }

  function addClickListeners() {
    kickBTN.addEventListener("touchstart", handleEvent);
    kickBTN.addEventListener("mousedown", handleEvent);
    snareBTN.addEventListener("touchstart", handleEvent);
    snareBTN.addEventListener("mousedown", handleEvent);
    hi_hatBTN.addEventListener("touchstart", handleEvent);
    hi_hatBTN.addEventListener("mousedown", handleEvent);
    clapBTN.addEventListener("touchstart", handleEvent);
    clapBTN.addEventListener("mousedown", handleEvent);
    tomBTN.addEventListener("touchstart", handleEvent);
    tomBTN.addEventListener("mousedown", handleEvent);
    digital_tomBTN.addEventListener("touchstart", handleEvent);
    digital_tomBTN.addEventListener("mousedown", handleEvent);

    profile1BTN.addEventListener("touchstart", handleEvent);
    profile1BTN.addEventListener("mousedown", handleEvent);
    profile2BTN.addEventListener("touchstart", handleEvent);
    profile2BTN.addEventListener("mousedown", handleEvent);
  }

  function handleEvent(e) {
    if (e.touches) {
      e.preventDefault();
      e = e.touches[0];
    }
    var currentColor = colorPicker.current();
    var nextColor = colorPicker.next();
    var targetR = calcPageFillRadius(e.pageX, e.pageY);
    var rippleSize = Math.min(200, cW * 0.4);
    var minCoverDuration = 750;

    var pageFill = new Circle({
      x: e.pageX,
      y: e.pageY,
      r: 0,
      fill: nextColor,
    });
    var fillAnimation = anime({
      targets: pageFill,
      r: targetR,
      duration: Math.max(targetR / 2, minCoverDuration),
      easing: "easeOutQuart",
      complete: function () {
        bgColor = pageFill.fill;
        removeAnimation(fillAnimation);
      },
    });

    var ripple = new Circle({
      x: e.pageX,
      y: e.pageY,
      r: 0,
      fill: currentColor,
      stroke: {
        width: 3,
        color: currentColor,
      },
      opacity: 1,
    });
    var rippleAnimation = anime({
      targets: ripple,
      r: rippleSize,
      opacity: 0,
      easing: "easeOutExpo",
      duration: 900,
      complete: removeAnimation,
    });

    var particles = [];
    for (var i = 0; i < 32; i++) {
      var particle = new Circle({
        x: e.pageX,
        y: e.pageY,
        fill: currentColor,
        r: anime.random(24, 48),
      });
      particles.push(particle);
    }
    var particlesAnimation = anime({
      targets: particles,
      x: function (particle) {
        return particle.x + anime.random(rippleSize, -rippleSize);
      },
      y: function (particle) {
        return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
      },
      r: 0,
      easing: "easeOutExpo",
      duration: anime.random(1000, 1300),
      complete: removeAnimation,
    });
    animations.push(fillAnimation, rippleAnimation, particlesAnimation);
  }

  function extend(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }

  var Circle = function (opts) {
    extend(this, opts);
  };

  Circle.prototype.draw = function () {
    ctx.globalAlpha = this.opacity || 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    if (this.stroke) {
      ctx.strokeStyle = this.stroke.color;
      ctx.lineWidth = this.stroke.width;
      ctx.stroke();
    }
    if (this.fill) {
      ctx.fillStyle = this.fill;
      ctx.fill();
    }
    ctx.closePath();
    ctx.globalAlpha = 1;
  };

  var animate = anime({
    duration: Infinity,
    update: function () {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cW, cH);
      animations.forEach(function (anim) {
        anim.animatables.forEach(function (animatable) {
          animatable.target.draw();
        });
      });
    },
  });

  var resizeCanvas = function () {
    cW = window.innerWidth;
    cH = window.innerHeight;
    c.width = cW * devicePixelRatio;
    c.height = cH * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  };

  (function init() {
    resizeCanvas();
    if (window.CP) {
      // CodePen's loop detection was causin' problems
      // and I have no idea why, so...
      window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;
    }
    window.addEventListener("resize", resizeCanvas);
    addClickListeners();
    if (!!window.location.pathname.match(/fullcpgrid/)) {
      startFauxClicking();
    }
    handleInactiveUser();
  })();

  function handleInactiveUser() {
    var inactive = setTimeout(function () {
      fauxClick(cW / 2, cH / 2);
    }, 2000);

    function clearInactiveTimeout() {
      clearTimeout(inactive);
      document.removeEventListener("mousedown", clearInactiveTimeout);
      document.removeEventListener("touchstart", clearInactiveTimeout);
    }

    document.addEventListener("mousedown", clearInactiveTimeout);
    document.addEventListener("touchstart", clearInactiveTimeout);
  }

  function startFauxClicking() {
    setTimeout(function () {
      fauxClick(
        anime.random(cW * 0.2, cW * 0.8),
        anime.random(cH * 0.2, cH * 0.8)
      );
      startFauxClicking();
    }, anime.random(200, 900));
  }

  function fauxClick(x, y) {
    var fauxClick = new Event("mousedown");
    fauxClick.pageX = x;
    fauxClick.pageY = y;
    document.dispatchEvent(fauxClick);
  }
}

// Animate the effects when clicking buttons
function AnimateClick() {
  var canvasEl = document.querySelector(".c");
  var ctx = canvasEl.getContext("2d");
  var numberOfParticules = 30;
  var pointerX = 0;
  var pointerY = 0;
  // Careful - event listeners
  var tap =
    "ontouchstart" in window || navigator.msMaxTouchPoints
      ? "touchstart"
      : "mousedown";
  var colors = ["#FFD100", "#0074FF", "#1E305E", "#FF5D25", "#FFFFFF"];

  function setCanvasSize() {
    canvasEl.width = window.innerWidth * 2;
    canvasEl.height = window.innerHeight * 2;
    canvasEl.style.width = window.innerWidth + "px";
    canvasEl.style.height = window.innerHeight + "px";
    canvasEl.getContext("2d").scale(2, 2);
  }

  function updateCoords(e) {
    pointerX = e.clientX || e.touches[0].clientX;
    pointerY = e.clientY || e.touches[0].clientY;
  }

  function setParticuleDirection(p) {
    var angle = (anime.random(0, 360) * Math.PI) / 180;
    var value = anime.random(50, 180);
    var radius = [-1, 1][anime.random(0, 1)] * value;
    return {
      x: p.x + radius * Math.cos(angle),
      y: p.y + radius * Math.sin(angle),
    };
  }

  function createParticule(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = colors[anime.random(0, colors.length - 1)];
    p.radius = anime.random(16, 32);
    p.endPos = setParticuleDirection(p);
    p.draw = function () {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = p.color;
      ctx.fill();
    };
    return p;
  }

  function createCircle(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = "#FFF";
    p.radius = 0.1;
    p.alpha = 0.5;
    p.lineWidth = 6;
    p.draw = function () {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.lineWidth = p.lineWidth;
      ctx.strokeStyle = p.color;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    return p;
  }

  function renderParticule(anim) {
    for (var i = 0; i < anim.animatables.length; i++) {
      anim.animatables[i].target.draw();
    }
  }

  function animateParticules(x, y) {
    var circle = createCircle(x, y);
    var particules = [];
    for (var i = 0; i < numberOfParticules; i++) {
      particules.push(createParticule(x, y));
    }
    anime
      .timeline()
      .add({
        targets: particules,
        x: function (p) {
          return p.endPos.x;
        },
        y: function (p) {
          return p.endPos.y;
        },
        radius: 0.1,
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule,
      })
      .add({
        targets: circle,
        radius: anime.random(80, 160),
        lineWidth: 0,
        alpha: {
          value: 0,
          easing: "linear",
          duration: anime.random(600, 800),
        },
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule,
        offset: 0,
      });
  }

  var render = anime({
    duration: Infinity,
    update: function () {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    },
  });

  function handleFXButtonClick(e) {
    window.human = true;
    render.play();
    updateCoords(e);
    animateParticules(pointerX, pointerY);
  }

  reverbBTN.addEventListener(tap, handleFXButtonClick, false);
  distortionBTN.addEventListener(tap, handleFXButtonClick, false);
  crusherBTN.addEventListener(tap, handleFXButtonClick, false);
  tremoloBTN.addEventListener(tap, handleFXButtonClick, false);

  var centerX = window.innerWidth / 2;
  var centerY = window.innerHeight / 2;

  function autoClick() {
    if (window.human) return;
    animateParticules(
      anime.random(centerX - 50, centerX + 50),
      anime.random(centerY - 50, centerY + 50)
    );
    anime({ duration: 200 }).finished.then(autoClick);
  }

  autoClick();
  setCanvasSize();
  window.addEventListener("resize", setCanvasSize, false);
}

// Animate the drag in the left circle
function AnimateDragLeft() {
  var canvasEl = document.querySelector(".transparent-c-left");
  var ctx = canvasEl.getContext("2d");
  var numberOfParticules = 1;
  var pointerX = 0;
  var pointerY = 0;
  var tap =
    "ontouchstart" in window || navigator.msMaxTouchPoints
      ? "touchstart"
      : "touchmove";
  var colors = ["#FFD100", "#0074FF", "#1E305E", "#FF5D25", "#FFFFFF"];

  function setCanvasSize() {
    canvasEl.width = window.innerWidth * 2;
    canvasEl.height = window.innerHeight * 2;
    canvasEl.style.width = window.innerWidth + "px";
    canvasEl.style.height = window.innerHeight + "px";
    canvasEl.getContext("2d").scale(2, 2);
  }

  function updateCoords(e) {
    pointerX = e.clientX || e.touches[0].clientX;
    pointerY = e.clientY || e.touches[0].clientY;
  }

  function setParticuleDirection(p) {
    var angle = (anime.random(0, 360) * Math.PI) / 180;
    var value = anime.random(50, 180);
    var radius = [-1, 1][anime.random(0, 1)] * value;
    return {
      x: p.x + radius * Math.cos(angle),
      y: p.y + radius * Math.sin(angle),
    };
  }

  function createParticule(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = colors[anime.random(0, colors.length - 1)];
    p.radius = anime.random(16, 32);
    p.endPos = setParticuleDirection(p);
    p.draw = function () {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = p.color;
      ctx.fill();
    };
    return p;
  }

  function createCircle(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = "#FFF";
    p.radius = 0.1;
    p.alpha = 0.5;
    p.lineWidth = 6;
    p.draw = function () {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.lineWidth = p.lineWidth;
      ctx.strokeStyle = p.color;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    return p;
  }

  function renderParticule(anim) {
    for (var i = 0; i < anim.animatables.length; i++) {
      anim.animatables[i].target.draw();
    }
  }

  function animateParticules(x, y) {
    var circle = createCircle(x, y);
    var particules = [];
    for (var i = 0; i < numberOfParticules; i++) {
      particules.push(createParticule(x, y));
    }
    anime
      .timeline()
      .add({
        targets: particules,
        x: function (p) {
          return p.endPos.x;
        },
        y: function (p) {
          return p.endPos.y;
        },
        radius: 0.1,
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule,
      })
      .add({
        targets: circle,
        radius: anime.random(80, 160),
        lineWidth: 0,
        alpha: {
          value: 0,
          easing: "linear",
          duration: anime.random(600, 800),
        },
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule,
        offset: 0,
      });
  }

  var render = anime({
    duration: Infinity,
    update: function () {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    },
  });

  function handleFXButtonClick(e) {
    window.human = true;
    render.play();
    updateCoords(e);
    animateParticules(pointerX, pointerY);
  }

  circle_left.addEventListener(tap, handleFXButtonClick, false);
  //circle_right.addEventListener(tap, handleFXButtonClick, false);

  var centerX = window.innerWidth / 2;
  var centerY = window.innerHeight / 2;

  function autoClick() {
    if (window.human) return;
    animateParticules(
      anime.random(centerX - 50, centerX + 50),
      anime.random(centerY - 50, centerY + 50)
    );
    anime({ duration: 200 }).finished.then(autoClick);
  }

  autoClick();
  setCanvasSize();
  window.addEventListener("resize", setCanvasSize, false);
}

// Animate the drag in the right circle
function AnimateDragRight() {
  var canvasEl = document.querySelector(".transparent-c-right");
  var ctx = canvasEl.getContext("2d");
  var numberOfParticules = 1;
  var pointerX = 0;
  var pointerY = 0;
  var tap =
    "ontouchstart" in window || navigator.msMaxTouchPoints
      ? "touchstart"
      : "touchmove";
  var colors = ["#FFD100", "#0074FF", "#1E305E", "#FF5D25", "#FFFFFF"];

  function setCanvasSize() {
    canvasEl.width = window.innerWidth * 2;
    canvasEl.height = window.innerHeight * 2;
    canvasEl.style.width = window.innerWidth + "px";
    canvasEl.style.height = window.innerHeight + "px";
    canvasEl.getContext("2d").scale(2, 2);
  }

  function updateCoords(e) {
    pointerX = e.clientX || e.touches[0].clientX;
    pointerY = e.clientY || e.touches[0].clientY;
  }

  function setParticuleDirection(p) {
    var angle = (anime.random(0, 360) * Math.PI) / 180;
    var value = anime.random(50, 180);
    var radius = [-1, 1][anime.random(0, 1)] * value;
    return {
      x: p.x + radius * Math.cos(angle),
      y: p.y + radius * Math.sin(angle),
    };
  }

  function createParticule(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = colors[anime.random(0, colors.length - 1)];
    p.radius = anime.random(16, 32);
    p.endPos = setParticuleDirection(p);
    p.draw = function () {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = p.color;
      ctx.fill();
    };
    return p;
  }

  function createCircle(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = "#FFF";
    p.radius = 0.1;
    p.alpha = 0.5;
    p.lineWidth = 6;
    p.draw = function () {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.lineWidth = p.lineWidth;
      ctx.strokeStyle = p.color;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    return p;
  }

  function renderParticule(anim) {
    for (var i = 0; i < anim.animatables.length; i++) {
      anim.animatables[i].target.draw();
    }
  }

  function animateParticules(x, y) {
    var circle = createCircle(x, y);
    var particules = [];
    for (var i = 0; i < numberOfParticules; i++) {
      particules.push(createParticule(x, y));
    }
    anime
      .timeline()
      .add({
        targets: particules,
        x: function (p) {
          return p.endPos.x;
        },
        y: function (p) {
          return p.endPos.y;
        },
        radius: 0.1,
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule,
      })
      .add({
        targets: circle,
        radius: anime.random(80, 160),
        lineWidth: 0,
        alpha: {
          value: 0,
          easing: "linear",
          duration: anime.random(600, 800),
        },
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule,
        offset: 0,
      });
  }

  var render = anime({
    duration: Infinity,
    update: function () {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    },
  });

  function handleFXButtonClick(e) {
    window.human = true;
    render.play();
    updateCoords(e);
    animateParticules(pointerX, pointerY);
  }

  // circle_left.addEventListener(tap, handleFXButtonClick, false);
  circle_right.addEventListener(tap, handleFXButtonClick, false);

  var centerX = window.innerWidth / 2;
  var centerY = window.innerHeight / 2;

  function autoClick() {
    if (window.human) return;
    animateParticules(
      anime.random(centerX - 50, centerX + 50),
      anime.random(centerY - 50, centerY + 50)
    );
    anime({ duration: 200 }).finished.then(autoClick);
  }

  autoClick();
  setCanvasSize();
  window.addEventListener("resize", setCanvasSize, false);
}

var mousedown = false;
var isReverbActive = false;
var isDistortionActive = false;
var isCrusherActive = false;
var isTremoloActive = false;

// Create oscilators
var oscillator = new Tone.Oscillator().toDestination();
var fat = new Tone.FatOscillator("A3", "sine", 40).toDestination();

// Create effect signal
var reverb = new Tone.Reverb().toDestination();
reverb.wet.value = 0.8;
var distortion = new Tone.Distortion(0.8).toDestination();
var crusher = new Tone.Phaser({
  frequency: 15,
  octaves: 5,
  baseFrequency: 1000,
}).toDestination();
var tremolo = new Tone.PingPongDelay("4n", 0.2).toDestination();

// regulate the sound with Gain Node
var gainNode = new Tone.Gain();
oscillator.volume.value = -15;
oscillator.connect(gainNode);
var gainNodeRight = new Tone.Gain();
fat.volume.value = -15;
fat.connect(gainNodeRight);

const kickSampler = new Tone.Sampler({
  C4: "./samples/kick.wav",
}).toDestination();
const snareSampler = new Tone.Sampler({
  C4: "./samples/snare.wav",
}).toDestination();
const hi_hatSampler = new Tone.Sampler({
  C4: "./samples/hi-hat.wav",
}).toDestination();
const clapSampler = new Tone.Sampler({
  C4: "./samples/clap.wav",
}).toDestination();
const tomSampler = new Tone.Sampler({
  C4: "./samples/tom.wav",
}).toDestination();
const digital_tomSampler = new Tone.Sampler({
  C4: "./samples/digital-tom.wav",
}).toDestination();
const crashSampler = new Tone.Sampler({
  C4: "./samples/crash.mp3",
}).toDestination();
const digital_cowbellSampler = new Tone.Sampler({
  C4: "./samples/digital-cowbell.wav",
}).toDestination();
const djembeSampler = new Tone.Sampler({
  C4: "./samples/djembe.wav",
}).toDestination();
const drum_sticksSampler = new Tone.Sampler({
  C4: "./samples/drum-sticks.mp3",
}).toDestination();
const digital_cowbell_2Sampler = new Tone.Sampler({
  C4: "./samples/digital-cowbell-2.wav",
}).toDestination();
const short_bassSampler = new Tone.Sampler({
  C4: "./samples/short-bass.wav",
}).toDestination();
const steel_drumSampler = new Tone.Sampler({
  C4: "./samples/steel-drum.wav",
}).toDestination();

// Get Elements for FX Button
var reverbBTN = document.getElementById("fx-left-btn1");
var distortionBTN = document.getElementById("fx-left-btn2");
var crusherBTN = document.getElementById("fx-right-btn1");
var tremoloBTN = document.getElementById("fx-right-btn2");

const fxButtons = [reverbBTN, distortionBTN, crusherBTN, tremoloBTN];
let activeEffect = null; // Active or Not Flag

// Get Elements for Circle
const circle_left = document.getElementById("circle-left");
const circle_right = document.getElementById("circle-right");

// Get Rythm Buttons
const kickBTN = document.getElementById("kick-btn");
const snareBTN = document.getElementById("snare-btn");
const hi_hatBTN = document.getElementById("hi_hat-btn");
const clapBTN = document.getElementById("clap-btn");
const tomBTN = document.getElementById("tom-btn");
const digital_tomBTN = document.getElementById("digital_tom-btn");

// Listeners for Rythm Buttons
let kickEventListener,
  snareEventListener,
  hi_hatEventListener,
  clapEventListener,
  tomEventListener,
  digitaltomEventListener = null;

// Get Profile Buttons
const profile1BTN = document.getElementById("profile-1-btn");
const profile2BTN = document.getElementById("profile-2-btn");
const profileButtons = document.querySelectorAll(".button-29");

let currentProfile = null;

// Add event listeners for the profile buttons -> probable errors in here
profile1BTN.addEventListener("click", function () {
  profile1BTN.classList.add("pressed");
  profile2BTN.classList.remove("pressed");
  setProfile(1);
});

profile2BTN.addEventListener("click", function () {
  profile2BTN.classList.add("pressed");
  profile1BTN.classList.remove("pressed");
  setProfile(2);
});


// Function to set the correct sound to the profile
function setProfile(profile) {
  // TouchStart -> Click (Depends on Touch or Mouse)
  if (currentProfile === profile) {
    return; // Nothing to do if a profile is selected
  }

  removeEventListeners();
  currentProfile = profile;

  if (profile === 1) {
    changeButtonColors(
      "kick-btn",
      "hi_hat-btn",
      "tom-btn",
      "linear-gradient(20deg, #3A86FF 0%, #8338EC 100%, #8338EC 100%)"
    );

    changeButtonColors(
      "clap-btn",
      "digital_tom-btn",
      "snare-btn",
      "linear-gradient(180deg, #3A86FF 0%, #00FF87 100%)"
    );

    changeIcons("kick-icon", 'kick-icon.png');

    console.log("profile 1");
    setEventListeners(
      kickSampler.triggerAttack.bind(kickSampler, "C4"),
      snareSampler.triggerAttack.bind(snareSampler, "C4"),
      hi_hatSampler.triggerAttack.bind(hi_hatSampler, "C4"),
      clapSampler.triggerAttack.bind(clapSampler, "C4"),
      tomSampler.triggerAttack.bind(tomSampler, "C4"),
      digital_tomSampler.triggerAttack.bind(digital_tomSampler, "C4")
    );
  } else if (profile === 2) {
    changeButtonColors(
      "kick-btn",
      "hi_hat-btn",
      "tom-btn",
      "linear-gradient(180deg, #8821E7 0%, #8A2BE2 100%)"
    );

    changeButtonColors(
      "clap-btn",
      "digital_tom-btn",
      "snare-btn",
      "linear-gradient(180deg, #FF6347 0%, #8A2BE2 100%)"
    );

    changeIcons("kick-icon", 'clap-icon.webp');

    console.log("profile 2");
    setEventListeners(
      crashSampler.triggerAttack.bind(crashSampler, "D4"),
      digital_cowbellSampler.triggerAttack.bind(digital_cowbellSampler, "C4"),
      digital_cowbell_2Sampler.triggerAttack.bind(
        digital_cowbell_2Sampler,
        "C4"
      ),
      djembeSampler.triggerAttack.bind(djembeSampler, "C4"),
      steel_drumSampler.triggerAttack.bind(steel_drumSampler, "C4"),
      short_bassSampler.triggerAttack.bind(short_bassSampler, "C4")
    );
  }
}

// Change icons
function changeIcons(iconID, filename){
  var iconElement = document.getElementById(iconID);
  iconElement.style.backgroundImage = "url('./img/" + filename + "')";
}
// Changes button colors
function changeButtonColors(btn1, btn2, btn3, color) {
  document.getElementById(btn1).style.background = color;
  document.getElementById(btn2).style.background = color;
  document.getElementById(btn3).style.background = color;
}
// Sets event listeners for the buttons
function setEventListeners(
  kickCallback,
  snareCallback,
  hiHatCallback,
  clapCallback,
  tomCallback,
  digitalTomCallback
) {
  kickEventListener = function () {
    kickCallback();
  };
  kickBTN.addEventListener("touchstart", kickEventListener);

  snareEventListener = function () {
    snareCallback();
  };
  snareBTN.addEventListener("touchstart", snareEventListener);

  hi_hatEventListener = function () {
    hiHatCallback();
  };
  hi_hatBTN.addEventListener("touchstart", hi_hatEventListener);

  clapEventListener = function () {
    clapCallback();
  };
  clapBTN.addEventListener("touchstart", clapEventListener);

  tomEventListener = function () {
    tomCallback();
  };
  tomBTN.addEventListener("touchstart", tomEventListener);

  digitaltomEventListener = function () {
    digitalTomCallback();
  };
  digital_tomBTN.addEventListener("touchstart", digitaltomEventListener);
}

function removeEventListeners() {
  if (kickEventListener) {
    kickBTN.removeEventListener("touchstart", kickEventListener);
  }
  if (snareEventListener) {
    snareBTN.removeEventListener("touchstart", snareEventListener);
  }
  if (hi_hatEventListener) {
    hi_hatBTN.removeEventListener("touchstart", hi_hatEventListener);
  }
  if (clapEventListener) {
    clapBTN.removeEventListener("touchstart", clapEventListener);
  }
  if (tomEventListener) {
    tomBTN.removeEventListener("touchstart", tomEventListener);
  }
  if (digitaltomEventListener) {
    digital_tomBTN.removeEventListener("touchstart", digitaltomEventListener);
  }
}

// Callout animations for the drags, click, etc...
AnimateDragLeft();
AnimateDragRight();
AnimateClick();
AnimateCanvas();

// Using anime.js to anime the slider
const fxSlider = interact(".slider-left");
fxSlider.draggable({
  origin: "self",
  inertia: true,
  modifiers: [
    interact.modifiers.restrict({
      restriction: "self",
    }),
  ],
  listeners: {
    move(event) {
      const sliderWidth = interact.getElementRect(event.target).width;
      const value = event.pageX / sliderWidth;

      event.target.style.paddingLeft = value * 100 + "%";
      event.target.setAttribute("data-value", value.toFixed(2));

      // Atualizar os valores de reverb.wet.value e distortion.wet.value aqui
      var fxLevel = value; // Use o valor calculado acima ou ajuste conforme necessário
      reverb.wet.value = fxLevel;
      distortion.wet.value = fxLevel;
    },
  },
});

const fxSlider1 = interact(".slider-right");
fxSlider1.draggable({
  origin: "self",
  inertia: true,
  modifiers: [
    interact.modifiers.restrict({
      restriction: "self",
    }),
  ],
  listeners: {
    move(event) {
      const sliderWidth = interact.getElementRect(event.target).width;
      const value = event.pageX / sliderWidth;

      event.target.style.paddingLeft = value * 100 + "%";
      event.target.setAttribute("data-value", value.toFixed(2));

      // Atualizar os valores de reverb.wet.value e distortion.wet.value aqui
      var fxLevel = 1 - value; // Use o valor calculado acima ou ajuste conforme necessário
      crusher.wet.value = fxLevel;
      tremolo.wet.value = fxLevel;
    },
  },
});

// Function to activate / deactivate an effect
function toggleEffect(effect, button) {
  if (activeEffect === effect) {
    // Deactivate
    effect.disconnect();
    oscillator.disconnect();
    oscillator.connect(gainNode);
    gainNode.toDestination();
    activeEffect = null;
    button.classList.remove("pressed");
  } else {
    // Activate
    oscillator.disconnect();
    oscillator.connect(gainNode);
    gainNode.connect(effect);
    effect.toDestination();
    activeEffect = effect;
    button.classList.add("pressed");
  }
}

// Function to activate / deactivate effect on FAT oscilator
function toggleFatEffect(effect, button) {
  if (activeEffect === effect) {
    // Deactivate
    effect.disconnect();
    fat.disconnect();
    fat.connect(gainNodeRight);
    gainNodeRight.toDestination();
    activeEffect = null;
    button.classList.remove("pressed");
  } else {
    // Activate
    fat.disconnect();
    fat.connect(gainNodeRight);
    gainNodeRight.connect(effect);
    effect.toDestination();
    activeEffect = effect;
    button.classList.add("pressed");
  }
}

// Click/Touch events to fx buttons
reverbBTN.addEventListener("touchstart", function () {
  toggleEffect(reverb, reverbBTN);
});

distortionBTN.addEventListener("touchstart", function () {
  toggleEffect(distortion, distortionBTN);
});

crusherBTN.addEventListener("touchstart", function () {
  toggleFatEffect(crusher, crusherBTN);
});

tremoloBTN.addEventListener("touchstart", function () {
  toggleFatEffect(tremolo, tremoloBTN);
});

// Click/Touch events to circle / Oscillators
circle_left.addEventListener("touchstart", function (e) {
  if (mousedown) return;

  // Calculate frequency depending on the position of the touch
  oscillator.frequency.value = calculateFrequency(
    e.targetTouches[0].clientX,
    circle_left
  );
  // also calculate gain depending on the position of the touch
  gainNode.gain.value = calculateGain(e.targetTouches[0].clientY, circle_left);

  oscillator.start();
  mousedown = true;
});

circle_left.addEventListener("touchend", function () {
  if (mousedown) {
    oscillator.stop();
    mousedown = false;
  }
});

circle_left.addEventListener("touchmove", function (e) {
  if (mousedown) {
    oscillator.frequency.value = calculateFrequency(
      e.targetTouches[0].clientX,
      circle_left
    );
    gainNode.gain.value = calculateGain(
      e.targetTouches[0].clientY,
      circle_left
    );
  }
});
// Same thing as below, only now to the other oscilator
circle_right.addEventListener("touchstart", function (e) {
  if (mousedown) return;

  fat.frequency.value = calculateFrequencyReverse(
    e.targetTouches[0].clientX,
    circle_right
  );
  gainNodeRight.gain.value = calculateGainReverse(
    e.targetTouches[0].clientY,
    circle_right
  );

  // fat.frequency.value = calculateFrequencyReverse(e.clientX, circle_right);
  // gainNodeRight.gain.value = calculateGainReverse(e.clientY, circle_right);

  fat.start();
  mousedown = true;
});

circle_right.addEventListener("touchend", function () {
  if (mousedown) {
    fat.stop();
    mousedown = false;
  }
});

// mousemove
circle_right.addEventListener("touchmove", function (e) {
  if (mousedown) {
    fat.frequency.value = calculateFrequencyReverse(
      e.targetTouches[0].clientX,
      circle_right
    );
    gainNodeRight.gain.value = calculateGainReverse(
      e.targetTouches[0].clientY,
      circle_right
    );
    // fat.frequency.value = calculateFrequencyReverse(e.clientX, circle_right);
    // gainNodeRight.gain.value = calculateGainReverse(e.clientY, circle_right);
  }
});

// Function to Calculate Frequency and Position Mapping
function calculateFrequency(mouseXPosition, circle_left) {
  var minFrequency = 20,
    maxFrequency = 2000;

  // Circle dimensions
  var circleRect = circle_left.getBoundingClientRect();
  var circleWidth = circleRect.width;
  var circleLeft = circleRect.left;

  // relative position to the circle
  var relativeX = mouseXPosition - circleLeft;

  // if mouse is inside circle
  if (relativeX >= 0 && relativeX <= circleWidth) {
    // map the mouse -> frequency levels
    return (
      (relativeX / circleWidth) * (maxFrequency - minFrequency) + minFrequency
    );
  } else {
    // outside of circle
    return minFrequency;
  }
}
// Same theory but now to make Gain Mapping of the Circle
function calculateGain(mouseYPosition, circle_left) {
  var minGain = 0,
    maxGain = 1;

  // Circle Dimensions
  var circleRect = circle_left.getBoundingClientRect();
  var circleHeight = circleRect.height;
  var circleTop = circleRect.top;

  // Relative Position
  var relativeY = mouseYPosition - circleTop;

  // Mouse is inside the circle
  if (relativeY >= 0 && relativeY <= circleHeight) {
    // Map the gain to the relative position
    return 1 - (relativeY / circleHeight) * maxGain;
  } else {
    // If outside circle
    return minGain;
  }
}

// Same thing but now reverse
function calculateFrequencyReverse(mouseXPosition, circle_right) {
  var minFrequency = 20,
    maxFrequency = 2000;

  var circleRect = circle_right.getBoundingClientRect();
  var circleWidth = circleRect.width;
  var circleLeft = circleRect.left;

  var relativeX = mouseXPosition - circleLeft;

  if (relativeX >= 0 && relativeX <= circleWidth) {
    return (
      maxFrequency - (relativeX / circleWidth) * maxFrequency + minFrequency
    );
  } else {
    return -1;
  }
}

function calculateGainReverse(mouseYPosition, circle_right) {
  var minGain = 0,
    maxGain = 1;

  var circleRect = circle_right.getBoundingClientRect();
  var circleHeight = circleRect.height;
  var circleTop = circleRect.top;

  var relativeY = mouseYPosition - circleTop;

  if (relativeY >= 0 && relativeY <= circleHeight) {
    return (relativeY / circleHeight) * maxGain + minGain;
  } else {
    return minGain;
  }
}
