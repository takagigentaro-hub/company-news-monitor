#!/usr/bin/env python3
"""
Fetch RSS/Atom feeds for a public company news monitor and write data/news.json.
No private job-hunting notes or personal data are included.

This script intentionally uses only Python standard library modules so it can run
on GitHub-hosted runners without installing dependencies.
"""
from __future__ import annotations

import email.utils
import hashlib
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUTPUT = DATA_DIR / "news.json"
MAX_ITEMS = 180
REQUEST_TIMEOUT = 25
USER_AGENT = "company-news-monitor/1.0 (+https://github.com/)"

# Public RSS sources only. Google News RSS is used for broad monitoring because
# many Japanese corporate pages do not provide stable RSS feeds.
FEEDS: List[Dict[str, str]] = [
    {
        "name": "重工・防衛 Google News",
        "type": "news",
        "url": "https://news.google.com/rss/search?q=%28%E4%B8%89%E8%8F%B1%E9%87%8D%E5%B7%A5+OR+%E5%B7%9D%E5%B4%8E%E9%87%8D%E5%B7%A5+OR+IHI+OR+%E4%B8%89%E8%8F%B1%E9%9B%BB%E6%A9%9F+OR+NEC%29+%28%E9%98%B2%E8%A1%9B+OR+%E8%88%AA%E7%A9%BA%E5%AE%87%E5%AE%99+OR+%E5%AE%89%E5%85%A8%E4%BF%9D%E9%9A%9C+OR+%E5%8F%97%E6%B3%A8%29&hl=ja&gl=JP&ceid=JP:ja",
    },
    {
        "name": "エネルギー・中東 Google News",
        "type": "news",
        "url": "https://news.google.com/rss/search?q=%28INPEX+OR+JERA+OR+%E6%97%A5%E6%8F%AE+OR+%E5%8D%83%E4%BB%A3%E7%94%B0%E5%8C%96%E5%B7%A5+OR+%E4%B8%89%E4%BA%95%E7%89%A9%E7%94%A3+OR+%E4%B8%89%E8%8F%B1%E5%95%86%E4%BA%8B+OR+%E4%BD%8F%E5%8F%8B%E5%95%86%E4%BA%8B+OR+%E4%B8%B8%E7%B4%85%29+%28LNG+OR+%E6%B0%B4%E7%B4%A0+OR+%E3%82%A2%E3%83%B3%E3%83%A2%E3%83%8B%E3%82%A2+OR+%E4%B8%AD%E6%9D%B1+OR+%E3%82%B5%E3%82%A6%E3%82%B8+OR+UAE+OR+%E3%82%AB%E3%82%BF%E3%83%BC%29&hl=ja&gl=JP&ceid=JP:ja",
    },
    {
        "name": "IR・決算・受注 Google News",
        "type": "ir",
        "url": "https://news.google.com/rss/search?q=%28%E4%B8%89%E8%8F%B1%E9%87%8D%E5%B7%A5+OR+%E5%B7%9D%E5%B4%8E%E9%87%8D%E5%B7%A5+OR+IHI+OR+INPEX+OR+JERA+OR+%E6%97%A5%E6%8F%AE+OR+%E5%8D%83%E4%BB%A3%E7%94%B0%E5%8C%96%E5%B7%A5%29+%28IR+OR+%E6%B1%BA%E7%AE%97+OR+%E5%8F%97%E6%B3%A8+OR+%E4%B8%AD%E6%9C%9F%E7%B5%8C%E5%96%B6%E8%A8%88%E7%94%BB+OR+%E6%A5%AD%E7%B8%BE%29&hl=ja&gl=JP&ceid=JP:ja",
    },
    {
        "name": "採用・インターン Google News",
        "type": "jobs",
        "url": "https://news.google.com/rss/search?q=%28%E4%B8%89%E8%8F%B1%E9%87%8D%E5%B7%A5+OR+%E5%B7%9D%E5%B4%8E%E9%87%8D%E5%B7%A5+OR+IHI+OR+%E4%B8%89%E8%8F%B1%E9%9B%BB%E6%A9%9F+OR+NEC+OR+INPEX+OR+JERA+OR+%E6%97%A5%E6%8F%AE+OR+%E5%8D%83%E4%BB%A3%E7%94%B0%E5%8C%96%E5%B7%A5%29+%28%E6%8E%A1%E7%94%A8+OR+%E6%96%B0%E5%8D%92+OR+%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%B3+OR+%E3%82%AD%E3%83%A3%E3%83%AA%E3%82%A2%29&hl=ja&gl=JP&ceid=JP:ja",
    },
    {
        "name": "防衛省 新着情報",
        "type": "official",
        "url": "https://www.mod.go.jp/j/press/rss/news.xml",
    },
    {
        "name": "経済産業省 ニュースリリース",
        "type": "official",
        "url": "https://www.meti.go.jp/rss/meti_news.xml",
    },
]

