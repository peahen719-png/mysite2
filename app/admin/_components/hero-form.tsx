"use client";

import { useActionState } from "react";

import { saveHeroTexts, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { HeroTextKey, HeroTexts } from "@/lib/types";

const inputClass =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";
const textareaClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50";

const fields: { key: HeroTextKey; label: string; multiline?: boolean; hint?: string }[] = [
  { key: "eyebrow", label: "작은 머리글" },
  { key: "title", label: "제목", multiline: true, hint: "Enter 로 줄을 바꾸면 화면에서도 줄이 바뀝니다." },
  { key: "description", label: "설명", multiline: true },
  { key: "primaryCtaLabel", label: "첫 번째 버튼 글자" },
  { key: "secondaryCtaLabel", label: "두 번째 버튼 글자" },
];

/** 첫 화면(히어로) 글자 입력 칸. 칸을 비우고 저장하면 site.config.ts 의 기본 글자로 돌아갑니다. */
export function HeroForm({ texts }: { texts: HeroTexts }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveHeroTexts, {});

  return (
    <form action={action} className="grid gap-4">
      {fields.map((field) => (
        <label key={field.key} className="grid gap-1.5 text-sm">
          <span className="font-medium">{field.label}</span>
          {field.multiline ? (
            <textarea
              name={field.key}
              rows={field.key === "title" ? 2 : 3}
              defaultValue={texts[field.key]}
              className={textareaClass}
            />
          ) : (
            <input name={field.key} defaultValue={texts[field.key]} className={inputClass} />
          )}
          {field.hint ? <span className="text-xs text-muted-foreground">{field.hint}</span> : null}
        </label>
      ))}

      <p className="text-xs text-muted-foreground">
        칸을 비우고 저장하면 처음 글자(site.config.ts)로 돌아갑니다.
      </p>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </Button>
        {state.message ? (
          <p className={state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
