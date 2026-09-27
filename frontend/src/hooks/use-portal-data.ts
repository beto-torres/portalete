"use client";

import { useEffect, useState } from "react";
import { initialCountdowns, initialEvents, initialSchedule } from "@/lib/data";
import { api } from "@/lib/api";
import type { Countdown, ScheduleItem, SchoolEvent, Suggestion, User } from "@/types";
import { useStoredState } from "./use-stored-state";

export function usePortalData(user: User | null, sessionReady: boolean) {
  const [events, setEvents] = useStoredState<SchoolEvent[]>("ete-events", initialEvents);
  const [countdowns, setCountdowns] = useStoredState<Countdown[]>("ete-countdowns", initialCountdowns);
  const [suggestions, setSuggestions] = useStoredState<Suggestion[]>("ete-suggestions", []);
  const [schedule, setSchedule] = useStoredState<ScheduleItem[]>("ete-schedule", initialSchedule);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (!sessionReady || !user) return;
    let active = true;

    Promise.all([
      api.events(),
      api.schedules(),
      api.countdowns(),
      user.role === "admin" ? api.suggestions() : Promise.resolve([]),
    ]).then(([nextEvents, nextSchedule, nextCountdowns, nextSuggestions]) => {
      if (!active) return;
      setEvents(nextEvents);
      setSchedule(nextSchedule);
      setCountdowns(nextCountdowns);
      if (user.role === "admin") setSuggestions(nextSuggestions);
      setWarning("");
    }).catch(() => {
      if (active) setWarning("API indisponível: exibindo os dados salvos neste navegador.");
    });

    return () => { active = false; };
  }, [sessionReady, user?.email]);

  return { events, setEvents, countdowns, setCountdowns, suggestions, setSuggestions, schedule, setSchedule, warning };
}
