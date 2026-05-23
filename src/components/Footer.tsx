export function Footer() {
  return (
    <footer className="footer-note" role="contentinfo">
      <span className="pin pin--blue" aria-hidden="true" />
      <div className="footer-note-content">
        <span className="footer-note-title">Wahala Sorter v0.1</span>
        <span className="footer-note-meta">
          Pinned for the builders of Lagos &bull; Sort the pile, close the case
        </span>
      </div>
      <span className="pin pin--yellow" aria-hidden="true" style={{ width: 10, height: 10 }} />
    </footer>
  );
}
