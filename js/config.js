// アプリ全体の設定・文言を一元管理する。
// 前処理定数としきい値は eval/preprocess.js・eval/confusion.js と同値に保ち、
// 評価ハーネスとアプリの推論結果がズレないようにする。
// ブラウザ(type="module")と node --test の両方から import できる純データ。

// --- 前処理（eval/preprocess.js と一致させること） ---
export const INPUT_SIZE = 224; // px
export const CHANNELS = 3; // RGB
// "zero_to_one" → [0,1] / "minus_one_to_one" → [-1,1]
// Teachable Machine のエクスポート設定に合わせる。
export const NORMALIZATION = "zero_to_one";

export function normalizeParams() {
  if (NORMALIZATION === "minus_one_to_one") return { scale: 1 / 127.5, offset: -1 };
  return { scale: 1 / 255, offset: 0 };
}

// --- 分類クラス（作物種7分類：raw/ に含まれる作物） ---
export const CLASSES = [
  "bell_pepper",
  "corn",
  "grape",
  "olive",
  "potato",
  "strawberry",
  "tomato",
];

export const CLASS_LABELS = {
  bell_pepper: "ピーマン",
  corn: "トウモロコシ",
  grape: "ブドウ",
  olive: "オリーブ",
  potato: "ジャガイモ",
  strawberry: "イチゴ",
  tomato: "トマト",
};

// クラス別コメント（作物名からテンプレ生成）
export const CLASS_COMMENTS = Object.fromEntries(
  CLASSES.map((cls) => [cls, `${CLASS_LABELS[cls]}の葉の画像に近い特徴があると判定しました。`]),
);

// --- 確信度しきい値（仕様書 7.1-7.3 を踏襲。多クラスのため最大確率で判定） ---
export const CONFIDENCE = {
  NORMAL: 0.6, // これ以上 = 通常判定
  UNSTABLE: 0.35, // これ以上 = 不安定（それ未満は判定不能）
};

export const CONFIDENCE_MESSAGES = {
  unstable: "判定が少し不安定です。\n明るさや距離を変えて、もう一度試してください。",
  unknown: "うまく判定できません。\n葉がはっきり映るようにして、もう一度試してください。",
};

// --- 注意書き（仕様書 16） ---
export const NOTICE =
  "このAIは授業用の画像認識体験アプリです。\n" +
  "実際の病害虫診断や農業上の判断を行うものではありません。\n" +
  "最終判断には、現場確認と専門知識が必要です。";

// --- エラーメッセージ（仕様書 11） ---
export const ERRORS = {
  cameraDenied: "カメラが利用できません。\n画像アップロードで試してください。",
  cameraUnsupported: "この端末ではカメラが使えない可能性があります。\n画像アップロードで試してください。",
  modelLoad: "AIモデルの読み込みに失敗しました。\nページを再読み込みしてください。",
  noImage: "判定する画像を選択してください。",
  inference: "判定に失敗しました。\nもう一度試してください。",
};

// --- モデル配置 ---
export const MODEL_URL = "model/model.json";
export const METADATA_URL = "model/metadata.json";

// ラベル名を比較用に正規化（小文字化＋区切りをアンダースコアへ統一）。
function normalizeLabel(raw) {
  let s = String(raw).trim().toLowerCase();
  for (const sep of ["___", "__", " ", "-", "/"]) s = s.split(sep).join("_");
  while (s.includes("__")) s = s.split("__").join("_");
  return s.replace(/^_+|_+$/g, "");
}

// metadata.json のラベル表記 → 正規ラベル（eval/labels.js と同方針）。
// Teachable Machine のクラス名は英語キー・日本語表示名のどちらでも解決できる。
const LABEL_ALIASES = {
  bell_pepper: "bell_pepper",
  pepper: "bell_pepper",
  ピーマン: "bell_pepper",
  corn: "corn",
  トウモロコシ: "corn",
  grape: "grape",
  ブドウ: "grape",
  olive: "olive",
  オリーブ: "olive",
  potato: "potato",
  ジャガイモ: "potato",
  strawberry: "strawberry",
  イチゴ: "strawberry",
  tomato: "tomato",
  トマト: "tomato",
};

export function resolveLabel(raw) {
  if (raw == null) throw new Error("label must not be null");
  const key = normalizeLabel(raw);
  if (LABEL_ALIASES[key]) return LABEL_ALIASES[key];
  for (const cls of CLASSES) if (key.includes(cls)) return cls;
  throw new Error(`未知のラベル: ${raw}`);
}
