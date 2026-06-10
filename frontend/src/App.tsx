import { useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';

import { DocumentTargetPanel } from './components/DocumentTargetPanel';
import { DownloadCenter } from './components/DownloadCenter';
import { FileCard } from './components/FileCard';
import { Header } from './components/Header';
import { ImageTargetPanel } from './components/ImageTargetPanel';
import { ModeSwitcher } from './components/ModeSwitcher';
import { PdfTargetPanel } from './components/PdfTargetPanel';
import { ProgressBar } from './components/ProgressBar';
import { UploadArea } from './components/UploadArea';
import { convertDocument, convertImage, convertPagesToPngZip, convertPdf, convertToPdf, mergePdfFiles } from './lib/api';
import {
  bodyClassForMode,
  DOCUMENT_CONVERSION_MAP,
  IMAGE_CONVERSION_MAP,
  MODE_CONFIG,
  getDocumentTargetLabel,
  getImageTargetLabel,
  getPdfTargetLabel,
} from './lib/conversions';
import { getFileExt, getIconForFile } from './lib/files';
import { DEFAULT_SEO_PAGE, applySeoMetadata, getSeoPageForPath } from './lib/seo';
import type { BatchBlob, ConversionItem, Mode } from './types/conversion';

function makeId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function App() {
  const initialSeoPage = useMemo(() => getSeoPageForPath(window.location.pathname), []);
  const [activeSeoPage, setActiveSeoPage] = useState(initialSeoPage);
  const [mode, setMode] = useState<Mode>(initialSeoPage?.mode ?? 'pdf');
  const [imageTarget, setImageTarget] = useState(initialSeoPage?.imageTarget ?? '.pdf');
  const [pdfTarget, setPdfTarget] = useState(initialSeoPage?.pdfTarget ?? '.docx');
  const [documentTarget, setDocumentTarget] = useState(initialSeoPage?.documentTarget ?? '.pdf');
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [batchBlobs, setBatchBlobs] = useState<BatchBlob[]>([]);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchCompleted, setBatchCompleted] = useState(0);
  const [showDownloads, setShowDownloads] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const config = MODE_CONFIG[mode];
  const actionWord =
    mode === 'pptx-png'
      ? 'Extracting slides from'
      : mode === 'pdf-tools' && pdfTarget === 'merge'
        ? 'Merging'
        : mode === 'documents'
          ? 'Converting'
        : mode === 'pdf-tools'
          ? 'Processing'
          : 'Converting';

  const uploadConfig = activeSeoPage
    ? {
        ...config,
        accept: activeSeoPage.accept,
        dropzoneTitle: activeSeoPage.dropzoneTitle,
        supportedFormats: activeSeoPage.supportedFormats,
      }
    : config;

  useEffect(() => {
    document.body.className = bodyClassForMode(mode);
  }, [mode]);

  useEffect(() => {
    applySeoMetadata(activeSeoPage ?? DEFAULT_SEO_PAGE);
  }, [activeSeoPage]);

  useEffect(() => {
    if (isProcessing && batchTotal > 0 && batchCompleted === batchTotal) {
      const timeout = window.setTimeout(() => {
        setIsProcessing(false);
        setShowDownloads(true);
      }, 800);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [batchCompleted, batchTotal, isProcessing]);

  const downloadItems = useMemo(() => items, [items]);

  const resetUi = () => {
    items.forEach((item) => {
      if (item.downloadUrl) URL.revokeObjectURL(item.downloadUrl);
    });
    setItems([]);
    setBatchBlobs([]);
    setBatchTotal(0);
    setBatchCompleted(0);
    setShowDownloads(false);
    setIsProcessing(false);
  };

  const clearSeoPage = () => {
    if (!activeSeoPage) return;
    setActiveSeoPage(null);
    window.history.replaceState({}, '', '/');
  };

  const changeMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    resetUi();
    clearSeoPage();
    setMode(nextMode);
  };

  const changeImageTarget = (target: string) => {
    clearSeoPage();
    setImageTarget(target);
  };

  const changePdfTarget = (target: string) => {
    clearSeoPage();
    setPdfTarget(target);
  };

  const changeDocumentTarget = (target: string) => {
    clearSeoPage();
    setDocumentTarget(target);
  };

  const updateItem = (id: string, patch: Partial<ConversionItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const queueItem = (fileName: string, iconClass: string, message: string) => {
    const id = makeId();
    setItems((current) => [
      {
        id,
        fileName,
        iconClass,
        state: 'processing',
        message,
      },
      ...current,
    ]);
    return id;
  };

  const queueFile = (file: File, message: string) => queueItem(file.name, getIconForFile(file, mode), message);

  const completeSuccess = (id: string, blob: Blob, filename: string, message: string) => {
    const downloadUrl = URL.createObjectURL(blob);
    updateItem(id, {
      state: 'success',
      message,
      downloadUrl,
      downloadName: filename,
    });
    setBatchBlobs((current) => [...current, { name: filename, blob }]);
  };

  const completeError = (id: string, message: string) => {
    updateItem(id, { state: 'error', message });
  };

  const incrementCompleted = () => {
    setBatchCompleted((current) => current + 1);
  };

  const uploadPdfFile = async (file: File) => {
    const id = queueFile(file, MODE_CONFIG.pdf.statusText);
    try {
      const result = await convertToPdf(file);
      completeSuccess(id, result.blob, result.filename, 'Conversion complete!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadImageFile = async (file: File, targetExt: string) => {
    const id = queueFile(file, `Converting to ${getImageTargetLabel(targetExt)}...`);
    try {
      const result = await convertImage(file, targetExt);
      completeSuccess(id, result.blob, result.filename, 'Image conversion complete!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'Image conversion failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadDocumentFile = async (file: File, targetExt: string) => {
    const id = queueFile(file, `Converting to ${getDocumentTargetLabel(targetExt)}...`);
    try {
      const result = await convertDocument(file, targetExt);
      completeSuccess(id, result.blob, result.filename, 'Document conversion complete!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'Document conversion failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadPdfToolFile = async (file: File, target: string) => {
    const id = queueFile(file, `Creating ${getPdfTargetLabel(target)}...`);
    try {
      const result = await convertPdf(file, target);
      completeSuccess(id, result.blob, result.filename, `${getPdfTargetLabel(target)} ready!`);
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'PDF conversion failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadMergedPdfFiles = async (files: File[]) => {
    const id = queueItem(`${files.length} PDFs`, 'bx-file-pdf', 'Merging PDFs...');
    try {
      const result = await mergePdfFiles(files);
      completeSuccess(id, result.blob, result.filename, 'Merged PDF ready!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'PDF merge failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadPageZipFile = async (file: File) => {
    const id = queueFile(file, 'Extracting slides as PNG...');
    try {
      const result = await convertPagesToPngZip(file);
      completeSuccess(id, result.blob, result.filename, `${result.filename} pages extracted!`);
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'Slide extraction failed');
    } finally {
      incrementCompleted();
    }
  };

  const handleImageFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const ext = getFileExt(file);
      return !IMAGE_CONVERSION_MAP[ext] || !IMAGE_CONVERSION_MAP[ext].includes(imageTarget);
    });

    if (invalidFiles.length > 0) {
      alert(`The selected target (${getImageTargetLabel(imageTarget)}) is not available for: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    files.forEach((file) => void uploadImageFile(file, imageTarget));
  };

  const handleDocumentFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const ext = getFileExt(file);
      return !DOCUMENT_CONVERSION_MAP[ext] || !DOCUMENT_CONVERSION_MAP[ext].includes(documentTarget);
    });

    if (invalidFiles.length > 0) {
      alert(`The selected target (${getDocumentTargetLabel(documentTarget)}) is not available for: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    files.forEach((file) => void uploadDocumentFile(file, documentTarget));
  };

  const handlePptxFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const name = file.name.toLowerCase();
      return !['.pptx', '.pdf'].some((ext) => name.endsWith(ext));
    });

    if (invalidFiles.length > 0) {
      alert(`Only .pptx and .pdf files are supported in this mode. Invalid: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    files.forEach((file) => void uploadPageZipFile(file));
  };

  const handlePdfToolFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => getFileExt(file) !== '.pdf');

    if (invalidFiles.length > 0) {
      alert(`Only .pdf files are supported in PDF Tools. Invalid: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    if (pdfTarget === 'merge') {
      if (files.length < 2) {
        alert('Select at least two PDFs to merge.');
        resetUi();
        return;
      }
      void uploadMergedPdfFiles(files);
      return;
    }

    files.forEach((file) => void uploadPdfToolFile(file, pdfTarget));
  };

  const validateSeoRouteFiles = (files: File[]) => {
    if (!activeSeoPage) return true;

    const invalidFiles = files.filter((file) => !activeSeoPage.acceptedExts.includes(getFileExt(file)));
    if (invalidFiles.length === 0) return true;

    alert(
      `${activeSeoPage.h1} accepts only ${activeSeoPage.supportedFormats.replace('Accepted format: ', '').toLowerCase()}. Invalid: ${invalidFiles.map((file) => file.name).join(', ')}`,
    );
    resetUi();
    return false;
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    if (!validateSeoRouteFiles(files)) return;

    resetUi();
    setBatchTotal(mode === 'pdf-tools' && pdfTarget === 'merge' ? 1 : files.length);
    setBatchCompleted(0);
    setIsProcessing(true);

    if (mode === 'image') {
      handleImageFiles(files);
    } else if (mode === 'documents') {
      handleDocumentFiles(files);
    } else if (mode === 'pdf-tools') {
      handlePdfToolFiles(files);
    } else if (mode === 'pptx-png') {
      handlePptxFiles(files);
    } else {
      files.forEach((file) => void uploadPdfFile(file));
    }
  };

  const downloadAll = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      batchBlobs.forEach((item) => {
        zip.file(item.name, item.blob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `Converti_Batch_${Math.floor(Date.now() / 1000)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      alert('Error creating zip file.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <>
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="container">
        <Header title={activeSeoPage?.h1 ?? DEFAULT_SEO_PAGE.h1} subtitle={activeSeoPage?.description ?? config.subtitle} />

        {!isProcessing && !showDownloads ? <ModeSwitcher mode={mode} onModeChange={changeMode} /> : null}

        {!showDownloads ? (
          <main>
            {isProcessing ? <ProgressBar completed={batchCompleted} total={batchTotal} actionWord={actionWord} /> : null}
            {!isProcessing && mode === 'documents' ? (
              <DocumentTargetPanel target={documentTarget} onTargetChange={changeDocumentTarget} />
            ) : null}
            {!isProcessing && mode === 'pdf-tools' ? <PdfTargetPanel target={pdfTarget} onTargetChange={changePdfTarget} /> : null}
            {!isProcessing && mode === 'image' ? <ImageTargetPanel target={imageTarget} onTargetChange={changeImageTarget} /> : null}
            {!isProcessing ? (
              <UploadArea
                accept={uploadConfig.accept}
                dropzoneIcon={uploadConfig.dropzoneIcon}
                dropzoneTitle={uploadConfig.dropzoneTitle}
                supportedFormats={uploadConfig.supportedFormats}
                onFilesSelected={handleFiles}
              />
            ) : null}
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
          </main>
        ) : (
          <DownloadCenter
            items={downloadItems}
            heroText={config.heroText}
            mode={mode}
            imageTarget={imageTarget}
            pdfTarget={pdfTarget}
            documentTarget={documentTarget}
            onDownloadAll={downloadAll}
            onConvertMore={resetUi}
            isZipping={isZipping}
          />
        )}
      </div>
    </>
  );
}
