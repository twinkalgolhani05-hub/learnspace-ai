import path from 'node:path';
import { parseOffice } from 'officeparser';
import { PDFParse } from 'pdf-parse';

export const ALLOWED_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png', '.webp'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
export const MAX_EXTRACTED_CHARS = 25000;

export const isImageMime = (mime) => {
  return mime && (mime.startsWith('image/') || mime.includes('jpeg') || mime.includes('png'));
};

/**
 * Extracts readable academic text from an uploaded file buffer.
 */
export const extractDocumentContent = async ({ buffer, originalName, mimeType }) => {
  const ext = path.extname(originalName || '').toLowerCase();
  let text = '';
  let pageCount = 1;
  let isImage = isImageMime(mimeType) || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  let imageData = null;

  try {
    if (isImage) {
      const base64 = buffer.toString('base64');
      const normalizedMime = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
      imageData = {
        mimeType: normalizedMime,
        data: base64,
      };
      text = `[Attached Image: ${originalName} (${Math.round(buffer.length / 1024)} KB). The image is visually processed by Google Gemini.]`;
      return {
        text,
        pageCount: 1,
        isImage: true,
        imageData,
      };
    }

    if (ext === '.txt' || mimeType === 'text/plain') {
      text = buffer.toString('utf-8');
      pageCount = Math.max(1, Math.ceil(text.length / 2500));
    } else if (ext === '.pdf' || mimeType === 'application/pdf') {
      try {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        text = (result?.text || '').trim();
        pageCount = result?.total || Math.max(1, Math.ceil(text.length / 2500));
      } catch (pdfErr) {
        console.warn('[PDFParse warning, attempting fallback]:', pdfErr.message);
        // Fallback: extract plain ascii text blocks from pdf stream
        const raw = buffer.toString('binary');
        const textMatches = raw.match(/\(([^()]{3,})\)T[jJ]/g) || [];
        text = textMatches.map((m) => m.slice(1, -2)).join(' ');
        if (!text || text.length < 50) {
          throw new Error('Unable to extract clear text from this PDF. Please ensure it contains selectable text or upload as an image.');
        }
      }
    } else if (['.ppt', '.pptx'].includes(ext) || mimeType.includes('presentation')) {
      try {
        const parsed = await parseOffice(buffer);
        text = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
        // Estimate slide count from slide headers or line blocks
        const slideMatches = text.match(/(slide\s*\d+|---)/gi);
        pageCount = slideMatches ? Math.max(1, slideMatches.length) : Math.max(1, Math.ceil(text.length / 1500));
      } catch (officeErr) {
        throw new Error(`Failed to parse presentation: ${officeErr.message}`);
      }
    } else {
      // Default try text decoding
      text = buffer.toString('utf-8');
    }

    // Clean up excessive whitespace
    text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    if (text.length > MAX_EXTRACTED_CHARS) {
      text =
        text.slice(0, MAX_EXTRACTED_CHARS) +
        `\n\n[Note: Document truncated to ${MAX_EXTRACTED_CHARS.toLocaleString()} characters for optimal reasoning.]`;
    }

    return {
      text: text || `[Empty document extracted from ${originalName}]`,
      pageCount: pageCount || 1,
      isImage: false,
      imageData: null,
    };
  } catch (error) {
    console.error(`[DocumentService Error for ${originalName}]:`, error);
    throw new Error(error.message || 'Error processing document content');
  }
};

