"use client";

import { useState, useEffect } from "react";

export default function FestivalGarland() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/festival/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.enabled && (d.slug === "ganesh_chaturthi" || d.slug === "diwali")) setVisible(true);
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none select-none w-full overflow-hidden leading-none"
      aria-hidden="true"
      style={{ marginTop: "-1px" }}
    >
      <img
        src="/garland-2.svg"
        alt=""
        className="block w-full h-auto object-cover"
        draggable={false}
      />
    </div>
  );
}
