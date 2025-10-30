import {
  Environment,
  OrthographicCamera,
  OrbitControls,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useControls, folder } from "leva";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { GodotCharacterHybrid } from "./GodotCharacterHybrid";
import * as THREE from "three";
import { Map1 } from "./Map1";
import { Map2 } from "./Map2";
import { Map3 } from "./Map3";
import { Map4 } from "./Map4";
import { Map5 } from "./Map5";
import { Map6 } from "./Map6";
import { Map7 } from "./Map7";
import { Map8 } from "./Map8";
import { Map9 } from "./Map9";
import { Map10 } from "./Map10";
import { DeerController } from "./DeerController";
import { DeerHerd } from "./DeerHerd";
import { useLightsControls } from "./useLightsControls";
import {
  getSafeSpawnPosition,
  getTerrainHeightFromTexture,
} from "../utils/terrainUtils";
import { SSAOEffect } from "./SSAOEffect";

const maps = {
  map1: {
    scale: 1,
    position: [0, 0, 0],
  },
  map2: {
    scale: 1,
    position: [0, 0, 0],
  },
  map3: {
    scale: 1,
    position: [0, 0, 0],
  },
  map4: {
    scale: 1,
    position: [0, 0, 0],
  },
  map5: {
    scale: 1,
    position: [0, 0, 0],
  },
  map6: {
    scale: 1,
    position: [0, 0, 0],
  },
  map7: {
    scale: 1,
    position: [0, 0, 0],
  },
  map8: {
    scale: 1,
    position: [0, 0, 0],
  },
  map9: {
    scale: 1,
    position: [0, 0, 0],
  },
  map10: {
    scale: 1,
    position: [0, 0, 0],
  },
};

