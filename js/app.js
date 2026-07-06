// 全体制御：モデル読み込み・カメラ・アップロード・推論・結果描画。

import { ERRORS, CLASS_LABELS } from "./config.js";
import { loadModel } from "./model-loader.js";
import { predict } from "./predict.js";
import { decideVerdict } from "./verdict.js";
import { CameraController } from "./camera.js";

const els = {
  video: document.getElementById("camera"),
  canvas: document.getElementById("capture"),
  startCamBtn: document.getElementById("start-camera"),
  predictBtn: document.getElementById("predict"),
  fileInput: document.getElementById("file-input"),
  preview: document.getElementById("preview"),
  status: document.getElementById("status"),
  result: document.getElementById("result"),
  resultHeadline: document.getElementById("result-headline"),
  resultPercent: document.getElementById("result-percent"),
  resultComment: document.getElementById("result-comment"),
  breakdown: document.getElementById("breakdown"),
  loadingOverlay: document.getElementById("loading-overlay"),
};

const state = {
  model: null,
  indexToClass: null,
  camera: new CameraController(els.video),
  hasImage: false, // アップロード画像 or カメラ起動中
};

function setStatus(message, kind = "info") {
  els.status.textContent = message;
  els.status.dataset.kind = kind;
  els.status.hidden = !message;
}

function setLoading(on) {
  els.loadingOverlay.hidden = !on;
  els.predictBtn.disabled = on || !state.model;
  els.predictBtn.setAttribute("aria-busy", String(on));
}

// 次の描画フレームまで待つ。同期的な推論の前にローディングを確実に表示させる。
function nextFrame() {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
}

async function init() {
  setStatus("AIモデルを読み込み中…", "loading");
  try {
    const { model, indexToClass } = await loadModel();
    state.model = model;
    state.indexToClass = indexToClass;
    setStatus("", "info");
    els.predictBtn.disabled = false;
  } catch (e) {
    console.error(e);
    setStatus(ERRORS.modelLoad, "error");
    els.predictBtn.disabled = true;
  }
}

async function onStartCamera() {
  try {
    await state.camera.start();
    state.hasImage = true;
    els.video.hidden = false;
    els.preview.hidden = true;
    setStatus("", "info");
  } catch (e) {
    console.error(e);
    setStatus(e.message || ERRORS.cameraDenied, "error");
  }
}

function onFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  els.preview.onload = () => URL.revokeObjectURL(url); // メモリ解放（保存しない）
  els.preview.src = url;
  els.preview.hidden = false;
  els.video.hidden = true;
  state.camera.stop();
  state.hasImage = true;
  setStatus("", "info");
}

function getSource() {
  // アップロード画像が表示中ならそれを、そうでなければカメラフレームを使う
  if (!els.preview.hidden && els.preview.src) return els.preview;
  if (state.camera.isRunning()) {
    return state.camera.captureToCanvas(els.canvas);
  }
  return null;
}

async function onPredict() {
  if (!state.model) {
    setStatus(ERRORS.modelLoad, "error");
    return;
  }
  const source = getSource();
  if (!source) {
    setStatus(ERRORS.noImage, "error");
    return;
  }
  try {
    setStatus("", "info");
    setLoading(true);
    // ローディングを描画してから、同期的な推論（メインスレッドを塞ぐ）を実行する。
    await nextFrame();
    const probs = predict(state.model, state.indexToClass, source);
    const verdict = decideVerdict(probs);
    renderResult(verdict);
  } catch (e) {
    console.error(e);
    setStatus(ERRORS.inference, "error");
  } finally {
    setLoading(false);
  }
}

function renderResult(v) {
  els.result.hidden = false;
  els.result.dataset.level = v.level;
  els.result.dataset.topClass = v.topClass;
  els.resultHeadline.textContent = v.headline;
  els.resultPercent.textContent = v.level === "normal" ? `${v.percent}%` : "";
  els.resultComment.textContent = v.comment;

  els.breakdown.innerHTML = "";
  for (const b of v.breakdown) {
    const row = document.createElement("li");
    row.className = "breakdown-row";
    row.dataset.cls = b.cls;
    row.innerHTML = `
      <span class="breakdown-label">${CLASS_LABELS[b.cls]}</span>
      <span class="breakdown-bar"><span class="breakdown-fill" style="transform:scaleX(${b.prob})"></span></span>
      <span class="breakdown-percent">${b.percent}%</span>
    `;
    els.breakdown.appendChild(row);
  }
}

els.startCamBtn.addEventListener("click", onStartCamera);
els.predictBtn.addEventListener("click", onPredict);
els.fileInput.addEventListener("change", onFileSelected);

init();
