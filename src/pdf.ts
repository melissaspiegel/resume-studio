import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
export async function extractPdfText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({data: bytes}).promise;
  const pages: string[] = [];
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const content = await (await doc.getPage(i)).getTextContent();
      let line = ''; const lines: string[] = []; let previousY: number | undefined;
      for (const item of content.items) {
        if (!('str' in item)) continue;
        const y = item.transform[5];
        if (previousY !== undefined && Math.abs(y - previousY) > 3) { lines.push(line.trim()); line = ''; }
        line += `${item.str} `; previousY = y;
      }
      if (line.trim()) lines.push(line.trim());
      pages.push(lines.join('\n'));
    }
    return pages.join('\n\n');
  } finally { await doc.destroy(); }
}
