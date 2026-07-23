import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 320,
    color: { dark: "#071A2C", light: "#F5EFE6" },
  });
}

export async function generateQrBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    margin: 1,
    width: 320,
    color: { dark: "#071A2C", light: "#F5EFE6" },
  });
}
