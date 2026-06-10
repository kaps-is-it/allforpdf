import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, '..');
const distDir = resolve(frontendRoot, 'dist');
const dataPath = resolve(frontendRoot, 'src/data/conversions.json');
const siteOrigin = (process.env.VITE_SITE_URL || 'https://allforpdf.com').replace(/\/$/, '');

const conversionData = JSON.parse(await readFile(dataPath, 'utf8'));

const toPdfInputExtensions = [
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
];

const formatLabels = {
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

const defaultSeoPage = {
  title: 'AllForPDF | Free Online File Converter',
  h1: 'AllForPDF File Converter',
  description:
    'Convert PDFs, images, documents, spreadsheets, presentations, code files, and more online with fast browser uploads.',
  canonicalPath: '/',
};

function slugToken(value) {
  return value.replace(/^\./, '').toLowerCase();
}

function labelForFormat(value) {
  return formatLabels[value] ?? value.replace(/^\./, '').toUpperCase();
}

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? labelForFormat(value);
}

function titleForConversion(inputLabel, outputLabel) {
  return `${inputLabel} to ${outputLabel} Converter - Convert ${inputLabel} to ${outputLabel} Online`;
}

function descriptionForConversion(inputLabel, outputLabel) {
  return `Convert ${inputLabel} files to ${outputLabel} online for free with AllForPDF. Upload your ${inputLabel} file and download a clean ${outputLabel} result in seconds.`;
}

function makeConversionPage({ inputExt, outputLabel, slug }) {
  const inputLabel = labelForFormat(inputExt);
  return {
    slug,
    title: titleForConversion(inputLabel, outputLabel),
    h1: `${inputLabel} to ${outputLabel} Converter`,
    description: descriptionForConversion(inputLabel, outputLabel),
    canonicalPath: `/${slug}`,
  };
}

function imageTargetSlug(inputExt, targetExt) {
  if (inputExt === '.gif' && targetExt === '.zip') return 'png-frames';
  return slugToken(targetExt);
}

function imageOutputLabel(inputExt, targetExt) {
  if (inputExt === '.gif' && targetExt === '.zip') return 'PNG Frames ZIP';
  return optionLabel(conversionData.imageTargetOptions, targetExt);
}

function pdfTargetSlug(target) {
  if (target === '.zip') return 'png-pages-zip';
  return slugToken(target);
}

function pdfOutputLabel(target) {
  if (target === '.zip') return 'PNG Pages ZIP';
  return optionLabel(conversionData.pdfTargetOptions, target).replace(' page image', '');
}

function makePdfToolPage(target) {
  if (target === 'compress') {
    return {
      slug: 'compress-pdf',
      title: 'Compress PDF Online - Reduce PDF File Size',
      h1: 'Compress PDF',
      description: 'Compress PDF files online for free with AllForPDF. Upload a PDF and download an optimized smaller PDF when possible.',
      canonicalPath: '/compress-pdf',
    };
  }

  if (target === 'split') {
    return {
      slug: 'split-pdf',
      title: 'Split PDF Online - Extract PDF Pages',
      h1: 'Split PDF',
      description: 'Split PDF files online for free with AllForPDF. Upload a PDF and download a ZIP with one PDF per page.',
      canonicalPath: '/split-pdf',
    };
  }

  if (target === 'merge') {
    return {
      slug: 'merge-pdf',
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
  });
}

function makePptxPngPage(inputExt) {
  const inputLabel = labelForFormat(inputExt);
  const slug = inputExt === '.pdf' ? 'pdf-to-png-pages' : 'pptx-to-png';
  return {
    slug,
    title: `${inputLabel} to PNG Converter - Extract Pages as PNG Images`,
    h1: `${inputLabel} to PNG Converter`,
    description: `Convert ${inputLabel} pages to high-quality PNG images online for free with AllForPDF. Download every page bundled in a ZIP file.`,
    canonicalPath: `/${slug}`,
  };
}

function createSeoPages() {
  const pages = [];

  Object.entries(conversionData.imageConversionMap).forEach(([inputExt, targets]) => {
    targets.forEach((targetExt) => {
      pages.push(
        makeConversionPage({
          inputExt,
          outputLabel: imageOutputLabel(inputExt, targetExt),
          slug: `${slugToken(inputExt)}-to-${imageTargetSlug(inputExt, targetExt)}`,
        }),
      );
    });
  });

  Object.entries(conversionData.documentConversionMap).forEach(([inputExt, targets]) => {
    targets.forEach((targetExt) => {
      pages.push(
        makeConversionPage({
          inputExt,
          outputLabel: optionLabel(conversionData.documentTargetOptions, targetExt),
          slug: `${slugToken(inputExt)}-to-${slugToken(targetExt)}`,
        }),
      );
    });
  });

  toPdfInputExtensions.forEach((inputExt) => {
    pages.push(
      makeConversionPage({
        inputExt,
        outputLabel: 'PDF',
        slug: `${slugToken(inputExt)}-to-pdf`,
      }),
    );
  });

  conversionData.pdfTargetOptions.forEach((target) => {
    pages.push(makePdfToolPage(target.value));
  });

  pages.push(makePptxPngPage('.pdf'), makePptxPngPage('.pptx'));

  const seen = new Set();
  return pages.filter((page) => {
    if (seen.has(page.slug)) return false;
    seen.add(page.slug);
    return true;
  });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function canonicalUrl(pathname) {
  return `${siteOrigin}${pathname === '/' ? '' : pathname}`;
}

function pageTags(page) {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const canonical = escapeHtml(canonicalUrl(page.canonicalPath));

  return [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ].join('\n    ');
}

function pageFallback(page) {
  return `<div id="root">
    <!--seo-fallback-start-->
    <main class="seo-fallback">
      <h1>${escapeHtml(page.h1)}</h1>
      <p>${escapeHtml(page.description)}</p>
    </main>
    <!--seo-fallback-end-->
  </div>`;
}

function renderHtml(baseHtml, page) {
  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta[^>]+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<div id="root">[\s\S]*?<!--seo-fallback-end-->\s*<\/div>|<div id="root"><\/div>/i, pageFallback(page))
    .replace(/<link[^>]+rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<meta[^>]+property="og:(title|description|url)"[^>]*>\s*/gi, '')
    .replace(/<meta[^>]+name="twitter:(title|description)"[^>]*>\s*/gi, '');

  html = html.replace(/<\/head>/i, `    ${pageTags(page)}\n  </head>`);
  return html;
}

function sitemapUrl(pathname) {
  return `${siteOrigin}${pathname === '/' ? '/' : pathname}`;
}

function renderSitemap(pages) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [defaultSeoPage, ...pages]
    .map(
      (page) => `  <url>
    <loc>${escapeHtml(sitemapUrl(page.canonicalPath))}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const baseHtmlPath = join(distDir, 'index.html');
const baseHtml = await readFile(baseHtmlPath, 'utf8');
const pages = createSeoPages();

await writeFile(baseHtmlPath, renderHtml(baseHtml, defaultSeoPage));

for (const page of pages) {
  const pageDir = join(distDir, page.slug);
  await mkdir(pageDir, { recursive: true });
  await writeFile(join(pageDir, 'index.html'), renderHtml(baseHtml, page));
}

await writeFile(join(distDir, 'sitemap.xml'), renderSitemap(pages));
await writeFile(join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);

console.log(`Generated ${pages.length} SEO landing pages.`);
