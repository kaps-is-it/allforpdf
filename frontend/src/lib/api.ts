import { filenameFromDisposition, getOutputNameForImage } from './files';

const DEFAULT_API_BASE_URL = 'https://kapsisit-allforpdf-api.hf.space';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

async function convertMultipart(endpoint: string, formData: FormData) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('Could not reach the conversion server. Please retry in a moment.');
  }

  if (!response.ok) {
    let message = `Conversion server returned ${response.status}`;
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Keep generic message if response is not JSON.
    }
    throw new Error(message);
  }

  return response;
}

export async function convertToPdf(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await convertMultipart('/api/convert', formData);
  const fallbackName = file.name.includes('.') ? `${file.name.substring(0, file.name.lastIndexOf('.'))}.pdf` : `${file.name}.pdf`;
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), fallbackName);
  return { blob: await response.blob(), filename };
}

export async function convertImage(file: File, targetExt: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetExt);

  const response = await convertMultipart('/api/convert-image', formData);
  const filename = filenameFromDisposition(
    response.headers.get('content-disposition'),
    getOutputNameForImage(file, targetExt),
  );
  return { blob: await response.blob(), filename };
}

function getDocumentOutputName(file: File, targetExt: string) {
  const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
  return `${stem}${targetExt}`;
}

export async function convertDocument(file: File, targetExt: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetExt);

  const response = await convertMultipart('/api/convert-document', formData);
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), getDocumentOutputName(file, targetExt));
  return { blob: await response.blob(), filename };
}

function getSpreadsheetOutputName(file: File, targetExt: string) {
  const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
  return `${stem}${targetExt}`;
}

export async function convertSpreadsheet(file: File, targetExt: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetExt);

  const response = await convertMultipart('/api/convert-spreadsheet', formData);
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), getSpreadsheetOutputName(file, targetExt));
  return { blob: await response.blob(), filename };
}

function getTextDataOutputName(file: File, targetExt: string) {
  const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
  return `${stem}${targetExt}`;
}

export async function convertTextData(file: File, targetExt: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetExt);

  const response = await convertMultipart('/api/convert-text-data', formData);
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), getTextDataOutputName(file, targetExt));
  return { blob: await response.blob(), filename };
}

function getNotebookOutputName(file: File, targetExt: string) {
  const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
  return `${stem}${targetExt}`;
}

export async function convertNotebook(file: File, targetExt: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetExt);

  const response = await convertMultipart('/api/convert-notebook', formData);
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), getNotebookOutputName(file, targetExt));
  return { blob: await response.blob(), filename };
}

function getEbookOutputName(file: File, targetExt: string) {
  const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
  return `${stem}${targetExt}`;
}

export async function convertEbook(file: File, targetExt: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetExt);

  const response = await convertMultipart('/api/convert-ebook', formData);
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), getEbookOutputName(file, targetExt));
  return { blob: await response.blob(), filename };
}

function getPresentationOutputName(file: File, targetExt: string) {
  const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
  if (targetExt === '.zip') return `${stem}_slide_images.zip`;
  if (['.png', '.jpg'].includes(targetExt)) return `${stem}_slide_1${targetExt}`;
  return `${stem}${targetExt}`;
}

export async function convertPresentation(file: File, targetExt: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetExt);

  const response = await convertMultipart('/api/convert-presentation', formData);
  const filename = filenameFromDisposition(
    response.headers.get('content-disposition'),
    getPresentationOutputName(file, targetExt),
  );
  return { blob: await response.blob(), filename };
}

function getPdfOutputName(file: File, target: string) {
  const stem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
  if (target === 'compress') return `${stem}_compressed.pdf`;
  if (target === 'split') return `${stem}_split_pages.zip`;
  if (target === '.zip') return `${stem}_png_pages.zip`;
  if (['.png', '.jpg', '.webp', '.svg'].includes(target)) return `${stem}_page_1${target}`;
  return `${stem}${target}`;
}

export async function convertPdf(file: File, target: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', target);

  const response = await convertMultipart('/api/convert-pdf', formData);
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), getPdfOutputName(file, target));
  return { blob: await response.blob(), filename };
}

export async function mergePdfFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await convertMultipart('/api/merge-pdfs', formData);
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), `Converti_Merged_${files.length}_files.pdf`);
  return { blob: await response.blob(), filename };
}

export async function convertPagesToPngZip(file: File) {
  const formData = new FormData();
  formData.append('files', file);

  const response = await convertMultipart('/api/convert-pptx-images', formData);
  const stem = file.name.replace(/\.(ppt|pptx|odp|pdf)$/i, '');
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), `${stem}_pages.zip`);
  return { blob: await response.blob(), filename };
}
