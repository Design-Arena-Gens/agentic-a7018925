"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SceneFlavor = {
  id: string;
  label: string;
  duration: number;
  text: string;
  sky: [string, string];
  ground: [string, string];
  accents: string[];
};

type Toast =
  | { type: "idle"; message: string }
  | { type: "progress"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

const SCENES: SceneFlavor[] = [
  {
    id: "dawn",
    label: "Aurora Dawn",
    duration: 8000,
    text: "Aurora, a glow-orb who paints the night sky, dreams of capturing the first sunrise over Cloud Harbor.",
    sky: ["#3c4ef5", "#f8c7ff"],
    ground: ["#1a0d38", "#452c91"],
    accents: ["#ffe892", "#ff9ed9", "#8af7ff"]
  },
  {
    id: "meet",
    label: "Spark & Drift",
    duration: 7000,
    text: "With her quirky kite-bot Drift, she rehearses color dances, but their timing keeps fizzling and fading away.",
    sky: ["#18256d", "#76c8ff"],
    ground: ["#101330", "#253d7b"],
    accents: ["#ffeaa7", "#9afff7", "#ffc8f6"]
  },
  {
    id: "storm",
    label: "Storm Surge",
    duration: 6500,
    text: "A sudden squall rips through the harbor, scattering palettes and dimming Aurora's shimmer to nearly nothing.",
    sky: ["#0a1028", "#4c4c92"],
    ground: ["#030516", "#15224b"],
    accents: ["#fd6a7d", "#6cdbff", "#ffffff"]
  },
  {
    id: "uplift",
    label: "Echoes of Light",
    duration: 6000,
    text: "Drift whirls ahead, reflecting the lost colors; Aurora listens to the harbor's heartbeat and feels a new hue awaken.",
    sky: ["#1a1540", "#9c7bff"],
    ground: ["#160d31", "#5123aa"],
    accents: ["#ffde7d", "#98f4ff", "#ffd0ec"]
  },
  {
    id: "finale",
    label: "First Sunrise",
    duration: 7000,
    text: "Together they paint a sunrise that blooms into a promise—Cloud Harbor will always chase the brightest dreams.",
    sky: ["#ff9ad9", "#fff6b8"],
    ground: ["#251045", "#6234b6"],
    accents: ["#fff3b0", "#9bfaff", "#ffd7f9"]
  }
];

const TOTAL_DURATION = SCENES.reduce((sum, scene) => sum + scene.duration, 0);

const getSceneAt = (elapsed: number) => {
  let accumulator = 0;
  for (let i = 0; i < SCENES.length; i += 1) {
    const scene = SCENES[i];
    if (elapsed < accumulator + scene.duration) {
      return {
        index: i,
        scene,
        progress: (elapsed - accumulator) / scene.duration
      };
    }
    accumulator += scene.duration;
  }
  return {
    index: SCENES.length - 1,
    scene: SCENES[SCENES.length - 1],
    progress: 1
  };
};

const easeInOut = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));
const wrap = (value: number, max: number) => {
  const result = value % max;
  return result < 0 ? result + max : result;
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  if (normalized.length !== 6 || Number.isNaN(value)) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const useStoryLoop = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onSceneChange: (sceneIndex: number) => void
) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    let animationFrame = 0;
    let start = performance.now();
    let lastSceneIndex = -1;

    const renderFrame = (now: number) => {
      const elapsed = wrap(now - start, TOTAL_DURATION);
      const { index, scene, progress } = getSceneAt(elapsed);
      if (index !== lastSceneIndex) {
        lastSceneIndex = index;
        onSceneChange(index);
      }
      paintScene(ctx, scene, progress, now - start);
      animationFrame = requestAnimationFrame(renderFrame);
    };

    animationFrame = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [canvasRef, onSceneChange]);
};

const paintScene = (
  ctx: CanvasRenderingContext2D,
  scene: SceneFlavor,
  localProgress: number,
  elapsed: number
) => {
  const progress = easeInOut(localProgress);
  const sparkleSeed = elapsed / 7000;
  const shimmer = Math.sin(elapsed / 1200) * 0.25 + 0.75;
  const parallaxShift = Math.sin(elapsed / 1800) * 20;

  ctx.save();
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawSky(ctx, scene, progress, shimmer);
  drawStars(ctx, scene, sparkleSeed);
  drawClouds(ctx, scene, progress, elapsed);
  drawHorizon(ctx, scene, progress);
  drawWater(ctx, scene, progress, elapsed);
  drawAurora(ctx, scene, progress, parallaxShift, shimmer);
  drawDrift(ctx, scene, progress, elapsed, shimmer);
  drawVignette(ctx);

  ctx.restore();
};

