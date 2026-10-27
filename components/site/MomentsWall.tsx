"use client";

import { useMemo, useState } from "react";
import type { Moment } from "@/lib/types";
import { formatDateLong } from "@/lib/utils";

const MONTH_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  timeZone: "Asia/Shanghai",
});

function monthLabel(iso: string): string {
  return MONTH_FORMAT.format(new Date(iso));
}

export function MomentsWall({ moments }: { moments: Moment[] }) {
  const [activeMood, setActiveMood] = useState<string>("all");

  const moods = useMemo(() => {
    const counts = new Map<string, number>();
    for (const moment of moments) {
      const mood = moment.mood?.trim() || "·";
      counts.set(mood, (counts.get(mood) || 0) + 1);
    }
    return [...counts.entries()];
  }, [moments]);

  const filtered = useMemo(
    () =>
      activeMood === "all"
        ? moments
        : moments.filter(
            (moment) => (moment.mood?.trim() || "·") === activeMood,
          ),
    [activeMood, moments],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Moment[]>();
    for (const moment of filtered) {
      const key = monthLabel(moment.createdAt);
      const list = map.get(key);
      if (list) list.push(moment);
      else map.set(key, [moment]);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="moments-wall">
      <div className="moment-filter" role="group" aria-label="按心情筛选动态">
        <button
          type="button"
          className={activeMood === "all" ? "is-active" : ""}
          onClick={() => setActiveMood("all")}
          aria-pressed={activeMood === "all"}
        >
          全部
          <span>{moments.length}</span>
        </button>
        {moods.map(([mood, count]) => (
          <button
            key={mood}
            type="button"
            className={activeMood === mood ? "is-active" : ""}
            onClick={() => setActiveMood(mood)}
            aria-pressed={activeMood === mood}
            title={`只看 ${mood} 的动态`}
          >
            <span className="moment-filter-mood">{mood}</span>
            <span>{count}</span>
          </button>
        ))}
      </div>

      {groups.length ? (
        <div className="moment-groups">
          {groups.map(([month, items]) => (
            <section className="moment-group" key={month}>
              <div className="moment-group-head">
                <h2>{month}</h2>
                <span>{items.length} 条</span>
              </div>

              <div className="moment-cards">
                {items.map((moment, index) => (
                  <article
                    className="moment-card glass"
                    key={moment.id}
                    style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
                  >
                    <div className="moment-card-head">
                      <span className="moment-card-mood" aria-hidden="true">
                        {moment.mood?.trim() || "·"}
                      </span>
                      <time dateTime={moment.createdAt}>
                        {formatDateLong(moment.createdAt)}
                      </time>
                    </div>
                    <p>{moment.content}</p>
                    <div className="moment-card-foot">
                      <span>{month}</span>
                      <span>NO. {String(index + 1).padStart(2, "0")}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-panel empty-panel-inline moments-empty">
          <p>这个心情下还没有动态，换一个看看。</p>
        </div>
      )}
    </div>
  );
}