KEYWORDS = {
    "jobs": ["採用", "新卒", "中途", "インターン", "キャリア", "募集", "人材", "説明会", "マイページ"],
    "ir": ["IR", "決算", "業績", "中期経営計画", "株主", "有価証券", "統合報告", "決算短信", "説明会資料"],
    "stocks": ["株価", "急騰", "急落", "上昇", "下落", "証券", "ETF", "日経平均", "目標株価", "レーティング"],
    "press": ["プレスリリース", "発表", "締結", "受注", "開発", "実証", "提携", "MOU", "覚書", "共同", "開始"],
    "energy": ["LNG", "天然ガス", "原油", "水素", "アンモニア", "発電", "電力", "エネルギー", "燃料", "CCS", "CCUS", "再エネ", "脱炭素"],
    "intl": ["中東", "サウジ", "サウジアラビア", "UAE", "アラブ首長国連邦", "カタール", "オマーン", "イラン", "ホルムズ", "紅海", "海外", "輸出", "安全保障", "防衛装備", "GCAP"],
    "report": ["レポート", "分析", "提言", "報告書", "白書", "研究", "シンクタンク", "CSIS", "IISS", "SIPRI", "IEA"],
}

IMPORTANT_HIGH = ["受注", "契約", "締結", "MOU", "共同開発", "決算", "業績", "中期経営計画", "防衛", "安全保障", "LNG", "水素", "アンモニア", "中東", "サウジ", "UAE", "カタール", "輸出", "GCAP"]
IMPORTANT_MED = ["採用", "インターン", "提携", "発表", "実証", "株価", "レポート", "提言", "IR"]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean_text(value: Optional[str]) -> str:
    if not value:
        return ""
    text = re.sub(r"<!\[CDATA\[(.*?)\]\]>", r"\1", value, flags=re.S)
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def strip_ns(tag: str) -> str:
    return tag.split("}", 1)[-1].lower() if "}" in tag else tag.lower()


def child_text(elem: ET.Element, names: Iterable[str]) -> str:
    targets = {name.lower() for name in names}
    for child in list(elem):
        if strip_ns(child.tag) in targets:
            return clean_text("".join(child.itertext()))
    return ""


def child_link(elem: ET.Element) -> str:
    # RSS <link>text</link> or Atom <link href="..." />
    for child in list(elem):
        tag = strip_ns(child.tag)
        if tag == "link":
            href = child.attrib.get("href")
            if href:
                return href.strip()
            text = clean_text("".join(child.itertext()))
            if text:
                return text
    return ""


def parse_date(value: str) -> str:
    if not value:
        return now_iso()
    value = clean_text(value)
    # RFC822 dates used by RSS
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat(timespec="seconds")
    except Exception:
        pass
    # Atom ISO dates
    normalized = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat(timespec="seconds")
    except Exception:
        return now_iso()


def http_get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
        return response.read()


def parse_feed(xml_bytes: bytes, feed: Dict[str, str]) -> List[Dict[str, Any]]:
    root = ET.fromstring(xml_bytes)
    root_tag = strip_ns(root.tag)
    entries: List[ET.Element]

    if root_tag == "rss":
        channel = root.find("channel")
        entries = list(channel.findall("item")) if channel is not None else []
    elif root_tag == "feed":
        entries = [el for el in list(root) if strip_ns(el.tag) == "entry"]
    else:
        entries = [el for el in root.iter() if strip_ns(el.tag) in {"item", "entry"}]

    items: List[Dict[str, Any]] = []
    for entry in entries:
        title = child_text(entry, ["title"])
        link = child_link(entry)
        summary = child_text(entry, ["description", "summary", "content", "content:encoded"])
        published_raw = child_text(entry, ["pubDate", "published", "updated", "dc:date"])
        published_at = parse_date(published_raw)

        if not title or not link:
            continue

        # Google News wraps original source in the title, but we still keep the feed as source.
        text_for_classify = f"{title} {summary} {feed.get('name', '')} {feed.get('type', '')}"
        category = classify(text_for_classify, feed.get("type", "news"))
        importance = classify_importance(text_for_classify)
        source = infer_source(title, feed.get("name", "RSS"))

        items.append({
            "id": stable_id(link, title),
            "title": title,
            "link": link,
            "summary": summary,
            "source": source,
            "feed_name": feed.get("name", "RSS"),
            "category": category,
            "importance": importance,
            "published_at": published_at,
            "fetched_at": now_iso(),
        })
    return items


