const random = (() => {
  let seed = 20261027;
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();

const STARS = Array.from({ length: 84 }, (_, index) => ({
  left: Number((random() * 100).toFixed(2)),
  top: Number((random() * 100).toFixed(2)),
  size: Number((1 + random() * 1.9).toFixed(2)),
  delay: Number((random() * 7).toFixed(2)),
  opacity: Number((0.2 + random() * 0.65).toFixed(2)),
  key: `star-${index}`,
}));

export function Stars() {
  return (
    <div className="stars" aria-hidden="true">
      {STARS.map((star) => (
        <span
          key={star.key}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
