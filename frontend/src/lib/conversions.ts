import type { Mode, ModeConfig } from '../types/conversion';
import conversionData from '../data/conversions.json';

export const IMAGE_CONVERSION_MAP = conversionData.imageConversionMap as Record<string, string[]>;
export const IMAGE_TARGET_OPTIONS = conversionData.imageTargetOptions;
export const PDF_TARGET_OPTIONS = conversionData.pdfTargetOptions;
export const PRESENTATION_CONVERSION_MAP = conversionData.presentationConversionMap as Record<string, string[]>;
export const PRESENTATION_TARGET_OPTIONS = conversionData.presentationTargetOptions;
export const DOCUMENT_CONVERSION_MAP = conversionData.documentConversionMap as Record<string, string[]>;
export const DOCUMENT_TARGET_OPTIONS = conversionData.documentTargetOptions;
export const SPREADSHEET_CONVERSION_MAP = conversionData.spreadsheetConversionMap as Record<string, string[]>;
export const SPREADSHEET_TARGET_OPTIONS = conversionData.spreadsheetTargetOptions;
export const TEXT_DATA_CONVERSION_MAP = conversionData.textDataConversionMap as Record<string, string[]>;
export const TEXT_DATA_TARGET_OPTIONS = conversionData.textDataTargetOptions;
export const NOTEBOOK_CONVERSION_MAP = conversionData.notebookConversionMap as Record<string, string[]>;
export const NOTEBOOK_TARGET_OPTIONS = conversionData.notebookTargetOptions;
export const EBOOK_CONVERSION_MAP = conversionData.ebookConversionMap as Record<string, string[]>;
export const EBOOK_TARGET_OPTIONS = conversionData.ebookTargetOptions;

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
  pdf: {
    subtitle:
      'Convert any document, presentation, image, or Jupyter notebook into a pristine PDF instantly. Everything happens blazingly fast.',
    dropzoneTitle: 'Drag & Drop your files here',
    dropzoneIcon: 'bx-cloud-upload',
    supportedFormats: 'Supported formats: Word, RTF, Excel, PowerPoint, Text, Code, Markdown, HTML, XML, YAML, TOML, Pages, Jupyter, Images',
    accept:
      '.pptx,.ppt,.docx,.doc,.rtf,.xlsx,.xls,.csv,.tsv,.odt,.ods,.odp,.ipynb,.py,.js,.ts,.java,.c,.cpp,.html,.htm,.css,.json,.xml,.yaml,.yml,.toml,.md,.txt,.jpg,.jpeg,.png,.webp,.gif,.bmp',
    statusText: 'Converting to PDF...',
    heroText: 'All your files have been successfully processed and pixel-preserved.',
  },
  documents: {
    subtitle:
      'Convert Word, OpenDocument, RTF, text, Markdown, and HTML files into the document format you need.',
    dropzoneTitle: 'Drop your document files here',
    dropzoneIcon: 'bxs-file-doc',
    supportedFormats: 'Supported documents: DOC, DOCX, ODT, RTF, TXT, MD, HTML, HTM',
    accept: '.doc,.docx,.odt,.rtf,.txt,.md,.html,.htm',
    statusText: 'Converting document...',
    heroText: 'Your document conversions are ready to download.',
  },
  spreadsheets: {
    subtitle:
      'Convert Excel, OpenDocument, CSV, and TSV spreadsheets to PDF, workbook formats, delimited data, HTML, or JSON.',
    dropzoneTitle: 'Drop your spreadsheet files here',
    dropzoneIcon: 'bx-spreadsheet',
    supportedFormats: 'Supported spreadsheets: XLS, XLSX, CSV, ODS, TSV',
    accept: '.xls,.xlsx,.csv,.ods,.tsv',
    statusText: 'Converting spreadsheet...',
    heroText: 'Your spreadsheet conversions are ready to download.',
  },
  'text-data': {
    subtitle:
      'Convert text, Markdown, HTML, JSON, XML, YAML, TOML, CSV, and source code into clean output formats.',
    dropzoneTitle: 'Drop your text, code, or data files here',
    dropzoneIcon: 'bx-code-curly',
    supportedFormats: 'Supported files: TXT, MD, JSON, XML, CSV, YAML, YML, TOML, HTML, CSS, JS, TS, PY, JAVA, CPP, C',
    accept: '.txt,.md,.json,.xml,.csv,.yaml,.yml,.toml,.html,.css,.js,.ts,.py,.java,.cpp,.c',
    statusText: 'Converting text/data file...',
    heroText: 'Your text, code, and data conversions are ready to download.',
  },
  notebooks: {
    subtitle: 'Convert Jupyter notebooks into PDF, HTML, Python scripts, or Markdown documents.',
    dropzoneTitle: 'Drop your notebook files here',
    dropzoneIcon: 'bx-book-content',
    supportedFormats: 'Supported notebooks: IPYNB',
    accept: '.ipynb',
    statusText: 'Converting notebook...',
    heroText: 'Your notebook conversions are ready to download.',
  },
  ebooks: {
    subtitle:
      'Convert eBooks between EPUB, Kindle-friendly formats, PDF, plain text, and DOCX when the source allows text extraction.',
    dropzoneTitle: 'Drop your eBook files here',
    dropzoneIcon: 'bx-book-open',
    supportedFormats: 'Supported eBooks: EPUB, MOBI, AZW3, FB2, PDF, TXT',
    accept: '.epub,.mobi,.azw3,.fb2,.pdf,.txt',
    statusText: 'Converting eBook...',
    heroText: 'Your eBook conversions are ready to download.',
  },
  'pdf-tools': {
    subtitle:
      'Convert PDFs into Office files, text, HTML, page images, compressed PDFs, split archives, or merged PDFs.',
    dropzoneTitle: 'Drop your PDF files here',
    dropzoneIcon: 'bxs-file-pdf',
    supportedFormats: 'Accepted format: .pdf files',
    accept: '.pdf',
    statusText: 'Processing PDF...',
    heroText: 'Your PDF conversions are ready to download.',
  },
  image: {
    subtitle: 'Convert images between modern formats, export GIF frames, make icons, or turn artwork into PDFs.',
    dropzoneTitle: 'Drop your image files here',
    dropzoneIcon: 'bxs-image-alt',
    supportedFormats: 'Supported images: PNG, JPG, JPEG, WEBP, BMP, GIF, TIFF, TIF, SVG, HEIC, ICO',
    accept: '.png,.jpg,.jpeg,.webp,.bmp,.gif,.tiff,.tif,.svg,.heic,.ico',
    statusText: 'Converting image...',
    heroText: 'Your image conversions are ready to download.',
  },
  presentations: {
    subtitle:
      'Convert PowerPoint and OpenDocument presentations to PDF, PPTX, ODP, slide images, or a ZIP of slides.',
    dropzoneTitle: 'Drop your presentation files here',
    dropzoneIcon: 'bx-slideshow',
    supportedFormats: 'Supported presentations: PPT, PPTX, ODP',
    accept: '.ppt,.pptx,.odp',
    statusText: 'Converting presentation...',
    heroText: 'Your presentation conversions are ready to download.',
  },
  'pptx-png': {
    subtitle:
      'Extract every page from your PDFs or presentations as high-quality PNG images. Each file becomes a ZIP of pages.',
    dropzoneTitle: 'Drop your PDF or presentation files here',
    dropzoneIcon: 'bx-image',
    supportedFormats: 'Accepted formats: .pdf, .ppt, .pptx, and .odp files',
    accept: '.ppt,.pptx,.odp,.pdf',
    statusText: 'Extracting pages as PNG...',
    heroText: 'All pages have been extracted as high-quality PNG images.',
  },
};

