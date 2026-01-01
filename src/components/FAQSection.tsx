"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQContent {
    headline: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
}

interface FAQSectionProps {
    content: FAQContent;
}

export function FAQSection({ content }: FAQSectionProps) {
    const items = [
        {
            id: "01",
            title: content.q1,
            content: content.a1,
        },
        {
            id: "02",
            title: content.q2,
            content: content.a2,
        },
        {
            id: "03",
            title: content.q3,
            content: content.a3,
        },
    ];

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
