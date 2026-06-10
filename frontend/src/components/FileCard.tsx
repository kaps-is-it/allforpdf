import type { ConversionItem, Mode } from '../types/conversion';
import { getDownloadLabel } from '../lib/files';

interface FileCardProps {
  item: ConversionItem;
  mode: Mode;
  imageTarget: string;
  pdfTarget?: string;
  documentTarget?: string;
}

export function FileCard({ item, mode, imageTarget, pdfTarget, documentTarget }: FileCardProps) {
  return (
    <div className="file-item">
      <div className="file-info">
        <i className={`bx ${item.iconClass} file-icon`} />
        <div className="file-details">
          <h4>{item.fileName}</h4>
          <div className={`status ${item.state === 'processing' ? '' : item.state}`}>
            {item.state === 'processing' ? <span className="loader" /> : <i className={`bx ${item.state === 'success' ? 'bx-check-circle' : 'bx-x-circle'}`} />}
            {item.message}
          </div>
        </div>
      </div>
      <div className="file-actions">
        {item.state === 'success' && item.downloadUrl && item.downloadName ? (
          <a href={item.downloadUrl} download={item.downloadName} className="btn-download">
            <i className="bx bx-download" /> {getDownloadLabel(mode, imageTarget, pdfTarget, documentTarget)}
          </a>
        ) : (
          <button className="btn-download" type="button" disabled>
            {item.state === 'error' ? 'Failed' : 'Processing...'}
          </button>
        )}
      </div>
    </div>
  );
}
