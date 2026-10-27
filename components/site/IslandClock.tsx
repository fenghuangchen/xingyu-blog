"use client";

import { useEffect, useState } from "react";

const TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

const DATE_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Shanghai",
});

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  weekday: "short",
  timeZone: "Asia/Shanghai",
});

export function IslandClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const date = now
    ? `${DATE_FORMAT.format(now).replace(/\//g, ".")} · ${WEEKDAY_FORMAT.format(now)}`
    : "正在校准时间";

  return (
    <div className="island-clock" aria-label="本站当前时间">
      <span className="island-clock-time">
        {now ? TIME_FORMAT.format(now) : "--:--:--"}
      </span>
      <span className="island-clock-date">{date}</span>
    </div>
  );
}
