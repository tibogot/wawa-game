import React, { forwardRef, useMemo } from "react";
import { useControls, folder } from "leva";
import { Clouds, Cloud } from "@react-three/drei";
import { HeightMapUnreal } from "./HeightMapUnreal";
import { HeightFog } from "./HeightFog";
import { ButterflyParticles } from "./ButterflyParticles";
import { DustParticles } from "./DustParticles";
import { RainParticles3D } from "./RainParticles3D";
import { WindFlag } from "./WindFlag";
import { Mountain } from "./Mountain";
import * as THREE from "three";

export const Map3 = forwardRef<any, any>(
  (
    { scale = 1, position = [0, 0, 0] as [number, number, number], ...props },
    ref
  ) => {
    // Function to get terrain height using raycasting on the actual terrain mesh
    const getTerrainHeight = useMemo(() => {
      return (x: number, z: number): number => {
        if (!ref || typeof ref === "function" || !ref.current) return 0;

        const terrainMesh = ref.current as THREE.Mesh;
        if (!terrainMesh || !terrainMesh.geometry) return 0;

        // Create a ray from above the terrain pointing down
        const rayOrigin = new THREE.Vector3(x, 1000, z); // Start high above
        const rayDirection = new THREE.Vector3(0, -1, 0); // Point down

        const raycaster = new THREE.Raycaster(rayOrigin, rayDirection);
        const intersects = raycaster.intersectObject(terrainMesh);

        if (intersects.length > 0) {
          return intersects[0].point.y;
        }

        return 0; // Fallback if no intersection
      };
    }, [ref]);
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
      cloudSeed,
      cloudsLimit,
      cloudsRange,
      frustumCulled,
      butterflyEnabled,
      butterflyCount,
      butterflySpawnRange,
      butterflyMaxDistance,
      butterflySize,
      butterflyTexture,
      butterflyHeightMin,
      butterflyHeightMax,
      butterflySpreadRadius,
      heightFogEnabled,
      fogColor,
      fogHeight,
      fogNear,
      fogFar,
      dustEnabled,
      dustCount,
      dustSpawnRange,
      dustMaxDistance,
      dustSize,
      rainEnabled,
      rainDensity,
      rainAreaSize,
      rainHeight,
      rainSpeed,
      rainParticleSize,
      rainColor,
      rainOpacity,
    } = useControls("🌤️ AMBIENCE", {
      clouds: folder(
        {
          enabled: { value: false, label: "☁️ Enable Clouds" },
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
          cloudSeed: {
            value: 0,
            label: "Seed",
            min: 0,
            max: 1000,
            step: 1,
          },
          cloudsLimit: {
            value: 200,
            label: "Clouds Limit",
            min: 50,
            max: 500,
            step: 10,
          },
          cloudsRange: {
            value: 200,
            label: "Clouds Range (200 = all)",
            min: 0,
            max: 200,
            step: 10,
          },
          frustumCulled: {
            value: true,
            label: "Frustum Culled",
          },
        },
        { collapsed: true }
      ),
      butterflyParticles: folder(
        {
          butterflyEnabled: { value: false, label: "🦋 Enable Butterflies" },
          butterflyCount: {
            value: 8,
            label: "Count",
            min: 1,
            max: 50,
            step: 1,
          },
          butterflySpawnRange: {
            value: 40.0,
            label: "Spawn Range",
            min: 10,
            max: 100,
            step: 5,
          },
          butterflyMaxDistance: {
            value: 100.0,
            label: "Max Distance",
            min: 50,
            max: 500,
            step: 10,
          },
          butterflySize: {
            value: [0.5, 1.25] as [number, number],
            label: "Size [Width, Height]",
            step: 0.1,
          },
          butterflyTexture: {
            value: "butterfly" as "butterfly" | "moth" | "both",
            label: "Texture",
            options: ["butterfly", "moth", "both"],
          },
          butterflyHeightMin: {
            value: 2.0,
            label: "Height Min",
            min: 0,
            max: 20,
            step: 0.5,
          },
          butterflyHeightMax: {
            value: 5.0,
            label: "Height Max",
            min: 1,
            max: 30,
            step: 0.5,
          },
          butterflySpreadRadius: {
            value: 1.0,
            label: "Spread Radius",
            min: 0.1,
            max: 3.0,
            step: 0.1,
          },
        },
        { collapsed: true }
      ),
      heightFog: folder(
        {
          heightFogEnabled: { value: true, label: "🌫️ Enable Height Fog" },
          fogColor: { value: "#cccccc", label: "Fog Color" },
          fogHeight: {
            value: 50.0,
            label: "Fog Height",
            min: 0,
            max: 200,
            step: 5,
          },
          fogNear: {
            value: 1,
            label: "Fog Near",
            min: 0.1,
            max: 50,
            step: 1,
          },
          fogFar: {
            value: 2300,
            label: "Fog Far",
            min: 10,
            max: 5000,
            step: 10,
          },
        },
        { collapsed: true }
      ),
      dustParticles: folder(
        {
          dustEnabled: { value: false, label: "✨ Enable Dust Particles" },
          dustCount: {
            value: 8,
            label: "Count",
            min: 1,
            max: 50,
            step: 1,
          },
          dustSpawnRange: {
            value: 20.0,
            label: "Spawn Range",
            min: 5,
            max: 100,
            step: 5,
          },
          dustMaxDistance: {
            value: 50.0,
            label: "Max Distance",
            min: 20,
            max: 200,
            step: 10,
          },
          dustSize: {
            value: [0.4, 0.4] as [number, number],
            label: "Size [Width, Height]",
            step: 0.1,
          },
        },
        { collapsed: true }
      ),
      rainParticles: folder(
        {
          rainEnabled: { value: false, label: "💧 Enable Rain" },
          rainDensity: {
            value: 500,
            label: "Density",
            min: 100,
            max: 2000,
            step: 50,
          },
          rainAreaSize: {
            value: 50.0,
            label: "Area Size",
            min: 20,
            max: 200,
            step: 10,
          },
          rainHeight: {
            value: 20.0,
            label: "Rain Height",
            min: 5,
            max: 100,
            step: 5,
          },
          rainSpeed: {
            value: 8.0,
            label: "Fall Speed",
            min: 2,
            max: 20,
            step: 1,
          },
          rainParticleSize: {
            value: 0.01,
            label: "Particle Size",
            min: 0.005,
            max: 0.05,
            step: 0.001,
          },
          rainColor: {
            value: "#d0e0ff",
            label: "Rain Color",
          },
          rainOpacity: {
            value: 0.4,
            label: "Opacity",
            min: 0.1,
            max: 1.0,
            step: 0.05,
          },
        },
        { collapsed: true }
      ),
    });

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
    } = useControls("🏛️ OBJECTS", {
      windFlag: folder(
        {
          windFlagEnabled: { value: false, label: "🏳️ Enable Wind Flag" },
          windFlagPosition: {
            value: [10, 0, 10],
            label: "📍 Position [X, Z]",
            step: 1,
          },
          windFlagYOffset: {
            value: 0.0,
            min: -5.0,
            max: 5.0,
            step: 0.1,
            label: "⬆️ Y Height Offset",
          },
          windFlagScale: {
            value: 1.0,
            min: 0.1,
            max: 3.0,
            step: 0.1,
            label: "📏 Scale",
          },
          windFlagColor: {
            value: "#ff0000",
            label: "🎨 Flag Color",
          },
          windFlagPoleHeight: {
            value: 8,
            min: 3,
            max: 20,
            step: 0.5,
            label: "📏 Pole Height",
          },
          windFlagWidth: {
            value: 3,
            min: 1,
            max: 8,
            step: 0.5,
            label: "📐 Flag Width",
          },
          windFlagHeight: {
            value: 2,
            min: 1,
            max: 6,
            step: 0.5,
            label: "📐 Flag Height",
          },
          windFlagSegments: {
            value: 20,
            min: 10,
            max: 50,
            step: 5,
            label: "🔢 Segments (Quality)",
          },
          windFlagUseTexture: {
            value: true,
            label: "🖼️ Use Texture",
          },
          windFlagTexturePath: {
            value: "/textures/flag.png",
            label: "📁 Texture Path",
          },
          windFlagTextureQuality: {
            value: 16,
            min: 1,
            max: 16,
            step: 1,
            label: "✨ Texture Quality",
          },
          windFlagWaveIntensity: {
            value: 0.8,
            min: 0.1,
            max: 2.0,
            step: 0.1,
            label: "🌊 Wave Intensity",
          },
        },
        { collapsed: true }
      ),
      mountain: folder(
        {
          mountainEnabled: { value: false, label: "🏔️ Enable Mountain" },
          mountainPosition: {
            value: [0, 0, 0],
            label: "📍 Position [X, Y, Z]",
            step: 1,
          },
          mountainScale: {
            value: [1, 1, 1],
            label: "📏 Scale [X, Y, Z]",
            step: 0.1,
          },
          mountainRotation: {
            value: [0, 0, 0],
            label: "🔄 Rotation [X, Y, Z]",
            step: 0.1,
          },
          mountainColor: {
            value: "#8B7355",
            label: "🎨 Base Color",
          },
          mountainOpacity: {
            value: 1.0,
            min: 0.0,
            max: 1.0,
            step: 0.1,
            label: "👻 Opacity",
          },
          mountainRoughness: {
            value: 0.8,
            min: 0.0,
            max: 1.0,
            step: 0.1,
            label: "🔳 Roughness",
          },
          mountainMetalness: {
            value: 0.0,
            min: 0.0,
            max: 1.0,
            step: 0.1,
            label: "✨ Metalness",
          },
          mountainEmissive: {
            value: "#000000",
            label: "💡 Emissive Color",
          },
          mountainEmissiveIntensity: {
            value: 0.0,
            min: 0.0,
            max: 2.0,
            step: 0.1,
            label: "💡 Emissive Intensity",
          },
        },
        { collapsed: true }
      ),
    });

    // Calculate terrain height for WindFlag position
    // WindFlag positions pole center at poleHeight/2 above group position
    // So we need to place group at terrainHeight - poleHeight/2 to get pole base at terrainHeight
    // Add user-adjustable Y offset
    const windFlagTerrainHeight = windFlagEnabled
      ? getTerrainHeight(windFlagPosition[0], windFlagPosition[2]) -
        windFlagPoleHeight / 2 +
        windFlagYOffset
      : 0;

    // Debug: Log the calculated height
    if (windFlagEnabled) {
      console.log(
        `WindFlag at [${windFlagPosition[0]}, ${windFlagPosition[2]}] -> terrain height: ${windFlagTerrainHeight}`
      );
    }

    return (
      <group>
        <HeightFog
          enabled={heightFogEnabled}
          fogColor={fogColor}
          fogHeight={fogHeight}
          fogNear={fogNear}
          fogFar={fogFar}
        />
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
          <Clouds
            limit={cloudsLimit}
            range={cloudsRange === 200 ? undefined : cloudsRange}
            frustumCulled={frustumCulled}
          >
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
              seed={cloudSeed}
            />
          </Clouds>
        )}
        {/* Render single texture when not "both" */}
        {butterflyEnabled && butterflyTexture !== "both" && (
          <ButterflyParticles
            enabled={butterflyEnabled}
            count={butterflyCount}
            spawnRange={butterflySpawnRange}
            maxDistance={butterflyMaxDistance}
            butterflySize={butterflySize}
            texture={butterflyTexture as "butterfly" | "moth" | "both"}
            heightMin={butterflyHeightMin}
            heightMax={butterflyHeightMax}
            spreadRadius={butterflySpreadRadius}
          />
        )}
        {/* Render both butterflies AND moths when "both" is selected */}
        {butterflyEnabled && butterflyTexture === "both" && (
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
            />
          </>
        )}
        {/* Dust Particles */}
        {dustEnabled && (
          <DustParticles
            enabled={dustEnabled}
            count={dustCount}
            spawnRange={dustSpawnRange}
            maxDistance={dustMaxDistance}
            dustSize={dustSize}
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
        {/* Wind Flag */}
        {windFlagEnabled && (
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
      </group>
    );
  }
);
