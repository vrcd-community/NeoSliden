import { createFileRoute } from '@tanstack/react-router'
import { PDFJSProvider, PdfToImageConverter } from "../components/pdf2js";

export const Route = createFileRoute('/pdf2img')({
  component: App,
})

function App() {
  return (
    <>
      <title>PDF to Image - VRCD</title>
      <PDFJSProvider>
        <PdfToImageConverter />
      </PDFJSProvider>
    </>
  );
}
