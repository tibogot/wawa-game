import {
  Environment,
  OrthographicCamera,
  OrbitControls,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useControls, folder } from "leva";
import { useRef, useState, useEffect } from "react";
import { GodotCharacterHybrid } from "./GodotCharacterHybrid";
import * as THREE from "three";
import { Map1 } from "./Map1";
import { Map2 } from "./Map2";
import { Map3 } from "./Map3";
import { Map4 } from "./Map4";
import { Map5 } from "./Map5";
import { DeerController } from "./DeerController";
import { DeerHerd } from "./DeerHerd";
import { useLightsControls } from "./useLightsControls";
import {
  getSafeSpawnPosition,
  getTerrainHeightFromTexture,
} from "../utils/terrainUtils";

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
};

export const Experience = () => {
  const shadowCameraRef = useRef();
  const terrainMeshRef = useRef(null);
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState([
    0, 10, 0,
  ]);
  const [deerSpawnPosition, setDeerSpawnPosition] = useState([5, 1, 5]);

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
    directionalPosition,
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
    showTestSphere,
  } = useLightsControls();

  // Calculate smart spawn positions when map changes
  useEffect(() => {
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
      // Use texture-based calculation for Map5 (ZeldaTerrain2)
      // Map5 parameters: worldSize=1000, displacementScale=50, peak at Y=0
      const characterHeight = getTerrainHeightFromTexture(
        0,
        0,
        null,
        1000,
        50,
        0
      );
      const deerHeight = getTerrainHeightFromTexture(5, 5, null, 1000, 50, 0);

      const characterPos = [0, characterHeight + 2, 0];
      const deerPos = [5, 1, 5]; // Fixed at ground level with slight clearance

      setCharacterSpawnPosition(characterPos);
      setDeerSpawnPosition(deerPos);
    } else {
      // For other maps, use default positions
      setCharacterSpawnPosition([0, 2, 0]);
      setDeerSpawnPosition([5, 1, 5]);
    }
  }, [map]);

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
          ref={shadowCameraRef}
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
        ) : (
          <Map5
            ref={terrainMeshRef}
            scale={maps[map].scale}
            position={maps[map].position}
          />
        )}
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
        <DeerController
          position={deerSpawnPosition}
          terrainMesh={terrainMeshRef.current}
        />
        <DeerHerd terrainMesh={terrainMeshRef.current} />
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
    </>
  );
};
