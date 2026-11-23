import React from "react";
import { Composition, staticFile } from "remotion";
import { FPS, Promo, PromoProps } from "./Promo";

export const Root: React.FC = () => (
  <Composition
    id="Promo"
    component={Promo}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={900}
    defaultProps={{ ep: "dvs01", doc: null } as PromoProps}
    calculateMetadata={async ({ props }) => {
      const doc = await (await fetch(staticFile(`${props.ep}/timing.json`))).json();
      return { durationInFrames: doc.totalFrames, props: { ...props, doc } };
    }}
  />
);
