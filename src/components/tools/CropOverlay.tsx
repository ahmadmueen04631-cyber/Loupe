"use client";
import { useRef } from "react";
import type { Rect } from "@/lib/image/crop";

type Corner = "nw" | "ne" | "sw" | "se";
const CORNERS: Corner[] = ["nw", "ne", "sw", "se"];
const cursors: Record<Corner, string> = { nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize" };

export function CropOverlay({
  natW, natH, displayScale, selection, ratio, minSize, onChange,
}: {
  natW: number; natH: number; displayScale: number; selection: Rect; ratio: number | null; minSize: number;
  onChange: (r: Rect) => void;
}) {
  const dragRef = useRef<{ mode: "move" | Corner; grabX: number; grabY: number; start: Rect } | null>(null);

  const toNatural = (e: React.PointerEvent, rect: DOMRect) => ({
    x: Math.min(natW, Math.max(0, (e.clientX - rect.left) / displayScale)),
    y: Math.min(natH, Math.max(0, (e.clientY - rect.top) / displayScale)),
  });

  const startDrag = (mode: "move" | Corner) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = e.currentTarget.closest("[data-crop-frame]")!.getBoundingClientRect();
    const p = toNatural(e, rect);
    dragRef.current = { mode, grabX: p.x - selection.x, grabY: p.y - selection.y, start: selection };
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = toNatural(e, rect);

    if (drag.mode === "move") {
      const x = Math.min(natW - drag.start.w, Math.max(0, p.x - drag.grabX));
      const y = Math.min(natH - drag.start.h, Math.max(0, p.y - drag.grabY));
      onChange({ ...drag.start, x, y });
      return;
    }

    const fixed = {
      nw: { x: drag.start.x + drag.start.w, y: drag.start.y + drag.start.h },
      ne: { x: drag.start.x, y: drag.start.y + drag.start.h },
      sw: { x: drag.start.x + drag.start.w, y: drag.start.y },
      se: { x: drag.start.x, y: drag.start.y },
    }[drag.mode];

    const dirX = p.x >= fixed.x ? 1 : -1;
    const dirY = p.y >= fixed.y ? 1 : -1;
    let w = Math.max(minSize, Math.abs(p.x - fixed.x));
    let h = ratio ? w / ratio : Math.max(minSize, Math.abs(p.y - fixed.y));

    w = dirX > 0 ? Math.min(w, natW - fixed.x) : Math.min(w, fixed.x);
    if (ratio) {
      h = w / ratio;
      if (dirY > 0 && fixed.y + h > natH) { h = natH - fixed.y; w = h * ratio; }
      if (dirY < 0 && fixed.y - h < 0) { h = fixed.y; w = h * ratio; }
    } else {
      h = dirY > 0 ? Math.min(h, natH - fixed.y) : Math.min(h, fixed.y);
    }

    const x = dirX > 0 ? fixed.x : fixed.x - w;
    const y = dirY > 0 ? fixed.y : fixed.y - h;
    onChange({ x, y, w, h });
  };

  const endDrag = () => { dragRef.current = null; };

  return (
    <div
      data-crop-frame
      className="absolute inset-0"
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="absolute cursor-move touch-none border-2 border-white"
        style={{
          left: selection.x * displayScale,
          top: selection.y * displayScale,
          width: selection.w * displayScale,
          height: selection.h * displayScale,
          boxShadow: "0 0 0 9999px rgba(15,18,24,0.55)",
        }}
        onPointerDown={startDrag("move")}
      >
        {CORNERS.map((c) => (
          <div
            key={c}
            onPointerDown={startDrag(c)}
            className="absolute h-5 w-5 touch-none rounded-full border-2 border-[var(--accent)] bg-white"
            style={{
              cursor: cursors[c],
              top: c.startsWith("n") ? -10 : undefined,
              bottom: c.startsWith("s") ? -10 : undefined,
              left: c.endsWith("w") ? -10 : undefined,
              right: c.endsWith("e") ? -10 : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
