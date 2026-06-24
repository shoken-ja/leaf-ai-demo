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

// --- 分類クラス（2分類運用：背景データ未取得のため other は不採用） ---
export const CLASSES = ["healthy", "caution"];

export const CLASS_LABELS = {
  healthy: "健康そうな葉",
  caution: "注意が必要そうな葉",
};

// クラス別コメント（仕様書 7.4）
export const CLASS_COMMENTS = {
  healthy: "健康な葉の画像に近い特徴があると判定しました。",
  caution: "変色や斑点など、注意が必要そうな葉の画像に近い特徴があると判定しました。",
};

// --- 確信度しきい値（仕様書 7.1-7.3） ---
export const CONFIDENCE = {
  NORMAL: 0.7, // 70%以上 = 通常判定
  UNSTABLE: 0.5, // 50%以上70%未満 = 不安定
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

// metadata.json のラベル表記 → 正規ラベル（eval/labels.js と同方針）
const LABEL_ALIASES = {
  healthy: "healthy",
  "健康そうな葉": "healthy",
  caution: "caution",
  "注意が必要そうな葉": "caution",
};

export function resolveLabel(raw) {
  if (raw == null) throw new Error("label must not be null");
  const key = String(raw).trim().toLowerCase();
  if (LABEL_ALIASES[key]) return LABEL_ALIASES[key];
  for (const cls of CLASSES) if (key.includes(cls)) return cls;
  throw new Error(`未知のラベル: ${raw}`);
}
