import { useRef, useState, useCallback, useMemo, forwardRef } from "react";
import * as THREE from "three";
import { ProceduralTerrain5 } from "./ProceduralTerrain5";
import { ProceduralTerrain6 } from "./ProceduralTerrain6";
import { SimonDevGrass21 } from "./SimonDevGrass21/SimonDevGrass21";
import { SimonDevGrass22 } from "./SimonDevGrass22/SimonDevGrass22";
import { useSimonDevGrass21Controls } from "./useSimonDevGrass21Controls";
import { useSimonDevGrass22Controls } from "./useSimonDevGrass22Controls";
import { HeightFog } from "./HeightFog";
import { useHeightFogControls } from "./useHeightFogControls";
import { CloudSystem } from "./CloudSystem";
import { useLensFlareControls } from "./useLensFlareControls";
import LensFlare from "./LensFlare";
import { FlowingLinesSimple } from "./FlowingLinesSimple";
import { useFlowingLinesControls } from "./useFlowingLinesControls";
import { MovingShadowPlanes } from "./MovingShadowPlanes";
import { useMovingShadowPlanesControls } from "./useMovingShadowPlanesControls";
import { FloorDebugSpheres } from "./FloorDebugSpheres";
import { useFloorDebugSpheresControls } from "./useFloorDebugSpheresControls";
import { FloatingLeaves } from "./FloatingLeaves";
import { ButterflyParticles } from "./ButterflyParticles";
import { useButterflyParticlesControls } from "./useButterflyParticlesControls";
import { Mountain } from "./Mountain";
import { useMountainControls } from "./useMountainControls";
import { WindFlag } from "./WindFlag";
import { useWindFlagControls } from "./useWindFlagControls";
import { DustParticles } from "./DustParticles";
import { useDustParticlesControls } from "./useDustParticlesControls";
import { DynamicLeaves as DynamicLeaves3 } from "./DynamicLeaves3";
import { useDynamicLeaves3Controls } from "./useDynamicLeaves3Controls";
import { RainParticles3D } from "./RainParticles3D";
import { useRainParticles3DControls } from "./useRainParticles3DControls";
import { ParticlesFog } from "./ParticlesFog";
import { ShorelineEffect } from "./ShorelineEffect";
import { useShorelineEffectControls } from "./useShorelineEffectControls";

