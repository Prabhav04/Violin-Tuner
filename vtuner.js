// ===== GLOBALS =====
let metronomeInterval = null;
let isPlaying = false;
let audioContext;
let analyserNode;
let microphone;
let stream;
let pitchDetected = null;
let lastValidPitch = null;
const pitchElement = document.getElementById("pitchOutput");

// ===== AUDIO PLAYER FUNCTIONS =====
function toggleAudio(id, buttonId) {
    const audio = document.getElementById(id);
    const button = document.getElementById(buttonId);

    if (audio.paused) {
        pauseAllExcept(id);
        audio.play();
        button.style.background = '#d3e384';
    } else {
        audio.pause();
        button.style.background = '';
    }
}

function pauseAllExcept(currentId) {
    document.querySelectorAll('audio.audio').forEach(audio => {
        if (audio.id !== currentId) {
            audio.pause();
            const btn = document.getElementById('btn' + audio.id.charAt(0));
            if (btn) btn.style.background = '';
        }
    });
}

// ===== METRONOME FUNCTIONS =====
function flashBeat() {
    const circle = document.querySelector(".timenoti circle");
    if (!circle) return;

    circle.style.transform = "scale(1.6)";
    circle.style.opacity = "1";

    setTimeout(() => {
        circle.style.transform = "scale(1)";
        circle.style.opacity = "0.2";
    }, 100);
}

function toggleMetronome() {
    const bpmInput = document.getElementById("bpmInput");
    const bpm = parseInt(bpmInput.value);
    const click = document.getElementById("metronomeClick");
    const button = document.getElementById("metronomeToggle");

    if (!bpm || bpm < 30 || bpm > 240) {
        alert("Please enter a BPM between 30 and 240.");
        return;
    }

    if (isPlaying) {
        clearInterval(metronomeInterval);
        button.textContent = "Play";
        isPlaying = false;
    } else {
        const interval = 60000 / bpm;
        metronomeInterval = setInterval(() => {
            click.currentTime = 0;
            click.play();
            flashBeat();
        }, interval);
        button.textContent = "Pause";
        isPlaying = true;
    }
}

// ===== PITCH DETECTION =====
async function initMic() {
    try {
        // Stop previous stream if exists
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Initialize audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

        // Setup analyzer
        microphone = audioContext.createMediaStreamSource(stream);
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;

        microphone.connect(analyserNode);
        detectPitch();

        document.querySelector(".tuning-cont button").textContent = "Listening...";
        pitchElement.textContent = "Pitch: -- Hz";
    } catch (err) {
        console.error("Microphone error:", err);
        pitchElement.textContent = "Error: Microphone access denied";
    }
}

function stopRecording() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }
    pitchElement.textContent = "Pitch: Stopped";
    document.querySelector(".tuning-cont button").textContent = "Start Tuning";
}

function detectPitch() {
    if (!analyserNode) return;

    const bufferLength = analyserNode.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyserNode.getFloatTimeDomainData(dataArray);

    const pitch = autoCorrelate(dataArray, audioContext.sampleRate);
    const minPitch = 196;  // G3
    const maxPitch = 4698; // D8

    if (pitch !== -1 && pitch >= minPitch && pitch <= maxPitch) {
        lastValidPitch = pitch;
        pitchElement.textContent = `Pitch: ${pitch.toFixed(2)} Hz`;
    } else if (lastValidPitch) {
        pitchElement.textContent = `Pitch: ${lastValidPitch.toFixed(2)} Hz`;
    }

    requestAnimationFrame(detectPitch);
}

function autoCorrelate(buffer, sampleRate) {
    let size = buffer.length;
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;

    for (let i = 0; i < size; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / size);
    if (rms < 0.01) return -1;

    for (let offset = 1; offset < size / 2; offset++) {
        let correlation = 0;
        for (let i = 0; i < size - offset; i++) {
            correlation += buffer[i] * buffer[i + offset];
        }
        correlation /= size;
        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
    }

    return bestCorrelation > 0.01 ? sampleRate / bestOffset : -1;
}

// ===== MUSIC-REACTIVE PARTICLES =====
// ===== PARTICLE SYSTEM =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas?.getContext('2d');
let particles = [];

function initParticles() {
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fewer particles on mobile
    const particleCount = window.innerWidth < 768 ? 50 : 100;

    // Create particles with violin-inspired colors
    particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        baseSize: Math.random() * 2 + 1,
        speedX: Math.random() * 1.5 - 0.75,
        speedY: Math.random() * 1.5 - 0.75,
        color: `hsla(${Math.random() * 30 + 20}, 60%, 60%, ${Math.random() * 0.5 + 0.3})` // Amber/gold tones
    }));

    animateParticles();
}

function animateParticles() {
    if (!canvas || !ctx) return;

    // Clear with transparent background (so gradient shows through)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animateParticles);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    window.addEventListener('resize', initParticles);
});

// ===== EVENT LISTENERS =====
document.getElementById('stopRecordingButton')?.addEventListener('click', stopRecording);