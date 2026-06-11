import { useMemo, useState } from 'react';

import { SEO_PAGES, type SeoPage } from '../lib/seo';

interface SearchResult {
  page: SeoPage;
  score: number;
  label: string;
  category: string;
}

const ACTION_ALIASES: Record<string, string[]> = {
  compress: ['compress', 'reduce', 'shrink', 'small', 'smaller', 'size', 'optimize', 'optimise'],
  merge: ['merge', 'combine', 'join', 'attach', 'together'],
  split: ['split', 'separate', 'extract', 'pages'],
  convert: ['convert', 'converter', 'change', 'transform', 'turn', 'make', 'export', 'save', 'file'],
};

const FORMAT_ALIASES: Record<string, string[]> = {
  pdf: ['pdf', 'portable document'],
  jpg: ['jpg', 'jpeg', 'photo'],
  jpeg: ['jpeg', 'jpg', 'photo'],
  png: ['png', 'image', 'picture'],
  webp: ['webp'],
  gif: ['gif', 'animated'],
  bmp: ['bmp', 'bitmap'],
  tiff: ['tiff', 'tif'],
  tif: ['tif', 'tiff'],
  svg: ['svg', 'vector'],
  heic: ['heic', 'iphone photo', 'apple photo'],
  ico: ['ico', 'icon', 'favicon'],
  doc: ['doc', 'word'],
  docx: ['docx', 'word'],
  epub: ['epub', 'ebook', 'book'],
  mobi: ['mobi', 'kindle', 'ebook', 'book'],
  azw3: ['azw3', 'kindle', 'ebook', 'book'],
  fb2: ['fb2', 'fictionbook', 'ebook', 'book'],
  odt: ['odt', 'open document', 'opendocument'],
  rtf: ['rtf', 'rich text'],
  txt: ['txt', 'text'],
  md: ['md', 'markdown'],
  html: ['html', 'htm', 'web page', 'webpage'],
  htm: ['htm', 'html', 'web page', 'webpage'],
  ppt: ['ppt', 'powerpoint', 'presentation', 'slides'],
  pptx: ['pptx', 'powerpoint', 'presentation', 'slides'],
  odp: ['odp', 'presentation', 'slides'],
  xls: ['xls', 'excel', 'spreadsheet'],
  xlsx: ['xlsx', 'excel', 'spreadsheet'],
  csv: ['csv', 'spreadsheet'],
  ods: ['ods', 'spreadsheet'],
  tsv: ['tsv', 'tab separated', 'spreadsheet'],
  ipynb: ['ipynb', 'jupyter', 'notebook'],
  py: ['py', 'python'],
  js: ['js', 'javascript'],
  ts: ['ts', 'typescript'],
  java: ['java'],
  c: ['c'],
  cpp: ['cpp', 'c++'],
  css: ['css'],
  json: ['json'],
  xml: ['xml'],
  yaml: ['yaml', 'yml'],
  yml: ['yml', 'yaml'],
  toml: ['toml'],
  zip: ['zip', 'archive'],
  mp4: ['mp4', 'video'],
};

