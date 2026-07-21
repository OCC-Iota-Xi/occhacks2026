"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const DAYS = [
  {
    id: "day-one",
    label: "day one · oct 11",
    events: [
      { time: "8:00 am", name: "registration opens" },
      { time: "9:00 am", name: "opening ceremony" },
      { time: "9:15 am", name: "competition start" },
      { time: "12:30 pm", name: "lunch" },
      { time: "2:00 pm", name: "keynote speaker #1" },
      { time: "4:30 pm", name: "keynote speaker #2" },
      { time: "6:00 pm", name: "dinner" },
      { time: "8:00 pm", name: "end of day" },
    ],
  },
  {
    id: "day-two",
    label: "day two · oct 12",
    events: [
      { time: "9:00 am", name: "competition start" },
      { time: "9:00 am", name: "breakfast" },
      { time: "11:00 am", name: "leetcode challenge" },
      { time: "12:00 pm", name: "lunch" },
      { time: "3:30 pm", name: "submission deadline" },
      { time: "3:45 pm", name: "judging" },
      { time: "5:15 pm", name: "closing ceremony & awards" },
    ],
  },
];

export default function Schedule() {
  return (
    <section id="schedule" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Schedule" accent="" className="mb-12" />

      <Reveal>
        <Tabs defaultValue="day-one" className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <TabsList>
              {DAYS.map((day) => (
                <TabsTrigger key={day.id} value={day.id}>
                  {day.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {DAYS.map((day) => (
            <TabsContent key={day.id} value={day.id}>
              <div className="border-b border-border">
                {day.events.map((event) => (
                  <div key={`${day.id}-${event.time}-${event.name}`} className="border-t border-border py-5 text-center transition-colors hover:bg-accent group">
                    <p className="text-xs tabular-nums text-muted-foreground group-hover:text-accent-foreground">
                      {event.time}
                    </p>
                    <p className="mt-1 text-base group-hover:text-accent-foreground sm:text-lg">{event.name}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-xs text-muted-foreground/70">
                schedule is provisional — final times land closer to the event.
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </Reveal>
    </section>
  );
}
