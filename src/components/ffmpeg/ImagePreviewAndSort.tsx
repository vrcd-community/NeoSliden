import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { XIcon } from 'lucide-react';

interface ImageFile extends File {
  preview: string;
}

interface ImagePreviewAndSortProps {
  selectedImages: ImageFile[];
  setSelectedImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
}

export const ImagePreviewAndSort: React.FC<ImagePreviewAndSortProps> = ({
  selectedImages,
  setSelectedImages,
}) => {
  // FIXME: isDraggingOver 这个变量删除后，拖拽时就不显示蓝色边框了..?

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragImageRef = useRef<HTMLDivElement | null>(null);

  const handleRemoveImage = useCallback((index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  }, [setSelectedImages]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    setDragging(true);
    
    // 创建自定义拖动图像
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    
    // 创建拖动图像容器
    const dragImage = document.createElement('div');
    dragImage.style.position = 'fixed';
    dragImage.style.top = '-9999px';
    dragImage.style.left = '-9999px';
    dragImage.style.width = `${rect.width}px`;
    dragImage.style.height = `${rect.height}px`;
    dragImage.style.zIndex = '10000';
    dragImage.style.pointerEvents = 'none';
    
    // 克隆整个元素内容
    const contentClone = target.cloneNode(true) as HTMLDivElement;
    contentClone.style.opacity = '1';
    contentClone.style.transform = 'scale(1)';
    contentClone.style.width = '100%';
    contentClone.style.height = '100%';
    
    dragImage.appendChild(contentClone);
    document.body.appendChild(dragImage);
    dragImageRef.current = dragImage;
    
    // 设置自定义拖动图像
    e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragging(false);
    setIsDraggingOver(false);
    
    // 清理自定义拖动图像
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      setSelectedImages(prev => {
        const newImages = [...prev];
        const draggedItem = newImages[dragItem.current!];
        
        // 移除原位置的元素
        newImages.splice(dragItem.current!, 1);
        // 插入到新位置
        newImages.splice(dragOverItem.current!, 0, draggedItem);
        
        return newImages;
      });
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
  }, [setSelectedImages]);

  if (selectedImages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-slate-300">图片预览和排序</Label>
      <div
        className={`flex flex-wrap gap-2 p-2 rounded-md min-h-[100px]`}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDraggingOver(false)}
      >
        {selectedImages.map((image, index) => (
          <div
            key={image.name + index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`relative w-24 h-24 rounded-md overflow-hidden group cursor-grab transition-all duration-200 ease-in-out ${
              dragging && dragOverItem.current === index && dragItem.current !== index
                ? 'ring-2 ring-blue-500'
                : ''
            }`}
          >
            <img
              src={image.preview}
              alt={image.name}
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
            <span className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs truncate p-1">
              {image.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};