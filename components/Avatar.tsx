import { avatarInitial, cn, isImageSource } from "@/lib/utils";

type AvatarProps = {
  src: string;
  name: string;
  size?: number;
  className?: string;
  eager?: boolean;
};

export function Avatar({
  src,
  name,
  size = 96,
  className,
  eager = false,
}: AvatarProps) {
  const style = { width: size, height: size };

  if (src && isImageSource(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading={eager ? "eager" : "lazy"}
        className={cn("avatar", className)}
        style={style}
      />
    );
  }

  return (
    <span
      className={cn("avatar avatar-fallback", className)}
      style={{ ...style, fontSize: Math.round(size * 0.36) }}
      aria-label={name}
    >
      {src && src.length <= 8 ? src : avatarInitial(name)}
    </span>
  );
}
