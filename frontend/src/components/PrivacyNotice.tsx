export function PrivacyNotice() {
  return (
    <aside className="privacy-notice" aria-label="File privacy notice">
      <div className="privacy-icon">
        <i className="bx bx-shield-quarter" />
      </div>
      <div>
        <strong>No database. No saved documents.</strong>
        <p>
          AllForPDF is a direct conversion platform. Your files are used only for the active conversion request, returned to you
          as the output, and removed from temporary processing storage after the response is delivered. Uploaded file contents are
          not stored in a database, reused, profiled, or used for analytics.
        </p>
      </div>
    </aside>
  );
}
