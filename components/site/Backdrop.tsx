import { Stars } from "./Stars";

export function Backdrop({ stars = true }: { stars?: boolean }) {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <div className="backdrop-veil" />
      {stars ? <Stars /> : null}
      <div className="grain" />
    </div>
  );
}