const drawSky = (
  ctx: CanvasRenderingContext2D,
  scene: SceneFlavor,
  progress: number,
  shimmer: number
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, scene.sky[0]);
  gradient.addColorStop(1, scene.sky[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const glowRadius = 420;
  const glowX = CANVAS_WIDTH / 2;
  const glowY = CANVAS_HEIGHT * (0.32 + 0.05 * Math.sin(progress * Math.PI));
  const radial = ctx.createRadialGradient(
    glowX,
    glowY,
    0,
    glowX,
    glowY,
    glowRadius
  );
  radial.addColorStop(0, `rgba(255, 255, 255, ${0.36 * shimmer})`);
  radial.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

const drawStars = (
  ctx: CanvasRenderingContext2D,
  scene: SceneFlavor,
  sparkleSeed: number
) => {
  const starCount = 90;
  for (let i = 0; i < starCount; i += 1) {
    const seed = i * 54.321;
    const x = (Math.sin(seed) * 0.5 + 0.5) * CANVAS_WIDTH;
    const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * CANVAS_HEIGHT * 0.55;
    const radius = 1.4 + (Math.sin(seed * 13 + sparkleSeed) + 1) * 1.2;
    const twinkle = (Math.sin(seed * 7 + sparkleSeed * 4) + 1) / 2;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  scene.accents.forEach((color, idx) => {
    const orbX =
      CANVAS_WIDTH * (0.2 + (idx * 0.3 + Math.sin(sparkleSeed + idx)) * 0.2);
    const orbY = CANVAS_HEIGHT * (0.12 + idx * 0.08);
    const orbRadius = 120 + idx * 40;
    const gradient = ctx.createRadialGradient(
      orbX,
      orbY,
      0,
      orbX,
      orbY,
      orbRadius
    );
    gradient.addColorStop(0, `${color}33`);
    gradient.addColorStop(0.6, `${color}12`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.6);
    ctx.globalCompositeOperation = "source-over";
  });
};

const drawClouds = (
  ctx: CanvasRenderingContext2D,
  scene: SceneFlavor,
  progress: number,
  elapsed: number
) => {
  const puffBaseY = CANVAS_HEIGHT * 0.35;
  const cloudColor = `${scene.accents[1]}55`;
  ctx.fillStyle = cloudColor;
  const speed = 14000;
  for (let i = 0; i < 6; i += 1) {
    const offset = (elapsed / speed + i * 0.18) % 1;
    const x = CANVAS_WIDTH * (offset - 0.2);
    const y = puffBaseY + Math.sin(progress * Math.PI + i) * 12;
    drawCloud(ctx, x, y, 200 + i * 35, scene.accents[i % scene.accents.length]);
  }
};

const drawCloud = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  accent: string
) => {
  const puffCount = 5;
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < puffCount; i += 1) {
    const radius = size * (0.35 + i * 0.1);
    const offsetX = (i - puffCount / 2) * radius * 0.5;
    const offsetY = Math.sin(i * 1.5) * radius * 0.25;
    const gradient = ctx.createRadialGradient(
      offsetX,
      offsetY,
      radius * 0.25,
      offsetX,
      offsetY,
      radius
    );
    gradient.addColorStop(0, `${accent}aa`);
    gradient.addColorStop(1, `${accent}00`);
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(offsetX, offsetY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const drawHorizon = (
  ctx: CanvasRenderingContext2D,
  scene: SceneFlavor,
  progress: number
) => {
  ctx.save();
  const gradient = ctx.createLinearGradient(
    0,
    CANVAS_HEIGHT * 0.48,
    0,
    CANVAS_HEIGHT
  );
  gradient.addColorStop(0, `${scene.ground[0]}cc`);
  gradient.addColorStop(1, `${scene.ground[1]}ff`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, CANVAS_HEIGHT * 0.45, CANVAS_WIDTH, CANVAS_HEIGHT * 0.55);

  const ridgeHeight = CANVAS_HEIGHT * 0.18;
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT * 0.55);
  ctx.bezierCurveTo(
    CANVAS_WIDTH * 0.25,
    CANVAS_HEIGHT * (0.55 - 0.05 - 0.02 * Math.sin(progress * Math.PI)),
    CANVAS_WIDTH * 0.45,
    CANVAS_HEIGHT * (0.59 + 0.04 * Math.cos(progress * Math.PI)),
    CANVAS_WIDTH * 0.65,
    CANVAS_HEIGHT * 0.56
  );
  ctx.bezierCurveTo(
    CANVAS_WIDTH * 0.82,
    CANVAS_HEIGHT * (0.52 + 0.03 * Math.sin(progress * Math.PI * 1.5)),
    CANVAS_WIDTH,
    CANVAS_HEIGHT * 0.6,
    CANVAS_WIDTH,
    CANVAS_HEIGHT * 0.6
  );
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT * 0.8);
  ctx.lineTo(0, CANVAS_HEIGHT * 0.8);
  ctx.closePath();
  ctx.fillStyle = `${scene.ground[0]}aa`;
  ctx.fill();
  ctx.restore();
};

const drawWater = (
  ctx: CanvasRenderingContext2D,
  scene: SceneFlavor,
  progress: number,
  elapsed: number
) => {
  ctx.save();
  const top = CANVAS_HEIGHT * 0.6;
  const gradient = ctx.createLinearGradient(0, top, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, `${scene.ground[0]}aa`);
  gradient.addColorStop(1, `${scene.ground[1]}dd`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, top, CANVAS_WIDTH, CANVAS_HEIGHT - top);

  const waveCount = 6;
  ctx.strokeStyle = `${scene.accents[2]}66`;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < waveCount; i += 1) {
    const y = top + i * 48;
    ctx.beginPath();
    for (let x = 0; x <= CANVAS_WIDTH; x += 24) {
      const wave =
        Math.sin(progress * Math.PI * 2 + elapsed / 900 + x / 110 + i) * 12;
      const yOffset = Math.cos(elapsed / 1200 + i) * 6;
      ctx.lineTo(x, y + wave + yOffset);
    }
    ctx.stroke();
  }

  ctx.restore();
};

const drawAurora = (
  ctx: CanvasRenderingContext2D,
  scene: SceneFlavor,
  progress: number,
  parallaxShift: number,
  shimmer: number
) => {
  ctx.save();
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.38);
  ctx.rotate(Math.sin(progress * Math.PI * 2) * 0.03);

  const ribbonCount = 5;
  for (let i = 0; i < ribbonCount; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-340, -120 + i * 28);
    for (let x = -340; x <= 340; x += 20) {
      const wave =
        Math.sin((x / 120 + progress * 2 + i * 0.8) * Math.PI) * 90 * shimmer;
      const vertical =
        Math.cos((x / 250 + progress * 3 + i) * Math.PI) * 35 * shimmer;
      ctx.lineTo(x, wave + vertical + i * 20 + parallaxShift * 0.2);
    }
    ctx.strokeStyle = hexToRgba(
      scene.accents[i % scene.accents.length],
      0.22 + 0.26 * shimmer
    );
    ctx.lineWidth = 8 - i * 0.8;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
  }
  ctx.restore();
};

