// カメラ起動・停止・静止画取得（仕様書 6.3 / 11.1-11.2）。

import { ERRORS } from "./config.js";

export class CameraController {
  constructor(videoEl) {
    this.video = videoEl;
    this.stream = null;
    this.facingMode = "environment"; // 背面優先
  }

  isSupported() {
    return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /** カメラを起動。成功で true、失敗で理由付き例外。 */
  async start() {
    if (!this.isSupported()) {
      const err = new Error(ERRORS.cameraUnsupported);
      err.kind = "unsupported";
      throw err;
    }
    try {
      this.stop();
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facingMode },
        audio: false,
      });
      this.video.srcObject = this.stream;
      this.video.setAttribute("playsinline", ""); // iOS Safari
      await this.video.play();
      return true;
    } catch (e) {
      const err = new Error(ERRORS.cameraDenied);
      err.kind = "denied";
      err.cause = e;
      throw err;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.video) this.video.srcObject = null;
  }

  isRunning() {
    return Boolean(this.stream);
  }

  /** 前面/背面を切り替えて再起動。 */
  async toggleFacing() {
    this.facingMode = this.facingMode === "environment" ? "user" : "environment";
    if (this.isRunning()) await this.start();
  }

  /** 現在フレームを canvas に描画して返す。 */
  captureToCanvas(canvas) {
    const w = this.video.videoWidth;
    const h = this.video.videoHeight;
    if (!w || !h) throw new Error("カメラ映像がまだ準備できていません");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(this.video, 0, 0, w, h);
    return canvas;
  }
}
