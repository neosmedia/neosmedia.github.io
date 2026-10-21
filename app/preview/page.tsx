import Home from "@/components/Home";

export const metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

// Full home page, available before launch. At launch, set
// The full site is now live at "/", so this page is just a noindex duplicate (kept so old links work).
export default function Preview() {
  return <Home />;
}
