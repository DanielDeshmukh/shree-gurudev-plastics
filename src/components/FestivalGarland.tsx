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
      style={{ position: "relative", zIndex: 50, marginTop: "-1px" }}
      aria-hidden="true"
    >
      <div
        style={{
          backgroundImage: "url(/garland-4.svg)",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "top center",
          backgroundSize: "auto 100%",
          width: "100%",
          height: "220px",
        }}
      />
    </div>
  );
}
