import {
  DOCUMENT_CONVERSION_MAP,
  IMAGE_CONVERSION_MAP,
  PDF_TARGET_OPTIONS,
  getDocumentTargetLabel,
  getImageTargetLabel,
  getPdfTargetLabel,
} from './conversions';
import type { Mode } from '../types/conversion';

const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || 'https://allforpdf.com').replace(/\/$/, '');

const TO_PDF_INPUT_EXTENSIONS = [
  '.pptx',
  '.ppt',
  '.xlsx',
  '.xls',
  '.csv',
  '.ods',
  '.odp',
  '.ipynb',
  '.py',
  '.js',
  '.java',
  '.c',
  '.cpp',
  '.css',
  '.json',
] as const;

const FORMAT_LABELS: Record<string, string> = {
  '.bmp': 'BMP',
  '.c': 'C',
  '.cpp': 'C++',
  '.csv': 'CSV',
  '.css': 'CSS',
  '.doc': 'DOC',
  '.docx': 'DOCX',
  '.gif': 'GIF',
  '.heic': 'HEIC',
  '.htm': 'HTML',
  '.html': 'HTML',
  '.ico': 'ICO',
  '.ipynb': 'Jupyter Notebook',
  '.java': 'Java',
  '.jpeg': 'JPEG',
  '.jpg': 'JPG',
  '.js': 'JavaScript',
  '.json': 'JSON',
  '.md': 'Markdown',
  '.odp': 'ODP',
  '.ods': 'ODS',
  '.odt': 'ODT',
  '.pdf': 'PDF',
  '.png': 'PNG',
  '.ppt': 'PPT',
  '.pptx': 'PPTX',
  '.py': 'Python',
  '.rtf': 'RTF',
  '.svg': 'SVG',
  '.tif': 'TIF',
  '.tiff': 'TIFF',
  '.txt': 'TXT',
  '.webp': 'WEBP',
  '.xls': 'XLS',
  '.xlsx': 'XLSX',
  '.zip': 'ZIP',
};

export interface SeoMetadata {
  title: string;
  h1: string;
  description: string;
  canonicalPath: string;
}

export interface SeoPage extends SeoMetadata {
  slug: string;
  mode: Mode;
  acceptedExts: string[];
  accept: string;
  supportedFormats: string;
  dropzoneTitle: string;
  imageTarget?: string;
  pdfTarget?: string;
  documentTarget?: string;
}

export const DEFAULT_SEO_PAGE: SeoMetadata = {
  title: 'AllForPDF | Free Online File Converter',
  h1: 'AllForPDF File Converter',
  description:
    'Convert PDFs, images, documents, spreadsheets, presentations, code files, and more online with fast browser uploads.',
  canonicalPath: '/',
};

function canonicalUrl(path: string) {
  return `${SITE_ORIGIN}${path === '/' ? '' : path}`;
}

function slugToken(value: string) {
  return value.replace(/^\./, '').toLowerCase();
}

function labelForFormat(value: string) {
  return FORMAT_LABELS[value] ?? value.replace(/^\./, '').toUpperCase();
}

function routeFromSlug(slug: string) {
  return `/${slug}`;
}

function titleForConversion(inputLabel: string, outputLabel: string) {
  return `${inputLabel} to ${outputLabel} Converter - Convert ${inputLabel} to ${outputLabel} Online`;
}

function descriptionForConversion(inputLabel: string, outputLabel: string) {
  return `Convert ${inputLabel} files to ${outputLabel} online for free with AllForPDF. Upload your ${inputLabel} file and download a clean ${outputLabel} result in seconds.`;
}

function makeConversionPage({
  inputExt,
  outputLabel,
  slug,
  mode,
  imageTarget,
  pdfTarget,
  documentTarget,
}: {
  inputExt: string;
  outputLabel: string;
  slug: string;
  mode: Mode;
  imageTarget?: string;
  pdfTarget?: string;
  documentTarget?: string;
}): SeoPage {
  const inputLabel = labelForFormat(inputExt);
  const canonicalPath = routeFromSlug(slug);

  return {
    slug,
    mode,
    imageTarget,
    pdfTarget,
    documentTarget,
    acceptedExts: [inputExt],
    accept: inputExt,
    supportedFormats: `Accepted format: ${inputLabel} files`,
    dropzoneTitle: `Drop your ${inputLabel} files here`,
    title: titleForConversion(inputLabel, outputLabel),
    h1: `${inputLabel} to ${outputLabel} Converter`,
    description: descriptionForConversion(inputLabel, outputLabel),
    canonicalPath,
  };
}

function imageTargetSlug(inputExt: string, targetExt: string) {
  if (inputExt === '.gif' && targetExt === '.zip') return 'png-frames';
  return slugToken(targetExt);
}

function imageOutputLabel(inputExt: string, targetExt: string) {
  if (inputExt === '.gif' && targetExt === '.zip') return 'PNG Frames ZIP';
  return getImageTargetLabel(targetExt);
}

function pdfTargetSlug(target: string) {
  if (target === '.zip') return 'png-pages-zip';
  return slugToken(target);
}

function pdfOutputLabel(target: string) {
  if (target === '.zip') return 'PNG Pages ZIP';
  return getPdfTargetLabel(target).replace(' page image', '');
}

