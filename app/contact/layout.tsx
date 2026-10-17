import type { Metadata } from "next";
import { LAUNCHED } from "@/lib/site";

// Keep these pages out of search results until the full site launches.
export const metadata: Metadata = {
  robots: LAUNCHED ? undefined : { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
