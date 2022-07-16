import {ref} from "vue";

const animations: (() => void)[] = [];
const requestAnimation = requestAnimationFrame || ((cb: () => void) => setTimeout(cb, 16));
const cancelAnimation = cancelAnimationFrame || clearTimeout;
let animation = 0;
export const averageFps = ref<number>(0);

export function registerAnimation (callback: () => void) {
    animations.push(callback);
    if (!animation) {
        startAnimation();
    }
}

export function unregisterAnimation (callback: () => void) {
    const index = animations.findIndex(c => c === callback);
    if (index !== -1) {
        animations.splice(index, 1);
    }
    if (!animations.length) {
        stopAnimation();
    }
}

export function startAnimation () {
    if (!animation && animations.length) {
        animation = requestAnimation(animationStep);
    }
}

export function stopAnimation () {
    if (animation) {
        cancelAnimation(animation);
        animation = 0;
    }
}

let startTime = -1;
let frames = 0;

function animationStep () {
    const time = performance.now();
    updateFPS(time);
    for (let i = 0; i < animations.length; i++) {
        animations[i]();
    }
    animation = requestAnimation(animationStep);
}

const updateFPS = (time: number) => {
    ++frames;
    if (startTime === -1) {
        startTime = time;
    }
    const dTime = time - startTime;
    if (dTime > 0) {
        averageFps.value = Math.trunc(frames / dTime * 1000);
    }
    if (frames > 500) {
        frames = 0;
        startTime = time;
    }
}