const MODE_LABELS: Record<SeoPage['mode'], string> = {
  pdf: 'Convert to PDF',
  documents: 'Document',
  spreadsheets: 'Spreadsheet',
  'text-data': 'Text and data',
  notebooks: 'Notebook',
  ebooks: 'eBook',
  'pdf-tools': 'PDF tool',
  image: 'Image',
  presentations: 'Presentation',
  'pptx-png': 'Page images',
};

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/c\+\+/g, 'cpp')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokensFor(value: string) {
  return normalizeSearch(value).split(/\s+/).filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function pageTokens(page: SeoPage) {
  const slugParts = page.slug.split('-');
  const directTokens = [
    ...tokensFor(page.h1),
    ...tokensFor(page.title),
    ...tokensFor(page.description),
    ...tokensFor(page.slug),
    ...page.acceptedExts.map((ext) => ext.replace('.', '')),
    page.imageTarget?.replace('.', '') ?? '',
    page.pdfTarget?.replace('.', '') ?? '',
    page.documentTarget?.replace('.', '') ?? '',
    page.presentationTarget?.replace('.', '') ?? '',
    page.textDataTarget?.replace('.', '') ?? '',
    page.notebookTarget?.replace('.', '') ?? '',
    page.ebookTarget?.replace('.', '') ?? '',
    ...slugParts,
  ];

  const expandedTokens = directTokens.flatMap((token) => [token, ...(FORMAT_ALIASES[token] ?? []), ...(ACTION_ALIASES[token] ?? [])]);
  return unique([...directTokens, ...expandedTokens].flatMap(tokensFor));
}

function categoryFor(page: SeoPage) {
  if (page.pdfTarget === 'merge') return 'Merge PDF';
  if (page.pdfTarget === 'compress') return 'Compress PDF';
  if (page.pdfTarget === 'split') return 'Split PDF';
  return MODE_LABELS[page.mode];
}

function makeSearchIndex() {
  return SEO_PAGES.map((page) => ({
    page,
    label: page.h1,
    category: categoryFor(page),
    tokens: pageTokens(page),
    normalizedLabel: normalizeSearch(`${page.h1} ${page.slug}`),
  }));
}

function scorePage(query: string, queryTokens: string[], entry: ReturnType<typeof makeSearchIndex>[number]) {
  if (!query) return 0;

  let score = 0;
  const slugPhrase = entry.page.slug.replaceAll('-', ' ');

  if (entry.normalizedLabel.includes(query)) score += 60;
  if (slugPhrase === query) score += 90;
  if (slugPhrase.includes(query)) score += 45;

  queryTokens.forEach((token) => {
    if (entry.tokens.includes(token)) score += 18;
    if (entry.tokens.some((candidate) => candidate.startsWith(token))) score += 8;
  });

  if (query.includes(' to ') && slugPhrase === query) score += 80;
  if (queryTokens.includes('compress') && entry.page.pdfTarget === 'compress') score += 70;
  if ((queryTokens.includes('reduce') || queryTokens.includes('shrink')) && entry.page.pdfTarget === 'compress') score += 60;
  if (queryTokens.includes('merge') && entry.page.pdfTarget === 'merge') score += 70;
  if ((queryTokens.includes('combine') || queryTokens.includes('join')) && entry.page.pdfTarget === 'merge') score += 60;
  if (queryTokens.includes('split') && entry.page.pdfTarget === 'split') score += 70;

  return score;
}

function requiredPdfAction(queryTokens: string[]) {
  if (queryTokens.some((token) => ['merge', 'combine', 'join', 'attach', 'together'].includes(token))) return 'merge';
  if (queryTokens.some((token) => ['compress', 'reduce', 'shrink', 'small', 'smaller', 'optimize', 'optimise'].includes(token))) {
    return 'compress';
  }
  if (queryTokens.some((token) => ['split', 'separate'].includes(token))) return 'split';
  return null;
}

export function ConversionSearch() {
  const [query, setQuery] = useState('');
  const index = useMemo(() => makeSearchIndex(), []);
  const normalizedQuery = normalizeSearch(query);
  const queryTokens = tokensFor(query);
  const results = useMemo<SearchResult[]>(() => {
    if (normalizedQuery.length < 2) return [];

    const requiredAction = requiredPdfAction(queryTokens);

    return index
      .filter((entry) => !requiredAction || entry.page.pdfTarget === requiredAction)
      .map((entry) => ({
        page: entry.page,
        score: scorePage(normalizedQuery, queryTokens, entry),
        label: entry.label,
        category: entry.category,
      }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .slice(0, 8);
  }, [index, normalizedQuery, queryTokens]);

  const hasQuery = normalizedQuery.length >= 2;

  return (
    <section className="conversion-search" aria-label="Search conversions">
      <div className="search-box">
        <i className="bx bx-search" />
        <input
          type="search"
          value={query}
          placeholder="Search for any file types conversion here."
          aria-label="Search for any file types conversion here"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {hasQuery ? (
        <div className="search-results" role="listbox" aria-label="Conversion search suggestions">
          {results.length > 0 ? (
            results.map((result) => (
              <a className="search-result" href={result.page.canonicalPath} key={result.page.slug} role="option">
                <span>
                  <strong>{result.label}</strong>
                  <small>{result.category} · {result.page.supportedFormats}</small>
                </span>
                <i className="bx bx-right-arrow-alt" />
              </a>
            ))
          ) : (
            <p className="search-empty">No exact match yet. Try words like “PDF to PNG”, “JPG to PDF”, or “merge PDF”.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
