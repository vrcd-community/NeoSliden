import React, { useState, useCallback } from 'react';
import { usePDFJS } from './pdfjs';
import { LogView } from '../ffmpeg';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadIcon, PlayIcon } from 'lucide-react';
import { useImageContext } from '@/lib/ImageContext';
import { useNavigate } from '@tanstack/react-router';
import { type ImageItem } from '@/lib/ImageContext';

export const PdfToImageConverter: React.FC = () => {
  const { pdfjs, isLoading, log } = usePDFJS();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { setImages: setGlobalImages } = useImageContext();
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPdfFile(event.target.files[0]);
      setImages([]); // Clear previous images
    }
  };

  const convertPdfToImages = useCallback(async () => {
    if (!pdfjs || !pdfFile) return;

    setIsConverting(true);
    setImages([]);
    setProgress(0);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;
      const newImages: ImageItem[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get canvas context");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const imageDataUrl = canvas.toDataURL('image/png');
        const objectURL = URL.createObjectURL(new Blob([await fetch(imageDataUrl).then(res => res.blob())], { type: 'image/png' }));

        newImages.push({
          src: objectURL,
          name: `page-${i}.png`,
        });
        setProgress(Math.round((i / numPages) * 100));
      }
      setImages(newImages);
    } catch (error) {
      console.error("Error converting PDF:", error);
    } finally {
      setIsConverting(false);
    }
  }, [pdfjs, pdfFile]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="bg-black/60 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">PDF转图片</CardTitle>
          <CardDescription className="text-slate-400">Powered By PDF.js</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && <p className="text-slate-300">Loading PDF.js library...</p>}
          {!isLoading && !pdfjs && <p className="text-red-400">Failed to load PDF.js library.</p>}

          {!isLoading && pdfjs && (
            <div className="space-y-2">
              <Label htmlFor="pdf-upload" className="text-slate-300">选择 PDF 文件</Label>
              <div className="relative">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="text-slate-300 pr-24"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-1 top-1 h-7 gap-1 text-xs"
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                >
                  <UploadIcon className="h-3 w-3" /> 浏览
                </Button>
              </div>
              {pdfFile && <p className="text-sm text-slate-400">已选择文件: {pdfFile.name}</p>}
            </div>
          )}

          {isConverting && progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {images.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <Label className="text-slate-300">生成的图片:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.name} className="border border-white/20 rounded-lg overflow-hidden shadow-md">
                    <img src={image.src} alt={image.name} className="w-full h-auto object-cover" />
                    <p className="p-2 text-sm text-center truncate text-slate-300">{image.name}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={async () => {
                    setGlobalImages(images);
                    navigate({ to: '/' });
                  }}
                  disabled={images.length === 0}
                >
                  跳转到图片转视频
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={convertPdfToImages}
            disabled={!pdfFile || isConverting}
            className="w-full"
          >
            {isConverting ? (
              <>
                <span className="animate-pulse">转换中... ({progress}%)</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" /> 开始转换
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <LogView log={log} />
    </div>
  );
};
