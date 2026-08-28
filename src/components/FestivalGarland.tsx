"use client";

import { useFestivalStatus } from "@/lib/useFestivalStatus";

export default function FestivalGarland() {
  const status = useFestivalStatus();

  if (!status?.enabled || (status.slug !== "ganesh_chaturthi" && status.slug !== "diwali")) return null;

  return (
    <div
      className="pointer-events-none select-none w-full overflow-hidden leading-none sticky top-16 z-50"
      style={{ marginTop: "-1px", marginBottom: "-140px" }}
      aria-hidden="true"
    >
      <div
        style={{
          backgroundImage: "url(/garland-4.svg)",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "top center",
          backgroundSize: "auto 65%",
          width: "100%",
          height: "140px",
        }}
      />
    </div>
  );
}
