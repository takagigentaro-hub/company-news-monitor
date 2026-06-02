# 日本 重工・防衛・エネルギー関連企業ニュースモニター

GitHub Pages + GitHub Actions で運用する公開情報モニターです。

## 仕組み

- `index.html` が `data/news.json` を読み込み、ニュース一覧を表示します。
- `.github/workflows/update-news.yml` が1時間ごとに実行されます。
- `scripts/fetch_rss.py` がRSS/Atomフィードを取得し、カテゴリ分類・重複排除・日付順ソートを行い、`data/news.json` を更新します。

## 公開前提の注意

このページには、個人的な情報、非公開情報、個人メモを入れないでください。

## ローカル確認

ブラウザで `file://` として開くと `data/news.json` の読み込みに失敗する場合があります。
以下のようにローカルサーバーを立てて確認してください。

```bash
python -m http.server 8000
```

その後、ブラウザで `http://localhost:8000/` を開きます。
