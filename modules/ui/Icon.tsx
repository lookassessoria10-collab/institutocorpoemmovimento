/** Ícones de traço simples (sem dependência externa). */
const PATHS: Record<string, string> = {
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeOff: "M3 3l18 18 M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2 M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a10.3 10.3 0 0 0 5.4-1.6 M9.9 9.9a3 3 0 0 0 4.2 4.2",
  play: "M7 4.5v15l12-7.5-12-7.5Z",
  pause: "M8 5v14 M16 5v14",
  restart: "M3 12a9 9 0 1 0 3-6.7 M3 4v5h5",
  loop: "M17 2l3 3-3 3 M4 11V9a4 4 0 0 1 4-4h12 M7 22l-3-3 3-3 M20 13v2a4 4 0 0 1-4 4H4",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  close: "M6 6l12 12 M18 6L6 18",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  home: "M3 11l9-7 9 7 M5 10v10h14V10",
  layers: "M12 3l9 5-9 5-9-5 9-5Z M3 13l9 5 9-5 M3 17l9 5 9-5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 11v5 M12 8h.01",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M18 15l-6-6-6 6",
  isolate: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 8v8 M8 12h8",
  spark: "M12 3v4 M12 17v4 M3 12h4 M17 12h4 M5.6 5.6l2.8 2.8 M15.6 15.6l2.8 2.8 M5.6 18.4l2.8-2.8 M15.6 8.4l2.8-2.8",
  undo: "M9 14L4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  record: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  stop: "M7 7h10v10H7z",
  mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z M19 11a7 7 0 0 1-14 0 M12 18v3",
  camera: "M15 10l5-3v10l-5-3 M3 7h12v10H3z",
  download: "M12 3v12 M7 10l5 5 5-5 M4 21h16",
  expand: "M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5",
  arrow: "M5 19L19 5 M9 5h10v10",
  marker: "M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  text: "M5 6h14 M12 6v13",
  circle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  panelLeft: "M3 4h18v16H3z M9 4v16",
  panelRight: "M3 4h18v16H3z M15 4v16",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  move: "M12 2v20 M2 12h20 M12 2l-3 3 M12 2l3 3 M12 22l-3-3 M12 22l3-3 M2 12l3-3 M2 12l3 3 M22 12l-3-3 M22 12l-3 3",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-4 w-4", strokeWidth = 1.7 }: { name: IconName; className?: string; strokeWidth?: number }) {
  const fill = name === "play" || name === "record" || name === "stop" ? "currentColor" : "none";
  return (
    <svg viewBox="0 0 24 24" className={className} fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
