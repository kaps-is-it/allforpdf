const DIRECTORY_GROUPS = [
  {
    title: 'Popular PDF Tools',
    links: [
      { href: '/merge-pdf', label: 'Merge PDF' },
      { href: '/compress-pdf', label: 'Compress PDF' },
      { href: '/split-pdf', label: 'Split PDF' },
      { href: '/pdf-to-docx', label: 'PDF to DOCX' },
      { href: '/pdf-to-png-pages', label: 'PDF to PNG Pages' },
    ],
  },
  {
    title: 'Image Converters',
    links: [
      { href: '/png-to-pdf', label: 'PNG to PDF' },
      { href: '/jpg-to-pdf', label: 'JPG to PDF' },
      { href: '/webp-to-png', label: 'WEBP to PNG' },
      { href: '/heic-to-jpg', label: 'HEIC to JPG' },
      { href: '/gif-to-mp4', label: 'GIF to MP4' },
    ],
  },
  {
    title: 'Document Converters',
    links: [
      { href: '/docx-to-pdf', label: 'DOCX to PDF' },
      { href: '/doc-to-pdf', label: 'DOC to PDF' },
      { href: '/md-to-pdf', label: 'Markdown to PDF' },
      { href: '/html-to-pdf', label: 'HTML to PDF' },
      { href: '/txt-to-docx', label: 'TXT to DOCX' },
    ],
  },
  {
    title: 'Spreadsheet Converters',
    links: [
      { href: '/xlsx-to-pdf', label: 'XLSX to PDF' },
      { href: '/xlsx-to-csv', label: 'XLSX to CSV' },
      { href: '/csv-to-xlsx', label: 'CSV to XLSX' },
      { href: '/ods-to-csv', label: 'ODS to CSV' },
      { href: '/tsv-to-json', label: 'TSV to JSON' },
    ],
  },
  {
    title: 'Text, Code, and Data',
    links: [
      { href: '/json-to-csv', label: 'JSON to CSV' },
      { href: '/json-to-xml', label: 'JSON to XML' },
      { href: '/xml-to-json', label: 'XML to JSON' },
      { href: '/yaml-to-json', label: 'YAML to JSON' },
      { href: '/ts-to-pdf', label: 'TypeScript to PDF' },
    ],
  },
  {
    title: 'Notebook Converters',
    links: [
      { href: '/ipynb-to-pdf', label: 'IPYNB to PDF' },
      { href: '/ipynb-to-html', label: 'IPYNB to HTML' },
      { href: '/ipynb-to-py', label: 'IPYNB to Python' },
      { href: '/ipynb-to-md', label: 'IPYNB to Markdown' },
    ],
  },
  {
    title: 'eBook Converters',
    links: [
      { href: '/epub-to-pdf', label: 'EPUB to PDF' },
      { href: '/epub-to-mobi', label: 'EPUB to MOBI' },
      { href: '/mobi-to-epub', label: 'MOBI to EPUB' },
      { href: '/azw3-to-pdf', label: 'AZW3 to PDF' },
      { href: '/pdf-to-epub', label: 'PDF to EPUB' },
    ],
  },
  {
    title: 'Presentation Converters',
    links: [
      { href: '/ppt-to-pdf', label: 'PPT to PDF' },
      { href: '/pptx-to-odp', label: 'PPTX to ODP' },
      { href: '/odp-to-pptx', label: 'ODP to PPTX' },
      { href: '/pptx-to-jpg', label: 'PPTX to JPG' },
      { href: '/pptx-to-slide-images-zip', label: 'PPTX to Slides ZIP' },
    ],
  },
];

export function ToolDirectory() {
  return (
    <section className="tool-directory" aria-labelledby="tool-directory-title">
      <div className="section-heading">
        <span className="eyebrow">Browse</span>
        <h2 id="tool-directory-title">Find the right converter faster</h2>
        <p>Jump into common tools directly, or use the toolbox above for broader conversion modes.</p>
      </div>
      <div className="directory-grid">
        {DIRECTORY_GROUPS.map((group) => (
          <div className="directory-card" key={group.title}>
            <h3>{group.title}</h3>
            <div className="directory-links">
              {group.links.map((link) => (
                <a href={link.href} key={link.href}>
                  {link.label}
                  <i className="bx bx-right-arrow-alt" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
