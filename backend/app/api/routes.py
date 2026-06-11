import os
import shutil
import uuid
import zipfile as zipfile_module
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask

from app.conversions.formats import (
    DOCUMENT_CONVERSION_MAP,
    DOCUMENT_OUTPUT_TARGETS,
    DOCUMENT_MEDIA_TYPES,
    EBOOK_CONVERSION_MAP,
    EBOOK_OUTPUT_TARGETS,
    IMAGE_CONVERSION_MAP,
    IMAGE_MEDIA_TYPES,
    NOTEBOOK_CONVERSION_MAP,
    NOTEBOOK_OUTPUT_TARGETS,
    PDF_CONVERSION_TARGETS,
    PDF_MEDIA_TYPES,
    PRESENTATION_CONVERSION_MAP,
    PRESENTATION_OUTPUT_TARGETS,
    SPREADSHEET_CONVERSION_MAP,
    SPREADSHEET_OUTPUT_TARGETS,
    TEXT_DATA_CONVERSION_MAP,
    TEXT_DATA_OUTPUT_TARGETS,
    get_document_download_name,
    get_image_download_name,
    normalize_image_extension,
    normalize_document_target,
    normalize_ebook_target,
    normalize_notebook_target,
    normalize_pdf_target,
    normalize_presentation_target,
    normalize_spreadsheet_target,
    normalize_text_data_target,
)
from app.conversions.services import (
    process_document_conversion,
    process_document_to_images,
    process_ebook_conversion,
    process_image_conversion,
    process_image_to_pdf,
    process_ipynb_to_pdf,
    process_notebook_conversion,
    process_office_to_pdf,
    process_pdf_conversion,
    process_pdf_merge,
    process_presentation_conversion,
    process_spreadsheet_conversion,
    process_spreadsheet_to_pdf,
    process_text_data_conversion,
    process_text_code_to_pdf,
)
from app.core.config import TEMP_DIR
from app.core.files import cleanup_paths, make_temp_path, save_upload

router = APIRouter(prefix="/api")


def converted_file_response(path, filename, media_type, cleanup):
    return FileResponse(
        path=path,
        filename=filename,
        media_type=media_type,
        headers={"Access-Control-Expose-Headers": "Content-Disposition"},
        background=BackgroundTask(cleanup_paths, cleanup),
    )


