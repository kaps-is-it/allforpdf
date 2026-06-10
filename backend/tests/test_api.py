import io
import zipfile
from pathlib import Path

import fitz
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.conversions.formats import DOCUMENT_CONVERSION_MAP, IMAGE_CONVERSION_MAP
from app.main import app

client = TestClient(app)
FIXTURES = Path(__file__).resolve().parent / "fixtures"
FILE_FIXTURES = FIXTURES / "files"
IMAGE_FIXTURES = FIXTURES / "images"


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
    "ipynb",
    "txt",
    "md",
    "py",
    "js",
    "c",
    "cpp",
    "java",
    "html",
    "htm",
    "css",
    "json",
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


def assert_valid_office_zip(content, expected_member):
    with zipfile.ZipFile(io.BytesIO(content), "r") as archive:
        assert archive.testzip() is None
        assert expected_member in archive.namelist()


def assert_valid_rtf(content):
    assert content.lstrip().startswith(b"{\\rtf")


def assert_text_contains_fixture(content):
    assert b"Converti" in content


def assert_valid_zip_with_pdfs(content):
    with zipfile.ZipFile(io.BytesIO(content), "r") as archive:
        pdfs = [name for name in archive.namelist() if name.lower().endswith(".pdf")]
        assert pdfs
        assert_valid_pdf(archive.read(pdfs[0]))


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


@pytest.mark.parametrize("source_name", ["sample.pdf", "sample.pptx"])
def test_convert_pdf_or_pptx_to_png_zip(source_name):
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
