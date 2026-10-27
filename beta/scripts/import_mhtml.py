#!/usr/bin/env python3
"""Importa os artigos salvos pelo navegador em formato MHTML para o SQLite local."""

import argparse
import json
import re
import sqlite3
import uuid
from urllib.request import Request, urlopen
from email import policy
from email.parser import BytesParser
from html.parser import HTMLParser
from pathlib import Path


CATEGORY_BY_LABEL = {
    "Autismo": "autismo",
    "Emoções": "emocoes",
    "Dicas": "dicas",
    "Diagnóstico": "diagnostico",
    "Vida Adulta": "vida_adulta",
    "Trabalho": "trabalho",
}


class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_article = False
        self.article_depth = 0
        self.in_content = False
        self.content_depth = 0
        self.skip_depth = 0
        self.fields = {"title": [], "category": [], "author": [], "read_time": [], "excerpt": []}
        self.current_field = None
        self.markdown = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = attributes.get("class", "")

        if tag == "article" and not self.in_article:
            self.in_article = True
            self.article_depth = 1
            return
        if not self.in_article:
            return
        if tag == "article":
            self.article_depth += 1
        if tag in {"svg", "script", "style"}:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        if tag == "div" and "prose" in classes:
            self.in_content = True
            self.content_depth = 1
            return
        if self.in_content:
            if tag == "div":
                self.content_depth += 1
            if tag == "h2":
                self.markdown.append("\n\n## ")
            elif tag == "h3":
                self.markdown.append("\n\n### ")
            elif tag == "p":
                self.markdown.append("\n\n")
            elif tag == "li":
                self.markdown.append("\n- ")
            elif tag == "strong":
                self.markdown.append("**")
            elif tag == "em":
                self.markdown.append("*")
            elif tag == "blockquote":
                self.markdown.append("\n\n> ")
            elif tag == "br":
                self.markdown.append("\n")
            return
        if tag == "h1":
            self.current_field = "title"
        elif tag == "span" and not self.fields["category"]:
            self.current_field = "category"
        elif tag == "p" and not self.fields["excerpt"]:
            self.current_field = "excerpt"
        elif tag == "span" and self.fields["category"] and not self.fields["author"]:
            self.current_field = "author"
        elif tag == "span" and "flex" in classes and not self.fields["read_time"]:
            self.current_field = "read_time"

    def handle_endtag(self, tag):
        if self.skip_depth and tag in {"svg", "script", "style"}:
            self.skip_depth -= 1
            return
        if not self.in_article or self.skip_depth:
            return
        if self.in_content:
            if tag == "div":
                self.content_depth -= 1
                if self.content_depth == 0:
                    self.in_content = False
            elif tag in {"h2", "h3", "p", "li", "blockquote"}:
                self.markdown.append("\n")
            elif tag == "strong":
                self.markdown.append("**")
            elif tag == "em":
                self.markdown.append("*")
            return
        if tag in {"h1", "span", "p"}:
            self.current_field = None
        if tag == "article":
            self.article_depth -= 1
            self.in_article = self.article_depth > 0

    def handle_data(self, data):
        if not self.in_article or self.skip_depth:
            return
        value = re.sub(r"\s+", " ", data)
        if not value.strip():
            return
        if self.in_content:
            self.markdown.append(value)
        elif self.current_field:
            self.fields[self.current_field].append(value.strip())

    def result(self):
        values = {key: " ".join(parts).strip() for key, parts in self.fields.items()}
        content = re.sub(r"[ \t]+\n", "\n", "".join(self.markdown))
        values["content"] = re.sub(r"\n{3,}", "\n\n", content).strip()
        values["category"] = CATEGORY_BY_LABEL.get(values["category"], "autismo")
        return values


def extract_html(path):
    message = BytesParser(policy=policy.default).parsebytes(path.read_bytes())
    part = next(part for part in message.walk() if part.get_content_type() == "text/html")
    return part.get_payload(decode=True).decode("utf-8")


def ensure_schema(connection):
    connection.execute(
        """CREATE TABLE IF NOT EXISTS blog_posts (
            id TEXT PRIMARY KEY, title TEXT NOT NULL, excerpt TEXT,
            content TEXT NOT NULL, category TEXT DEFAULT 'autismo',
            author TEXT, read_time TEXT, created_date TEXT NOT NULL
        )"""
    )


def import_posts(database_path, source_dir):
    connection = sqlite3.connect(database_path)
    ensure_schema(connection)
    imported = 0
    paths = sorted(source_dir.glob("*.mhtml"), key=lambda item: (not item.stem.isdigit(), item.stem))
    for path in paths:
        parser = ArticleParser()
        parser.feed(extract_html(path))
        post = parser.result()
        if not post["title"] and not post["content"]:
            continue
        upsert_post(connection, post)
        imported += 1
        print(f"Importado: {post['title']}")
    connection.commit()
    connection.close()
    print(f"Total importado: {imported}")


def upsert_post(connection, post):
    if not post.get("title") or not post.get("content"):
        raise ValueError("Registro sem título ou conteúdo")
    existing = connection.execute("SELECT id FROM blog_posts WHERE title = ? ORDER BY created_date LIMIT 1", (post["title"],)).fetchone()
    values = (post.get("excerpt", ""), post["content"], post.get("category", "autismo"), post.get("author", "Equipe Emocionário Amigo"), post.get("read_time", ""))
    if existing:
        connection.execute(
            "UPDATE blog_posts SET excerpt = ?, content = ?, category = ?, author = ?, read_time = ? WHERE id = ?",
            (*values, existing[0]),
        )
    else:
        connection.execute(
            """INSERT INTO blog_posts (id, title, excerpt, content, category, author, read_time, created_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))""",
            (post.get("id", str(uuid.uuid4())), post["title"], *values, post.get("created_date")),
        )


def import_json(database_path, json_path=None, url=None):
    if json_path:
        records = json.loads(Path(json_path).read_text(encoding="utf-8"))
    else:
        request = Request(url, headers={"X-App-Id": "6a8515dbf1889a329b49695f"})
        with urlopen(request) as response:
            records = json.load(response)
    connection = sqlite3.connect(database_path)
    ensure_schema(connection)
    for post in records:
        upsert_post(connection, post)
        print(f"Importado: {post['title']}")
    connection.commit()
    connection.close()
    print(f"Total importado: {len(records)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--database", default="data/app.sqlite")
    parser.add_argument("--source", default="paginas salvas")
    parser.add_argument("--json")
    parser.add_argument("--url")
    args = parser.parse_args()
    if args.json or args.url:
        import_json(Path(args.database), args.json, args.url)
    else:
        import_posts(Path(args.database), Path(args.source))