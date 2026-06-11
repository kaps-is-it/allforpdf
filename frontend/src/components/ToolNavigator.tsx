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
}

interface ToolNavigatorProps {
  mode: Mode;
  imageTarget: string;
  pdfTarget: string;
  documentTarget: string;
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
    id: 'image-pdf',
    title: 'Image Converter',
    description: 'PNG, JPG, WEBP, SVG, HEIC, ICO',
    iconClass: 'bxs-image-alt',
    mode: 'image',
    imageTarget: '.pdf',
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

function isActiveTool(preset: ToolPreset, mode: Mode, imageTarget: string, pdfTarget: string, documentTarget: string) {
  if (preset.mode !== mode) return false;
  if (preset.imageTarget && preset.imageTarget !== imageTarget) return false;
  if (preset.pdfTarget && preset.pdfTarget !== pdfTarget) return false;
  if (preset.documentTarget && preset.documentTarget !== documentTarget) return false;
  return true;
}

export function ToolNavigator({ mode, imageTarget, pdfTarget, documentTarget, onToolSelect }: ToolNavigatorProps) {
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
                className={`tool-card ${isActiveTool(tool, mode, imageTarget, pdfTarget, documentTarget) ? 'active' : ''}`}
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
