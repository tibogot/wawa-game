import { RigidBody } from "@react-three/rapier";
import { useRef, useMemo } from "react";
import { useControls, folder } from "leva";
import { DynamicLeaves as DynamicLeaves3 } from "./DynamicLeaves3";
import { SimonDevGrass21 } from "./SimonDevGrass21/SimonDevGrass21";
import { SimonDevGrass22 } from "./SimonDevGrass22/SimonDevGrass22";
import { SimonDevGrass23 } from "./SimonDevGrass23/SimonDevGrass23";
import { GrassPatch } from "./GrassClaude2";
import { ImpostorForest } from "./ImpostorForest";
import { LeafPileMountain } from "./LeafPileMountain";
import { useDynamicLeaves3Controls } from "./useDynamicLeaves3Controls";
import { useSimonDevGrass21Controls } from "./useSimonDevGrass21Controls";
import { useSimonDevGrass22Controls } from "./useSimonDevGrass22Controls";
import { useSimonDevGrass23Controls } from "./useSimonDevGrass23Controls";
import { useGrassClaudeControls } from "./useGrassClaudeControls";
import { useImpostorForestControls } from "./useImpostorForestControls";
import { useLeafPileMountainControls } from "./useLeafPileMountainControls";
import { useInstancedTreesControls } from "./useInstancedTreesControls";
import { useLensFlareControls } from "./useLensFlareControls";
import LensFlare from "./LensFlare";
import { FlowingLinesSimple } from "./FlowingLinesSimple";
import { WindFlag } from "./WindFlag";
import { useWindFlagControls } from "./useWindFlagControls";
import { RipplePlane } from "./RipplePlane";
import { FloatingLeaves2 } from "./FloatingLeaves2";
import { Skybox } from "./Skybox";
import { Tree } from "./Tree";
import { InstancedTrees } from "./InstancedTrees";
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
  // Get SimonDevGrass22 controls (separate folder under FOLIAGE)
  const { simonDevGrass22Enabled } = useSimonDevGrass22Controls();
  // Get SimonDevGrass23 controls (separate folder under FOLIAGE)
  const { simonDevGrass23Enabled } = useSimonDevGrass23Controls();
  // Get GrassClaude controls
  const { grassClaudeEnabled } = useGrassClaudeControls();

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

  // Get LeafPileMountain controls
  const {
    leafPileMountainEnabled,
    leafPileMountainCount,
    leafPileMountainPileRadius,
    leafPileMountainPileHeight,
    leafPileMountainPositionX,
    leafPileMountainPositionZ,
    leafPileMountainInteractionRange,
    leafPileMountainPushStrength,
    leafPileMountainSwirlStrength,
    leafPileMountainExplosionStrength,
  } = useLeafPileMountainControls();

  // Get Tree control (single tree component)
  const { treeEnabled } = useControls("🌿 FOLIAGE", {
    tree: folder(
      {
        treeEnabled: {
          value: false,
          label: "🌲 Enable Single Tree",
        },
      },
      { collapsed: true }
    ),
  });

  // Get InstancedTrees controls
  const {
    instancedTreesEnabled,
    instancedTreeCount,
    instancedPositionX,
    instancedPositionY,
    instancedPositionZ,
    instancedRadius,
    instancedMinRadius,
    scaleRangeMin,
    scaleRangeMax,
    castShadow,
    receiveShadow,
    enableTransparentSorting,
    enableBVH,
    bvhMargin,
    enableViewThickening,
    viewThickenPower,
    viewThickenStrength,
  } = useInstancedTreesControls();

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

  // Get FlowingLines and RipplePlane controls - Map1 specific
  const {
    skyboxEnabled,
    flowingLinesEnabled,
    ripplePlaneEnabled,
    ripplePlaneSize,
    ripplePlaneSegments,
    ripplePlaneRadius,
    ripplePlaneStrength,
    ripplePlaneSpeed,
    ripplePlaneFrequency,
    ripplePlaneColor,
    ripplePlaneOpacity,
    ripplePlanePositionX,
    ripplePlanePositionY,
    ripplePlanePositionZ,
  } = useControls("🗺️ MAP 1", {
    skybox: folder(
      {
        skyboxEnabled: {
          value: true,
          label: "🌌 Enable Skybox",
        },
      },
      { collapsed: true }
    ),
    flowingLines: folder(
      {
        flowingLinesEnabled: {
          value: false,
          label: "🌊 Enable Flowing Lines",
        },
      },
      { collapsed: true }
    ),
    ripplePlane: folder(
      {
        ripplePlaneEnabled: {
          value: false,
          label: "🌊 Enable Ripple Plane",
        },
        ripplePlaneSize: {
          value: 50,
          min: 10,
          max: 200,
          step: 1,
          label: "📏 Size",
        },
        ripplePlaneSegments: {
          value: 64,
          min: 16,
          max: 128,
          step: 8,
          label: "🔲 Segments",
        },
        ripplePlaneRadius: {
          value: 5.0,
          min: 1.0,
          max: 20.0,
          step: 0.5,
          label: "📐 Ripple Radius",
        },
        ripplePlaneStrength: {
          value: 0.5,
          min: 0.0,
          max: 2.0,
          step: 0.1,
          label: "💪 Ripple Strength",
        },
        ripplePlaneSpeed: {
          value: 2.0,
          min: 0.5,
          max: 10.0,
          step: 0.1,
          label: "⚡ Ripple Speed",
        },
        ripplePlaneFrequency: {
          value: 2.0,
          min: 0.5,
          max: 10.0,
          step: 0.1,
          label: "🌊 Wave Frequency",
        },
        ripplePlaneColor: {
          value: "#4a90e2",
          label: "🎨 Color",
        },
        ripplePlaneOpacity: {
          value: 0.8,
          min: 0.0,
          max: 1.0,
          step: 0.05,
          label: "👻 Opacity",
        },
        ripplePlanePositionX: {
          value: 0,
          min: -100,
          max: 100,
          step: 1,
          label: "📍 Pos X",
        },
        ripplePlanePositionY: {
          value: 0.1,
          min: -10,
          max: 10,
          step: 0.1,
          label: "📍 Pos Y",
        },
        ripplePlanePositionZ: {
          value: 0,
          min: -100,
          max: 100,
          step: 1,
          label: "📍 Pos Z",
        },
      },
      { collapsed: true }
    ),
  });

  // Create stable fallback vectors
  const fallbackPosition = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const fallbackVelocity = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // WindFlag controls (reuse shared hook used by other maps)
  const {
    windFlagEnabled,
    windFlagPosition,
    windFlagYOffset,
    windFlagScale,
    windFlagColor,
    windFlagPoleHeight,
    windFlagWidth,
    windFlagHeight,
    windFlagSegments,
    windFlagUseTexture,
    windFlagTexturePath,
    windFlagTextureQuality,
    windFlagWaveIntensity,
  } = useWindFlagControls();

  return (
    <group ref={group} {...props}>
      {skyboxEnabled && <Skybox />}
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
      {/* WindFlag to visualize global wind */}
      {windFlagEnabled && (
        <WindFlag
          position={[
            windFlagPosition[0],
            -windFlagPoleHeight / 2 + windFlagYOffset,
            windFlagPosition[1],
          ]}
          scale={windFlagScale}
          flagColor={windFlagColor}
          poleHeight={windFlagPoleHeight}
          flagWidth={windFlagWidth}
          flagHeight={windFlagHeight}
          segments={windFlagSegments}
          useTexture={windFlagUseTexture}
          texturePath={windFlagTexturePath}
          textureQuality={windFlagTextureQuality}
          waveIntensity={windFlagWaveIntensity}
        />
      )}
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
      {/* SimonDevGrass21 Grass System */}
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

      {/* SimonDevGrass22 Grass System */}
      {simonDevGrass22Enabled && (
        <SimonDevGrass22
          areaSize={200}
          mapSize={200}
          grassHeight={1.0}
          grassScale={1.0}
          getGroundHeight={getGroundHeight}
          characterPosition={characterPosition || fallbackPosition}
        />
      )}

      {/* SimonDevGrass23 Grass System */}
      {simonDevGrass23Enabled && (
        <SimonDevGrass23
          areaSize={200}
          mapSize={200}
          grassHeight={1.0}
          grassScale={1.0}
          getGroundHeight={getGroundHeight}
          characterPosition={characterPosition || fallbackPosition}
        />
      )}

      {/* GrassPatch - Claude grass system */}
      {grassClaudeEnabled && (
        <GrassPatch position={[0, 0, 0]} playerPosition={characterPosition} />
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

      {/* Leaf Pile Mountain - Pile of leaves on the floor */}
      {leafPileMountainEnabled && (
        <LeafPileMountain
          count={leafPileMountainCount}
          pileRadius={leafPileMountainPileRadius}
          pileHeight={leafPileMountainPileHeight}
          position={[leafPileMountainPositionX, 0, leafPileMountainPositionZ]}
          ybotPosition={characterPosition || fallbackPosition}
          ybotVelocity={characterVelocity || fallbackVelocity}
          getGroundHeight={getGroundHeight}
          characterInteractionRange={leafPileMountainInteractionRange}
          characterPushStrength={leafPileMountainPushStrength}
          characterSwirlStrength={leafPileMountainSwirlStrength}
          characterExplosionStrength={leafPileMountainExplosionStrength}
        />
      )}

      {/* Flowing Lines - Simple CodePen version on flat terrain */}
      {flowingLinesEnabled && (
        <FlowingLinesSimple
          enabled={flowingLinesEnabled}
          lineCount={10}
          getTerrainHeight={getGroundHeight}
        />
      )}

      {/* Ripple Plane - Interactive water-like surface */}
      {ripplePlaneEnabled && (
        <RipplePlane
          position={[
            ripplePlanePositionX,
            ripplePlanePositionY,
            ripplePlanePositionZ,
          ]}
          size={ripplePlaneSize}
          segments={ripplePlaneSegments}
          characterPosition={characterPosition || fallbackPosition}
          rippleRadius={ripplePlaneRadius}
          rippleStrength={ripplePlaneStrength}
          rippleSpeed={ripplePlaneSpeed}
          rippleFrequency={ripplePlaneFrequency}
          color={ripplePlaneColor}
          opacity={ripplePlaneOpacity}
        />
      )}

      {/* Floating Leaves 2 - Follows character position */}
      <FloatingLeaves2
        characterPosition={characterPosition || fallbackPosition}
        getTerrainHeight={getGroundHeight}
      />

      {/* Tree */}
      {treeEnabled && (
        <Tree
          position={[10, 0, 10]}
          scale={1}
          enabled={true}
          getTerrainHeight={getGroundHeight}
        />
      )}

      {/* Instanced Trees - Using InstancedMesh2 */}
      {instancedTreesEnabled && (
        <InstancedTrees
          count={instancedTreeCount}
          position={[
            instancedPositionX,
            instancedPositionY,
            instancedPositionZ,
          ]}
          radius={instancedRadius}
          minRadius={instancedMinRadius}
          scaleRange={[scaleRangeMin, scaleRangeMax]}
          enabled={instancedTreesEnabled}
          getTerrainHeight={getGroundHeight}
          enableBVH={enableBVH}
          bvhMargin={bvhMargin}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
          enableTransparentSorting={enableTransparentSorting}
          enableViewThickening={enableViewThickening}
          viewThickenPower={viewThickenPower}
          viewThickenStrength={viewThickenStrength}
        />
      )}
    </group>
  );
};
