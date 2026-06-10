import type { Mode } from '../types/conversion';
import { getDocumentTargetLabel, getImageTargetLabel, getPdfTargetLabel } from './conversions';

export function getFileExt(fileOrName: File | string) {
  const name = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
  const lastDot = name.lastIndexOf('.');
  return lastDot === -1 ? '' : name.substring(lastDot).toLowerCase();
}

export function getIconForExt(ext: string) {
  if (['.pdf'].includes(ext)) return 'bx-file-pdf';
  if (['.docx', '.doc', '.odt', '.rtf'].includes(ext)) return 'bx-file';
  if (['.pptx', '.ppt', '.odp'].includes(ext)) return 'bx-slideshow';
  if (['.xlsx', '.xls', '.ods', '.csv'].includes(ext)) return 'bx-spreadsheet';
  if (['.ipynb', '.py', '.js', '.c', '.cpp', '.java', '.json', '.html', '.htm', '.css', '.md', '.txt'].includes(ext)) {
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
  if (mode === 'pdf-tools') return 'bx-file-pdf';
  if (mode === 'pptx-png') return ext === '.pdf' ? 'bx-file-pdf' : 'bx-slideshow';
  return getIconForExt(ext);
}

export function getOutputNameForImage(file: File, targetExt: string) {
  const lastDot = file.name.lastIndexOf('.');
  const stem = lastDot === -1 ? file.name : file.name.substring(0, lastDot);
  if (targetExt === '.zip') return `${stem}_png_frames.zip`;
  return `${stem}${targetExt}`;
}

export function getDownloadLabel(mode: Mode, imageTarget: string, pdfTarget = '', documentTarget = '') {
  if (mode === 'documents') return `Download ${getDocumentTargetLabel(documentTarget)}`;
  if (mode === 'pdf-tools') return `Download ${getPdfTargetLabel(pdfTarget)}`;
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