@router.post("/convert")
async def convert_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = Path(file.filename).suffix.lower()
    input_path = make_temp_path(ext)
    output_path = input_path.with_suffix(".pdf")
    save_upload(file, input_path)

    try:
        if ext in ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif']:
            await process_image_to_pdf(str(input_path.resolve()), str(output_path.resolve()))
        elif ext in ['.doc', '.docx', '.ppt', '.pptx', '.odt', '.odp', '.rtf']:
            libreoffice_out = await process_office_to_pdf(str(input_path.resolve()), str(TEMP_DIR.resolve()))
            if os.path.exists(libreoffice_out) and libreoffice_out != str(output_path.resolve()):
                shutil.move(libreoffice_out, output_path)
        elif ext in ['.xls', '.xlsx', '.csv', '.ods', '.tsv']:
            await process_spreadsheet_to_pdf(str(input_path.resolve()), str(output_path.resolve()), ext)
        elif ext == '.ipynb':
            await process_ipynb_to_pdf(str(input_path.resolve()), str(output_path.resolve()))
        elif ext in [
            '.txt',
            '.md',
            '.py',
            '.js',
            '.ts',
            '.c',
            '.cpp',
            '.java',
            '.html',
            '.htm',
            '.css',
            '.json',
            '.xml',
            '.yaml',
            '.yml',
            '.toml',
        ]:
            text_ext = '.html' if ext == '.htm' else ext
            await process_text_code_to_pdf(str(input_path.resolve()), str(output_path.resolve()), text_ext)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

        if not output_path.exists():
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        return converted_file_response(
            path=output_path,
            filename=f"{Path(file.filename).stem}.pdf",
            media_type="application/pdf",
            cleanup=[input_path, output_path],
        )
    except HTTPException:
        cleanup_paths([input_path, output_path])
        raise
    except Exception as e:
        cleanup_paths([input_path, output_path])
        print(f"Error converting {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.get("/image-conversions")
async def image_conversions():
    return {
        "inputs": sorted(IMAGE_CONVERSION_MAP.keys()),
        "conversions": IMAGE_CONVERSION_MAP,
        "outputs": sorted({target for targets in IMAGE_CONVERSION_MAP.values() for target in targets}),
    }


@router.get("/pdf-conversions")
async def pdf_conversions():
    return {
        "inputs": [".pdf"],
        "outputs": PDF_CONVERSION_TARGETS,
        "conversions": {".pdf": PDF_CONVERSION_TARGETS},
        "multi_file": {"multiple_pdfs": "merge"},
    }


@router.get("/document-conversions")
async def document_conversions():
    return {
        "inputs": sorted(DOCUMENT_CONVERSION_MAP.keys()),
        "outputs": DOCUMENT_OUTPUT_TARGETS,
        "conversions": DOCUMENT_CONVERSION_MAP,
    }


@router.get("/presentation-conversions")
async def presentation_conversions():
    return {
        "inputs": sorted(PRESENTATION_CONVERSION_MAP.keys()),
        "outputs": PRESENTATION_OUTPUT_TARGETS,
        "conversions": PRESENTATION_CONVERSION_MAP,
    }


@router.get("/spreadsheet-conversions")
async def spreadsheet_conversions():
    return {
        "inputs": sorted(SPREADSHEET_CONVERSION_MAP.keys()),
        "outputs": SPREADSHEET_OUTPUT_TARGETS,
        "conversions": SPREADSHEET_CONVERSION_MAP,
    }


@router.get("/text-data-conversions")
async def text_data_conversions():
    return {
        "inputs": sorted(TEXT_DATA_CONVERSION_MAP.keys()),
        "outputs": TEXT_DATA_OUTPUT_TARGETS,
        "conversions": TEXT_DATA_CONVERSION_MAP,
    }


@router.get("/notebook-conversions")
async def notebook_conversions():
    return {
        "inputs": sorted(NOTEBOOK_CONVERSION_MAP.keys()),
        "outputs": NOTEBOOK_OUTPUT_TARGETS,
        "conversions": NOTEBOOK_CONVERSION_MAP,
    }


@router.get("/ebook-conversions")
async def ebook_conversions():
    return {
        "inputs": sorted(EBOOK_CONVERSION_MAP.keys()),
        "outputs": EBOOK_OUTPUT_TARGETS,
        "conversions": EBOOK_CONVERSION_MAP,
    }


@router.post("/convert-notebook")
async def convert_notebook_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    input_ext = Path(file.filename).suffix.lower()
    target_ext = normalize_notebook_target(target_format)

    if input_ext not in NOTEBOOK_CONVERSION_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported notebook type: {input_ext}")
    if target_ext not in NOTEBOOK_CONVERSION_MAP[input_ext]:
        raise HTTPException(status_code=400, detail=f"Unsupported notebook conversion: {input_ext} to {target_ext}")

    input_path = make_temp_path(input_ext)
    save_upload(file, input_path)

    cleanup_candidates = [input_path]

    try:
        result = await process_notebook_conversion(
            str(input_path.resolve()),
            str(TEMP_DIR.resolve()),
            file.filename,
            target_ext,
        )

        if not os.path.exists(result.path):
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        cleanup_candidates.append(result.path)
        return converted_file_response(
            path=result.path,
            filename=result.filename,
            media_type=result.media_type,
            cleanup=cleanup_candidates,
        )
    except HTTPException:
        cleanup_paths(cleanup_candidates)
        raise
    except Exception as e:
        cleanup_paths(cleanup_candidates)
        print(f"Error converting notebook {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/convert-ebook")
async def convert_ebook_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    input_ext = Path(file.filename).suffix.lower()
    target_ext = normalize_ebook_target(target_format)

    if input_ext not in EBOOK_CONVERSION_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported eBook type: {input_ext}")
    if target_ext not in EBOOK_CONVERSION_MAP[input_ext]:
        raise HTTPException(status_code=400, detail=f"Unsupported eBook conversion: {input_ext} to {target_ext}")

    input_path = make_temp_path(input_ext)
    save_upload(file, input_path)

    cleanup_candidates = [input_path]

    try:
        result = await process_ebook_conversion(
            str(input_path.resolve()),
            str(TEMP_DIR.resolve()),
            file.filename,
            input_ext,
            target_ext,
        )

        if not os.path.exists(result.path):
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        cleanup_candidates.append(result.path)
        return converted_file_response(
            path=result.path,
            filename=result.filename,
            media_type=result.media_type,
            cleanup=cleanup_candidates,
        )
    except HTTPException:
        cleanup_paths(cleanup_candidates)
        raise
    except Exception as e:
        cleanup_paths(cleanup_candidates)
        print(f"Error converting eBook {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/convert-spreadsheet")
async def convert_spreadsheet_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    input_ext = Path(file.filename).suffix.lower()
    target_ext = normalize_spreadsheet_target(target_format)

    if input_ext not in SPREADSHEET_CONVERSION_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported spreadsheet type: {input_ext}")
    if target_ext not in SPREADSHEET_CONVERSION_MAP[input_ext]:
        raise HTTPException(status_code=400, detail=f"Unsupported spreadsheet conversion: {input_ext} to {target_ext}")

    input_path = make_temp_path(input_ext)
    save_upload(file, input_path)

    cleanup_candidates = [input_path]

    try:
        result = await process_spreadsheet_conversion(
            str(input_path.resolve()),
            str(TEMP_DIR.resolve()),
            file.filename,
            input_ext,
            target_ext,
        )

        if not os.path.exists(result.path):
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        cleanup_candidates.append(result.path)
        return converted_file_response(
            path=result.path,
            filename=result.filename,
            media_type=result.media_type,
            cleanup=cleanup_candidates,
        )
    except HTTPException:
        cleanup_paths(cleanup_candidates)
        raise
    except Exception as e:
        cleanup_paths(cleanup_candidates)
        print(f"Error converting spreadsheet {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/convert-text-data")
async def convert_text_data_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    input_ext = Path(file.filename).suffix.lower()
    target_ext = normalize_text_data_target(target_format)

    if input_ext not in TEXT_DATA_CONVERSION_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported text/data type: {input_ext}")
    if target_ext not in TEXT_DATA_CONVERSION_MAP[input_ext]:
        raise HTTPException(status_code=400, detail=f"Unsupported text/data conversion: {input_ext} to {target_ext}")

    input_path = make_temp_path(input_ext)
    save_upload(file, input_path)

    cleanup_candidates = [input_path]

    try:
        result = await process_text_data_conversion(
            str(input_path.resolve()),
            str(TEMP_DIR.resolve()),
            file.filename,
            input_ext,
            target_ext,
        )

        if not os.path.exists(result.path):
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        cleanup_candidates.append(result.path)
        return converted_file_response(
            path=result.path,
            filename=result.filename,
            media_type=result.media_type,
            cleanup=cleanup_candidates,
        )
    except HTTPException:
        cleanup_paths(cleanup_candidates)
        raise
    except Exception as e:
        cleanup_paths(cleanup_candidates)
        print(f"Error converting text/data {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/convert-document")
async def convert_document_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    input_ext = Path(file.filename).suffix.lower()
    target_ext = normalize_document_target(target_format)

    if input_ext not in DOCUMENT_CONVERSION_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported document type: {input_ext}")
    if target_ext not in DOCUMENT_CONVERSION_MAP[input_ext]:
        raise HTTPException(status_code=400, detail=f"Unsupported document conversion: {input_ext} to {target_ext}")

    input_path = make_temp_path(input_ext)
    save_upload(file, input_path)

    cleanup_candidates = [input_path]

    try:
        result = await process_document_conversion(
            str(input_path.resolve()),
            str(TEMP_DIR.resolve()),
            file.filename,
            input_ext,
            target_ext,
        )

        if not os.path.exists(result.path):
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        cleanup_candidates.append(result.path)
        return converted_file_response(
            path=result.path,
            filename=result.filename,
            media_type=result.media_type,
            cleanup=cleanup_candidates,
        )
    except HTTPException:
        cleanup_paths(cleanup_candidates)
        raise
    except Exception as e:
        cleanup_paths(cleanup_candidates)
        print(f"Error converting document {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/convert-presentation")
async def convert_presentation_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    input_ext = Path(file.filename).suffix.lower()
    target_ext = normalize_presentation_target(target_format)

    if input_ext not in PRESENTATION_CONVERSION_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported presentation type: {input_ext}")
    if target_ext not in PRESENTATION_CONVERSION_MAP[input_ext]:
        raise HTTPException(status_code=400, detail=f"Unsupported presentation conversion: {input_ext} to {target_ext}")

    input_path = make_temp_path(input_ext)
    save_upload(file, input_path)

    cleanup_candidates = [input_path]

    try:
        result = await process_presentation_conversion(
            str(input_path.resolve()),
            str(TEMP_DIR.resolve()),
            file.filename,
            input_ext,
            target_ext,
        )

        if not os.path.exists(result.path):
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        cleanup_candidates.append(result.path)
        return converted_file_response(
            path=result.path,
            filename=result.filename,
            media_type=result.media_type,
            cleanup=cleanup_candidates,
        )
    except HTTPException:
        cleanup_paths(cleanup_candidates)
        raise
    except Exception as e:
        cleanup_paths(cleanup_candidates)
        print(f"Error converting presentation {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/convert-pdf")
async def convert_pdf_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    input_ext = Path(file.filename).suffix.lower()
    if input_ext != ".pdf":
        raise HTTPException(status_code=400, detail=f"Unsupported file type for PDF tools: {input_ext}")

    target = normalize_pdf_target(target_format)
    if target not in PDF_CONVERSION_TARGETS:
        raise HTTPException(status_code=400, detail=f"Unsupported PDF conversion target: {target}")

    input_path = make_temp_path(".pdf")
    save_upload(file, input_path)

    cleanup_candidates = [input_path]

    try:
        result = await process_pdf_conversion(
            str(input_path.resolve()),
            str(TEMP_DIR.resolve()),
            file.filename,
            target,
        )

        if not os.path.exists(result.path):
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        cleanup_candidates.append(result.path)
        return converted_file_response(
            path=result.path,
            filename=result.filename,
            media_type=result.media_type,
            cleanup=cleanup_candidates,
        )
    except HTTPException:
        cleanup_paths(cleanup_candidates)
        raise
    except Exception as e:
        cleanup_paths(cleanup_candidates)
        print(f"Error converting PDF {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/merge-pdfs")
async def merge_pdf_files(files: List[UploadFile] = File(...)):
    if not files or all(f.filename == "" for f in files):
        raise HTTPException(status_code=400, detail="No files provided")
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least two PDFs to merge.")

    input_paths = []
    output_path = TEMP_DIR / f"{uuid.uuid4()}_merged.pdf"

    try:
        for file in files:
            if not file.filename:
                raise HTTPException(status_code=400, detail="Every uploaded file must have a filename.")
            input_ext = Path(file.filename).suffix.lower()
            if input_ext != ".pdf":
                raise HTTPException(status_code=400, detail=f"Unsupported file type for merge: {input_ext}")

            input_path = make_temp_path(".pdf")
            save_upload(file, input_path)
            input_paths.append(str(input_path.resolve()))

        await process_pdf_merge(input_paths, str(output_path.resolve()))

        if not output_path.exists():
            raise HTTPException(status_code=500, detail="Merge failed: output file not generated")

        return converted_file_response(
            path=output_path,
            filename=f"Converti_Merged_{len(files)}_files.pdf",
            media_type=PDF_MEDIA_TYPES[".pdf"],
            cleanup=[*input_paths, output_path],
        )
    except HTTPException:
        cleanup_paths([*input_paths, output_path])
        raise
    except Exception as e:
        cleanup_paths([*input_paths, output_path])
        print(f"Error merging PDFs: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/convert-image")
async def convert_image_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    input_ext = Path(file.filename).suffix.lower()
    target_ext = normalize_image_extension(target_format)

    if input_ext not in IMAGE_CONVERSION_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {input_ext}")
    if target_ext not in IMAGE_CONVERSION_MAP[input_ext]:
        raise HTTPException(status_code=400, detail=f"Unsupported image conversion: {input_ext} to {target_ext}")

    input_path = make_temp_path(input_ext)
    output_path = make_temp_path(target_ext)
    save_upload(file, input_path)

    try:
        final_output_path = await process_image_conversion(
            str(input_path.resolve()),
            str(output_path.resolve()),
            input_ext,
            target_ext,
        )

        if not os.path.exists(final_output_path):
            raise HTTPException(status_code=500, detail="Conversion failed: output file not generated")

        return converted_file_response(
            path=final_output_path,
            filename=get_image_download_name(file.filename, target_ext),
            media_type=IMAGE_MEDIA_TYPES.get(target_ext, "application/octet-stream"),
            cleanup=[input_path, output_path, final_output_path],
        )
    except HTTPException:
        cleanup_paths([input_path, output_path])
        raise
    except Exception as e:
        cleanup_paths([input_path, output_path])
        print(f"Error converting image {file.filename}: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})


@router.post("/convert-pptx-images")
async def convert_to_images(files: List[UploadFile] = File(...)):
    if not files or all(f.filename == '' for f in files):
        raise HTTPException(status_code=400, detail="No files provided")

    allowed_exts = {'.ppt', '.pptx', '.odp', '.pdf'}
    for f in files:
        ext = Path(f.filename).suffix.lower()
        if ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{ext}' for '{f.filename}'. Only .ppt, .pptx, .odp, and .pdf files are accepted.",
            )

    generated_zips = []
    cleanup_candidates = []

    try:
        for file in files:
            ext = Path(file.filename).suffix.lower()
            input_path = make_temp_path(ext)
            output_zip_path = TEMP_DIR / f"{uuid.uuid4()}_{Path(file.filename).stem}_slides.zip"
            cleanup_candidates.extend([input_path, output_zip_path])
            save_upload(file, input_path)

            try:
                await process_document_to_images(
                    str(input_path.resolve()),
                    str(output_zip_path.resolve()),
                    file.filename,
                )

                if not output_zip_path.exists():
                    raise Exception(f"Conversion failed for {file.filename}: output not generated.")

                generated_zips.append((file.filename, output_zip_path))
            except Exception as e:
                cleanup_paths(cleanup_candidates)
                print(f"Error converting {file.filename}: {e}")
                return JSONResponse(
                    status_code=500,
                    content={"detail": f"Failed on '{file.filename}': {str(e)}", "error": True},
                )

        if len(generated_zips) == 1:
            orig_name, zip_path = generated_zips[0]
            return converted_file_response(
                path=zip_path,
                filename=f"{Path(orig_name).stem}_pages.zip",
                media_type="application/zip",
                cleanup=cleanup_candidates,
            )

        mega_zip_path = TEMP_DIR / f"{uuid.uuid4()}_all_slides.zip"
        cleanup_candidates.append(mega_zip_path)
        with zipfile_module.ZipFile(str(mega_zip_path), 'w', zipfile_module.ZIP_DEFLATED) as mega:
            for index, (orig_name, zip_path) in enumerate(generated_zips, start=1):
                inner_zip_name = f"{index:02d}_{Path(orig_name).stem}_slides.zip"
                mega.write(str(zip_path), arcname=inner_zip_name)

        return converted_file_response(
            path=mega_zip_path,
            filename=f"Converti_Pages_{len(generated_zips)}_files.zip",
            media_type="application/zip",
            cleanup=cleanup_candidates,
        )
    except HTTPException:
        cleanup_paths(cleanup_candidates)
        raise
    except Exception as e:
        cleanup_paths(cleanup_candidates)
        print(f"Error in batch PPTX conversion: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e), "error": True})
