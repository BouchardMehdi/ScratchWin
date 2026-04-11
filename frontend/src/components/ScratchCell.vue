<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import SymbolToken from "./SymbolToken.vue";
import { playScratchSound } from "../utils/audio";

const props = defineProps({
  cell: {
    type: Object,
    required: true,
  },
  forceRevealToken: {
    type: Number,
    default: 0,
  },
  roundToken: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["revealed"]);

const wrapperRef = ref(null);
const canvasRef = ref(null);
const revealed = ref(false);
const particles = ref([]);

let isScratching = false;
let strokeCount = 0;
let resizeObserver = null;
let particleId = 0;

function getBrushRadius(width) {
  return Math.max(15, width * 0.1);
}

function paintScratchCover() {
  const wrapper = wrapperRef.value;
  const canvas = canvasRef.value;

  if (!wrapper || !canvas || revealed.value) {
    return;
  }

  const rect = wrapper.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  const context = canvas.getContext("2d");
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.scale(ratio, ratio);

  const baseGradient = context.createLinearGradient(0, 0, rect.width, rect.height);
  baseGradient.addColorStop(0, "#f2f4f8");
  baseGradient.addColorStop(0.18, "#bec6d4");
  baseGradient.addColorStop(0.5, "#eef2f7");
  baseGradient.addColorStop(0.7, "#9ea7b8");
  baseGradient.addColorStop(1, "#d9dee7");
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, rect.width, rect.height);

  const shineGradient = context.createLinearGradient(0, 0, rect.width, 0);
  shineGradient.addColorStop(0, "rgba(255,255,255,0.12)");
  shineGradient.addColorStop(0.15, "rgba(255,255,255,0.52)");
  shineGradient.addColorStop(0.33, "rgba(255,255,255,0.08)");
  shineGradient.addColorStop(0.55, "rgba(255,255,255,0.45)");
  shineGradient.addColorStop(1, "rgba(255,255,255,0.05)");
  context.fillStyle = shineGradient;
  context.fillRect(0, 0, rect.width, rect.height);

  context.strokeStyle = "rgba(255, 255, 255, 0.16)";
  context.lineWidth = 1.5;
  for (let y = 12; y < rect.height + 12; y += 10) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(rect.width, y - 10);
    context.stroke();
  }

  for (let index = 0; index < 120; index += 1) {
    const sparkleX = Math.random() * rect.width;
    const sparkleY = Math.random() * rect.height;
    const sparkleSize = Math.random() * 1.5 + 0.3;

    context.fillStyle =
      Math.random() > 0.5 ? "rgba(255,255,255,0.22)" : "rgba(132,142,160,0.18)";
    context.fillRect(sparkleX, sparkleY, sparkleSize, sparkleSize);
  }

  context.strokeStyle = "rgba(81, 90, 107, 0.22)";
  context.lineWidth = 1;
  context.strokeRect(1.5, 1.5, rect.width - 3, rect.height - 3);

  const textGradient = context.createLinearGradient(0, rect.height * 0.35, 0, rect.height * 0.7);
  textGradient.addColorStop(0, "rgba(255,255,255,0.9)");
  textGradient.addColorStop(1, "rgba(117,125,143,0.78)");
  context.fillStyle = textGradient;
  context.font = "700 14px Segoe UI";
  context.textAlign = "center";
  context.shadowColor = "rgba(255,255,255,0.35)";
  context.shadowBlur = 6;
  context.fillText("GRATTER", rect.width / 2, rect.height / 2 + 4);
  context.shadowBlur = 0;
}

function revealCell() {
  if (revealed.value) {
    return;
  }

  revealed.value = true;
  isScratching = false;
  emit("revealed", props.cell.id);
}

function checkScratchProgress() {
  const canvas = canvasRef.value;
  if (!canvas || revealed.value) {
    return;
  }

  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let transparentPixels = 0;

  for (let index = 3; index < imageData.length; index += 4) {
    if (imageData[index] === 0) {
      transparentPixels += 1;
    }
  }

  const scratchedRatio = transparentPixels / (imageData.length / 4);
  if (scratchedRatio >= 0.5) {
    revealCell();
  }
}

function scratchAt(clientX, clientY) {
  const canvas = canvasRef.value;
  if (!canvas || revealed.value) {
    return;
  }

  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  context.save();
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.arc(x, y, getBrushRadius(rect.width), 0, Math.PI * 2);
  context.fill();
  context.restore();

  playScratchSound();

  strokeCount += 1;
  if (strokeCount % 2 === 0) {
    spawnParticle(x, y);
  }
  if (strokeCount % 5 === 0) {
    checkScratchProgress();
  }
}

function spawnParticle(x, y) {
  const id = particleId;
  particleId += 1;

  const particle = {
    id,
    x,
    y,
    size: 6 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 92,
    drop: 52 + Math.random() * 34,
    rotation: -35 + Math.random() * 170,
    duration: 520 + Math.random() * 360,
    tone: Math.random() > 0.5 ? "light" : "dark",
  };

  particles.value = [...particles.value, particle];

  window.setTimeout(() => {
    particles.value = particles.value.filter((item) => item.id !== id);
  }, particle.duration);
}

function onPointerDown(event) {
  if (revealed.value) {
    return;
  }

  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  isScratching = true;
  strokeCount = 0;
  canvasRef.value?.setPointerCapture?.(event.pointerId);
  scratchAt(event.clientX, event.clientY);
}

function onPointerMove(event) {
  if (!isScratching || revealed.value) {
    return;
  }

  scratchAt(event.clientX, event.clientY);
}

function stopScratching(event) {
  isScratching = false;

  if (event?.pointerId != null) {
    try {
      canvasRef.value?.releasePointerCapture?.(event.pointerId);
    } catch (error) {
      // Ignore browsers that throw when the pointer was not captured.
    }
  }

  checkScratchProgress();
}

watch(
  () => props.roundToken,
  async () => {
    revealed.value = false;
    await nextTick();
    paintScratchCover();
  },
  { immediate: true },
);

watch(
  () => props.forceRevealToken,
  () => {
    revealCell();
  },
);

onMounted(() => {
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      if (!revealed.value) {
        paintScratchCover();
      }
    });

    if (wrapperRef.value) {
      resizeObserver.observe(wrapperRef.value);
    }
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div
    ref="wrapperRef"
    class="scratch-cell-shell"
    :class="[props.cell.variant, { revealed }]"
  >
    <span
      v-for="particle in particles"
      :key="particle.id"
      class="scratch-particle"
      :style="{
        left: `${particle.x}px`,
        top: `${particle.y}px`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        '--particle-drift': `${particle.drift}px`,
        '--particle-drop': `${particle.drop}px`,
        '--particle-rotation': `${particle.rotation}deg`,
        '--particle-duration': `${particle.duration}ms`,
      }"
      :class="`particle-${particle.tone}`"
    />

    <div class="scratch-cell-content" :class="{ visible: revealed }">
      <SymbolToken :symbol="props.cell.symbol" size="large" :label="props.cell.label" />
      <strong v-if="props.cell.caption" class="scratch-cell-caption">
        {{ props.cell.caption }}
      </strong>
    </div>

    <canvas
      v-if="!revealed"
      ref="canvasRef"
      class="scratch-cover"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="stopScratching"
      @pointercancel="stopScratching"
      @pointerleave="stopScratching"
    />
  </div>
</template>
