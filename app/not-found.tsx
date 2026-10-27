import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Backdrop } from "@/components/site/Backdrop";
import { StarMark } from "@/components/icons";
import { DEFAULT_THEME, themeStyle } from "@/lib/theme";

export default function NotFound() {
  return (
    <div
      className="site not-found-page"
      data-preset={DEFAULT_THEME.preset}
      style={themeStyle(DEFAULT_THEME)}
    >
      <Backdrop stars />
      <main className="not-found">
        <span className="brand-mark brand-mark-lg">
          <StarMark size={22} />
        </span>
        <span className="section-kicker">404 · LOST AT SEA</span>
        <h1>这座小岛还没有亮灯。</h1>
        <p>你要找的页面可能已经搬走，或者从来就不在海上。</p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={15} />
          回到主岛
        </Link>
      </main>
    </div>
  );
}
