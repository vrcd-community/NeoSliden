import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type LogViewProps = {
  log: string[];
};

export const LogView = ({ log }: LogViewProps) => {
  return (
    <div className="w-full bg-black/60 rounded-lg shadow-lg overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="logs" className="border-0">
          <AccordionTrigger className="px-4 py-3 text-md font-semibold text-slate-200 hover:no-underline hover:bg-black/40">
            Log View
          </AccordionTrigger>
          <AccordionContent className="px-4 overflow-y-auto max-h-80">
            <div className="space-y-2">
              {log.map((message, index) => (
                <div key={index} className="text-sm font-mono p-2 bg-[#1E2227] rounded text-slate-300">
                  {message}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};