export function bodyClassForMode(mode: Mode) {
  if (mode === 'documents') return 'mode-documents';
  if (mode === 'spreadsheets') return 'mode-spreadsheets';
  if (mode === 'text-data') return 'mode-text-data';
  if (mode === 'notebooks') return 'mode-notebooks';
  if (mode === 'ebooks') return 'mode-ebooks';
  if (mode === 'pdf-tools') return 'mode-pdf-tools';
  if (mode === 'image') return 'mode-image';
  if (mode === 'presentations') return 'mode-presentations';
  if (mode === 'pptx-png') return 'mode-pptx-png';
  return '';
}

export function getImageTargetLabel(targetExt: string) {
  if (targetExt === '.zip') return 'PNG frames ZIP';
  return targetExt.replace('.', '').toUpperCase();
}

export function imageTargetHint(targetExt: string) {
  const matchingInputs = Object.entries(IMAGE_CONVERSION_MAP)
    .filter(([, targets]) => targets.includes(targetExt))
    .map(([input]) => input.toUpperCase().replace('.', ''));
  return `${getImageTargetLabel(targetExt)} output accepts: ${matchingInputs.join(', ')}. GIF to ZIP exports every frame as PNG files.`;
}

export function getPdfTargetLabel(target: string) {
  const option = PDF_TARGET_OPTIONS.find((item) => item.value === target);
  return option?.label ?? target.replace('.', '').toUpperCase();
}

