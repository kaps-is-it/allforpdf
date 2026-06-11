import io
import json
import os
import shutil
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

import fitz
import pytest
import xlrd
import yaml
from fastapi.testclient import TestClient
from PIL import Image

from app.conversions.formats import (
    DOCUMENT_CONVERSION_MAP,
    EBOOK_CONVERSION_MAP,
    IMAGE_CONVERSION_MAP,
    NOTEBOOK_CONVERSION_MAP,
    PRESENTATION_CONVERSION_MAP,
    SPREADSHEET_CONVERSION_MAP,
    TEXT_DATA_CONVERSION_MAP,
)
from app.main import app

client = TestClient(app)
FIXTURES = Path(__file__).resolve().parent / "fixtures"
FILE_FIXTURES = FIXTURES / "files"
IMAGE_FIXTURES = FIXTURES / "images"
CALIBRE_ENV = os.environ.get("CALIBRE_EBOOK_CONVERT")
CALIBRE_AVAILABLE = bool(
    (CALIBRE_ENV and Path(CALIBRE_ENV).exists())
    or shutil.which("ebook-convert")
    or Path(r"C:\Program Files\Calibre2\ebook-convert.exe").exists()
    or Path(r"C:\Program Files (x86)\Calibre2\ebook-convert.exe").exists()
)


PDF_EXTENSIONS = [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "bmp",
    "gif",
    "doc",
    "docx",
    "rtf",
    "ppt",
    "pptx",
    "odt",
    "odp",
    "xls",
    "xlsx",
    "csv",
    "ods",
    "tsv",
    "ipynb",
    "txt",
    "md",
    "py",
    "js",
    "ts",
    "c",
    "cpp",
    "java",
    "html",
    "htm",
    "css",
    "json",
    "xml",
    "yaml",
    "yml",
    "toml",
]


def post_file(endpoint, field_name, path, extra_fields=None):
    with path.open("rb") as file:
        response = client.post(
            endpoint,
            data=extra_fields or {},
            files={field_name: (path.name, file, "application/octet-stream")},
        )
    return response


def assert_valid_pdf(content):
    with fitz.open(stream=content, filetype="pdf") as doc:
        assert doc.page_count >= 1


def assert_valid_image(content, expected_format=None):
    with Image.open(io.BytesIO(content)) as image:
        image.verify()
    with Image.open(io.BytesIO(content)) as image:
        if expected_format:
            assert image.format == expected_format
        assert image.width > 0
        assert image.height > 0


def assert_valid_zip_with_pngs(content):
    with zipfile.ZipFile(io.BytesIO(content), "r") as archive:
        pngs = [name for name in archive.namelist() if name.lower().endswith(".png")]
        assert pngs
        assert_valid_image(archive.read(pngs[0]), "PNG")


def assert_valid_zip_with_images(content, suffix, expected_format):
    with zipfile.ZipFile(io.BytesIO(content), "r") as archive:
        images = [name for name in archive.namelist() if name.lower().endswith(suffix)]
        assert images
        assert_valid_image(archive.read(images[0]), expected_format)


def assert_valid_office_zip(content, expected_member):
    with zipfile.ZipFile(io.BytesIO(content), "r") as archive:
        assert archive.testzip() is None
        assert expected_member in archive.namelist()


def assert_valid_epub(content):
    with zipfile.ZipFile(io.BytesIO(content), "r") as archive:
        assert archive.testzip() is None
        assert archive.read("mimetype") == b"application/epub+zip"
        assert "META-INF/container.xml" in archive.namelist()


def assert_valid_xls(content):
    workbook = xlrd.open_workbook(file_contents=content)
    assert workbook.nsheets >= 1
    sheet = workbook.sheet_by_index(0)
    assert sheet.nrows >= 2


def assert_valid_rtf(content):
    assert content.lstrip().startswith(b"{\\rtf")


def assert_text_contains_fixture(content):
    assert b"Converti" in content


def assert_valid_zip_with_pdfs(content):
    with zipfile.ZipFile(io.BytesIO(content), "r") as archive:
        pdfs = [name for name in archive.namelist() if name.lower().endswith(".pdf")]
        assert pdfs
        assert_valid_pdf(archive.read(pdfs[0]))


