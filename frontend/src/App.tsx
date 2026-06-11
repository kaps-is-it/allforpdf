import { useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';

import { AdSlot } from './components/AdSlot';
import { ConversionSearch } from './components/ConversionSearch';
import { ConverterIntro } from './components/ConverterIntro';
import { DocumentTargetPanel } from './components/DocumentTargetPanel';
import { DownloadCenter } from './components/DownloadCenter';
import { EbookTargetPanel } from './components/EbookTargetPanel';
import { FileCard } from './components/FileCard';
import { Header } from './components/Header';
import { ImageTargetPanel } from './components/ImageTargetPanel';
import { NotebookTargetPanel } from './components/NotebookTargetPanel';
import { PdfTargetPanel } from './components/PdfTargetPanel';
import { PresentationTargetPanel } from './components/PresentationTargetPanel';
import { PrivacyNotice } from './components/PrivacyNotice';
import { ProgressBar } from './components/ProgressBar';
import { SpreadsheetTargetPanel } from './components/SpreadsheetTargetPanel';
import { TextDataTargetPanel } from './components/TextDataTargetPanel';
import { ToolDirectory } from './components/ToolDirectory';
import { ToolNavigator, type ToolPreset } from './components/ToolNavigator';
import { UploadArea } from './components/UploadArea';
import {
  convertDocument,
  convertEbook,
  convertImage,
  convertNotebook,
  convertPagesToPngZip,
  convertPdf,
  convertPresentation,
  convertSpreadsheet,
  convertTextData,
  convertToPdf,
  mergePdfFiles,
} from './lib/api';
import {
  bodyClassForMode,
  DOCUMENT_CONVERSION_MAP,
  EBOOK_CONVERSION_MAP,
  IMAGE_CONVERSION_MAP,
  MODE_CONFIG,
  NOTEBOOK_CONVERSION_MAP,
  PRESENTATION_CONVERSION_MAP,
  SPREADSHEET_CONVERSION_MAP,
  TEXT_DATA_CONVERSION_MAP,
  getDocumentTargetLabel,
  getEbookTargetLabel,
  getImageTargetLabel,
  getNotebookTargetLabel,
  getPdfTargetLabel,
  getPresentationTargetLabel,
  getSpreadsheetTargetLabel,
  getTextDataTargetLabel,
} from './lib/conversions';
import { getFileExt, getIconForFile } from './lib/files';
import { DEFAULT_SEO_PAGE, applySeoMetadata, getSeoPageForPath } from './lib/seo';
import type { BatchBlob, ConversionItem, Mode } from './types/conversion';

function makeId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

const MODE_LABELS: Record<Mode, string> = {
  pdf: 'Convert to PDF',
  documents: 'Document converter',
  spreadsheets: 'Spreadsheet converter',
  'text-data': 'Text, code, and data converter',
  notebooks: 'Notebook converter',
  ebooks: 'eBook converter',
  'pdf-tools': 'PDF tools',
  image: 'Image converter',
  presentations: 'Presentation converter',
  'pptx-png': 'Page extractor',
};

export function App() {
  const initialSeoPage = useMemo(() => getSeoPageForPath(window.location.pathname), []);
  const [activeSeoPage, setActiveSeoPage] = useState(initialSeoPage);
  const [mode, setMode] = useState<Mode>(initialSeoPage?.mode ?? 'pdf');
  const [imageTarget, setImageTarget] = useState(initialSeoPage?.imageTarget ?? '.pdf');
  const [pdfTarget, setPdfTarget] = useState(initialSeoPage?.pdfTarget ?? '.docx');
  const [documentTarget, setDocumentTarget] = useState(initialSeoPage?.documentTarget ?? '.pdf');
  const [presentationTarget, setPresentationTarget] = useState(initialSeoPage?.presentationTarget ?? '.pdf');
  const [spreadsheetTarget, setSpreadsheetTarget] = useState(initialSeoPage?.spreadsheetTarget ?? '.pdf');
  const [textDataTarget, setTextDataTarget] = useState(initialSeoPage?.textDataTarget ?? '.pdf');
  const [notebookTarget, setNotebookTarget] = useState(initialSeoPage?.notebookTarget ?? '.pdf');
  const [ebookTarget, setEbookTarget] = useState(initialSeoPage?.ebookTarget ?? '.epub');
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
  const outputLabel =
    mode === 'documents'
      ? getDocumentTargetLabel(documentTarget)
      : mode === 'spreadsheets'
        ? getSpreadsheetTargetLabel(spreadsheetTarget)
      : mode === 'text-data'
        ? getTextDataTargetLabel(textDataTarget)
      : mode === 'notebooks'
        ? getNotebookTargetLabel(notebookTarget)
      : mode === 'ebooks'
        ? getEbookTargetLabel(ebookTarget)
      : mode === 'presentations'
        ? getPresentationTargetLabel(presentationTarget)
      : mode === 'pdf-tools'
        ? getPdfTargetLabel(pdfTarget)
        : mode === 'image'
          ? getImageTargetLabel(imageTarget)
          : mode === 'pptx-png'
            ? 'PNG pages ZIP'
            : 'PDF';
  const focusedRouteLabel = activeSeoPage?.h1.replace(/\s+Converter$/, '');
  const converterIntroTitle = activeSeoPage ? 'Focused conversion setup' : 'Ready to convert';
  const converterIntroDescription = activeSeoPage
    ? 'This tool is already set for the page you opened. Upload matching files and download the result when processing finishes.'
    : 'Choose a task from the toolbox, set the output when needed, then drop files into the converter.';
  const showTargetControls = !isProcessing && !activeSeoPage;

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

  const changeSpreadsheetTarget = (target: string) => {
    clearSeoPage();
    setSpreadsheetTarget(target);
  };

  const changeTextDataTarget = (target: string) => {
    clearSeoPage();
    setTextDataTarget(target);
  };

  const changeNotebookTarget = (target: string) => {
    clearSeoPage();
    setNotebookTarget(target);
  };

  const changeEbookTarget = (target: string) => {
    clearSeoPage();
    setEbookTarget(target);
  };

  const changePresentationTarget = (target: string) => {
    clearSeoPage();
    setPresentationTarget(target);
  };

  const selectTool = (preset: ToolPreset) => {
    resetUi();
    clearSeoPage();
    setMode(preset.mode);
    if (preset.imageTarget) setImageTarget(preset.imageTarget);
    if (preset.pdfTarget) setPdfTarget(preset.pdfTarget);
    if (preset.documentTarget) setDocumentTarget(preset.documentTarget);
    if (preset.presentationTarget) setPresentationTarget(preset.presentationTarget);
    if (preset.spreadsheetTarget) setSpreadsheetTarget(preset.spreadsheetTarget);
    if (preset.textDataTarget) setTextDataTarget(preset.textDataTarget);
    if (preset.notebookTarget) setNotebookTarget(preset.notebookTarget);
    if (preset.ebookTarget) setEbookTarget(preset.ebookTarget);
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

  const uploadSpreadsheetFile = async (file: File, targetExt: string) => {
    const id = queueFile(file, `Converting to ${getSpreadsheetTargetLabel(targetExt)}...`);
    try {
      const result = await convertSpreadsheet(file, targetExt);
      completeSuccess(id, result.blob, result.filename, 'Spreadsheet conversion complete!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'Spreadsheet conversion failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadTextDataFile = async (file: File, targetExt: string) => {
    const id = queueFile(file, `Converting to ${getTextDataTargetLabel(targetExt)}...`);
    try {
      const result = await convertTextData(file, targetExt);
      completeSuccess(id, result.blob, result.filename, 'Text/data conversion complete!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'Text/data conversion failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadNotebookFile = async (file: File, targetExt: string) => {
    const id = queueFile(file, `Converting to ${getNotebookTargetLabel(targetExt)}...`);
    try {
      const result = await convertNotebook(file, targetExt);
      completeSuccess(id, result.blob, result.filename, 'Notebook conversion complete!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'Notebook conversion failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadEbookFile = async (file: File, targetExt: string) => {
    const id = queueFile(file, `Converting to ${getEbookTargetLabel(targetExt)}...`);
    try {
      const result = await convertEbook(file, targetExt);
      completeSuccess(id, result.blob, result.filename, 'eBook conversion complete!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'eBook conversion failed');
    } finally {
      incrementCompleted();
    }
  };

  const uploadPresentationFile = async (file: File, targetExt: string) => {
    const id = queueFile(file, `Converting to ${getPresentationTargetLabel(targetExt)}...`);
    try {
      const result = await convertPresentation(file, targetExt);
      completeSuccess(id, result.blob, result.filename, 'Presentation conversion complete!');
    } catch (error) {
      completeError(id, error instanceof Error ? error.message : 'Presentation conversion failed');
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

  const handleSpreadsheetFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const ext = getFileExt(file);
      return !SPREADSHEET_CONVERSION_MAP[ext] || !SPREADSHEET_CONVERSION_MAP[ext].includes(spreadsheetTarget);
    });

    if (invalidFiles.length > 0) {
      alert(`The selected target (${getSpreadsheetTargetLabel(spreadsheetTarget)}) is not available for: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    files.forEach((file) => void uploadSpreadsheetFile(file, spreadsheetTarget));
  };

  const handleTextDataFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const ext = getFileExt(file);
      return !TEXT_DATA_CONVERSION_MAP[ext] || !TEXT_DATA_CONVERSION_MAP[ext].includes(textDataTarget);
    });

    if (invalidFiles.length > 0) {
      alert(`The selected target (${getTextDataTargetLabel(textDataTarget)}) is not available for: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    files.forEach((file) => void uploadTextDataFile(file, textDataTarget));
  };

  const handleNotebookFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const ext = getFileExt(file);
      return !NOTEBOOK_CONVERSION_MAP[ext] || !NOTEBOOK_CONVERSION_MAP[ext].includes(notebookTarget);
    });

    if (invalidFiles.length > 0) {
      alert(`The selected target (${getNotebookTargetLabel(notebookTarget)}) is not available for: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    files.forEach((file) => void uploadNotebookFile(file, notebookTarget));
  };

  const handleEbookFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const ext = getFileExt(file);
      return !EBOOK_CONVERSION_MAP[ext] || !EBOOK_CONVERSION_MAP[ext].includes(ebookTarget);
    });

    if (invalidFiles.length > 0) {
      alert(`The selected target (${getEbookTargetLabel(ebookTarget)}) is not available for: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    files.forEach((file) => void uploadEbookFile(file, ebookTarget));
  };

  const handlePresentationFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const ext = getFileExt(file);
      return !PRESENTATION_CONVERSION_MAP[ext] || !PRESENTATION_CONVERSION_MAP[ext].includes(presentationTarget);
    });

    if (invalidFiles.length > 0) {
      alert(`The selected target (${getPresentationTargetLabel(presentationTarget)}) is not available for: ${invalidFiles.map((file) => file.name).join(', ')}`);
      resetUi();
      return;
    }

    files.forEach((file) => void uploadPresentationFile(file, presentationTarget));
  };

  const handlePptxFiles = (files: File[]) => {
    const invalidFiles = files.filter((file) => {
      const name = file.name.toLowerCase();
      return !['.ppt', '.pptx', '.odp', '.pdf'].some((ext) => name.endsWith(ext));
    });

    if (invalidFiles.length > 0) {
      alert(`Only .ppt, .pptx, .odp, and .pdf files are supported in this mode. Invalid: ${invalidFiles.map((file) => file.name).join(', ')}`);
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
    } else if (mode === 'spreadsheets') {
      handleSpreadsheetFiles(files);
    } else if (mode === 'text-data') {
      handleTextDataFiles(files);
    } else if (mode === 'notebooks') {
      handleNotebookFiles(files);
    } else if (mode === 'ebooks') {
      handleEbookFiles(files);
    } else if (mode === 'presentations') {
      handlePresentationFiles(files);
    } else if (mode === 'pdf-tools') {
      handlePdfToolFiles(files);
    } else if (mode === 'pptx-png') {
      handlePptxFiles(files);
    } else {
      files.forEach((file) => void uploadPdfFile(file));
    }
  };

  const downloadAll = async () => {
    if (batchBlobs.length === 0) {
      alert('No converted files are available to download.');
      return;
    }

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
      <div className="ambient-grid" />
      <div className="page-shell">
        <Header
          title={activeSeoPage?.h1 ?? DEFAULT_SEO_PAGE.h1}
          subtitle={activeSeoPage?.description ?? config.subtitle}
          eyebrow={activeSeoPage ? 'Focused converter' : 'All-in-one file workspace'}
        />
        <ConversionSearch />

        <div className="workspace-layout">
          <aside className="tool-sidebar">
            <ToolNavigator
              mode={mode}
              imageTarget={imageTarget}
              pdfTarget={pdfTarget}
              documentTarget={documentTarget}
              presentationTarget={presentationTarget}
              spreadsheetTarget={spreadsheetTarget}
              textDataTarget={textDataTarget}
              notebookTarget={notebookTarget}
              ebookTarget={ebookTarget}
              onToolSelect={selectTool}
            />
          </aside>

          <main className="workspace-main">
            <section className="converter-panel">
              <ConverterIntro
                title={converterIntroTitle}
                description={converterIntroDescription}
                modeLabel={MODE_LABELS[mode]}
                routeLabel={focusedRouteLabel}
                outputLabel={`Output: ${outputLabel}`}
                acceptedLabel={uploadConfig.supportedFormats}
              />
              <PrivacyNotice />

              {!showDownloads ? (
                <>
                  {isProcessing ? <ProgressBar completed={batchCompleted} total={batchTotal} actionWord={actionWord} /> : null}
                  {showTargetControls && mode === 'documents' ? (
                    <DocumentTargetPanel target={documentTarget} onTargetChange={changeDocumentTarget} />
                  ) : null}
                  {showTargetControls && mode === 'spreadsheets' ? (
                    <SpreadsheetTargetPanel target={spreadsheetTarget} onTargetChange={changeSpreadsheetTarget} />
                  ) : null}
                  {showTargetControls && mode === 'text-data' ? (
                    <TextDataTargetPanel target={textDataTarget} onTargetChange={changeTextDataTarget} />
                  ) : null}
                  {showTargetControls && mode === 'notebooks' ? (
                    <NotebookTargetPanel target={notebookTarget} onTargetChange={changeNotebookTarget} />
                  ) : null}
                  {showTargetControls && mode === 'ebooks' ? (
                    <EbookTargetPanel target={ebookTarget} onTargetChange={changeEbookTarget} />
                  ) : null}
                  {showTargetControls && mode === 'presentations' ? (
                    <PresentationTargetPanel target={presentationTarget} onTargetChange={changePresentationTarget} />
                  ) : null}
                  {showTargetControls && mode === 'pdf-tools' ? <PdfTargetPanel target={pdfTarget} onTargetChange={changePdfTarget} /> : null}
                  {showTargetControls && mode === 'image' ? <ImageTargetPanel target={imageTarget} onTargetChange={changeImageTarget} /> : null}
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
                        presentationTarget={presentationTarget}
                        spreadsheetTarget={spreadsheetTarget}
                        textDataTarget={textDataTarget}
                        notebookTarget={notebookTarget}
                        ebookTarget={ebookTarget}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <DownloadCenter
                  items={downloadItems}
                  heroText={config.heroText}
                  mode={mode}
                  imageTarget={imageTarget}
                  pdfTarget={pdfTarget}
                  documentTarget={documentTarget}
                  presentationTarget={presentationTarget}
                  spreadsheetTarget={spreadsheetTarget}
                  textDataTarget={textDataTarget}
                  notebookTarget={notebookTarget}
                  ebookTarget={ebookTarget}
                  onDownloadAll={downloadAll}
                  onConvertMore={resetUi}
                  isZipping={isZipping}
                />
              )}
            </section>

            <AdSlot variant="banner" label="Advertisement" />
          </main>

          <aside className="ad-column" aria-label="Advertisement spaces">
            <AdSlot variant="rail" label="Advertisement" />
            <AdSlot variant="compact" label="Sponsored space" />
          </aside>
        </div>

        {!isProcessing ? <ToolDirectory /> : null}
      </div>
    </>
  );
}
