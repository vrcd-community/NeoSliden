import { useState } from 'react';
import { fetchFile } from "@ffmpeg/util";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageIcon, PlayIcon, UploadIcon } from 'lucide-react';
import { useFFmpeg } from './FFmpegProvider';
import { LogView } from './LogView';

export const ImageToVideoConverter = () => {
  const { ffmpeg, isLoading, log, latestLog, progress, addLog } = useFFmpeg();
  
  // 图片转视频状态
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [outputVideo, setOutputVideo] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        imageFiles.push(files[i]);
      }
    }

    setSelectedImages(imageFiles);

    // 预览第一张图片
    if (imageFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(imageFiles[0]);
    }

    addLog(`[App] 已选择 ${imageFiles.length} 张图片`);
  };

  const handleTranscode = async () => {
    if (selectedImages.length === 0) {
      addLog(`[Error] 请先选择图片`);
      return;
    }

    setIsTranscoding(true);
    addLog(`[App] 开始转码 ${selectedImages.length} 张图片为视频`);

    try {
      // 写入所有图片
      for (let i = 0; i < selectedImages.length; i++) {
        const imageName = `image_${i.toString().padStart(5, '0')}.png`;
        await ffmpeg.writeFile(imageName, await fetchFile(selectedImages[i]));
        addLog(`[App] 处理图片 ${i + 1}/${selectedImages.length}`);
      }

      await ffmpeg.exec([
        '-loglevel', 'info',
        '-y',
        '-framerate', '1',
        '-i', 'image_%05d.png',
        '-c:v', 'libx264',
        '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
        '-pix_fmt', 'yuv420p',
        'output.mp4',
      ]);

      // 读取输出视频
      const data = await ffmpeg.readFile('output.mp4');

      // 创建视频URL
      const videoBlob = new Blob([data], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setOutputVideo(videoUrl);

      addLog(`[App] 转码完成`);
    } catch (error) {
      console.error(error);
      addLog(`[Error] 转码失败: ${error}`);
    } finally {
      setIsTranscoding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-slate-200">FFmpeg 加载中...</span>
          </div>
        </div>
        <LogView log={log} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="bg-black/60 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">Neo Sliden</CardTitle>
          <CardDescription className="text-slate-400">Powered By FFmpeg WASM</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 图片上传区域 */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-slate-300">选择图片</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="text-slate-300"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-1 top-1 h-7 gap-1 text-xs"
                    onClick={() => document.getElementById('images')?.click()}
                  >
                    <UploadIcon className="h-3 w-3" /> 浏览
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  已选择 {selectedImages.length} 张图片
                </p>
              </div>

              {/* 图片预览 */}
              <div className="flex items-center justify-center bg-black/30 rounded-md h-[150px] overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <span className="text-xs">图片预览</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 输出视频 */}
          {outputVideo && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <Label className="text-slate-300">输出视频</Label>
              <div className="bg-black/30 rounded-md overflow-hidden">
                <video
                  src={outputVideo}
                  controls
                  className="w-full max-h-[300px]"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = outputVideo;
                    a.download = 'output.mp4';
                    a.click();
                  }}
                >
                  下载视频
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleTranscode}
            disabled={selectedImages.length === 0 || isTranscoding}
            className="w-full"
          >
            {isTranscoding ? (
              <>
                <span className="animate-pulse">{latestLog || `Loading... (${progress}%)`}</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" /> 开始转码
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <LogView log={log} />
    </div>
  );
};