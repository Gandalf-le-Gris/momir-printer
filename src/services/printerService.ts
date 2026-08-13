import { Ref, ref } from "vue"

const PRINTER_SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb';
const WRITE_CHARACTERISTIC_UUID = '0000ff02-0000-1000-8000-00805f9b34fb';

class PrinterService {
  public status: Ref<'connected' | 'connecting' | 'not_connected'> = ref('not_connected');
  private device: any | null = null;
  private characteristic: any | null = null;

  connect = async (): Promise<void> => {
    try {
      this.status.value = 'connecting';
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'MiniX' }, { namePrefix: 'Seznik' }],
        optionalServices: [PRINTER_SERVICE_UUID]
      });

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService(PRINTER_SERVICE_UUID);
      this.characteristic = await service?.getCharacteristic(WRITE_CHARACTERISTIC_UUID) || null;
      this.device.addEventListener('gattserverdisconnected', () => {
        this.status.value = 'not_connected';
      });
      this.status.value = 'connected';
    } catch (error) {
      console.error('Failed to connect:', error);
      this.status.value = 'not_connected';
    }
  }

  private canvasToRasterPayload(canvas: HTMLCanvasElement): Uint8Array {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const bytesPerLine = Math.ceil(width / 8);
    const commands: number[] = [];

    commands.push(0x1b, 0x40);

    const xL = bytesPerLine & 0xff;
    const xH = (bytesPerLine >> 8) & 0xff;
    const yL = height & 0xff;
    const yH = (height >> 8) & 0xff;

    commands.push(0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH);

    for (let y = 0; y < height; y++) {
      for (let byteIdx = 0; byteIdx < bytesPerLine; byteIdx++) {
        let byteVal = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = byteIdx * 8 + bit;
          if (x < width) {
            const offset = (y * width + x) * 4;
            const brightness = 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
            if (brightness < 128 && data[offset + 3] > 128) {
              byteVal |= (1 << (7 - bit));
            }
          }
        }
        commands.push(byteVal);
      }
    }

    commands.push(0x1b, 0x64, 0x03);

    return new Uint8Array(commands);
  }

  async printCanvas(canvas: HTMLCanvasElement): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Printer not connected.');
    }

    const bitmap = this.canvasToRasterPayload(canvas);

    const CHUNK_SIZE = 30;
    for (let i = 0; i < bitmap.length; i += CHUNK_SIZE) {
      const chunk = bitmap.slice(i, i + CHUNK_SIZE);
      await this.characteristic.writeValueWithoutResponse(chunk);
    }
  }
}

export default new PrinterService();
