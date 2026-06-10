import { useRef, useState } from 'react';

interface UploadAreaProps {
  accept: string;
  dropzoneIcon: string;
  dropzoneTitle: string;
  supportedFormats: string;
  onFilesSelected: (files: File[]) => void;
}

export function UploadArea({ accept, dropzoneIcon, dropzoneTitle, supportedFormats, onFilesSelected }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const submitFiles = (files: FileList | null) => {
    if (!files?.length) return;
    onFilesSelected(Array.from(files));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`upload-area ${dragging ? 'dragover' : ''}`}
      onClick={openPicker}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        submitFiles(event.dataTransfer.files);
      }}
    >
      <div className="upload-icon">
        <i className={`bx ${dropzoneIcon}`} />
      </div>
      <h2>{dropzoneTitle}</h2>
      <p>or</p>
      <button
        className="btn-primary"
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openPicker();
        }}
      >
        Browse Files
      </button>
      <input ref={inputRef} type="file" multiple accept={accept} hidden onChange={(event) => submitFiles(event.target.files)} />
      <p className="supported-formats">{supportedFormats}</p>
    </div>
  );
}

