import React, { forwardRef } from "react";
import { useControls } from "leva";
import { Clouds, Cloud } from "@react-three/drei";
import { HeightMapUnreal } from "./HeightMapUnreal";
import { HeightFog } from "./HeightFog";

export const Map3 = forwardRef<any, any>(
  (
    { scale = 1, position = [0, 0, 0] as [number, number, number], ...props },
    ref
  ) => {
    const {
      enabled,
      cloudPosition,
      cloudScale,
      cloudSegments,
      bounds,
      concentrate,
      cloudVolume,
      smallestVolume,
      cloudFade,
      cloudOpacity,
      cloudColor,
      speed,
      growth,
    } = useControls("Map3 Clouds", {
      enabled: { value: false, label: "Enabled" },
      cloudPosition: {
        value: [0, 800, 0],
        label: "Position",
        step: 50,
      },
      cloudScale: {
        value: [1, 1, 1],
        label: "Scale",
        step: 0.1,
      },
      bounds: {
        value: [10, 2, 2],
        label: "Bounds",
        step: 1,
      },
      cloudSegments: {
        value: 40,
        label: "Segments",
        min: 10,
        max: 100,
        step: 5,
      },
      concentrate: {
        value: "inside" as "random" | "inside" | "outside",
        label: "Concentrate",
        options: ["random", "inside", "outside"],
      },
      cloudVolume: {
        value: 8,
        label: "Volume",
        min: 1,
        max: 20,
        step: 1,
      },
      smallestVolume: {
        value: 0.25,
        label: "Smallest Volume",
        min: 0.1,
        max: 1,
        step: 0.05,
      },
      cloudFade: {
        value: 10,
        label: "Fade Distance",
        min: 0,
        max: 50,
        step: 1,
      },
      cloudOpacity: {
        value: 1,
        label: "Opacity",
        min: 0,
        max: 1,
        step: 0.1,
      },
      cloudColor: {
        value: "#ffffff",
        label: "Color",
      },
      speed: {
        value: 0,
        label: "Animation Speed",
        min: 0,
        max: 2,
        step: 0.1,
      },
      growth: {
        value: 4,
        label: "Growth Factor",
        min: 1,
        max: 10,
        step: 0.5,
      },
    });

    return (
      <group>
        <HeightFog />
        <HeightMapUnreal
          ref={ref}
          size={4000}
          segments={200}
          heightScale={200}
          position={position}
          scale={scale}
          {...props}
        />
        {enabled && (
          <Clouds limit={200}>
            <Cloud
              position={cloudPosition}
              scale={cloudScale}
              bounds={bounds}
              segments={cloudSegments}
              concentrate={concentrate as "random" | "inside" | "outside"}
              volume={cloudVolume}
              smallestVolume={smallestVolume}
              fade={cloudFade}
              color={cloudColor}
              opacity={cloudOpacity}
              speed={speed}
              growth={growth}
            />
          </Clouds>
        )}
      </group>
    );
  }
);
