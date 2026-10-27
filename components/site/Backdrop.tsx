import { DynamicStars } from "./DynamicStars";

export function Backdrop({ stars = true }: { stars?: boolean }) {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
      <div className="aurora aurora-c" />
      <div className="curtain curtain-a" />
      <div className="curtain curtain-b" />
      <div className="nebula" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <div className="backdrop-veil" />
      {stars ? <DynamicStars /> : null}
      <div className="grain" />
    </div>
  );
}
