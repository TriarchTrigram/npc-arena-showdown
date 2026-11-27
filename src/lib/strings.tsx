import type { JSX } from "react";
import stringsData from "@/strings.json";

export type StringKey = string;

const STRINGS: Record<string, unknown> = stringsData as Record<string, unknown>;

export function useStrings(): Record<string, unknown> {
  return STRINGS;
}

export function readString(obj: unknown, path: string): string | undefined {
  if (obj === null || typeof obj !== "object") return undefined;
  const record = obj as Record<string, unknown>;
  const dot = path.indexOf(".");
  if (dot !== -1) {
    const nested = readString(record[path.slice(0, dot)], path.slice(dot + 1));
    if (nested !== undefined) return nested;
  }
  const direct = record[path];
  return typeof direct === "string" ? direct : undefined;
}

function interpolate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? `{{${key}}}`));
}

type TextProps = {
  id: StringKey;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  vars?: Record<string, unknown>;
  [key: string]: unknown;
};

export function Text({ id, as: Tag = "span", vars, ...rest }: TextProps) {
  const template = readString(STRINGS, id) ?? "";
  const value = vars ? interpolate(template, vars) : template;
  const Component = Tag as React.ElementType;
  return <Component {...rest}>{value}</Component>;
}

export function useString(id: StringKey, vars?: Record<string, unknown>): string {
  const template = readString(STRINGS, id) ?? "";
  return vars ? interpolate(template, vars) : template;
}