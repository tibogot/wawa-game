import { RigidBody } from "@react-three/rapier";
import { useRef, useMemo } from "react";
import { useControls, folder } from "leva";
import { DynamicLeaves as DynamicLeaves3 } from "./DynamicLeaves3";
import { SimonDevGrass21 } from "./SimonDevGrass21/SimonDevGrass21";
import { ImpostorForest } from "./ImpostorForest";
import { useDynamicLeaves3Controls } from "./useDynamicLeaves3Controls";
import { useSimonDevGrass21Controls } from "./useSimonDevGrass21Controls";
import { useImpostorForestControls } from "./useImpostorForestControls";
import { useLensFlareControls } from "./useLensFlareControls";
import LensFlare from "./LensFlare";
import { FlowingLinesSimple } from "./FlowingLinesSimple";
import * as THREE from "three";

export const Map1 = ({
  scale = 1,
  position = [0, 0, 0],
  characterPosition,
  characterVelocity,
  ...props
}) => {
  const group = useRef();

  // Simple ground height function for flat plane
  const getGroundHeight = useMemo(
    () => (x, z) => 0, // Flat plane at y=0
    []
  );

  // Get dynamicLeaves3 controls
  const {
    dynamicLeaves3Enabled,
    dynamicLeaves3Count,
    dynamicLeaves3AreaSize,
    dynamicLeaves3InteractionRange,
    dynamicLeaves3PushStrength,
    dynamicLeaves3SwirlStrength,
  } = useDynamicLeaves3Controls();

  // Get SimonDevGrass21 controls
  const { simonDevGrass21Enabled } = useSimonDevGrass21Controls();

  // Get ImpostorForest controls
  const {
    impostorForestEnabled,
    treeCount,
    radius,
    minRadius,
    centerX,
    centerY,
    centerZ,
    lodMid,
    lodFar,
  } = useImpostorForestControls();

  // Get LensFlare controls
  const {
    lensFlareEnabled,
    lensFlare1Enabled,
    lensFlare1Position,
    lensFlare1H,
    lensFlare1S,
    lensFlare1L,
    lensFlare1Intensity,
    lensFlare2Enabled,
    lensFlare2Position,
    lensFlare2H,
    lensFlare2S,
    lensFlare2L,
    lensFlare2Intensity,
    lensFlare3Enabled,
    lensFlare3Position,
    lensFlare3H,
    lensFlare3S,
    lensFlare3L,
    lensFlare3Intensity,
    flareDistance,
  } = useLensFlareControls();

  // Get FlowingLines controls - Map1 specific
  const { flowingLinesEnabled } = useControls("🗺️ MAP 1", {
    flowingLines: folder(
      {
        flowingLinesEnabled: {
          value: false,
          label: "🌊 Enable Flowing Lines",
        },
      },
      { collapsed: true }
    ),
  });

  // Create stable fallback vectors
  const fallbackPosition = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const fallbackVelocity = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  return (
    <group ref={group} {...props}>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          position={position}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={scale}
          receiveShadow
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial
            color="#a0a0a0"
            metalness={0.3}
            roughness={0.4}
            envMapIntensity={1}
          />
        </mesh>
      </RigidBody>
      {/* Dynamic Leaves v3 */}
      {dynamicLeaves3Enabled && (
        <DynamicLeaves3
          count={dynamicLeaves3Count}
          areaSize={dynamicLeaves3AreaSize}
          ybotPosition={characterPosition || fallbackPosition}
          ybotVelocity={characterVelocity || fallbackVelocity}
          getGroundHeight={getGroundHeight}
          characterInteractionRange={dynamicLeaves3InteractionRange}
          characterPushStrength={dynamicLeaves3PushStrength}
          characterSwirlStrength={dynamicLeaves3SwirlStrength}
        />
      )}
      {/* SimonDevGrass21 Grass System - Perfect for flat plane debugging! */}
      {simonDevGrass21Enabled && (
        <SimonDevGrass21
          areaSize={200}
          mapSize={200}
          grassHeight={1.0}
          grassScale={1.0}
          getGroundHeight={getGroundHeight}
          characterPosition={characterPosition || fallbackPosition}
        />
      )}

      {/* ImpostorForest - Octahedral impostor-based trees */}
      {impostorForestEnabled && (
        <ImpostorForest
          centerPosition={[centerX, centerY, centerZ]}
          radius={radius}
          minRadius={minRadius}
          treeCount={treeCount}
          modelPath="/models/tree.glb"
          lodDistances={{ mid: lodMid, low: lodFar }}
        />
      )}

      {/* Lens Flares */}
      {lensFlareEnabled && (
        <>
          {lensFlare1Enabled && (
            <LensFlare
              position={[
                lensFlare1Position.x,
                lensFlare1Position.y,
                lensFlare1Position.z,
              ]}
              h={lensFlare1H}
              s={lensFlare1S}
              l={lensFlare1L}
              intensity={lensFlare1Intensity}
              distance={flareDistance}
            />
          )}
          {lensFlare2Enabled && (
            <LensFlare
              position={[
                lensFlare2Position.x,
                lensFlare2Position.y,
                lensFlare2Position.z,
              ]}
              h={lensFlare2H}
              s={lensFlare2S}
              l={lensFlare2L}
              intensity={lensFlare2Intensity}
              distance={flareDistance}
            />
          )}
          {lensFlare3Enabled && (
            <LensFlare
              position={[
                lensFlare3Position.x,
                lensFlare3Position.y,
                lensFlare3Position.z,
              ]}
              h={lensFlare3H}
              s={lensFlare3S}
              l={lensFlare3L}
              intensity={lensFlare3Intensity}
              distance={flareDistance}
            />
          )}
        </>
      )}

      {/* Flowing Lines - Simple CodePen version on flat terrain */}
      {flowingLinesEnabled && (
        <FlowingLinesSimple
          enabled={flowingLinesEnabled}
          lineCount={10}
          getTerrainHeight={getGroundHeight}
        />
      )}
    </group>
  );
};