def assert_valid_xml(content):
    root = ET.fromstring(content)
    assert root.tag


def assert_valid_yaml(content):
    payload = yaml.safe_load(content)
    assert payload is not None


@pytest.mark.parametrize("extension", PDF_EXTENSIONS)
def test_convert_to_pdf_matrix(extension):
    source = FILE_FIXTURES / f"sample.{extension}"
    response = post_file("/api/convert", "file", source)

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith("application/pdf")
    assert_valid_pdf(response.content)


@pytest.mark.parametrize(
    ("source_name", "target", "expected_content_type"),
    [
        ("sample.png", ".webp", "image/webp"),
        ("sample.svg", ".png", "image/png"),
        ("sample.heic", ".jpg", "image/jpeg"),
        ("sample.gif", ".zip", "application/zip"),
        ("sample.gif", ".mp4", "video/mp4"),
        ("sample.tiff", ".pdf", "application/pdf"),
    ],
)
def test_convert_image_representative_outputs(source_name, target, expected_content_type):
    response = post_file(
        "/api/convert-image",
        "file",
        IMAGE_FIXTURES / source_name,
        {"target_format": target},
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith(expected_content_type)

    if target == ".pdf":
        assert_valid_pdf(response.content)
    elif target == ".zip":
        assert_valid_zip_with_pngs(response.content)
    elif target == ".mp4":
        assert b"ftyp" in response.content[:64]
    else:
        assert_valid_image(response.content)


@pytest.mark.parametrize(
    ("input_ext", "target_ext"),
    [(input_ext, target) for input_ext, targets in IMAGE_CONVERSION_MAP.items() for target in targets],
)
def test_convert_image_full_matrix(input_ext, target_ext):
    source = IMAGE_FIXTURES / f"sample{input_ext}"
    response = post_file(
        "/api/convert-image",
        "file",
        source,
        {"target_format": target_ext},
    )

    assert response.status_code == 200, response.text
    if target_ext == ".pdf":
        assert_valid_pdf(response.content)
    elif target_ext == ".zip":
        assert_valid_zip_with_pngs(response.content)
    elif target_ext == ".mp4":
        assert b"ftyp" in response.content[:64]
    elif target_ext == ".svg":
        assert b"<svg" in response.content[:100]
    else:
        assert_valid_image(response.content)


@pytest.mark.parametrize("source_name", ["sample.pdf", "sample.ppt", "sample.pptx", "sample.odp"])
def test_convert_pdf_or_presentation_to_png_zip(source_name):
    response = post_file("/api/convert-pptx-images", "files", FILE_FIXTURES / source_name)

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith("application/zip")
    assert_valid_zip_with_pngs(response.content)


@pytest.mark.parametrize(
    ("input_ext", "target_ext"),
    [(input_ext, target) for input_ext, targets in DOCUMENT_CONVERSION_MAP.items() for target in targets],
)
def test_convert_document_full_matrix(input_ext, target_ext):
    source = FILE_FIXTURES / f"sample{input_ext}"
    response = post_file(
        "/api/convert-document",
        "file",
        source,
        {"target_format": target_ext},
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith(
        {
            ".pdf": "application/pdf",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".odt": "application/vnd.oasis.opendocument.text",
            ".rtf": "application/rtf",
            ".txt": "text/plain",
            ".html": "text/html",
            ".md": "text/markdown",
        }[target_ext]
    )

    if target_ext == ".pdf":
        assert_valid_pdf(response.content)
    elif target_ext == ".docx":
        assert_valid_office_zip(response.content, "word/document.xml")
    elif target_ext == ".odt":
        assert_valid_office_zip(response.content, "content.xml")
    elif target_ext == ".rtf":
        assert_valid_rtf(response.content)
    elif target_ext in {".txt", ".md"}:
        assert_text_contains_fixture(response.content)
    elif target_ext == ".html":
        assert b"<html" in response.content[:500].lower()


@pytest.mark.parametrize(
    ("input_ext", "target_ext"),
    [(input_ext, target) for input_ext, targets in SPREADSHEET_CONVERSION_MAP.items() for target in targets],
)
def test_convert_spreadsheet_full_matrix(input_ext, target_ext):
    source = FILE_FIXTURES / f"sample{input_ext}"
    response = post_file(
        "/api/convert-spreadsheet",
        "file",
        source,
        {"target_format": target_ext},
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith(
        {
            ".pdf": "application/pdf",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls": "application/vnd.ms-excel",
            ".csv": "text/csv",
            ".ods": "application/vnd.oasis.opendocument.spreadsheet",
            ".tsv": "text/tab-separated-values",
            ".html": "text/html",
            ".json": "application/json",
        }[target_ext]
    )

    if target_ext == ".pdf":
        assert_valid_pdf(response.content)
    elif target_ext == ".xlsx":
        assert_valid_office_zip(response.content, "xl/workbook.xml")
    elif target_ext == ".xls":
        assert_valid_xls(response.content)
    elif target_ext == ".ods":
        assert_valid_office_zip(response.content, "content.xml")
    elif target_ext == ".csv":
        assert b"name,value" in response.content
        assert b"alpha,1" in response.content
    elif target_ext == ".tsv":
        assert b"name\tvalue" in response.content
        assert b"alpha\t1" in response.content
    elif target_ext == ".html":
        assert b"<html" in response.content[:500].lower()
        assert b"alpha" in response.content
    elif target_ext == ".json":
        payload = json.loads(response.content)
        records = payload if isinstance(payload, list) else next(iter(payload.values()))
        assert records[0]["name"] == "alpha"


@pytest.mark.parametrize(
    ("input_ext", "target_ext"),
    [(input_ext, target) for input_ext, targets in TEXT_DATA_CONVERSION_MAP.items() for target in targets],
)
def test_convert_text_data_full_matrix(input_ext, target_ext):
    source = FILE_FIXTURES / f"sample{input_ext}"
    response = post_file(
        "/api/convert-text-data",
        "file",
        source,
        {"target_format": target_ext},
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith(
        {
            ".pdf": "application/pdf",
            ".txt": "text/plain",
            ".html": "text/html",
            ".json": "application/json",
            ".xml": "application/xml",
            ".csv": "text/csv",
            ".yaml": "application/x-yaml",
            ".md": "text/markdown",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }[target_ext]
    )

    if target_ext == ".pdf":
        assert_valid_pdf(response.content)
    elif target_ext == ".docx":
        assert_valid_office_zip(response.content, "word/document.xml")
    elif target_ext == ".xlsx":
        assert_valid_office_zip(response.content, "xl/workbook.xml")
    elif target_ext == ".html":
        assert b"<html" in response.content[:500].lower()
    elif target_ext == ".json":
        assert json.loads(response.content) is not None
    elif target_ext == ".xml":
        assert_valid_xml(response.content)
    elif target_ext == ".yaml":
        assert_valid_yaml(response.content)
    else:
        assert response.content.strip()


@pytest.mark.parametrize(
    ("input_ext", "target_ext"),
    [(input_ext, target) for input_ext, targets in NOTEBOOK_CONVERSION_MAP.items() for target in targets],
)
def test_convert_notebook_full_matrix(input_ext, target_ext):
    source = FILE_FIXTURES / f"sample{input_ext}"
    response = post_file(
        "/api/convert-notebook",
        "file",
        source,
        {"target_format": target_ext},
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith(
        {
            ".pdf": "application/pdf",
            ".html": "text/html",
            ".py": "text/x-python",
            ".md": "text/markdown",
        }[target_ext]
    )

    if target_ext == ".pdf":
        assert_valid_pdf(response.content)
    elif target_ext == ".html":
        assert b"<html" in response.content[:500].lower() or b"<!doctype html" in response.content[:500].lower()
    elif target_ext == ".py":
        assert b"print" in response.content
    elif target_ext == ".md":
        assert b"Converti Notebook Fixture" in response.content


@pytest.mark.parametrize(
    ("input_ext", "target_ext"),
    [(input_ext, target) for input_ext, targets in EBOOK_CONVERSION_MAP.items() for target in targets],
)
def test_convert_ebook_full_matrix(input_ext, target_ext):
    if target_ext in {".mobi", ".azw3"} and not CALIBRE_AVAILABLE:
        pytest.skip("Calibre ebook-convert is required for MOBI/AZW3 output tests.")

    source = FILE_FIXTURES / f"sample{input_ext}"
    response = post_file(
        "/api/convert-ebook",
        "file",
        source,
        {"target_format": target_ext},
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith(
        {
            ".epub": "application/epub+zip",
            ".mobi": "application/x-mobipocket-ebook",
            ".azw3": "application/vnd.amazon.ebook",
            ".pdf": "application/pdf",
            ".txt": "text/plain",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }[target_ext]
    )

    if target_ext == ".epub":
        assert_valid_epub(response.content)
    elif target_ext == ".pdf":
        assert_valid_pdf(response.content)
    elif target_ext == ".docx":
        assert_valid_office_zip(response.content, "word/document.xml")
    elif target_ext == ".txt":
        assert response.content.strip()
    elif target_ext in {".mobi", ".azw3"}:
        assert b"BOOK" in response.content[:100]


@pytest.mark.parametrize(
    ("input_ext", "target_ext"),
    [(input_ext, target) for input_ext, targets in PRESENTATION_CONVERSION_MAP.items() for target in targets],
)
def test_convert_presentation_full_matrix(input_ext, target_ext):
    source = FILE_FIXTURES / f"sample{input_ext}"
    response = post_file(
        "/api/convert-presentation",
        "file",
        source,
        {"target_format": target_ext},
    )

    assert response.status_code == 200, response.text

    if target_ext == ".pdf":
        assert response.headers["content-type"].startswith("application/pdf")
        assert_valid_pdf(response.content)
    elif target_ext == ".pptx":
        assert response.headers["content-type"].startswith(
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
        assert_valid_office_zip(response.content, "ppt/presentation.xml")
    elif target_ext == ".odp":
        assert response.headers["content-type"].startswith("application/vnd.oasis.opendocument.presentation")
        assert_valid_office_zip(response.content, "content.xml")
    elif target_ext == ".png":
        content_type = response.headers["content-type"]
        assert content_type.startswith(("image/png", "application/zip"))
        if content_type.startswith("application/zip"):
            assert_valid_zip_with_images(response.content, ".png", "PNG")
        else:
            assert_valid_image(response.content, "PNG")
    elif target_ext == ".jpg":
        content_type = response.headers["content-type"]
        assert content_type.startswith(("image/jpeg", "application/zip"))
        if content_type.startswith("application/zip"):
            assert_valid_zip_with_images(response.content, ".jpg", "JPEG")
        else:
            assert_valid_image(response.content, "JPEG")
    elif target_ext == ".zip":
        assert response.headers["content-type"].startswith("application/zip")
        assert_valid_zip_with_pngs(response.content)


@pytest.mark.parametrize(
    ("target", "expected_content_type"),
    [
        (".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        (".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        (".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        (".txt", "text/plain"),
        (".html", "text/html"),
        (".png", "image/png"),
        (".jpg", "image/jpeg"),
        (".webp", "image/webp"),
        (".svg", "image/svg+xml"),
        (".zip", "application/zip"),
        ("compress", "application/pdf"),
        ("split", "application/zip"),
    ],
)
def test_convert_pdf_target_matrix(target, expected_content_type):
    response = post_file(
        "/api/convert-pdf",
        "file",
        FILE_FIXTURES / "sample.pdf",
        {"target_format": target},
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith(expected_content_type)

    if target == ".docx":
        assert_valid_office_zip(response.content, "word/document.xml")
    elif target == ".pptx":
        assert_valid_office_zip(response.content, "ppt/presentation.xml")
    elif target == ".xlsx":
        assert_valid_office_zip(response.content, "xl/workbook.xml")
    elif target == ".txt":
        assert b"Converti plain text fixture" in response.content
    elif target == ".html":
        assert b"<html" in response.content[:300].lower()
    elif target == ".png":
        assert_valid_image(response.content, "PNG")
    elif target == ".jpg":
        assert_valid_image(response.content, "JPEG")
    elif target == ".webp":
        assert_valid_image(response.content, "WEBP")
    elif target == ".svg":
        assert b"<svg" in response.content[:100]
    elif target == ".zip":
        assert_valid_zip_with_pngs(response.content)
    elif target == "compress":
        assert_valid_pdf(response.content)
    elif target == "split":
        assert_valid_zip_with_pdfs(response.content)


def test_merge_pdfs():
    source = FILE_FIXTURES / "sample.pdf"
    with source.open("rb") as first, source.open("rb") as second:
        response = client.post(
            "/api/merge-pdfs",
            files=[
                ("files", ("first.pdf", first, "application/pdf")),
                ("files", ("second.pdf", second, "application/pdf")),
            ],
        )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith("application/pdf")
    with fitz.open(stream=response.content, filetype="pdf") as doc:
        assert doc.page_count == 2


def test_image_conversion_metadata():
    response = client.get("/api/image-conversions")

    assert response.status_code == 200
    body = response.json()
    assert ".heic" in body["inputs"]
    assert ".png" in body["conversions"][".heic"]
    assert ".mp4" in body["conversions"][".gif"]


def test_pdf_conversion_metadata():
    response = client.get("/api/pdf-conversions")

    assert response.status_code == 200
    body = response.json()
    assert body["inputs"] == [".pdf"]
    assert ".docx" in body["conversions"][".pdf"]
    assert "split" in body["conversions"][".pdf"]
    assert body["multi_file"]["multiple_pdfs"] == "merge"


def test_document_conversion_metadata():
    response = client.get("/api/document-conversions")

    assert response.status_code == 200
    body = response.json()
    assert ".rtf" in body["inputs"]
    assert ".htm" in body["inputs"]
    assert ".md" in body["outputs"]
    assert ".rtf" in body["outputs"]
    assert ".pdf" in body["conversions"][".docx"]
    assert ".docx" in body["conversions"][".md"]
    assert ".txt" in body["conversions"][".html"]


def test_presentation_conversion_metadata():
    response = client.get("/api/presentation-conversions")

    assert response.status_code == 200
    body = response.json()
    assert body["inputs"] == [".odp", ".ppt", ".pptx"]
    assert ".pdf" in body["outputs"]
    assert ".png" in body["outputs"]
    assert ".jpg" in body["outputs"]
    assert ".zip" in body["outputs"]
    assert ".odp" in body["conversions"][".pptx"]
    assert ".pptx" in body["conversions"][".odp"]


def test_spreadsheet_conversion_metadata():
    response = client.get("/api/spreadsheet-conversions")

    assert response.status_code == 200
    body = response.json()
    assert body["inputs"] == [".csv", ".ods", ".tsv", ".xls", ".xlsx"]
    assert ".tsv" in body["outputs"]
    assert ".json" in body["outputs"]
    assert ".pdf" in body["conversions"][".xlsx"]
    assert ".xlsx" in body["conversions"][".csv"]
    assert ".json" in body["conversions"][".tsv"]


def test_text_data_conversion_metadata():
    response = client.get("/api/text-data-conversions")

    assert response.status_code == 200
    body = response.json()
    assert ".xml" in body["inputs"]
    assert ".yaml" in body["inputs"]
    assert ".toml" in body["inputs"]
    assert ".ts" in body["inputs"]
    assert ".xml" in body["outputs"]
    assert ".yaml" in body["outputs"]
    assert ".csv" in body["conversions"][".json"]
    assert ".json" in body["conversions"][".xml"]
    assert ".json" in body["conversions"][".yaml"]
    assert ".txt" in body["conversions"][".ts"]


def test_notebook_conversion_metadata():
    response = client.get("/api/notebook-conversions")

    assert response.status_code == 200
    body = response.json()
    assert body["inputs"] == [".ipynb"]
    assert ".pdf" in body["outputs"]
    assert ".html" in body["outputs"]
    assert ".py" in body["conversions"][".ipynb"]
    assert ".md" in body["conversions"][".ipynb"]


def test_ebook_conversion_metadata():
    response = client.get("/api/ebook-conversions")

    assert response.status_code == 200
    body = response.json()
    assert ".epub" in body["inputs"]
    assert ".mobi" in body["inputs"]
    assert ".azw3" in body["inputs"]
    assert ".fb2" in body["inputs"]
    assert ".docx" in body["outputs"]
    assert ".mobi" in body["conversions"][".epub"]
    assert ".azw3" in body["conversions"][".epub"]
    assert ".epub" in body["conversions"][".pdf"]
    assert ".pdf" in body["conversions"][".txt"]
