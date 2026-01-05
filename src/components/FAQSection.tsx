"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQContent {
    headline: string;
    items?: FAQItem[];
    // Legacy support for q1, a1, etc.
    q1?: string;
    a1?: string;
    q2?: string;
    a2?: string;
    q3?: string;
    a3?: string;
}

interface FAQSectionProps {
    content: FAQContent;
}

export function FAQSection({ content }: FAQSectionProps) {
    // Generate items from new array structure or legacy q1/a1 props
    const rawItems = content.items || [
        { question: content.q1 || "", answer: content.a1 || "" },
        { question: content.q2 || "", answer: content.a2 || "" },
        { question: content.q3 || "", answer: content.a3 || "" },
    ].filter(item => item.question !== "");

    const items = rawItems.map((item, index) => ({
        id: (index + 1).toString().padStart(2, '0'),
        title: item.question,
        content: item.answer,
    }));

    return (
        <section className="py-24 bg-muted/20 border-t border-border">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl mb-4">
                        {content.headline}
                    </h2>
                </div>
                <div className="w-full max-w-xl mx-auto">
                    <Accordion
                        type="single"
                        defaultValue="01"
                        collapsible
                        className="w-full"
                    >
                        {items.map((item) => (
                            <AccordionItem value={item.id} key={item.id}>
                                <AccordionTrigger className="text-left hover:pl-3 hover:[&_div.bg-primary]:bg-secondary duration-1000 hover:no-underline cursor-pointer [data-slot=accordion-trigger] [&>svg]:hidden hover:[&_svg]:rotate-90 hover:[&_svg]:text-primary">
                                    <div className="flex flex-1 items-start justify-between gap-4">
                                        <div className="flex gap-3 items-center">
                                            <h1 className="text-muted-foreground/50 font-mono">
                                                {item.id}
                                            </h1>
                                            <h3 className="text-lg md:text-xl font-semibold">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <div className="bg-primary/10 duration-500 rounded-sm flex items-center p-2">
                                            <Plus
                                                className={cn(
                                                    "text-primary size-4 shrink-0 transition-transform duration-1000",
                                                    "[data-state=open]:rotate-90",
                                                )}
                                            />
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground pb-6 pr-20">
                                    {item.content}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
