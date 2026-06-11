import type { Mode } from '../types/conversion';
import {
  getDocumentTargetLabel,
  getEbookTargetLabel,
  getImageTargetLabel,
  getNotebookTargetLabel,
  getPdfTargetLabel,
  getPresentationTargetLabel,
  getSpreadsheetTargetLabel,
  getTextDataTargetLabel,
} from './conversions';

export function getFileExt(fileOrName: File | string) {
  const name = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
  const lastDot = name.lastIndexOf('.');
  return lastDot === -1 ? '' : name.substring(lastDot).toLowerCase();
}

export function getIconForExt(ext: string) {
  if (['.pdf'].includes(ext)) return 'bx-file-pdf';
  if (['.docx', '.doc', '.odt', '.rtf'].includes(ext)) return 'bx-file';
  if (['.pptx', '.ppt', '.odp'].includes(ext)) return 'bx-slideshow';
  if (['.xlsx', '.xls', '.ods', '.csv', '.tsv'].includes(ext)) return 'bx-spreadsheet';
  if (['.epub', '.mobi', '.azw3', '.fb2'].includes(ext)) return 'bx-book-open';
  if (['.ipynb', '.py', '.js', '.ts', '.c', '.cpp', '.java', '.json', '.xml', '.yaml', '.yml', '.toml', '.html', '.htm', '.css', '.md', '.txt'].includes(ext)) {
    return 'bx-code-alt';
  }
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.svg', '.heic', '.ico'].includes(ext)) {
    return 'bx-image';
  }
  if (['.mp4'].includes(ext)) return 'bx-video';
  if (['.zip'].includes(ext)) return 'bxs-file-archive';
  return 'bx-file-blank';
}

export function getIconForFile(file: File, mode: Mode) {
  const ext = getFileExt(file);
  if (mode === 'documents') return getIconForExt(ext);
  if (mode === 'spreadsheets') return 'bx-spreadsheet';
  if (mode === 'text-data') return getIconForExt(ext);
  if (mode === 'notebooks') return 'bx-book-content';
  if (mode === 'ebooks') return getIconForExt(ext);
  if (mode === 'pdf-tools') return 'bx-file-pdf';
  if (mode === 'presentations') return 'bx-slideshow';
  if (mode === 'pptx-png') return ext === '.pdf' ? 'bx-file-pdf' : 'bx-slideshow';
  return getIconForExt(ext);
}

export function getOutputNameForImage(file: File, targetExt: string) {
  const lastDot = file.name.lastIndexOf('.');
  const stem = lastDot === -1 ? file.name : file.name.substring(0, lastDot);
  if (targetExt === '.zip') return `${stem}_png_frames.zip`;
  return `${stem}${targetExt}`;
}

export function getDownloadLabel(
  mode: Mode,
  imageTarget: string,
  pdfTarget = '',
  documentTarget = '',
  presentationTarget = '',
  spreadsheetTarget = '',
  textDataTarget = '',
  notebookTarget = '',
  ebookTarget = '',
) {
  if (mode === 'documents') return `Download ${getDocumentTargetLabel(documentTarget)}`;
  if (mode === 'spreadsheets') return `Download ${getSpreadsheetTargetLabel(spreadsheetTarget)}`;
  if (mode === 'text-data') return `Download ${getTextDataTargetLabel(textDataTarget)}`;
  if (mode === 'notebooks') return `Download ${getNotebookTargetLabel(notebookTarget)}`;
  if (mode === 'ebooks') return `Download ${getEbookTargetLabel(ebookTarget)}`;
  if (mode === 'pdf-tools') return `Download ${getPdfTargetLabel(pdfTarget)}`;
  if (mode === 'presentations') return `Download ${getPresentationTargetLabel(presentationTarget)}`;
  if (mode === 'pptx-png') return 'Download ZIP';
  if (mode === 'image') return `Download ${getImageTargetLabel(imageTarget)}`;
  return 'Download PDF';
}

export function filenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition || !disposition.includes('filename=')) return fallback;
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(disposition);
  return matches?.[1] ? matches[1].replace(/['"]/g, '') : fallback;
}