export const Map9 = forwardRef(
  (
    {
      scale = 1,
      position = [0, 0, 0],
      characterPosition,
      characterVelocity,
      onTerrainReady,
      ...props
    },
    ref
  ) => {
    const group = useRef(null);
    const [heightmapLookup, setHeightmapLookup] = useState(null);
    const [isTerrainMeshReady, setIsTerrainMeshReady] = useState(false);

    // Get SimonDevGrass21 controls
    const { simonDevGrass21Enabled } = useSimonDevGrass21Controls();
    // Get SimonDevGrass22 controls
    const { simonDevGrass22Enabled } = useSimonDevGrass22Controls();

    // Get Height Fog controls from hook
    const { heightFogEnabled, fogColor, fogHeight, fogNear, fogFar } =
      useHeightFogControls();

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

    // Get FlowingLines controls
    const {
      enabled: flowingLinesEnabled,
      lineCount,
      lineLength,
      lineWidth,
      heightOffset,
      verticalWave,
      animationSpeed,
      pathRadius,
      pathFrequency,
      lineColor,
      lineOpacity,
      segments,
      boundaryRadius,
    } = useFlowingLinesControls();

    // Get MovingShadowPlanes controls
    const {
      enabled: movingShadowPlanesEnabled,
      planeCount,
      planeSize,
      planeHeight,
      moveSpeed,
      moveRange,
      planeOpacity,
      planeColor,
      followPlayer,
    } = useMovingShadowPlanesControls();

    // Get FloorDebugSpheres controls
    const {
      enabled: floorDebugSpheresEnabled,
      gridSize,
      areaSize,
      sphereSize,
      sphereColor,
      emissiveIntensity,
    } = useFloorDebugSpheresControls();

    // Get ButterflyParticles controls
    const {
      butterflyEnabled,
      butterflyCount,
      butterflySpawnRange,
      butterflyMaxDistance,
      butterflySize,
      butterflyTexture,
      butterflyHeightMin,
      butterflyHeightMax,
      butterflySpreadRadius,
    } = useButterflyParticlesControls();

    // Get Mountain controls
    const {
      mountainEnabled,
      mountainPosition,
      mountainScale,
      mountainRotation,
      mountainColor,
      mountainOpacity,
      mountainRoughness,
      mountainMetalness,
      mountainEmissive,
      mountainEmissiveIntensity,
    } = useMountainControls();

    // Get WindFlag controls
    const {
      windFlagEnabled,
      windFlagPosition,
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
      windFlagYOffset,
    } = useWindFlagControls();

    // Get DustParticles controls
    const {
      dustEnabled,
      dustCount,
      dustSpawnRange,
      dustMaxDistance,
      dustSize,
    } = useDustParticlesControls();

    // Get DynamicLeaves3 controls
    const {
      dynamicLeaves3Enabled,
      dynamicLeaves3Count,
      dynamicLeaves3AreaSize,
      dynamicLeaves3InteractionRange,
      dynamicLeaves3PushStrength,
      dynamicLeaves3SwirlStrength,
    } = useDynamicLeaves3Controls();

    // Get RainParticles controls
    const {
      rainEnabled,
      rainDensity,
      rainAreaSize,
      rainHeight,
      rainSpeed,
      rainParticleSize,
      rainColor,
      rainOpacity,
    } = useRainParticles3DControls();

    // Get ShorelineEffect controls
    const {
      enabled: shorelineEnabled,
      shorelineIntensity,
      shorelineWidth,
      shorelineColor1,
      shorelineColor2,
      waveSpeed,
      waveAmplitude,
      noiseScale,
      gradientSharpness,
      waterLevel,
      debugMode,
    } = useShorelineEffectControls();

    // Create stable fallback vectors
    const fallbackPosition = useMemo(() => new THREE.Vector3(0, 0, 0), []);
    const fallbackVelocity = useMemo(() => new THREE.Vector3(0, 0, 0), []);

    // Callback when ProceduralTerrain4 heightmap is ready
    const handleHeightmapReady = useCallback((fn) => {
      console.log(
        "✅ Map9 received heightmap lookup from ProceduralTerrain4 (Simplex)"
      );
      setHeightmapLookup(() => fn);
      // Mark terrain mesh as ready after a short delay to ensure materials are compiled
      setTimeout(() => {
        setIsTerrainMeshReady(true);
        console.log("✅ Map9 terrain mesh ready, HeightFog can now apply");
      }, 100);
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

    // Calculate terrain height for WindFlag position
    // WindFlag positions pole center at poleHeight/2 above group position
    // So we need to place group at terrainHeight - poleHeight/2 to get pole base at terrainHeight
    // Add user-adjustable Y offset
    const windFlagTerrainHeight =
      windFlagEnabled && heightmapLookup
        ? getGroundHeight(windFlagPosition[0], windFlagPosition[2]) -
          windFlagPoleHeight / 2 +
          windFlagYOffset
        : 0;

    // Debug: Log the calculated height
    if (windFlagEnabled && heightmapLookup) {
      console.log(
        `Map9 - WindFlag at [${windFlagPosition[0]}, ${windFlagPosition[2]}] -> terrain height: ${windFlagTerrainHeight}`
      );
    }

    return (
      <group ref={group} {...props}>
        <CloudSystem />
        <ProceduralTerrain6
          onTerrainReady={onTerrainReady}
          onHeightmapReady={handleHeightmapReady}
        />

        {/* Only render HeightFog after terrain mesh is ready */}
        {isTerrainMeshReady && (
          <HeightFog
            enabled={heightFogEnabled}
            fogColor={fogColor}
            fogHeight={fogHeight}
            fogNear={fogNear}
            fogFar={fogFar}
          />
        )}

        {/* SimonDevGrass21 Grass System - Only render when heightmap is ready */}
        {simonDevGrass21Enabled && heightmapLookup && (
          <SimonDevGrass21
            areaSize={200}
            mapSize={2500}
            grassHeight={1.0}
            grassScale={1.0}
            getGroundHeight={getGroundHeight}
            characterPosition={characterPosition || fallbackPosition}
          />
        )}

        {/* SimonDevGrass22 Grass System - Only render when heightmap is ready */}
        {simonDevGrass22Enabled && heightmapLookup && (
          <SimonDevGrass22
            areaSize={200}
            mapSize={2500}
            grassHeight={1.0}
            grassScale={1.0}
            getGroundHeight={getGroundHeight}
            characterPosition={characterPosition || fallbackPosition}
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
        {/* Flowing Lines */}
        {flowingLinesEnabled && heightmapLookup && (
          <FlowingLinesSimple
            enabled={flowingLinesEnabled}
            lineCount={lineCount}
            lineLength={lineLength}
            lineWidth={lineWidth}
            heightOffset={heightOffset}
            verticalWave={verticalWave}
            animationSpeed={animationSpeed}
            pathRadius={pathRadius}
            pathFrequency={pathFrequency}
            lineColor={lineColor}
            lineOpacity={lineOpacity}
            segments={segments}
            boundaryRadius={boundaryRadius}
            getTerrainHeight={getGroundHeight}
          />
        )}
        {/* Moving Shadow Planes */}
        {movingShadowPlanesEnabled && (
          <MovingShadowPlanes
            characterPosition={characterPosition || fallbackPosition}
            enabled={movingShadowPlanesEnabled}
            planeCount={planeCount}
            planeSize={planeSize}
            planeHeight={planeHeight}
            moveSpeed={moveSpeed}
            moveRange={moveRange}
            planeOpacity={planeOpacity}
            planeColor={planeColor}
            followPlayer={followPlayer}
          />
        )}
        {/* Floor Debug Spheres - Visualize terrain height calculations */}
        {floorDebugSpheresEnabled && heightmapLookup && (
          <FloorDebugSpheres
            heightmapLookup={heightmapLookup}
            enabled={floorDebugSpheresEnabled}
            gridSize={gridSize}
            areaSize={areaSize}
            sphereSize={sphereSize}
            sphereColor={sphereColor}
            emissiveIntensity={emissiveIntensity}
          />
        )}
        {/* Floating Leaves */}
        {heightmapLookup && (
          <FloatingLeaves getTerrainHeight={getGroundHeight} />
        )}
        {/* Butterfly Particles */}
        {butterflyEnabled && butterflyTexture !== "both" && heightmapLookup && (
          <ButterflyParticles
            enabled={butterflyEnabled}
            count={butterflyCount}
            spawnRange={butterflySpawnRange}
            maxDistance={butterflyMaxDistance}
            butterflySize={butterflySize}
            texture={butterflyTexture}
            heightMin={butterflyHeightMin}
            heightMax={butterflyHeightMax}
            spreadRadius={butterflySpreadRadius}
            getTerrainHeight={getGroundHeight}
          />
        )}
        {/* Render both butterflies AND moths when "both" is selected */}
        {butterflyEnabled && butterflyTexture === "both" && heightmapLookup && (
          <>
            <ButterflyParticles
              enabled={butterflyEnabled}
              count={Math.ceil(butterflyCount / 2)}
              spawnRange={butterflySpawnRange}
              maxDistance={butterflyMaxDistance}
              butterflySize={butterflySize}
              texture="butterfly"
              heightMin={butterflyHeightMin}
              heightMax={butterflyHeightMax}
              spreadRadius={butterflySpreadRadius}
              getTerrainHeight={getGroundHeight}
            />
            <ButterflyParticles
              enabled={butterflyEnabled}
              count={Math.floor(butterflyCount / 2)}
              spawnRange={butterflySpawnRange}
              maxDistance={butterflyMaxDistance}
              butterflySize={butterflySize}
              texture="moth"
              heightMin={butterflyHeightMin}
              heightMax={butterflyHeightMax}
              spreadRadius={butterflySpreadRadius}
              getTerrainHeight={getGroundHeight}
            />
          </>
        )}
        {/* Dust Particles */}
        {dustEnabled && heightmapLookup && (
          <DustParticles
            enabled={dustEnabled}
            count={dustCount}
            spawnRange={dustSpawnRange}
            maxDistance={dustMaxDistance}
            dustSize={dustSize}
            getTerrainHeight={getGroundHeight}
          />
        )}
        {/* Rain Particles */}
        {rainEnabled && (
          <RainParticles3D
            enabled={rainEnabled}
            density={rainDensity}
            areaSize={rainAreaSize}
            rainHeight={rainHeight}
            rainSpeed={rainSpeed}
            particleSize={rainParticleSize}
            rainColor={rainColor}
            rainOpacity={rainOpacity}
          />
        )}
        {/* Particles Fog */}
        {heightmapLookup && <ParticlesFog getTerrainHeight={getGroundHeight} />}
        {/* Dynamic Leaves v3 */}
        {dynamicLeaves3Enabled && heightmapLookup && (
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
        {/* Wind Flag */}
        {windFlagEnabled && heightmapLookup && (
          <WindFlag
            position={[
              windFlagPosition[0],
              windFlagTerrainHeight,
              windFlagPosition[2],
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
        {/* Mountain */}
        <Mountain
          mountainEnabled={mountainEnabled}
          mountainPosition={mountainPosition}
          mountainScale={mountainScale}
          mountainRotation={mountainRotation}
          mountainColor={mountainColor}
          mountainOpacity={mountainOpacity}
          mountainRoughness={mountainRoughness}
          mountainMetalness={mountainMetalness}
          mountainEmissive={mountainEmissive}
          mountainEmissiveIntensity={mountainEmissiveIntensity}
        />
        {/* Shoreline Effect */}
        {heightmapLookup && (
          <ShorelineEffect
            terrainSize={2500}
            waterLevel={waterLevel}
            enableShoreline={shorelineEnabled}
            shorelineIntensity={shorelineIntensity}
            shorelineWidth={shorelineWidth}
            shorelineColor1={shorelineColor1}
            shorelineColor2={shorelineColor2}
            waveSpeed={waveSpeed}
            waveAmplitude={waveAmplitude}
            noiseScale={noiseScale}
            gradientSharpness={gradientSharpness}
            debugMode={debugMode}
          />
        )}
      </group>
    );
  }
);
