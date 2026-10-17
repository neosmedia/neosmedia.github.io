import ComingSoon from "@/components/ComingSoon";
import Home from "@/components/Home";
import { LAUNCHED } from "@/lib/site";

export default function Page() {
  return LAUNCHED ? <Home /> : <ComingSoon />;
}
