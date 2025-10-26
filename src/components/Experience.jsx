import {
  Environment,
  OrthographicCamera,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useControls, folder } from "leva";
import { useRef, useState, useEffect } from "react";
import { GodotCharacterHybrid } from "./GodotCharacterHybrid";
import { Map1 } from "./Map1";
import { Map2 } from "./Map2";
import { Map3 } from "./Map3";
import { Map4 } from "./Map4";
import { DeerController } from "./DeerController";
import { DeerHerd } from "./DeerHerd";
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
};

export const Experience = () => {
  const shadowCameraRef = useRef();
  const terrainMeshRef = useRef(null);
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState([
    0, 10, 0,
  ]);
  const [deerSpawnPosition, setDeerSpawnPosition] = useState([5, 1, 5]);
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
  } = useControls("💡 LIGHTS", {
    environment: folder(
      {
        envType: {
          value: "custom",
          options: ["preset", "custom"],
          label: "Type",
        },
        envPreset: {
          value: "sunset",
          options: [
            "apartment",
            "city",
            "dawn",
            "forest",
            "lobby",
            "night",
            "park",
            "studio",
            "sunset",
            "warehouse",
          ],
          label: "Preset",
        },
        envCustomUrl: {
          value:
            "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rustig_koppie_puresky_4k.hdr",
          label: "HDRI URL",
        },
        envIntensity: {
          value: 1,
          min: 0,
          max: 5,
          step: 0.1,
          label: "Intensity",
        },
        envBackground: {
          value: true,
          label: "Show as Background",
        },
        envBackgroundBlurriness: {
          value: 0,
          min: 0,
          max: 1,
          step: 0.01,
          label: "Background Blur",
        },
        envBackgroundIntensity: {
          value: 0.7,
          min: 0,
          max: 5,
          step: 0.1,
          label: "Background Intensity",
        },
      },
      { collapsed: true }
    ),
    ambient: folder(
      {
        ambientIntensity: {
          value: 0.4,
          min: 0,
          max: 2,
          step: 0.1,
          label: "Intensity",
        },
      },
      { collapsed: true }
    ),
    sun: folder(
      {
        directionalIntensity: {
          value: 0.65,
          min: 0,
          max: 3,
          step: 0.05,
          label: "Intensity",
        },
        directionalColor: {
          value: "#ffffff",
          label: "Color",
        },
        directionalPosition: {
          value: [-15, 10, 15],
          label: "Position [X, Y, Z]",
        },
        shadowMapSize: {
          value: 2048,
          options: [512, 1024, 2048, 4096, 8192],
          label: "Shadow Map Size",
        },
        shadowBias: {
          value: -0.00005,
          min: -0.001,
          max: 0.001,
          step: 0.00001,
          label: "Shadow Bias",
        },
        shadowNormalBias: {
          value: 0.0,
          min: 0,
          max: 0.1,
          step: 0.001,
          label: "Normal Bias",
        },
        shadowRadius: {
          value: 4,
          min: 0,
          max: 20,
          step: 1,
          label: "Shadow Blur Radius",
        },
      },
      { collapsed: true }
    ),
    shadows: folder(
      {
        shadowCameraLeft: {
          value: -22,
          min: -100,
          max: 100,
          step: 1,
          label: "Left Bound",
        },
        shadowCameraRight: {
          value: 15,
          min: -100,
          max: 100,
          step: 1,
          label: "Right Bound",
        },
        shadowCameraTop: {
          value: 10,
          min: -100,
          max: 100,
          step: 1,
          label: "Top Bound",
        },
        shadowCameraBottom: {
          value: -20,
          min: -100,
          max: 100,
          step: 1,
          label: "Bottom Bound",
        },
        shadowCameraNear: {
          value: 0.1,
          min: 0.1,
          max: 1000,
          step: 1,
          label: "Near Plane",
        },
        shadowCameraFar: {
          value: 1000,
          min: 1,
          max: 5000,
          step: 10,
          label: "Far Plane",
        },
      },
      { collapsed: true }
    ),
    debug: folder(
      {
        showTestSphere: {
          value: true,
          label: "Show Test Sphere",
        },
      },
      { collapsed: true }
    ),
  });

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
    } else {
      // For other maps, use default positions
      setCharacterSpawnPosition([0, 2, 0]);
      setDeerSpawnPosition([5, 1, 5]);
    }
  }, [map]);

  return (
    <>
      {cameraMode === "orbit" ? (
        <>
          <PerspectiveCamera
            makeDefault
            position={[0, 50, 100]}
            fov={75}
            near={0.1}
            far={5000}
          />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={2000}
          />
        </>
      ) : (
        <PerspectiveCamera makeDefault fov={75} near={0.1} far={5000} />
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
          <Map1 scale={maps[map].scale} position={maps[map].position} />
        ) : map === "map2" ? (
          <Map2 scale={maps[map].scale} position={maps[map].position} />
        ) : map === "map3" ? (
          <Map3
            ref={terrainMeshRef}
            scale={maps[map].scale}
            position={maps[map].position}
          />
        ) : (
          <Map4 scale={maps[map].scale} position={maps[map].position} />
        )}
        <GodotCharacterHybrid
          cameraMode={cameraMode}
          position={characterSpawnPosition}
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
