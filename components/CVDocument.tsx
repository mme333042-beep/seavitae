"use client";

import { useCallback, useRef } from "react";
import { generatePrintableCV, type CVData } from "@/lib/pdfGenerator";

interface CVDocumentProps {
  cv: CVData;
}

/**
 * Renders the exact same printable HTML used for the PDF download inside an
 * iframe, so the on-screen preview can never drift from the downloaded file.
 *
 * The iframe is auto-sized to its content height (srcDoc is same-origin, so
 * the content document is readable) to avoid an inner scrollbar.
 */
export default function CVDocument({ cv }: CVDocumentProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = generatePrintableCV(cv);

  const handleLoad = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    try {
      const doc = frame.contentDocument;
      if (doc?.body) {
        frame.style.height = `${doc.body.scrollHeight}px`;
      }
    } catch {
      // Same-origin srcDoc should always be readable; ignore if blocked.
    }
  }, []);

  return (
    <div className="cv-document">
      <iframe
        ref={frameRef}
        title={`${cv.fullName} CV preview`}
        srcDoc={srcDoc}
        onLoad={handleLoad}
        className="cv-document-frame"
      />
    </div>
  );
}
