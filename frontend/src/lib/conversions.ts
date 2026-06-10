import type { Mode, ModeConfig } from '../types/conversion';
import conversionData from '../data/conversions.json';

export const IMAGE_CONVERSION_MAP = conversionData.imageConversionMap as Record<string, string[]>;
export const IMAGE_TARGET_OPTIONS = conversionData.imageTargetOptions;
export const PDF_TARGET_OPTIONS = conversionData.pdfTargetOptions;
export const DOCUMENT_CONVERSION_MAP = conversionData.documentConversionMap as Record<string, string[]>;
export const DOCUMENT_TARGET_OPTIONS = conversionData.documentTargetOptions;

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
  pdf: {
    subtitle:
      'Convert any document, presentation, image, or Jupyter notebook into a pristine PDF instantly. Everything happens blazingly fast.',
    dropzoneTitle: 'Drag & Drop your files here',
    dropzoneIcon: 'bx-cloud-upload',
    supportedFormats: 'Supported formats: Word, RTF, Excel, PowerPoint, Text, Code, Markdown, HTML, Pages, Jupyter, Images',
    accept:
      '.pptx,.ppt,.docx,.doc,.rtf,.xlsx,.xls,.csv,.odt,.ods,.odp,.ipynb,.py,.js,.java,.c,.cpp,.html,.htm,.css,.json,.md,.txt,.jpg,.jpeg,.png,.webp,.gif,.bmp',
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
  'pptx-png': {
    subtitle:
      'Extract every page from your PDFs or PowerPoint presentations as high-quality PNG images. Each file becomes a ZIP of pages.',
    dropzoneTitle: 'Drop your PDF or PPTX files here',
    dropzoneIcon: 'bx-image',
    supportedFormats: 'Accepted formats: .pdf and .pptx files',
    accept: '.pptx,.pdf',
    statusText: 'Extracting pages as PNG...',
    heroText: 'All pages have been extracted as high-quality PNG images.',
  },
};

export function bodyClassForMode(mode: Mode) {
  if (mode === 'documents') return 'mode-documents';
  if (mode === 'pdf-tools') return 'mode-pdf-tools';
  if (mode === 'image') return 'mode-image';
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
