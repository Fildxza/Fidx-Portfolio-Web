"use client";

import { TypingText } from "@/components/shared/typing-text";
import { TYPING_ROLES } from "@/lib/constants";

export function HeroTyping() {
  return <TypingText words={TYPING_ROLES} />;
}
