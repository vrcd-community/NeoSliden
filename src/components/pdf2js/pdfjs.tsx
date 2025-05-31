import { createContext, useContext, useEffect, useRef, useState } from "react";

interface PDFJSContextType {
  pdfjs: any;
  isLoading: boolean;
  log: string[];
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const PDFJSContext = createContext<PDFJSContextType | null>(null);

export const PDFJSProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const pdfjsRef = useRef<any>(null);

  useEffect(() => {
    if (window.pdfjsLib) {
      pdfjsRef.current = window.pdfjsLib;
      setIsLoading(false);
    
      return
    }

    setIsLoading(true);

    setLog(prev => [...prev, "Loading PDF.js..."]);

    const script = document.createElement("script");
    
    script.onload = () => {
      pdfjsRef.current = window.pdfjsLib;
      setIsLoading(false);
      setLog(prev => [...prev, "PDF.js loaded"]);
    }
    
    script.onerror = () => {
      setIsLoading(false);
      setLog(prev => [...prev, "Failed to load PDF.js"]);
    }

    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, [])

  return (
    <PDFJSContext.Provider
      value={{
        pdfjs: pdfjsRef.current,
        isLoading,
        log,
      }}
    >
      {children}
    </PDFJSContext.Provider>
  )
}

export const usePDFJS = () => {
  const context = useContext(PDFJSContext);

  if (!context) {
    throw new Error("usePDFJS must be used within a PDFJSProvider");
  }

  return context;
}