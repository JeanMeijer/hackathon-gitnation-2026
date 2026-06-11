import type { CSSProperties } from "react";
import { Avatar } from "@progress/kendo-react-layout";
import styles from "./profile-avatar.module.css";

type AvatarSize = "small" | "medium" | "large";

type AvatarPalette = {
  accent: string;
  end: string;
  start: string;
};

type AvatarVars = CSSProperties & {
  "--avatar-accent": string;
  "--avatar-end": string;
  "--avatar-start": string;
};

type ProfileAvatarProps = {
  className?: string;
  name: string;
  size?: AvatarSize;
};

const avatarPalettes: AvatarPalette[] = [
  { accent: "#dff9ff", end: "#14b8a6", start: "#0ea5e9" },
  { accent: "#fef3c7", end: "#f97316", start: "#8b5cf6" },
  { accent: "#fce7f3", end: "#ec4899", start: "#6366f1" },
  { accent: "#dcfce7", end: "#22c55e", start: "#0891b2" },
  { accent: "#e0e7ff", end: "#7c3aed", start: "#ef4444" },
  { accent: "#ccfbf1", end: "#0f766e", start: "#84cc16" },
  { accent: "#fae8ff", end: "#a855f7", start: "#06b6d4" },
  { accent: "#ffedd5", end: "#ea580c", start: "#16a34a" },
  { accent: "#dbeafe", end: "#2563eb", start: "#db2777" },
  { accent: "#fef9c3", end: "#ca8a04", start: "#0f766e" },
  { accent: "#fee2e2", end: "#e11d48", start: "#0284c7" },
];

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "?";
}

function getAvatarPalette(name: string) {
  const hash = [...name].reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );

  return avatarPalettes[hash % avatarPalettes.length];
}

export default function ProfileAvatar({
  className,
  name,
  size = "medium",
}: ProfileAvatarProps) {
  const palette = getAvatarPalette(name);
  const style: AvatarVars = {
    "--avatar-accent": palette.accent,
    "--avatar-end": palette.end,
    "--avatar-start": palette.start,
  };

  return (
    <Avatar
      className={[styles.avatar, styles[size], className]
        .filter(Boolean)
        .join(" ")}
      type="text"
      rounded="full"
      aria-hidden="true"
      style={style}
    >
      {getInitials(name)}
    </Avatar>
  );
}
