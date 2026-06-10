from pathlib import Path

IMAGE_CONVERSION_MAP = {
    '.png': ['.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.tiff', '.svg', '.pdf', '.ico'],
    '.jpg': ['.png', '.jpeg', '.webp', '.bmp', '.gif', '.tiff', '.svg', '.pdf', '.ico'],
    '.jpeg': ['.png', '.jpg', '.webp', '.bmp', '.gif', '.tiff', '.svg', '.pdf', '.ico'],
    '.webp': ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.svg', '.pdf', '.ico'],
    '.bmp': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.tiff', '.svg', '.pdf', '.ico'],
    '.gif': ['.mp4', '.webp', '.zip', '.pdf'],
    '.tiff': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.svg', '.pdf', '.ico'],
    '.tif': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.svg', '.pdf', '.ico'],
    '.svg': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.tiff', '.pdf', '.ico'],
    '.heic': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff', '.svg', '.pdf', '.ico'],
    '.ico': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.tiff', '.svg', '.pdf'],
}

IMAGE_MEDIA_TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.gif': 'image/gif',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.mp4': 'video/mp4',
}

PDF_CONVERSION_TARGETS = [
    '.docx',
    '.pptx',
    '.xlsx',
    '.txt',
    '.html',
    '.png',
    '.jpg',
    '.webp',
    '.svg',
    '.zip',
    'compress',
    'split',
]

PDF_MEDIA_TYPES = {
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.zip': 'application/zip',
    '.pdf': 'application/pdf',
    'compress': 'application/pdf',
    'split': 'application/zip',
}

DOCUMENT_INPUT_EXTENSIONS = ['.doc', '.docx', '.odt', '.rtf', '.txt', '.md', '.html', '.htm']

DOCUMENT_OUTPUT_TARGETS = ['.pdf', '.docx', '.odt', '.rtf', '.txt', '.html', '.md']

DOCUMENT_CONVERSION_MAP = {
    '.doc': ['.pdf', '.docx', '.odt', '.rtf', '.txt', '.html', '.md'],
    '.docx': ['.pdf', '.odt', '.rtf', '.txt', '.html', '.md'],
    '.odt': ['.pdf', '.docx', '.rtf', '.txt', '.html', '.md'],
    '.rtf': ['.pdf', '.docx', '.odt', '.txt', '.html', '.md'],
    '.txt': ['.pdf', '.docx', '.odt', '.rtf', '.html', '.md'],
    '.md': ['.pdf', '.docx', '.odt', '.rtf', '.txt', '.html'],
    '.html': ['.pdf', '.docx', '.odt', '.rtf', '.txt', '.md'],
    '.htm': ['.pdf', '.docx', '.odt', '.rtf', '.txt', '.md'],
}

DOCUMENT_MEDIA_TYPES = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.odt': 'application/vnd.oasis.opendocument.text',
    '.rtf': 'application/rtf',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.md': 'text/markdown',
}


def normalize_image_extension(value):
    value = (value or '').strip().lower()
    if not value:
        return value
    return value if value.startswith('.') else f'.{value}'


def normalize_pdf_target(value):
    value = (value or '').strip().lower()
    aliases = {
        'compressed': 'compress',
        'compressed-pdf': 'compress',
        'compressed_pdf': 'compress',
        'compress-pdf': 'compress',
        'split-pdf': 'split',
        'split_pdf': 'split',
    }
    value = aliases.get(value, value)
    if value in {'compress', 'split'}:
        return value
    return value if value.startswith('.') else f'.{value}'


def normalize_document_target(value):
    value = (value or '').strip().lower()
    aliases = {
        'markdown': '.md',
        '.markdown': '.md',
        'htm': '.html',
        '.htm': '.html',
    }
    value = aliases.get(value, value)
    return value if value.startswith('.') else f'.{value}'


def get_image_download_name(original_filename, target_ext):
    stem = Path(original_filename).stem
    if target_ext == '.zip':
        return f"{stem}_png_frames.zip"
    return f"{stem}{target_ext}"


def get_pdf_download_name(original_filename, target):
    stem = Path(original_filename).stem
    if target == 'compress':
        return f"{stem}_compressed.pdf"
    if target == 'split':
        return f"{stem}_split_pages.zip"
    if target == '.zip':
        return f"{stem}_png_pages.zip"
    return f"{stem}{target}"


def get_document_download_name(original_filename, target):
    stem = Path(original_filename).stem
    return f"{stem}{target}"
