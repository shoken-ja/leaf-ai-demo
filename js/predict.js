// 画像ソース（canvas / img / video）から3クラス確率を推論する。
// 前処理は eval/evaluate.js と同じ（224×224・RGB・config の正規化）。

import { INPUT_SIZE, CLASSES, normalizeParams } from "./config.js";

/**
 * @param {tf.LayersModel} model
 * @param {string[]} indexToClass 出力index→正規ラベル
 * @param {CanvasImageSource} source canvas / video / img 要素
 * @returns {{healthy:number, caution:number}}
 */
export function predict(model, indexToClass, source) {
  const { scale, offset } = normalizeParams();

  const probsArray = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(source, 3);
    const resized = tf.image.resizeBilinear(pixels, [INPUT_SIZE, INPUT_SIZE]);
    const normalized = resized.toFloat().mul(scale).add(offset).expandDims(0);
    const logits = model.predict(normalized);
    return logits.dataSync();
  });

  // index→クラスへ詰め替え（CLASSES を単一の真実とする）
  const probs = Object.fromEntries(CLASSES.map((cls) => [cls, 0]));
  indexToClass.forEach((cls, i) => {
    if (CLASSES.includes(cls)) probs[cls] = probsArray[i];
  });
  return probs;
}
