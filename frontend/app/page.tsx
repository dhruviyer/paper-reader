"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronsDownUp, ChevronsUpDown } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import Loading from "@/components/loading";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [accordion, setAccordion] = useState<Array<string> | null>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/papers", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (response.ok) {
      const body = (await response.json())["body"];
      console.log(body);
      setSummary(body);
      setAccordion(Object.keys(body));
    } else {
      alert("Failed to upload file");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-extrabold mb-10">Paper Reader</h1>
      <div className="grid grid-cols-2">
        <div className="w-fit">
          <form>
            <Input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setFile(file);
                }
              }}
            ></Input>
          </form>
          <Button
            className="w-fit mt-5 font-medium"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Summarizing..." : "Submit Paper"}
          </Button>
        </div>
        <div>
          {loading && <Loading />}
          {!loading && summary && (
            <div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAccordion(Object.keys(summary));
                  }}
                  className="flex items-center space-x-1"
                >
                  <ChevronsUpDown className="h-4 w-4" />
                  <span>Expand all</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAccordion([]);
                  }}
                  className="flex items-center space-x-1"
                >
                  <ChevronsDownUp className="h-4 w-4" />
                  <span>Collapse all</span>
                </Button>
              </div>
              <Accordion
                type="multiple"
                className="w-full"
                value={accordion ? accordion : []}
                onValueChange={(value) => setAccordion(value)}
              >
                {Object.entries(summary).map(([key, value]) => (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger className="text-xl font-bold">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </AccordionTrigger>
                    <AccordionContent className="text-lg">
                      {value}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
