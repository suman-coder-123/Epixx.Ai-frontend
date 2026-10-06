"use client";

import { useEffect } from "react";

// Single flat dot cursor, transform-only, disabled on touch devices.
export function Cursor() {
  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const el = document.createElement("div");
    el.id = "epixx-cursor";
    document.body.appendChild(el);
    let x = -100;
    let y = -100;
    let tx = x;
    let ty = y;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
      const t = e.target as HTMLElement | null;
      const clickable = t?.closest("a,button,input,select,textarea,[role=button]");
      const s = clickable ? 1.5 : 1;
      el.style.width = `${17 * s}px`;
      el.style.height = `${17 * s}px`;
    };
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x - el.offsetWidth / 2}px,${y - el.offsetHeight / 2}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      el.remove();
    };
  }, []);
  return null;
}