const drawDrift = (
  ctx: CanvasRenderingContext2D,
  scene: SceneFlavor,
  progress: number,
  elapsed: number,
  shimmer: number
) => {
  ctx.save();
  const baseX =
    CANVAS_WIDTH * (0.32 + 0.12 * Math.sin(progress * Math.PI * 2 + elapsed / 900));
  const baseY =
    CANVAS_HEIGHT * (0.68 + 0.02 * Math.sin(elapsed / 500 + progress * Math.PI));

  ctx.translate(baseX, baseY);
  ctx.scale(1, 1);

  ctx.beginPath();
  const width = 160;
  const height = 90;
  const radius = 34;
  const left = -width / 2;
  const top = -120;
  ctx.moveTo(left + radius, top);
  ctx.lineTo(left + width - radius, top);
  ctx.quadraticCurveTo(left + width, top, left + width, top + radius);
  ctx.lineTo(left + width, top + height - radius);
  ctx.quadraticCurveTo(left + width, top + height, left + width - radius, top + height);
  ctx.lineTo(left + radius, top + height);
  ctx.quadraticCurveTo(left, top + height, left, top + height - radius);
  ctx.lineTo(left, top + radius);
  ctx.quadraticCurveTo(left, top, left + radius, top);
  ctx.closePath();
  ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * shimmer})`;
  ctx.strokeStyle = `${scene.accents[0]}cc`;
  ctx.lineWidth = 6;
  ctx.fill();
  ctx.stroke();

  const eyeBlink = Math.abs(Math.sin(elapsed / 280)) < 0.12 ? 0.18 : 1;
  const eyeOffset = 34;
  const eyeRadius = 16;
  ctx.fillStyle = `rgba(20, 20, 60, 0.86)`;
  ctx.beginPath();
  ctx.ellipse(-eyeOffset, -75, eyeRadius, eyeRadius * eyeBlink, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(eyeOffset, -75, eyeRadius, eyeRadius * eyeBlink, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-50, -26);
  ctx.quadraticCurveTo(0, 12 * shimmer, 50, -26);
  ctx.strokeStyle = `${scene.accents[2]}aa`;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-90, -30);
  ctx.quadraticCurveTo(
    -100,
    60 * shimmer,
    -140,
    160 * (0.5 + 0.5 * Math.sin(elapsed / 700))
  );
  ctx.strokeStyle = `${scene.accents[0]}55`;
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(90, -30);
  ctx.quadraticCurveTo(
    120,
    40 * shimmer,
    160,
    140 * (0.5 + 0.5 * Math.cos(elapsed / 650))
  );
  ctx.stroke();

  ctx.beginPath();
  const bob = Math.sin(elapsed / 280) * 24;
  ctx.fillStyle = `${scene.accents[1]}aa`;
  ctx.shadowBlur = 28;
  ctx.shadowColor = scene.accents[1];
  ctx.arc(0, -120 + bob, 18 + shimmer * 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const drawVignette = (ctx: CanvasRenderingContext2D) => {
  const vignette = ctx.createRadialGradient(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.25,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.65
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.32)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

const StoryApp = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [visibleScene, setVisibleScene] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [toast, setToast] = useState<Toast>({
    type: "idle",
    message: "Looping cinematic ready."
  });
  const [recording, setRecording] = useState(false);

  useStoryLoop(canvasRef, (sceneIndex) => {
    setActiveScene(sceneIndex);
  });

  useEffect(() => {
    setTextVisible(false);
    const timeout = window.setTimeout(() => {
      setVisibleScene(activeScene);
      setTextVisible(true);
    }, 280);
    return () => window.clearTimeout(timeout);
  }, [activeScene]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (typeof canvas.captureStream !== "function" || typeof window.MediaRecorder === "undefined") {
      setToast({
        type: "error",
        message: "Recording not supported in this browser. Try latest Chrome or Edge."
      });
      return;
    }

    if (recording) {
      return;
    }

    setRecording(true);
    setToast({
      type: "progress",
      message: "Rendering cinematic... stay on the page."
    });

    const stream = canvas.captureStream(60);
    const options: MediaRecorderOptions = {
      mimeType: "video/webm;codecs=vp9"
    };

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch (error) {
      console.error(error);
      setRecording(false);
      setToast({
        type: "error",
        message: "Video encoder unavailable. Enable VP9 or use desktop Chrome."
      });
      return;
    }

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    const stopPromise = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = (evt) => reject(evt);
    });

    recorder.start();

    await new Promise((resolve) => window.setTimeout(resolve, TOTAL_DURATION + 400));
    if (recorder.state !== "inactive") {
      recorder.stop();
    }

    try {
      await stopPromise;
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "lumina-dreams-pixar-short.webm";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setToast({
        type: "success",
        message: "Rendered! Check your downloads for the short."
      });
    } catch (error) {
      console.error(error);
      setToast({
        type: "error",
        message: "Recording failed. Refresh and try again."
      });
    } finally {
      setRecording(false);
    }
  };

  const toastClass = useMemo(() => {
    if (toast.type === "error") return "status-toast error";
    if (toast.type === "progress") return "status-toast";
    if (toast.type === "success") return "status-toast";
    return "status-toast";
  }, [toast.type]);

  return (
    <div className="app-shell">
      <div className="shine-overlay" />
      <div className="app-header">
        <div>
          <div className="brand-title">Lumina Dreams</div>
          <div style={{ fontSize: "0.78rem", opacity: 0.72, letterSpacing: "0.08em" }}>
            Pixar-inspired short form storyteller
          </div>
        </div>
        <div className="pill">1080×1920</div>
      </div>
      <div className="stage">
        <canvas ref={canvasRef} />
        <div className={`story-text ${textVisible ? "" : "hidden"}`}>
          {SCENES[visibleScene]?.text}
        </div>
        <div className={toastClass} style={{ opacity: toast.type === "idle" ? 0 : 1 }}>
          {toast.message}
        </div>
      </div>
      <div className="cta">
        <button onClick={handleDownload} disabled={recording}>
          {recording ? "Rendering..." : "Download Viral Short"}
        </button>
        <small>Tip: Import the WebM into your editor to add narration & upload as a Short.</small>
      </div>
    </div>
  );
};

export default StoryApp;
