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
