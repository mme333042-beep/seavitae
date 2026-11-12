"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generatePrintableCV, type CVData } from "@/lib/pdfGenerator";

/** Natural layout width of the printable document, in CSS pixels. */
const DOCUMENT_WIDTH = 820;

interface CVDocumentProps {
  cv: CVData;
  /**
   * When true the preview is display-only: links inside the document are not
   * clickable. Use for sample previews on marketing pages.
   */
  isStatic?: boolean;
}

/**
 * Renders the exact same printable HTML used for the PDF download inside an
 * iframe, so the on-screen preview can never drift from the downloaded file.
 *
 * The document is always laid out at its natural width and scaled down to fit
 * narrower containers (phones), so the two-column layout stays intact and
 * readable instead of collapsing. The iframe is sized to its content height
 * (srcDoc is same-origin) to avoid an inner scrollbar.
 */
export default function CVDocument({ cv, isStatic = false }: CVDocumentProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const srcDoc = generatePrintableCV(cv);

  const measure = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    try {
      const doc = frame.contentDocument;
      if (doc?.documentElement) {
        setContentHeight(doc.documentElement.scrollHeight);
      }
    } catch {
      // Same-origin srcDoc should always be readable; ignore if blocked.
    }
  }, []);

  // Re-measure once web fonts in the document have loaded (they change height).
  const handleLoad = useCallback(() => {
    measure();
    try {
      const doc = frameRef.current?.contentDocument;
      doc?.fonts?.ready.then(measure).catch(() => undefined);
    } catch {
      // ignore
    }
  }, [measure]);

  // Scale the fixed-width document to the wrapper's available width.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const update = () => {
      const available = wrapper.clientWidth;
      setScale(available > 0 ? Math.min(1, available / DOCUMENT_WIDTH) : 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`cv-document${isStatic ? " is-static" : ""}`}
      style={contentHeight ? { height: `${contentHeight * scale}px` } : undefined}
    >
      <iframe
        ref={frameRef}
        title={`${cv.fullName} CV preview`}
        srcDoc={srcDoc}
        onLoad={handleLoad}
        className="cv-document-frame"
        tabIndex={isStatic ? -1 : undefined}
        aria-hidden={isStatic || undefined}
        style={{
          height: contentHeight ? `${contentHeight}px` : undefined,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}
