import Button from "@/components/Button";
import { Sections, PageHead } from "@/components/HomeSections";

export const metadata = { title: "Style guide", robots: { index: false, follow: false } };

/** Internal reference for the pill buttons (noindex, not linked, not in the sitemap). See DESIGN.md. */
export default function StyleGuide() {
  const sizes = ["sm", "md", "lg"] as const;
  return (
    <main className="page">
      <Sections page>
        <PageHead title="Pill buttons" lede="Variants, sizes and icon placement." />
        <section className="sec container sg">
          {(["primary", "outline"] as const).map((v) => (
            <div key={v} className="sg-block">
              <h2 className="sg-h mono">{v}</h2>
              {sizes.map((s) => (
                <div key={s} className="sg-row">
                  <span className="sg-label mono">{s}</span>
                  <Button variant={v} size={s}>Label</Button>
                  <Button variant={v} size={s} iconLeft="arrowLeft">Icon left</Button>
                  <Button variant={v} size={s} iconRight="arrowUpRight">Icon right</Button>
                  <Button variant={v} size={s} iconOnly iconLeft="plus" label="Add" />
                </div>
              ))}
            </div>
          ))}
        </section>
      </Sections>
    </main>
  );
}
