import type { Mode } from '../types/conversion';

interface ModeSwitcherProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  const indicatorClass =
    mode === 'documents'
      ? 'slide-one'
      : mode === 'pdf-tools'
        ? 'slide-two'
        : mode === 'image'
          ? 'slide-three'
          : mode === 'pptx-png'
            ? 'slide-four'
            : '';

  return (
    <div className="mode-switcher">
      <button className={`mode-tab ${mode === 'pdf' ? 'active' : ''}`} type="button" onClick={() => onModeChange('pdf')}>
        <i className="bx bxs-file-pdf" /> Any &rarr; PDF
      </button>
      <button
        className={`mode-tab ${mode === 'documents' ? 'active' : ''}`}
        type="button"
        onClick={() => onModeChange('documents')}
      >
        <i className="bx bxs-file-doc" /> Documents
      </button>
      <button
        className={`mode-tab ${mode === 'pdf-tools' ? 'active' : ''}`}
        type="button"
        onClick={() => onModeChange('pdf-tools')}
      >
        <i className="bx bx-transfer" /> PDF Tools
      </button>
      <button
        className={`mode-tab ${mode === 'image' ? 'active' : ''}`}
        type="button"
        onClick={() => onModeChange('image')}
      >
        <i className="bx bxs-image-alt" /> Image Converter
      </button>
      <button
        className={`mode-tab ${mode === 'pptx-png' ? 'active' : ''}`}
        type="button"
        onClick={() => onModeChange('pptx-png')}
      >
        <i className="bx bxs-image" /> PDF/PPTX &rarr; PNG Pages
      </button>
      <div className={`mode-indicator ${indicatorClass}`} />
    </div>
  );
}
