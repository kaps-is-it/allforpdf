import type { ConversionItem, Mode } from '../types/conversion';
import { FileCard } from './FileCard';

interface DownloadCenterProps {
  items: ConversionItem[];
  heroText: string;
  mode: Mode;
  imageTarget: string;
  pdfTarget?: string;
  documentTarget?: string;
  onDownloadAll: () => void;
  onConvertMore: () => void;
  isZipping: boolean;
}

export function DownloadCenter({
  items,
  heroText,
  mode,
  imageTarget,
  pdfTarget,
  documentTarget,
  onDownloadAll,
  onConvertMore,
  isZipping,
}: DownloadCenterProps) {
  return (
    <section id="downloadCenter">
      <div className="download-hero">
        <i className="bx bxs-check-shield" />
        <h2>Conversion Complete</h2>
        <p>{heroText}</p>
        <button className="btn-primary btn-massive" type="button" onClick={onDownloadAll} disabled={isZipping}>
          <i className={`bx ${isZipping ? 'bx-loader-alt bx-spin' : 'bxs-file-archive'}`} />
          {isZipping ? 'Zipping...' : 'Download All as ZIP'}
        </button>
      </div>

      <div className="download-list-header">
        <h3>Individual Files</h3>
        <button className="btn-text" type="button" onClick={onConvertMore}>
          <i className="bx bx-refresh" /> Convert More
        </button>
      </div>
      <div className="file-list">
        {items.map((item) => (
          <FileCard
            key={item.id}
            item={item}
            mode={mode}
            imageTarget={imageTarget}
            pdfTarget={pdfTarget}
            documentTarget={documentTarget}
          />
        ))}
      </div>
    </section>
  );
}
