export interface ScheduleEvent {
  time: string;
  name: string;
  /** Who is on stage, first names only — the same rule the roster follows. */
  speakers?: string;
}

/**
 * The run of show, a day at a time. The home page's schedule section and the
 * hacker handbook both list it from here, so a time changed once is changed in
 * both.
 */
export const SCHEDULE_DAYS: { id: string; label: string; events: ScheduleEvent[] }[] = [
  {
    id: "day-1",
    label: "Day 1 (Oct 10th)",
    events: [
      { time: "8:00 am", name: "Registration opens" },
      { time: "9:00 am", name: "Opening ceremony" },
      { time: "9:15 am", name: "Competition start" },
      { time: "12:30 pm", name: "Lunch" },
      { time: "1:30 pm", name: "Keynote 1", speakers: "Zhen & Mike" },
      { time: "3:30 pm", name: "Keynote 2", speakers: "Owen" },
      { time: "6:00 pm", name: "Dinner" },
      { time: "8:00 pm", name: "End of day" },
    ],
  },
  {
    id: "day-2",
    label: "Day 2 (Oct 11th)",
    events: [
      { time: "9:00 am", name: "Competition start" },
      { time: "11:00 am", name: "LeetCode challenge" },
      { time: "12:00 pm", name: "Lunch" },
      { time: "3:30 pm", name: "Submission deadline" },
      { time: "3:45 pm", name: "Judging" },
      { time: "5:15 pm", name: "Closing ceremony & awards" },
    ],
  },
];
