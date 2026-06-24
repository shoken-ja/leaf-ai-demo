// 推論確率から「表示すべき判定結果」を組み立てる純ロジック。
// TF.js に依存しないため node --test で検証できる（仕様書 7章）。

import {
  CLASSES,
  CLASS_LABELS,
  CLASS_COMMENTS,
  CONFIDENCE,
  CONFIDENCE_MESSAGES,
} from "./config.js";

/**
 * @param {{healthy:number, caution:number}} probs 各クラスの確率(0-1)
 * @returns 表示用の判定オブジェクト
 */
export function decideVerdict(probs) {
  for (const cls of CLASSES) {
    if (typeof probs?.[cls] !== "number" || Number.isNaN(probs[cls])) {
      throw new Error(`確率が不正です: ${cls}=${probs?.[cls]}`);
    }
  }

  // 最大確率クラスを決める
  let topClass = CLASSES[0];
  for (const cls of CLASSES) {
    if (probs[cls] > probs[topClass]) topClass = cls;
  }
  const confidence = probs[topClass];

  // 確信度レベル（仕様書 7.1-7.3）
  let level;
  if (confidence >= CONFIDENCE.NORMAL) level = "normal";
  else if (confidence >= CONFIDENCE.UNSTABLE) level = "unstable";
  else level = "unknown";

  const breakdown = CLASSES.map((cls) => ({
    cls,
    label: CLASS_LABELS[cls],
    prob: probs[cls],
    percent: Math.round(probs[cls] * 100),
  }));

  // 通常判定のみクラス名を見出しに出す。曖昧時は誤解を避け注意文を主にする。
  const headline = level === "normal" ? CLASS_LABELS[topClass] : "判定が不確かです";
  const comment =
    level === "normal"
      ? CLASS_COMMENTS[topClass]
      : level === "unstable"
        ? CONFIDENCE_MESSAGES.unstable
        : CONFIDENCE_MESSAGES.unknown;

  return {
    topClass,
    confidence,
    percent: Math.round(confidence * 100),
    level,
    headline,
    comment,
    breakdown,
  };
}
