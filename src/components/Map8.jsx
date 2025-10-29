import { useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { ProceduralTerrain3 } from "./ProceduralTerrain3";
import { SimonDevGrass21 } from "./SimonDevGrass21/SimonDevGrass21";
import { useSimonDevGrass21Controls } from "./useSimonDevGrass21Controls";

export const Map8 = ({
  scale = 1,
  position = [0, 0, 0],
  characterPosition,
  characterVelocity,
  onTerrainReady,
  ...props
}) => {
  const group = useRef(null);
  const [heightmapLookup, setHeightmapLookup] = useState(null);

  // Get SimonDevGrass21 controls
  const { simonDevGrass21Enabled } = useSimonDevGrass21Controls();

  // Create stable fallback vectors
  const fallbackPosition = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // Callback when ProceduralTerrain3 heightmap is ready
  const handleHeightmapReady = useCallback((fn) => {
    console.log("✅ Map8 received heightmap lookup from ProceduralTerrain3");
    setHeightmapLookup(() => fn);
  }, []);

  // Ground height function for grass - only works after heightmap is ready
  const getGroundHeight = useCallback(
    (x, z) => {
      if (!heightmapLookup) {
        return 0;
      }
      return heightmapLookup(x, z);
    },
    [heightmapLookup]
  );

  return (
    <group ref={group} {...props}>
      <ProceduralTerrain3
        onTerrainReady={onTerrainReady}
        onHeightmapReady={handleHeightmapReady}
      />

      {/* SimonDevGrass21 Grass System - Only render when heightmap is ready */}
      {simonDevGrass21Enabled && heightmapLookup && (
        <SimonDevGrass21
          areaSize={200}
          mapSize={2000}
          grassHeight={1.0}
          grassScale={1.0}
          getGroundHeight={getGroundHeight}
          characterPosition={characterPosition || fallbackPosition}
        />
      )}
    </group>
  );
};