def infer_source(title: str, fallback: str) -> str:
    # Google News titles often look like "Title - Publisher".
    parts = [p.strip() for p in title.rsplit(" - ", 1)]
    if len(parts) == 2 and len(parts[1]) <= 40:
        return parts[1]
    return fallback


def classify(text: str, fallback: str = "news") -> str:
    scores: Dict[str, int] = {key: 0 for key in KEYWORDS}
    upper_text = text.upper()
    for category, words in KEYWORDS.items():
        for word in words:
            target = word.upper() if re.search(r"[A-Za-z]", word) else word
            if target in upper_text if re.search(r"[A-Za-z]", word) else word in text:
                scores[category] += 1

    # Prefer explicit feed type when the score is tied or weak.
    if fallback in scores:
        scores[fallback] += 1

    best_category, best_score = max(scores.items(), key=lambda kv: kv[1])
    if best_score <= 0:
        return "news"
    return best_category


def classify_importance(text: str) -> str:
    upper = text.upper()
    for word in IMPORTANT_HIGH:
        if (word.upper() in upper) if re.search(r"[A-Za-z]", word) else (word in text):
            return "high"
    for word in IMPORTANT_MED:
        if (word.upper() in upper) if re.search(r"[A-Za-z]", word) else (word in text):
            return "med"
    return "low"


def canonical_url(url: str) -> str:
    try:
        parsed = urllib.parse.urlsplit(url)
        query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        query = [(k, v) for k, v in query if not k.lower().startswith("utm_") and k.lower() not in {"fbclid", "gclid"}]
        return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc.lower(), parsed.path, urllib.parse.urlencode(query), ""))
    except Exception:
        return url


def stable_id(link: str, title: str) -> str:
    base = canonical_url(link) or title
    return hashlib.sha1(base.encode("utf-8", errors="ignore")).hexdigest()[:16]


def normalize_title(title: str) -> str:
    title = re.sub(r"\s+-\s+[^-]{2,40}$", "", title)
    title = re.sub(r"\s+", "", title)
    return title.lower()


def deduplicate(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen_urls = set()
    seen_titles = set()
    result: List[Dict[str, Any]] = []
    for item in sorted(items, key=lambda x: x.get("published_at", ""), reverse=True):
        url_key = canonical_url(item.get("link", ""))
        title_key = normalize_title(item.get("title", ""))
        if url_key in seen_urls or title_key in seen_titles:
            continue
        seen_urls.add(url_key)
        seen_titles.add(title_key)
        result.append(item)
    return result


def fetch_all() -> Tuple[List[Dict[str, Any]], List[Dict[str, str]]]:
    items: List[Dict[str, Any]] = []
    errors: List[Dict[str, str]] = []
    for feed in FEEDS:
        name = feed.get("name", feed.get("url", "RSS"))
        url = feed["url"]
        print(f"[fetch] {name}: {url}")
        try:
            xml_bytes = http_get(url)
            parsed = parse_feed(xml_bytes, feed)
            print(f"[ok] {name}: {len(parsed)} items")
            items.extend(parsed)
            time.sleep(1.0)
        except Exception as exc:  # noqa: BLE001 - log and continue per feed
            message = f"{type(exc).__name__}: {exc}"
            print(f"[error] {name}: {message}", file=sys.stderr)
            errors.append({"name": name, "url": url, "error": message})
    return deduplicate(items)[:MAX_ITEMS], errors


def write_json(items: List[Dict[str, Any]], errors: List[Dict[str, str]]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": now_iso(),
        "item_count": len(items),
        "feeds": FEEDS,
        "errors": errors,
        "items": items,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[write] {OUTPUT} ({len(items)} items, {len(errors)} errors)")


def main() -> int:
    items, errors = fetch_all()
    write_json(items, errors)
    # Do not fail the workflow just because some feeds are temporarily down.
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
