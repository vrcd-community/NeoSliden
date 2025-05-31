import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// 定义FFmpeg上下文类型
type FFmpegContextType = {
  ffmpeg: FFmpeg;
  isLoading: boolean;
  log: string[];
  latestLog: string;
  progress: number;
  addLog: (message: string) => void;
};

// 创建上下文
const FFmpegContext = createContext<FFmpegContextType | null>(null);

// 提供FFmpeg Provider组件
export const FFmpegProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const ffmpegRef = useRef(new FFmpeg());
  const ffmpegLoadedRef = useRef(false);
  const [log, setLog] = useState<string[]>([]);
  const [latestLog, setLatestLog] = useState<string>("");
  const [progress, setProgress] = useState(0);

  // 添加日志的辅助函数
  const addLog = (message: string) => {
    const logMessage = `[${new Date().toLocaleTimeString()}]${message}`;
    setLog((prev) => [...prev, logMessage]);
  };

  useEffect(() => {
    const load = async () => {
      if (ffmpegLoadedRef.current) {
        addLog("[FFmpeg] Already loaded.");
        setIsLoading(false);
        return;
      }
      ffmpegLoadedRef.current = true;

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
      const ffmpeg = ffmpegRef.current;

      addLog("[FFmpeg] Loading ffmpeg...");

      ffmpeg.on("log", ({ type, message }) => {
        const logMessage = `[${new Date().toLocaleTimeString()}][FFmpeg-${type}] ${message}`;
        setLog((prev) => [...prev, logMessage]);
        setLatestLog(message);
        console.log(logMessage);
      });

      ffmpeg.on("progress", ({ progress, time }) => {
        console.log(
          `progress: ${progress * 100} % (transcoded time: ${time / 1000000} s)`
        );
        progress && setProgress(progress * 100);
      });

      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        addLog("[FFmpeg] Loaded successfully.");
        console.log(`ffmpeg loaded`, ffmpeg);
      } catch (error) {
        addLog(`[FFmpeg] Load failed: ${error}`);
        console.error("FFmpeg load error:", error);
        ffmpegLoadedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <FFmpegContext.Provider
      value={{
        ffmpeg: ffmpegRef.current,
        isLoading,
        log,
        latestLog,
        progress,
        addLog,
      }}
    >
      {children}
    </FFmpegContext.Provider>
  );
};

// 自定义Hook，用于在组件中访问FFmpeg上下文
export const useFFmpeg = () => {
  const context = useContext(FFmpegContext);
  if (!context) {
    throw new Error("useFFmpeg must be used within a FFmpegProvider");
  }
  return context;
};