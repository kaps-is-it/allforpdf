import type { Mode } from '../types/conversion';

export interface ToolPreset {
  id: string;
  title: string;
  description: string;
  iconClass: string;
  mode: Mode;
  imageTarget?: string;
  pdfTarget?: string;
  documentTarget?: string;
  presentationTarget?: string;
  spreadsheetTarget?: string;
  textDataTarget?: string;
  notebookTarget?: string;
  ebookTarget?: string;
}

interface ToolNavigatorProps {
  mode: Mode;
  imageTarget: string;
  pdfTarget: string;
  documentTarget: string;
  presentationTarget: string;
  spreadsheetTarget: string;
  textDataTarget: string;
  notebookTarget: string;
  ebookTarget: string;
  onToolSelect: (preset: ToolPreset) => void;
}

const PRIMARY_TOOLS: ToolPreset[] = [
  {
    id: 'to-pdf',
    title: 'Convert to PDF',
    description: 'Docs, slides, sheets, code, images',
    iconClass: 'bxs-file-pdf',
    mode: 'pdf',
  },
  {
    id: 'documents',
    title: 'Document Converter',
    description: 'DOCX, ODT, RTF, TXT, MD, HTML',
    iconClass: 'bxs-file-doc',
    mode: 'documents',
    documentTarget: '.pdf',
  },
  {
    id: 'spreadsheets',
    title: 'Spreadsheet Converter',
    description: 'XLSX, XLS, CSV, ODS, TSV',
    iconClass: 'bx-spreadsheet',
    mode: 'spreadsheets',
    spreadsheetTarget: '.pdf',
  },
  {
    id: 'text-data',
    title: 'Text & Data Converter',
    description: 'JSON, XML, YAML, TOML, code',
    iconClass: 'bx-code-curly',
    mode: 'text-data',
    textDataTarget: '.pdf',
  },
  {
    id: 'notebooks',
    title: 'Notebook Converter',
    description: 'IPYNB to PDF, HTML, PY, MD',
    iconClass: 'bx-book-content',
    mode: 'notebooks',
    notebookTarget: '.pdf',
  },
  {
    id: 'ebooks',
    title: 'eBook Converter',
    description: 'EPUB, MOBI, AZW3, FB2, PDF, TXT',
    iconClass: 'bx-book-open',
    mode: 'ebooks',
    ebookTarget: '.epub',
  },
  {
    id: 'image-pdf',
    title: 'Image Converter',
    description: 'PNG, JPG, WEBP, SVG, HEIC, ICO',
    iconClass: 'bxs-image-alt',
    mode: 'image',
    imageTarget: '.pdf',
  },
  {
    id: 'presentations',
    title: 'Presentation Converter',
    description: 'PPT, PPTX, ODP to PDF, images, ZIP',
    iconClass: 'bx-slideshow',
    mode: 'presentations',
    presentationTarget: '.pdf',
  },
  {
    id: 'page-extract',
    title: 'Pages to PNG',
    description: 'Extract PDF or PPTX pages',
    iconClass: 'bxs-file-image',
    mode: 'pptx-png',
  },
];

const PDF_TOOLS: ToolPreset[] = [
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine multiple PDFs',
    iconClass: 'bx-git-merge',
    mode: 'pdf-tools',
    pdfTarget: 'merge',
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduce PDF size',
    iconClass: 'bx-collapse-alt',
    mode: 'pdf-tools',
    pdfTarget: 'compress',
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'One PDF per page',
    iconClass: 'bx-scissors',
    mode: 'pdf-tools',
    pdfTarget: 'split',
  },
  {
    id: 'pdf-office',
    title: 'PDF to Office',
    description: 'DOCX, PPTX, XLSX',
    iconClass: 'bx-transfer',
    mode: 'pdf-tools',
    pdfTarget: '.docx',
  },
];

const TOOL_GROUPS = [
  { title: 'Start Here', tools: PRIMARY_TOOLS },
  { title: 'PDF Actions', tools: PDF_TOOLS },
];

function isActiveTool(
  preset: ToolPreset,
  mode: Mode,
  imageTarget: string,
  pdfTarget: string,
  documentTarget: string,
  presentationTarget: string,
  spreadsheetTarget: string,
  textDataTarget: string,
  notebookTarget: string,
  ebookTarget: string,
) {
  if (preset.mode !== mode) return false;
  if (preset.imageTarget && preset.imageTarget !== imageTarget) return false;
  if (preset.pdfTarget && preset.pdfTarget !== pdfTarget) return false;
  if (preset.documentTarget && preset.documentTarget !== documentTarget) return false;
  if (preset.presentationTarget && preset.presentationTarget !== presentationTarget) return false;
  if (preset.spreadsheetTarget && preset.spreadsheetTarget !== spreadsheetTarget) return false;
  if (preset.textDataTarget && preset.textDataTarget !== textDataTarget) return false;
  if (preset.notebookTarget && preset.notebookTarget !== notebookTarget) return false;
  if (preset.ebookTarget && preset.ebookTarget !== ebookTarget) return false;
  return true;
}

export function ToolNavigator({
  mode,
  imageTarget,
  pdfTarget,
  documentTarget,
  presentationTarget,
  spreadsheetTarget,
  textDataTarget,
  notebookTarget,
  ebookTarget,
  onToolSelect,
}: ToolNavigatorProps) {
  return (
    <nav className="tool-navigator" aria-label="Conversion tools">
      <div className="tool-navigator-header">
        <span className="eyebrow">Toolbox</span>
        <h2>Pick a task</h2>
      </div>
      {TOOL_GROUPS.map((group) => (
        <section className="tool-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="tool-list">
            {group.tools.map((tool) => (
              <button
                className={`tool-card ${isActiveTool(tool, mode, imageTarget, pdfTarget, documentTarget, presentationTarget, spreadsheetTarget, textDataTarget, notebookTarget, ebookTarget) ? 'active' : ''}`}
                key={tool.id}
                type="button"
                onClick={() => onToolSelect(tool)}
              >
                <i className={`bx ${tool.iconClass}`} />
                <span>
                  <strong>{tool.title}</strong>
                  <small>{tool.description}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
}
