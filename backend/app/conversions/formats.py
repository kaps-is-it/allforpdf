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

PRESENTATION_INPUT_EXTENSIONS = ['.ppt', '.pptx', '.odp']

PRESENTATION_OUTPUT_TARGETS = ['.pdf', '.pptx', '.odp', '.png', '.jpg', '.zip']

PRESENTATION_CONVERSION_MAP = {
    '.ppt': ['.pdf', '.pptx', '.odp', '.png', '.jpg', '.zip'],
    '.pptx': ['.pdf', '.odp', '.png', '.jpg', '.zip'],
    '.odp': ['.pdf', '.pptx', '.png', '.jpg', '.zip'],
}

PRESENTATION_MEDIA_TYPES = {
    '.pdf': 'application/pdf',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.odp': 'application/vnd.oasis.opendocument.presentation',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.zip': 'application/zip',
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

SPREADSHEET_INPUT_EXTENSIONS = ['.xls', '.xlsx', '.csv', '.ods', '.tsv']

SPREADSHEET_OUTPUT_TARGETS = ['.pdf', '.xlsx', '.xls', '.csv', '.ods', '.tsv', '.html', '.json']

SPREADSHEET_CONVERSION_MAP = {
    '.xls': ['.pdf', '.xlsx', '.csv', '.ods', '.tsv', '.html', '.json'],
    '.xlsx': ['.pdf', '.xls', '.csv', '.ods', '.tsv', '.html', '.json'],
    '.csv': ['.pdf', '.xlsx', '.xls', '.ods', '.tsv', '.html', '.json'],
    '.ods': ['.pdf', '.xlsx', '.xls', '.csv', '.tsv', '.html', '.json'],
    '.tsv': ['.pdf', '.xlsx', '.xls', '.csv', '.ods', '.html', '.json'],
}

SPREADSHEET_MEDIA_TYPES = {
    '.pdf': 'application/pdf',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv',
    '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
    '.tsv': 'text/tab-separated-values',
    '.html': 'text/html',
    '.json': 'application/json',
}

TEXT_DATA_INPUT_EXTENSIONS = [
    '.txt',
    '.md',
    '.json',
    '.xml',
    '.csv',
    '.yaml',
    '.yml',
    '.toml',
    '.html',
    '.css',
    '.js',
    '.ts',
    '.py',
    '.java',
    '.cpp',
    '.c',
]

TEXT_DATA_OUTPUT_TARGETS = ['.pdf', '.txt', '.html', '.json', '.xml', '.csv', '.yaml', '.md', '.docx', '.xlsx']

TEXT_DATA_CONVERSION_MAP = {
    '.txt': ['.pdf', '.docx', '.html', '.md'],
    '.md': ['.pdf', '.html', '.docx', '.txt'],
    '.html': ['.pdf', '.txt', '.md'],
    '.json': ['.pdf', '.txt', '.csv', '.xml', '.yaml'],
    '.xml': ['.pdf', '.txt', '.json', '.csv'],
    '.csv': ['.pdf', '.txt', '.json', '.xml', '.xlsx'],
    '.yaml': ['.pdf', '.txt', '.json'],
    '.yml': ['.pdf', '.txt', '.json'],
    '.toml': ['.pdf', '.txt', '.json', '.yaml'],
    '.css': ['.pdf', '.txt'],
    '.js': ['.pdf', '.txt'],
    '.ts': ['.pdf', '.txt'],
    '.py': ['.pdf', '.txt'],
    '.java': ['.pdf', '.txt'],
    '.cpp': ['.pdf', '.txt'],
    '.c': ['.pdf', '.txt'],
}

TEXT_DATA_MEDIA_TYPES = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.csv': 'text/csv',
    '.yaml': 'application/x-yaml',
    '.md': 'text/markdown',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

NOTEBOOK_INPUT_EXTENSIONS = ['.ipynb']

NOTEBOOK_OUTPUT_TARGETS = ['.pdf', '.html', '.py', '.md']

NOTEBOOK_CONVERSION_MAP = {
    '.ipynb': ['.pdf', '.html', '.py', '.md'],
}

NOTEBOOK_MEDIA_TYPES = {
    '.pdf': 'application/pdf',
    '.html': 'text/html',
    '.py': 'text/x-python',
    '.md': 'text/markdown',
}

EBOOK_INPUT_EXTENSIONS = ['.epub', '.mobi', '.azw3', '.fb2', '.pdf', '.txt']

EBOOK_OUTPUT_TARGETS = ['.epub', '.mobi', '.azw3', '.pdf', '.txt', '.docx']

EBOOK_CONVERSION_MAP = {
    '.epub': ['.pdf', '.mobi', '.azw3', '.txt', '.docx'],
    '.mobi': ['.epub', '.pdf', '.txt', '.docx'],
    '.azw3': ['.epub', '.pdf', '.txt', '.docx'],
    '.fb2': ['.epub', '.pdf', '.txt', '.docx'],
    '.pdf': ['.epub', '.txt', '.docx'],
    '.txt': ['.epub', '.pdf', '.docx'],
}

EBOOK_MEDIA_TYPES = {
    '.epub': 'application/epub+zip',
    '.mobi': 'application/x-mobipocket-ebook',
    '.azw3': 'application/vnd.amazon.ebook',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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


def normalize_presentation_target(value):
    value = (value or '').strip().lower()
    aliases = {
        'jpeg': '.jpg',
        '.jpeg': '.jpg',
        'slide-images': '.zip',
        'slides': '.zip',
    }
    value = aliases.get(value, value)
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


def normalize_spreadsheet_target(value):
    value = (value or '').strip().lower()
    aliases = {
        'excel': '.xlsx',
        'html': '.html',
        'json': '.json',
        'tab': '.tsv',
        'tab-separated': '.tsv',
        'tab-separated-values': '.tsv',
    }
    value = aliases.get(value, value)
    return value if value.startswith('.') else f'.{value}'


def normalize_text_data_target(value):
    value = (value or '').strip().lower()
    aliases = {
        'markdown': '.md',
        '.markdown': '.md',
        'excel': '.xlsx',
        'yml': '.yaml',
        '.yml': '.yaml',
    }
    value = aliases.get(value, value)
    return value if value.startswith('.') else f'.{value}'


def normalize_notebook_target(value):
    value = (value or '').strip().lower()
    aliases = {
        'python': '.py',
        '.python': '.py',
        'markdown': '.md',
        '.markdown': '.md',
    }
    value = aliases.get(value, value)
    return value if value.startswith('.') else f'.{value}'


def normalize_ebook_target(value):
    value = (value or '').strip().lower()
    aliases = {
        'kindle': '.mobi',
        'kindle-format': '.azw3',
        'fictionbook': '.fb2',
        'word': '.docx',
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


def get_presentation_download_name(original_filename, target):
    stem = Path(original_filename).stem
    if target == '.zip':
        return f"{stem}_slide_images.zip"
    return f"{stem}{target}"


def get_document_download_name(original_filename, target):
    stem = Path(original_filename).stem
    return f"{stem}{target}"


def get_spreadsheet_download_name(original_filename, target):
    stem = Path(original_filename).stem
    return f"{stem}{target}"


def get_text_data_download_name(original_filename, target):
    stem = Path(original_filename).stem
    return f"{stem}{target}"


def get_notebook_download_name(original_filename, target):
    stem = Path(original_filename).stem
    return f"{stem}{target}"


def get_ebook_download_name(original_filename, target):
    stem = Path(original_filename).stem
    return f"{stem}{target}"
