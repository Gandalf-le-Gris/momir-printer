import { Card, getPng } from "@/types/Card";

export interface CanvasContent {
  card: Card;
  width?: number;
  fontSize?: number;
  lineGap?: number;
  padding?: number;
}

interface TextLineConfig {
  text: string;
  width: number;
  padding: number;
  ctx: CanvasRenderingContext2D;
}

function calculateWrappedLines({ text, width, padding, ctx }: TextLineConfig): string[] {
  const maxLineWidth = width - (padding * 2);
  const rawLines = text.split('\n');
  const finalLines: string[] = [];

  for (const rawLine of rawLines) {
    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (ctx.measureText(testLine).width > maxLineWidth) {
        if (currentLine) finalLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) finalLines.push(currentLine);
  }

  return finalLines;
}

function computeCardText(card: Card): string {
  return (card.card_faces ?? [card])
      .map(c => `${c.printed_name ?? c.name}\n${c.mana_cost}\n${c.printed_type_line ?? c.type_line}\n${c.printed_text ?? c.oracle_text}${c.toughness ? `\n${c.power}/${c.toughness}` : ''}`)
      .join('\n');
}

export async function createCardCanvas({
  card,
  width = 384,
  fontSize = 20,
  lineGap = 6,
  padding = 12
}: CanvasContent): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const aspectRatio = img.height / img.width;
      const drawWidth = width;
      const drawHeight = Math.round(width * aspectRatio);
      
      const font = `${fontSize}px sans-serif`;

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.font = font;

      const lines = calculateWrappedLines({
        text: computeCardText(card),
        width: drawWidth,
        padding,
        ctx: tempCtx
      });
      const totalTextHeight = (lines.length * fontSize) + ((lines.length - 1) * lineGap);
      const totalHeight = drawHeight + totalTextHeight + (padding * 2);

      const canvas = document.createElement('canvas');
      canvas.width = drawWidth;
      canvas.height = totalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get 2D context'));

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

      ctx.fillStyle = '#000000';
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      let currentY = drawHeight + padding;
      for (const line of lines) {
        ctx.fillText(line, drawWidth / 2, currentY);
        currentY += fontSize + lineGap;
      }

      resolve(canvas);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = getPng(card);
  });
}