export function pdfTargetHint(target: string) {
  if (target === 'merge') return 'Upload two or more PDFs. They will be combined in the order selected.';
  if (target === 'split') return 'Each uploaded PDF becomes a ZIP containing one PDF per page.';
  if (target === 'compress') return 'Each uploaded PDF is optimized and returned as a smaller PDF when possible.';
  if (target === '.zip') return 'Each uploaded PDF becomes a ZIP containing PNG page images.';
  if (['.png', '.jpg', '.webp', '.svg'].includes(target)) {
    return 'Single-page PDFs download as one image. Multi-page PDFs download as a ZIP of page images.';
  }
  return `Each uploaded PDF is converted to ${getPdfTargetLabel(target)}.`;
}

export function getPresentationTargetLabel(target: string) {
  const option = PRESENTATION_TARGET_OPTIONS.find((item) => item.value === target);
  return option?.label ?? target.replace('.', '').toUpperCase();
}

export function presentationTargetHint(targetExt: string) {
  const matchingInputs = Object.entries(PRESENTATION_CONVERSION_MAP)
    .filter(([, targets]) => targets.includes(targetExt))
    .map(([input]) => input.toUpperCase().replace('.', ''));

  if (targetExt === '.zip') return 'Each deck becomes a ZIP containing PNG slide images.';
  if (['.png', '.jpg'].includes(targetExt)) {
    return `Single-slide decks download as one ${targetExt.replace('.', '').toUpperCase()} image. Multi-slide decks download as a ZIP of slide images.`;
  }

  return `${getPresentationTargetLabel(targetExt)} output accepts: ${matchingInputs.join(', ')}.`;
}

export function getDocumentTargetLabel(target: string) {
  const option = DOCUMENT_TARGET_OPTIONS.find((item) => item.value === target);
  return option?.label ?? target.replace('.', '').toUpperCase();
}

export function documentTargetHint(targetExt: string) {
  const matchingInputs = Object.entries(DOCUMENT_CONVERSION_MAP)
    .filter(([, targets]) => targets.includes(targetExt))
    .map(([input]) => input.toUpperCase().replace('.', ''));
  return `${getDocumentTargetLabel(targetExt)} output accepts: ${matchingInputs.join(', ')}.`;
}

export function getSpreadsheetTargetLabel(targetExt: string) {
  const option = SPREADSHEET_TARGET_OPTIONS.find((item) => item.value === targetExt);
  return option?.label ?? targetExt.replace('.', '').toUpperCase();
}

export function spreadsheetTargetHint(targetExt: string) {
  const matchingInputs = Object.entries(SPREADSHEET_CONVERSION_MAP)
    .filter(([, targets]) => targets.includes(targetExt))
    .map(([input]) => input.toUpperCase().replace('.', ''));
  return `${getSpreadsheetTargetLabel(targetExt)} output accepts: ${matchingInputs.join(', ')}. Multi-sheet workbooks keep all sheets for workbook, HTML, JSON, and PDF outputs.`;
}

export function getTextDataTargetLabel(targetExt: string) {
  const option = TEXT_DATA_TARGET_OPTIONS.find((item) => item.value === targetExt);
  return option?.label ?? targetExt.replace('.', '').toUpperCase();
}

export function textDataTargetHint(targetExt: string) {
  const matchingInputs = Object.entries(TEXT_DATA_CONVERSION_MAP)
    .filter(([, targets]) => targets.includes(targetExt))
    .map(([input]) => input.toUpperCase().replace('.', ''));
  return `${getTextDataTargetLabel(targetExt)} output accepts: ${matchingInputs.join(', ')}. Code files convert to syntax-highlighted PDF or plain TXT.`;
}

export function getNotebookTargetLabel(targetExt: string) {
  const option = NOTEBOOK_TARGET_OPTIONS.find((item) => item.value === targetExt);
  return option?.label ?? targetExt.replace('.', '').toUpperCase();
}

export function notebookTargetHint(targetExt: string) {
  const matchingInputs = Object.entries(NOTEBOOK_CONVERSION_MAP)
    .filter(([, targets]) => targets.includes(targetExt))
    .map(([input]) => input.toUpperCase().replace('.', ''));
  return `${getNotebookTargetLabel(targetExt)} output accepts: ${matchingInputs.join(', ')}.`;
}

export function getEbookTargetLabel(targetExt: string) {
  const option = EBOOK_TARGET_OPTIONS.find((item) => item.value === targetExt);
  return option?.label ?? targetExt.replace('.', '').toUpperCase();
}

export function ebookTargetHint(targetExt: string) {
  const matchingInputs = Object.entries(EBOOK_CONVERSION_MAP)
    .filter(([, targets]) => targets.includes(targetExt))
    .map(([input]) => input.toUpperCase().replace('.', ''));

  if (['.mobi', '.azw3'].includes(targetExt)) {
    return `${getEbookTargetLabel(targetExt)} output accepts: ${matchingInputs.join(', ')} and uses Calibre on the server.`;
  }

  return `${getEbookTargetLabel(targetExt)} output accepts: ${matchingInputs.join(', ')}.`;
}
