import Home from "@/components/Home";

export const metadata = {
  title: "Tyler Lange — Preview",
  robots: { index: false, follow: false },
};

// Full home page, available before launch. At launch, set
// NEXT_PUBLIC_LAUNCHED=true and "/" shows this instead of coming soon.
export default function Preview() {
  return <Home />;
}
