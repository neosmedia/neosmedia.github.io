import { ROLE_TITLE } from "@/lib/site";

/**
 * Small photo that sits on top of the hero balloons. The balloons treat it as a keep-out circle
 * (see BalloonName), so they get pushed aside. Hover / tap / focus shows the job title.
 */
export default function HeroAvatar() {
  return (
    <button type="button" className="hero-avatar" aria-describedby="hero-avatar-tip">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
      <img src="/ty-color.jpg" alt="Tyler Lange" width={48} height={48} decoding="async" />
      <span id="hero-avatar-tip" role="tooltip" className="hero-avatar-tip">
        {ROLE_TITLE}
      </span>
    </button>
  );
}
