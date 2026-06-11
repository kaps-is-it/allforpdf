export type Mode =
  | 'pdf'
  | 'documents'
  | 'spreadsheets'
  | 'text-data'
  | 'notebooks'
  | 'ebooks'
  | 'pdf-tools'
  | 'image'
  | 'presentations'
  | 'pptx-png';

export type ConversionState = 'processing' | 'success' | 'error';

export interface ModeConfig {
  subtitle: string;
  dropzoneTitle: string;
  dropzoneIcon: string;
  supportedFormats: string;
  accept: string;
  statusText: string;
  heroText: string;
}

export interface ConversionItem {
  id: string;
  fileName: string;
  iconClass: string;
  state: ConversionState;
  message: string;
  downloadUrl?: string;
  downloadName?: string;
}

export interface BatchBlob {
  name: string;
  blob: Blob;
}
