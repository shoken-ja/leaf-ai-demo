# AI葉っぱ診断（授業用デモ）

葉の画像を **健康そうな葉 / 注意が必要そうな葉** の2分類で、ブラウザ内のAIが判定する
教育用の画像認識体験アプリです。サーバー不要・画像は保存も送信もしません。

🔗 **公開URL**: https://shoken-ja.github.io/leaf-ai-demo/

> このAIは授業用の画像認識体験アプリです。
> 実際の病害虫診断や農業上の判断を行うものではありません。
> 最終判断には、現場確認と専門知識が必要です。

## 使い方

1. スマホ／Chromebook／PCのブラウザで公開URLを開く（配布QRからでも可）。
2. 「カメラを開始」して葉を映す、または「画像で試す」で画像を選ぶ。
3. 「判定する」を押すと、AIが2分類＋確信度（%）を表示します。

## 特徴

- 🧠 **ブラウザ内推論** — TensorFlow.js で完結（バックエンド無し）
- 🔒 **プライバシー** — カメラ映像・画像・判定結果を保存せず、外部送信もしない
- 📱 **端末を選ばない** — カメラが使えない場合は画像アップロードで判定

## 技術構成

HTML / CSS / JavaScript（ES Modules）＋ TensorFlow.js。
モデルは Teachable Machine で学習した2分類の画像分類モデル（`model/`）。
ホスティングは GitHub Pages（HTTPS）。

```text
index.html        画面
css/style.css     デザイン
js/               制御・カメラ・モデル読込・推論・判定
vendor/tf.min.js  TensorFlow.js（同梱・CDN非依存）
model/            Teachable Machine 出力モデル
```

## ローカルで動かす

カメラ機能は `localhost` か HTTPS でのみ動作します。

```bash
python3 -m http.server 8765
# → http://localhost:8765 を開く
```

---
※ 本デモは背景データ未取得のため2分類で運用しています。葉でない画像（手・机・背景）も
healthy / caution のどちらかに判定されます。3分類（＋判定対象外）に戻すには背景画像を
用意して再学習が必要です。
