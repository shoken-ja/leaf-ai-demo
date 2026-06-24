// TF.js モデルの読み込みとラベル順の解決。
// tf はグローバル（vendor/tf.min.js を index.html で読み込む）を利用する。

import { MODEL_URL, METADATA_URL, CLASSES, resolveLabel } from "./config.js";

/**
 * モデルと metadata を読み込み、{model, indexToClass} を返す。
 * 失敗時は例外（呼び出し側で仕様書11.3のメッセージを表示）。
 */
export async function loadModel() {
  if (typeof tf === "undefined") {
    throw new Error("TensorFlow.js が読み込まれていません");
  }

  const [model, metadata] = await Promise.all([
    tf.loadLayersModel(MODEL_URL),
    fetch(METADATA_URL).then((r) => {
      if (!r.ok) throw new Error(`metadata.json 取得失敗: ${r.status}`);
      return r.json();
    }),
  ]);

  const labels = metadata.labels;
  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error("metadata.labels が不正です");
  }

  // モデル出力インデックス → 正規ラベル
  const indexToClass = labels.map((raw) => resolveLabel(raw));

  // 3クラス過不足チェック
  const seen = new Set(indexToClass);
  for (const cls of CLASSES) {
    if (!seen.has(cls)) throw new Error(`ラベル ${cls} がモデルにありません`);
  }

  return { model, indexToClass };
}
