import { ImageResponse } from "next/og";
import { MarkImage, brand } from "@/components/site/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The family mark at home-screen size: a full-bleed signal square with the ink vector. iOS applies its own mask. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: brand.signal }}>
        <MarkImage size={180} square={false} />
      </div>
    ),
    { ...size }
  );
}
