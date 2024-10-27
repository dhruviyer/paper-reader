import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Loading() {
  return (
    <Accordion type="multiple" className="w-full">
      {Array.from({ length: 5 }).map((_, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-lg font-bold">
            <Skeleton className="h-[24px] w-[100px]" />
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Skeleton className="h-[18px] w-full" />
              <Skeleton className="h-[18px] w-3/4" />
              <Skeleton className="h-[18px] w-2/3" />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