export const Experience = () => {
  const directionalLightRef = useRef();
  const terrainMeshRef = useRef(null);
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState([
    0, 10, 0,
  ]);
  const [deerSpawnPosition, setDeerSpawnPosition] = useState([5, 1, 5]);
  const [isTerrainReady, setIsTerrainReady] = useState(false); // Track terrain readiness

  // Debug: Log when isTerrainReady changes
  useEffect(() => {
    console.log(`🔍 isTerrainReady changed to: ${isTerrainReady}`);
  }, [isTerrainReady]);

  // Track character position and velocity for dynamic effects
  const characterPositionVector = useRef(new THREE.Vector3());
  const characterVelocity = useRef(new THREE.Vector3());
  const { map, cameraMode } = useControls("Map", {
    map: {
      value: "map1",
      options: Object.keys(maps),
    },
    cameraMode: {
      value: "follow",
      options: ["follow", "orbit"],
      label: "Camera Mode",
    },
  });

  const { showRapierDebug, rapierDebugColor } = useControls("🐛 DEBUG", {
    showRapierDebug: {
      value: false,
      label: "🔍 Show Rapier Physics Debug",
    },
    rapierDebugColor: {
      value: "#00ff00",
      label: "🎨 Debug Wireframe Color",
    },
  });

  // Get lights controls from separate hook
  const {
    envType,
    envPreset,
    envCustomUrl,
    envIntensity,
    envBackground,
    envBackgroundBlurriness,
    envBackgroundIntensity,
    ambientIntensity,
    directionalIntensity,
    directionalPosition: defaultDirectionalPosition,
    directionalColor,
    shadowMapSize,
    shadowBias,
    shadowNormalBias,
    shadowRadius,
    shadowCameraLeft,
    shadowCameraRight,
    shadowCameraTop,
    shadowCameraBottom,
    shadowCameraNear,
    shadowCameraFar,
    followCharacter,
    showTestSphere,
  } = useLightsControls();

  // Override directional position for Map9 - memoized for stable reference
  const directionalPosition = useMemo(
    () => (map === "map9" ? [-15, 80, 15] : defaultDirectionalPosition),
    [map, defaultDirectionalPosition]
  );

  // Callback when terrain is ready (for Map5 and Map8)
  const handleTerrainReady = useCallback(() => {
    console.log(
      "✅ Terrain ready callback triggered, spawning character in 200ms..."
    );
    console.trace("Call stack for terrain ready:");
    setTimeout(() => {
      console.log("✅ Setting isTerrainReady to TRUE");
      setIsTerrainReady(true);
    }, 200); // Additional delay to ensure physics colliders are fully ready
  }, []);

  // Track previous map to detect actual changes (initialize to null for first run)
  const prevMapRef = useRef(null);

  // Calculate smart spawn positions when map changes
  useEffect(() => {
    // Only reset if map actually changed (allow first run when prevMapRef is null)
    if (prevMapRef.current === null || prevMapRef.current !== map) {
      console.log(
        `🗺️ Map changed from ${prevMapRef.current} to ${map}, resetting terrain ready`
      );
      prevMapRef.current = map;
      // Reset terrain ready state when map changes
      setIsTerrainReady(false);
    } else {
      console.log(
        `🔍 Map useEffect ran but map is still: ${map}, NOT resetting terrain ready`
      );
      return; // Exit early if map hasn't changed
    }

    // For Map5, Map8, Map9, and Map10, wait for terrain callback. For others, mark ready immediately
    if (map !== "map5" && map !== "map8" && map !== "map9" && map !== "map10") {
      setIsTerrainReady(true);
    }

    if (map === "map3") {
      // Use texture-based calculation for Map3 (no delay needed)
      // Map3 parameters: size=4000, heightScale=200, peak at Y=0
      const characterHeight = getTerrainHeightFromTexture(
        0,
        0,
        null,
        4000,
        200,
        0
      );
      const deerHeight = getTerrainHeightFromTexture(5, 5, null, 4000, 200, 0);

      const characterPos = [0, characterHeight + 2, 0];
      const deerPos = [5, 1, 5]; // Fixed at ground level with slight clearance

      setCharacterSpawnPosition(characterPos);
      setDeerSpawnPosition(deerPos);
    } else if (map === "map5") {
      // For Map5 (ZeldaTerrain2), the terrain is positioned so center peak is at Y=0
      // So spawn character at Y=2 (2 units above the center peak)
      const characterPos = [0, 2, 0];
      const deerPos = [5, 2, 5];

      setCharacterSpawnPosition(characterPos);
      setDeerSpawnPosition(deerPos);
    } else if (map === "map6") {
      // For Map6 (Zeldaterrain1), simple terrain with basic spawn
      const characterPos = [0, 5, 0];
      const deerPos = [5, 5, 5];

      setCharacterSpawnPosition(characterPos);
      setDeerSpawnPosition(deerPos);
    } else if (map === "map7") {
      // For Map7 (ProceduralTerrain2), simple procedural terrain
      const characterPos = [0, 5, 0];
      const deerPos = [5, 5, 5];

      setCharacterSpawnPosition(characterPos);
      setDeerSpawnPosition(deerPos);
    } else if (map === "map8") {
      // For Map8 (ProceduralTerrain3), procedural terrain with adjustable flatness
      // Spawn higher to give terrain time to fully initialize physics colliders
      const characterPos = [0, 50, 0];
      const deerPos = [5, 50, 5];

      setCharacterSpawnPosition(characterPos);
      setDeerSpawnPosition(deerPos);
    } else if (map === "map9") {
      // For Map9 (ProceduralTerrain4 with Simplex Noise), BOTW-style terrain
      // Spawn higher to give terrain time to fully initialize physics colliders
      const characterPos = [0, 50, 0];
      const deerPos = [5, 50, 5];

      setCharacterSpawnPosition(characterPos);
      setDeerSpawnPosition(deerPos);
    } else if (map === "map10") {
      // For Map10 (ZeldaTerrainSmooth), centered peak at Y=0 similar to Map5
      const characterPos = [0, 2, 0];
      const deerPos = [5, 2, 5];

      setCharacterSpawnPosition(characterPos);
      setDeerSpawnPosition(deerPos);
    } else {
      // For other maps, use default positions
      setCharacterSpawnPosition([0, 2, 0]);
      setDeerSpawnPosition([5, 1, 5]);
    }
  }, [map]);

  // Update shadow camera position to follow character when enabled
  useFrame(() => {
    if (followCharacter && directionalLightRef.current && isTerrainReady) {
      const light = directionalLightRef.current;

      // Access shadow camera from light's shadow object
      if (!light.shadow || !light.shadow.camera) return;

      const shadowCamera = light.shadow.camera;
      const charPos = characterPositionVector.current;

      // Calculate light direction (normalized direction from light position)
      const lightDir = new THREE.Vector3(...directionalPosition).normalize();

      // For directional light shadows, position camera above character in light direction
      // The camera should be far enough to see the character + tight bounds area
      const cameraHeight = 50; // Height above character
      const lightReversed = lightDir.clone().multiplyScalar(-1); // Reverse direction

      shadowCamera.position.set(
        charPos.x + lightReversed.x * cameraHeight,
        charPos.y + lightReversed.y * cameraHeight + cameraHeight,
        charPos.z + lightReversed.z * cameraHeight
      );

      // Point camera at character
      shadowCamera.lookAt(charPos.x, charPos.y, charPos.z);

      // Update light target (important for directional light shadows)
      if (light.target) {
        light.target.position.set(charPos.x, charPos.y, charPos.z);
        light.target.updateMatrixWorld();
      }

      // Reduce frustum bounds for high-quality shadows (smaller = sharper)
      const tightBounds = 15;
      shadowCamera.left = -tightBounds;
      shadowCamera.right = tightBounds;
      shadowCamera.top = tightBounds;
      shadowCamera.bottom = -tightBounds;

      // Update matrices and force shadow update
      shadowCamera.updateProjectionMatrix();
      shadowCamera.updateMatrixWorld();
      light.shadow.needsUpdate = true;
      light.shadow.updateMatrices(light);
    } else if (!followCharacter && directionalLightRef.current) {
      // Restore original bounds when not following
      const light = directionalLightRef.current;
      if (light.shadow && light.shadow.camera) {
        const shadowCamera = light.shadow.camera;
        shadowCamera.left = shadowCameraLeft;
        shadowCamera.right = shadowCameraRight;
        shadowCamera.top = shadowCameraTop;
        shadowCamera.bottom = shadowCameraBottom;
        shadowCamera.updateProjectionMatrix();
        light.shadow.needsUpdate = true;
        light.shadow.updateMatrices(light);
      }
    }
  });

  return (
    <>
      {cameraMode === "orbit" && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={2000}
        />
      )}
      {envType === "preset" ? (
        <Environment
          preset={envPreset}
          environmentIntensity={envIntensity}
          background={envBackground}
          backgroundBlurriness={envBackgroundBlurriness}
          backgroundIntensity={envBackgroundIntensity}
        />
      ) : (
        <Environment
          files={envCustomUrl}
          environmentIntensity={envIntensity}
          background={envBackground}
          backgroundBlurriness={envBackgroundBlurriness}
          backgroundIntensity={envBackgroundIntensity}
        />
      )}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        ref={directionalLightRef}
        intensity={directionalIntensity}
        color={directionalColor}
        castShadow
        position={directionalPosition}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-bias={shadowBias}
        shadow-normalBias={shadowNormalBias}
        shadow-radius={shadowRadius}
      >
        <OrthographicCamera
          left={shadowCameraLeft}
          right={shadowCameraRight}
          top={shadowCameraTop}
          bottom={shadowCameraBottom}
          near={shadowCameraNear}
          far={shadowCameraFar}
          attach={"shadow-camera"}
        />
      </directionalLight>
      <Physics key={map} debug={showRapierDebug}>
        {map === "map1" ? (
          <Map1
            scale={maps[map].scale}
            position={maps[map].position}
            characterPosition={characterPositionVector.current}
            characterVelocity={characterVelocity.current}
          />
        ) : map === "map2" ? (
          <Map2 scale={maps[map].scale} position={maps[map].position} />
        ) : map === "map3" ? (
          <Map3
            ref={terrainMeshRef}
            scale={maps[map].scale}
            position={maps[map].position}
            characterPosition={characterPositionVector.current}
            characterVelocity={characterVelocity.current}
          />
        ) : map === "map4" ? (
          <Map4 scale={maps[map].scale} position={maps[map].position} />
        ) : map === "map5" ? (
          <Map5
            ref={terrainMeshRef}
            scale={maps[map].scale}
            position={maps[map].position}
            characterPosition={characterPositionVector.current}
            characterVelocity={characterVelocity.current}
            onTerrainReady={handleTerrainReady}
          />
        ) : map === "map6" ? (
          <Map6
            scale={maps[map].scale}
            position={maps[map].position}
            characterPosition={characterPositionVector.current}
            characterVelocity={characterVelocity.current}
          />
        ) : map === "map7" ? (
          <Map7 scale={maps[map].scale} position={maps[map].position} />
        ) : map === "map8" ? (
          <Map8
            ref={terrainMeshRef}
            scale={maps[map].scale}
            position={maps[map].position}
            characterPosition={characterPositionVector.current}
            characterVelocity={characterVelocity.current}
            onTerrainReady={handleTerrainReady}
          />
        ) : map === "map9" ? (
          <Map9
            ref={terrainMeshRef}
            scale={maps[map].scale}
            position={maps[map].position}
            characterPosition={characterPositionVector.current}
            characterVelocity={characterVelocity.current}
            onTerrainReady={handleTerrainReady}
          />
        ) : (
          <Map10
            ref={terrainMeshRef}
            scale={maps[map].scale}
            position={maps[map].position}
            characterPosition={characterPositionVector.current}
            characterVelocity={characterVelocity.current}
            onTerrainReady={handleTerrainReady}
          />
        )}
        {/* Only spawn character when terrain is ready */}
        {isTerrainReady && (
          <GodotCharacterHybrid
            cameraMode={cameraMode}
            position={characterSpawnPosition}
            onPositionChange={(pos) => {
              characterPositionVector.current.set(pos[0], pos[1], pos[2]);
            }}
            onVelocityChange={(vel) => {
              characterVelocity.current.set(vel[0], vel[1], vel[2]);
            }}
          />
        )}
        {/* Only spawn deer when terrain is ready */}
        {isTerrainReady && (
          <>
            <DeerController
              position={deerSpawnPosition}
              terrainMesh={terrainMeshRef.current}
            />
            <DeerHerd
              terrainMesh={terrainMeshRef.current}
              spawnHeight={deerSpawnPosition[1]}
            />
          </>
        )}
      </Physics>
      {showTestSphere && (
        <mesh position={[0, 2, 5]} castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            metalness={0.8}
            roughness={0.2}
            envMapIntensity={envIntensity}
          />
        </mesh>
      )}
      {/* Post-processing effects */}
      <SSAOEffect />
    </>
  );
};
