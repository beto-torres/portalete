"use client";

import { createContext,useContext,type Dispatch,type ReactNode,type SetStateAction } from "react";
import type { Countdown,ScheduleItem,SchoolEvent,Suggestion,User,View } from "@/types";

interface PortalContextValue {
  user: User;
  events: SchoolEvent[];
  setEvents: Dispatch<SetStateAction<SchoolEvent[]>>;
  countdowns: Countdown[];
  setCountdowns: Dispatch<SetStateAction<Countdown[]>>;
  suggestions: Suggestion[];
  setSuggestions: Dispatch<SetStateAction<Suggestion[]>>;
  schedule: ScheduleItem[];
  setSchedule: Dispatch<SetStateAction<ScheduleItem[]>>;
  navigate: (view: View) => void;
  updateUser: (user: User) => void;
}

const PortalContext=createContext<PortalContextValue|null>(null);

export function PortalProvider({value,children}:{value:PortalContextValue;children:ReactNode}) {
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context=useContext(PortalContext);
  if(!context) throw new Error("usePortal deve ser usado dentro de PortalProvider.");
  return context;
}
