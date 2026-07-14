"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const DAYS = [
  {
    id: "day-one",
    label: "day one · oct 11",
    events: [
      { time: "9:00 am", name: "doors open · check-in & breakfast" },
      { time: "10:00 am", name: "opening ceremony" },
      { time: "10:30 am", name: "team formation" },
      { time: "11:00 am", name: "hacking begins" },
      { time: "12:30 pm", name: "lunch" },
      { time: "3:00 pm", name: "workshop · build your first api" },
      { time: "6:30 pm", name: "dinner" },
      { time: "9:00 pm", name: "late-night snack & games" },
    ],
  },
  {
    id: "day-two",
    label: "day two · oct 12",
    events: [
      { time: "8:00 am", name: "breakfast" },
      { time: "11:00 am", name: "hacking ends · submissions due" },
      { time: "11:30 am", name: "lunch" },
      { time: "12:30 pm", name: "project expo & judging" },
      { time: "2:30 pm", name: "awards & closing ceremony" },
    ],
  },
];

export default function Schedule() {
  return (
    <section id="schedule" className="scroll-mt-24 px-6 py-24 md:py-32">
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
