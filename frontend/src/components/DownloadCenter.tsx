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
  const successCount = items.filter((item) => item.state === 'success').length;
  const failedCount = items.filter((item) => item.state === 'error').length;
  const hasDownloads = successCount > 0;
  const title = hasDownloads ? (failedCount > 0 ? 'Conversion Finished' : 'Conversion Complete') : 'Conversion Failed';
  const description = hasDownloads
    ? failedCount > 0
      ? `${successCount} file${successCount === 1 ? '' : 's'} converted. ${failedCount} failed.`
      : heroText
    : 'No files were converted. Review the failed file below and try again.';
  const iconClass = hasDownloads ? 'bxs-check-shield' : 'bx-error-circle';
  const zipLabel = failedCount > 0 ? 'Download Successful Files as ZIP' : 'Download All as ZIP';

  return (
    <section id="downloadCenter">
      <div className={`download-hero ${hasDownloads ? '' : 'failed'}`}>
        <i className={`bx ${iconClass}`} />
        <h2>{title}</h2>
        <p>{description}</p>
        {hasDownloads ? (
          <button className="btn-primary btn-massive" type="button" onClick={onDownloadAll} disabled={isZipping}>
            <i className={`bx ${isZipping ? 'bx-loader-alt bx-spin' : 'bxs-file-archive'}`} />
            {isZipping ? 'Zipping...' : zipLabel}
          </button>
        ) : null}
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
