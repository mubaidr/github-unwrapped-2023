import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Gradient } from "../Gradients/NativeGradient";
import { UfoSvg } from "../Issues/UfoSvg";
import { PANE_BORDER } from "../TopLanguages/Pane";

export const openingTitleSchema = z.object({
  login: z.string(),
});

export const TITLE_IMAGE_INNER_BORDER_RADIUS = 30;
export const TITLE_IMAGE_BORDER_PADDING = 20;

export const TitleImage: React.FC<z.infer<typeof openingTitleSchema>> = ({
  login,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flip = spring({
    fps,
    frame,
    config: {},
    delay: 70,
  });

  const flipRad = interpolate(flip, [0, 1], [Math.PI, 0]);
  const flipOpposite = flipRad + Math.PI;

  return (
    <div
      style={{
        height: 160,
        width: 160,
        marginRight: TITLE_IMAGE_BORDER_PADDING,
        perspective: 1000,
        position: "relative",
      }}
    >
      <Img
        src={`https://github.com/${login}.png`}
        style={{
          width: 160,
          borderRadius: TITLE_IMAGE_INNER_BORDER_RADIUS,
          height: 160,
          border: PANE_BORDER,
          transform: `rotateY(${flipRad}rad)`,
          backfaceVisibility: "hidden",
          position: "absolute",
        }}
      />
      <div
        style={{
          width: 160,
          borderRadius: TITLE_IMAGE_INNER_BORDER_RADIUS,
          height: 160,
          border: PANE_BORDER,
          transform: `rotateY(${flipOpposite}rad)`,
          backfaceVisibility: "hidden",
          position: "absolute",
          backgroundColor: "#111",
          overflow: "hidden",
        }}
      >
        <AbsoluteFill>
          <Gradient gradient="blueRadial" />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <UfoSvg
            style={{
              height: 80,
            }}
          />
        </AbsoluteFill>
      </div>
    </div>
  );
};
