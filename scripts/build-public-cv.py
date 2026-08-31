#!/usr/bin/env python3
"""Create the public Project Manager DOCX from the approved ATS source.

The source is read-only and remains outside the repository. The script changes
only confirmed public copy while preserving the source document's styles and
layout. It never prints the document body.
"""

from __future__ import annotations

import argparse
import shutil
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = f"{{{WORD_NS}}}"
ET.register_namespace("w", WORD_NS)

REPLACEMENTS = {
    "YUMIND Reborn - автор проекта / Project Lead": (
        "@yumind_bot / Mini App - автор продукта, функции Project Manager / Product Manager"
    ),
    "май 2026 - июль 2026  |  Экспериментальный AI-продукт в формате Telegram-бота и Mini App. Проект создавался для проверки продуктовой гипотезы, развития технических навыков и тестирования моделей и систем памяти AI-агентов.": (
        "май 2026 - июль 2026  |  Завершенный продуктовый этап внутри продолжающей развиваться экосистемы YUMIND Reborn: Telegram-бот и Mini App с собственной системой памяти AI-агента."
    ),
    "Самостоятельно отвечал за продуктовую логику, техническую реализацию, тестирование, запуск и сопровождение; партнер помогал с созданием контента.": (
        "Отвечал за продуктовую логику, техническую реализацию, тестирование, запуск и сопровождение; партнер помогал с контентом."
    ),
    "Тестировал разные AI-модели и подходы к организации памяти агентов, реализовал собственную систему памяти в production-версии.": (
        "Тестировал AI-модели и подходы к памяти агентов; реализовал собственную систему памяти в production-версии."
    ),
    "Запустил Telegram-бот для 96 пользователей и одного администратора.": (
        "На 7 августа 2026 года доступ имели 96 пользовательских аккаунтов и один администратор; это не показатель MAU."
    ),
    "На 7 августа 2026 года продуктом воспользовались 70 уникальных аккаунтов, включая 46 пользователей Mini App и 36 авторов заметок.": (
        "70 уникальных аккаунтов подтвердили использование продукта, включая 46 пользователей Mini App и 36 авторов заметок."
    ),
    "В продукте сохранено 274 существующие неудаленные заметки; 22 аккаунта были активны в течение последних 30 дней.": (
        "В продукте было 274 существующие неудаленные заметки; 22 аккаунта были активны за предыдущие 30 дней."
    ),
    "2017 - 2021": "неоконченное высшее, 2017–2021",
}

CONTACT_REPLACEMENT = (
    "vladislav.sushin@gmail.com  |  +7 988 348-72-36  |  LinkedIn  |  GitHub  |  "
    "Актуально: август 2026"
)
CONTACT_TARGET = "__contact_paragraph__"


def paragraph_text(paragraph: ET.Element) -> str:
    return "".join(node.text or "" for node in paragraph.findall(f".//{W}t"))


def replace_paragraph(paragraph: ET.Element, text: str) -> None:
    text_nodes = paragraph.findall(f".//{W}t")
    if not text_nodes:
        raise ValueError("Target paragraph has no text nodes")
    text_nodes[0].text = text
    for node in text_nodes[1:]:
        node.text = ""


def is_legacy_contact_paragraph(text: str) -> bool:
    """Locate the source contact row without storing obsolete contact details."""
    return "LinkedIn" in text and "@" in text and " | " in text


def build(source: Path, output: Path) -> None:
    if source.resolve() == output.resolve():
        raise ValueError("Output must not overwrite the source document")
    if not source.is_file():
        raise FileNotFoundError(source)

    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="sushin-cv-") as temp_dir:
        draft = Path(temp_dir) / "draft.docx"
        seen: set[str] = set()
        with zipfile.ZipFile(source, "r") as input_zip, zipfile.ZipFile(
            draft, "w", zipfile.ZIP_DEFLATED
        ) as output_zip:
            for info in input_zip.infolist():
                data = input_zip.read(info.filename)
                if info.filename == "word/document.xml":
                    root = ET.fromstring(data)
                    for paragraph in root.findall(f".//{W}p"):
                        current = paragraph_text(paragraph)
                        if is_legacy_contact_paragraph(current):
                            replace_paragraph(paragraph, CONTACT_REPLACEMENT)
                            seen.add(CONTACT_TARGET)
                        elif current in REPLACEMENTS:
                            replace_paragraph(paragraph, REPLACEMENTS[current])
                            seen.add(current)
                    data = ET.tostring(root, encoding="utf-8", xml_declaration=True)
                output_zip.writestr(info, data)

        missing = (set(REPLACEMENTS) | {CONTACT_TARGET}) - seen
        if missing:
            raise ValueError(f"Approved replacement targets missing: {len(missing)}")

        with zipfile.ZipFile(draft, "r") as result_zip:
            document_xml = result_zip.read("word/document.xml").decode("utf-8")
        required = [
            "vladislav.sushin@gmail.com",
            "Актуально: август 2026",
            "неоконченное высшее, 2017–2021",
            "@yumind_bot / Mini App",
        ]
        if any(value not in document_xml for value in required):
            raise ValueError("Public CV validation failed")
        if "icloud.com" in document_xml:
            raise ValueError("Legacy CV email remains in the output")

        shutil.copyfile(draft, output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    build(args.source, args.output)
    print(f"created={args.output} replacements={len(REPLACEMENTS) + 1}")


if __name__ == "__main__":
    main()