function makePdfToolPage(target: string): SeoPage {
  if (target === 'compress') {
    return {
      slug: 'compress-pdf',
      mode: 'pdf-tools',
      pdfTarget: 'compress',
      acceptedExts: ['.pdf'],
      accept: '.pdf',
      supportedFormats: 'Accepted format: PDF files',
      dropzoneTitle: 'Drop your PDF files here',
      title: 'Compress PDF Online - Reduce PDF File Size',
      h1: 'Compress PDF',
      description: 'Compress PDF files online for free with AllForPDF. Upload a PDF and download an optimized smaller PDF when possible.',
      canonicalPath: '/compress-pdf',
    };
  }

  if (target === 'split') {
    return {
      slug: 'split-pdf',
      mode: 'pdf-tools',
      pdfTarget: 'split',
      acceptedExts: ['.pdf'],
      accept: '.pdf',
      supportedFormats: 'Accepted format: PDF files',
      dropzoneTitle: 'Drop your PDF files here',
      title: 'Split PDF Online - Extract PDF Pages',
      h1: 'Split PDF',
      description: 'Split PDF files online for free with AllForPDF. Upload a PDF and download a ZIP with one PDF per page.',
      canonicalPath: '/split-pdf',
    };
  }

  if (target === 'merge') {
    return {
      slug: 'merge-pdf',
      mode: 'pdf-tools',
      pdfTarget: 'merge',
      acceptedExts: ['.pdf'],
      accept: '.pdf',
      supportedFormats: 'Accepted format: PDF files',
      dropzoneTitle: 'Drop two or more PDF files here',
      title: 'Merge PDF Online - Combine PDF Files',
      h1: 'Merge PDF',
      description: 'Merge PDF files online for free with AllForPDF. Upload two or more PDFs and combine them into one file.',
      canonicalPath: '/merge-pdf',
    };
  }

  return makeConversionPage({
    inputExt: '.pdf',
    outputLabel: pdfOutputLabel(target),
    slug: `pdf-to-${pdfTargetSlug(target)}`,
    mode: 'pdf-tools',
    pdfTarget: target,
  });
}

function makePptxPngPage(inputExt: '.pdf' | '.pptx') {
  const inputLabel = labelForFormat(inputExt);
  const slug = inputExt === '.pdf' ? 'pdf-to-png-pages' : 'pptx-to-png';
  return {
    slug,
    mode: 'pptx-png',
    acceptedExts: [inputExt],
    accept: inputExt,
    supportedFormats: `Accepted format: ${inputLabel} files`,
    dropzoneTitle: `Drop your ${inputLabel} files here`,
    title: `${inputLabel} to PNG Converter - Extract Pages as PNG Images`,
    h1: `${inputLabel} to PNG Converter`,
    description: `Convert ${inputLabel} pages to high-quality PNG images online for free with AllForPDF. Download every page bundled in a ZIP file.`,
    canonicalPath: `/${slug}`,
  } satisfies SeoPage;
}

export function createSeoPages() {
  const pages: SeoPage[] = [];

  Object.entries(IMAGE_CONVERSION_MAP).forEach(([inputExt, targets]) => {
    targets.forEach((targetExt) => {
      pages.push(
        makeConversionPage({
          inputExt,
          outputLabel: imageOutputLabel(inputExt, targetExt),
          slug: `${slugToken(inputExt)}-to-${imageTargetSlug(inputExt, targetExt)}`,
          mode: 'image',
          imageTarget: targetExt,
        }),
      );
    });
  });

  Object.entries(DOCUMENT_CONVERSION_MAP).forEach(([inputExt, targets]) => {
    targets.forEach((targetExt) => {
      pages.push(
        makeConversionPage({
          inputExt,
          outputLabel: getDocumentTargetLabel(targetExt),
          slug: `${slugToken(inputExt)}-to-${slugToken(targetExt)}`,
          mode: 'documents',
          documentTarget: targetExt,
        }),
      );
    });
  });

  TO_PDF_INPUT_EXTENSIONS.forEach((inputExt) => {
    pages.push(
      makeConversionPage({
        inputExt,
        outputLabel: 'PDF',
        slug: `${slugToken(inputExt)}-to-pdf`,
        mode: 'pdf',
      }),
    );
  });

  PDF_TARGET_OPTIONS.forEach((target) => {
    pages.push(makePdfToolPage(target.value));
  });

  pages.push(makePptxPngPage('.pdf'), makePptxPngPage('.pptx'));

  const seen = new Set<string>();
  return pages.filter((page) => {
    if (seen.has(page.slug)) return false;
    seen.add(page.slug);
    return true;
  });
}

export const SEO_PAGES = createSeoPages();

export function getSeoPageForPath(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/') return null;
  const slug = normalizedPath.slice(1).toLowerCase();
  return SEO_PAGES.find((page) => page.slug === slug) ?? null;
}

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attr, value);
  }
}

export function applySeoMetadata(page: SeoMetadata) {
  document.title = page.title;
  setMeta('meta[name="description"]', 'content', page.description);
  setMeta('link[rel="canonical"]', 'href', canonicalUrl(page.canonicalPath));
  setMeta('meta[property="og:title"]', 'content', page.title);
  setMeta('meta[property="og:description"]', 'content', page.description);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl(page.canonicalPath));
  setMeta('meta[name="twitter:title"]', 'content', page.title);
  setMeta('meta[name="twitter:description"]', 'content', page.description);
}
