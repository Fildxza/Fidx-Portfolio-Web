"use client";

import { useEffect, useState } from "react";

export function TypingText({
  words,
  className,
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseMs = 1800,
}: {
  words: readonly string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex % words.length];

    if (!deleting && text === currentWord) {
      const timeout = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(timeout);
    }

    if (deleting && text === "") {
      const timeout = setTimeout(() => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }, 0);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(
      () => {
        setText((t) =>
          deleting ? currentWord.slice(0, t.length - 1) : currentWord.slice(0, t.length + 1)
        );
      },
      deleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className={className}>
      {text}
      <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-current align-middle h-[1em]" />
    </span>
  );
}
