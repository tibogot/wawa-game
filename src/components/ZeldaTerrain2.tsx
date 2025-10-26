import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { useControls } from "leva";
import { RigidBody, useRapier } from "@react-three/rapier";
import { Detailed } from "@react-three/drei";

// Tile interface for TypeScript
interface TerrainTile {
  x: number;
  z: number;
  centerX: number;
  centerZ: number;
  distanceToCamera: number;
  currentLOD: number | null;
  mesh: THREE.Mesh | null;
  tileSize: number;
  lastUpdateTime: number;
}

// Tiled Terrain LOD Component - Like your grass system
const TiledTerrainLOD = ({
  worldSize,
  segmentCount,
  lodSegment1,
  lodSegment2,
  lodSegment3,
  lodDistance1,
  lodDistance2,
  lodDistance3,
  terrainMaterial,
  lodMaterials,
  showLODColors,
  createTerrainGeometry,
  camera,
  showLODInfo,
}) => {
  const [tiles, setTiles] = useState<TerrainTile[]>([]);
  const lastUpdateTime = useRef(0);
  const tilesRef = useRef<TerrainTile[]>([]);

  // Create terrain tiles
  useEffect(() => {
    const TILE_SIZE = worldSize / 4; // 4x4 grid of tiles
    const tilesPerSide = 4;
    const newTiles: TerrainTile[] = [];

    for (let x = 0; x < tilesPerSide; x++) {
      for (let z = 0; z < tilesPerSide; z++) {
        const tileX = (x - tilesPerSide / 2) * TILE_SIZE + TILE_SIZE / 2;
        const tileZ = (z - tilesPerSide / 2) * TILE_SIZE + TILE_SIZE / 2;

        newTiles.push({
          x: tileX,
          z: tileZ,
          centerX: tileX,
          centerZ: tileZ,
          distanceToCamera: 0,
          currentLOD: null,
          mesh: null,
          tileSize: TILE_SIZE,
          lastUpdateTime: 0,
        });
      }
    }

    tilesRef.current = newTiles;
    setTiles(newTiles);
  }, [worldSize]);

  // Update LOD for each tile based on camera distance
  useFrame(() => {
    if (tilesRef.current.length === 0) return;

    const now = Date.now();
    if (now - lastUpdateTime.current < 100) return; // Update every 100ms
    lastUpdateTime.current = now;

    const cameraPos = camera.position;
    let updated = false;

    tilesRef.current.forEach((tile) => {
      // Calculate 2D distance from tile center to camera
      const distance = Math.sqrt(
        Math.pow(tile.centerX - cameraPos.x, 2) +
          Math.pow(tile.centerZ - cameraPos.z, 2)
      );

      tile.distanceToCamera = distance;

      // Determine LOD level based on distance
      let newLOD;
      if (distance < lodDistance1) {
        newLOD = 0; // High detail
      } else if (distance < lodDistance2) {
        newLOD = 1; // Medium detail
      } else if (distance < lodDistance3) {
        newLOD = 2; // Low detail
      } else {
        newLOD = 3; // Lowest detail
      }

      // Update tile if LOD changed
      if (tile.currentLOD !== newLOD) {
        tile.currentLOD = newLOD;
        tile.lastUpdateTime = now;
        updated = true;

        if (showLODInfo) {
          const colors = ["🔴 Red", "🟡 Yellow", "🟢 Green", "🔵 Blue"];
          console.log(
            `🎯 Tile LOD: ${newLOD} (${
              colors[newLOD]
            }) - Distance: ${distance.toFixed(1)} units`
          );
        }
      }
    });

    if (updated) {
      setTiles([...tilesRef.current]);
    }
  });

  return (
    <group>
      {tiles.map((tile, index) => {
        if (tile.currentLOD === null) return null;

        // Determine geometry and material based on LOD
        let geometry;
        let material;

        switch (tile.currentLOD) {
          case 0:
            geometry = createTerrainGeometry(segmentCount);
            material = showLODColors ? lodMaterials.lod0 : terrainMaterial;
            break;
          case 1:
            geometry = createTerrainGeometry(lodSegment1);
            material = showLODColors ? lodMaterials.lod1 : terrainMaterial;
            break;
          case 2:
            geometry = createTerrainGeometry(lodSegment2);
            material = showLODColors ? lodMaterials.lod2 : terrainMaterial;
            break;
          case 3:
            geometry = createTerrainGeometry(lodSegment3);
            material = showLODColors ? lodMaterials.lod3 : terrainMaterial;
            break;
          default:
            return null;
        }

        return (
          <mesh
            key={`tile-${index}`}
            position={[tile.centerX, 0, tile.centerZ]}
            material={material}
            receiveShadow
            castShadow={false}
          >
            <primitive object={geometry} />
          </mesh>
        );
      })}
    </group>
  );
};

// Main ZeldaTerrain2 Component - Brand new terrain system
const ZeldaTerrain2: React.FC<{
  onHeightmapReady?: (fn: (x: number, z: number) => number) => void;
}> = ({ onHeightmapReady }) => {
  // Load the heightmap texture
  const heightMap = useLoader(TextureLoader, "/textures/unreal-heightmap.png");

  // Get camera for LOD debugging
  const { camera } = useThree();
  const [cameraDistance, setCameraDistance] = useState(0);

  // Leva controls for terrain configuration
  const {
    worldSize,
    displacementScale,
    segmentCount,
    terrainHeight,
    roughness,
    metalness,
    showWireframe,
    useHeightmapAsTexture,
    terrainColor,
    enableLOD,
    lodDistance1,
    lodDistance2,
    lodDistance3,
    lodSegment1,
    lodSegment2,
    lodSegment3,
    showLODColors,
    showLODInfo,
    enableHeightGradient,
    lowHeightColor,
    midHeightColor,
    highHeightColor,
    lowHeightThreshold,
    highHeightThreshold,
    centerRegionSize,
  } = useControls("🗻 Zelda Terrain 2", {
    worldSize: {
      value: 1000,
      min: 500,
      max: 5000,
      step: 100,
      label: "World Size",
    },
    displacementScale: {
      value: 50,
      min: 10,
      max: 300,
      step: 10,
      label: "Displacement Scale",
    },
    segmentCount: {
      value: 1024,
      min: 128,
      max: 1024,
      step: 64,
      label: "Base Segment Count",
    },
    terrainHeight: {
      value: 0,
      min: -500,
      max: 50,
      step: 10,
      label: "Terrain Height (Y Position)",
    },
    roughness: {
      value: 0.9,
      min: 0.1,
      max: 1.0,
      step: 0.1,
      label: "Surface Roughness",
    },
    metalness: {
      value: 0.0,
      min: 0.0,
      max: 1.0,
      step: 0.1,
      label: "Metalness",
    },
    showWireframe: {
      value: false,
      label: "Show Wireframe",
    },
    useHeightmapAsTexture: {
      value: false,
      label: "Use Heightmap as Texture",
    },
    terrainColor: {
      value: "#4a7c59",
      label: "Terrain Color",
    },
    enableLOD: {
      value: false,
      label: "Enable LOD (Level of Detail)",
    },
    lodDistance1: {
      value: 60,
      min: 20,
      max: 120,
      step: 10,
      label: "LOD Distance 1 (High Detail)",
    },
    lodDistance2: {
      value: 120,
      min: 80,
      max: 200,
      step: 20,
      label: "LOD Distance 2 (Medium Detail)",
    },
    lodDistance3: {
      value: 200,
      min: 150,
      max: 400,
      step: 25,
      label: "LOD Distance 3 (Low Detail)",
    },
    lodSegment1: {
      value: 256,
      min: 128,
      max: 512,
      step: 32,
      label: "LOD 1 Segments (High Detail)",
    },
    lodSegment2: {
      value: 64,
      min: 32,
      max: 128,
      step: 16,
      label: "LOD 2 Segments (Medium Detail)",
    },
    lodSegment3: {
      value: 16,
      min: 8,
      max: 32,
      step: 4,
      label: "LOD 3 Segments (Low Detail)",
    },
    showLODColors: {
      value: false,
      label: "🎨 Show LOD Debug Colors",
    },
    showLODInfo: {
      value: false,
      label: "📊 Show LOD Info (Console)",
    },
    enableHeightGradient: {
      value: true,
      label: "🌈 Enable Height Gradient",
    },
    lowHeightColor: {
      value: "#2d5016", // Dark green for low areas
      label: "🟢 Low Height Color",
    },
    midHeightColor: {
      value: "#8b4513", // Brown for mid areas
      label: "🟤 Mid Height Color",
    },
    highHeightColor: {
      value: "#214807", // White for high areas
      label: "⚪ High Height Color",
    },
    lowHeightThreshold: {
      value: 0.3,
      min: 0,
      max: 1,
      step: 0.1,
      label: "📏 Low Height Threshold",
    },
    highHeightThreshold: {
      value: 0.7,
      min: 0,
      max: 1,
      step: 0.1,
      label: "📏 High Height Threshold",
    },
    centerRegionSize: {
      value: 5,
      min: 1,
      max: 20,
      step: 1,
      label: "🎯 Center Peak Detection",
    },
  });

  // Helper function to create terrain geometry with LOD
  const createTerrainGeometry = (segments: number) => {
    const geom = new THREE.PlaneGeometry(
      worldSize,
      worldSize,
      segments,
      segments
    );

    // Get the heightmap image data
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = heightMap.image.width;
    canvas.height = heightMap.image.height;
    ctx.drawImage(heightMap.image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Displace vertices based on heightmap
    const vertices = geom.attributes.position.array as Float32Array;
    const width = segments + 1;
    const height = segments + 1;

    // First pass: collect all heights to find min/max for normalization
    const heights: number[] = [];
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        // Map vertex position to heightmap pixel
        const px = Math.floor((j / width) * canvas.width);
        const py = Math.floor((i / height) * canvas.height);
        const pixelIndex = (py * canvas.width + px) * 4;

        // Get heightmap value (using red channel, 0-255)
        const heightValue = imageData.data[pixelIndex] / 255;
        heights.push(heightValue);
      }
    }

    // Find min and max heights for normalization
    let minHeight = heights[0];
    let maxHeight = heights[0];
    for (let i = 1; i < heights.length; i++) {
      if (heights[i] < minHeight) minHeight = heights[i];
      if (heights[i] > maxHeight) maxHeight = heights[i];
    }
    const heightRange = maxHeight - minHeight;

    // Create vertex colors if height gradient is enabled
    let colors: Float32Array | null = null;
    if (enableHeightGradient) {
      colors = new Float32Array(vertices.length);
    }

    // Second pass: apply normalized height displacement and colors
    let heightIndex = 0;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = (i * width + j) * 3;
        const rawHeight = heights[heightIndex++];

        // Normalize height so lowest point is at 0 and highest point uses full displacementScale
        const normalizedHeight =
          heightRange > 0 ? (rawHeight - minHeight) / heightRange : 0;

        // Apply height displacement with peak at center positioned at Y=0
        vertices[index + 2] = normalizedHeight * displacementScale + peakOffset;

        // Set vertex colors based on normalized height if gradient is enabled
        if (enableHeightGradient && colors) {
          let color: THREE.Color;

          if (normalizedHeight < lowHeightThreshold) {
            // Low height - blend between low and mid colors
            const t = normalizedHeight / lowHeightThreshold;
            color = new THREE.Color(lowHeightColor).lerp(
              new THREE.Color(midHeightColor),
              t
            );
          } else if (normalizedHeight < highHeightThreshold) {
            // Mid height - blend between mid and high colors
            const t =
              (normalizedHeight - lowHeightThreshold) /
              (highHeightThreshold - lowHeightThreshold);
            color = new THREE.Color(midHeightColor).lerp(
              new THREE.Color(highHeightColor),
              t
            );
          } else {
            // High height - use high color
            color = new THREE.Color(highHeightColor);
          }

          colors[index] = color.r;
          colors[index + 1] = color.g;
          colors[index + 2] = color.b;
        }
      }
    }

    // Add vertex colors if gradient is enabled
    if (enableHeightGradient && colors) {
      geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }

    // Update normals and bounding box
    geom.computeVertexNormals();
    geom.computeBoundingBox();

    return geom;
  };

  // Create material
  const terrainMaterial = useMemo(() => {
    // Always use standard material for proper shadow support
    return new THREE.MeshStandardMaterial({
      map: useHeightmapAsTexture ? heightMap : null,
      // Only use terrainColor when height gradient is disabled
      color: enableHeightGradient
        ? "#ffffff"
        : useHeightmapAsTexture
        ? "#ffffff"
        : terrainColor,
      roughness: roughness,
      metalness: metalness,
      wireframe: showWireframe,
      // Enable vertex colors when gradient is enabled
      vertexColors: enableHeightGradient,
    });
  }, [
    heightMap,
    useHeightmapAsTexture,
    terrainColor,
    roughness,
    metalness,
    showWireframe,
    enableHeightGradient,
  ]);

  // Create colored LOD materials for debugging
  const lodMaterials = useMemo(() => {
    const baseProps = {
      roughness: roughness,
      metalness: metalness,
      wireframe: showWireframe,
      // Enable vertex colors when gradient is enabled
      vertexColors: enableHeightGradient,
    };

    return {
      // LOD 0 - High Detail (Red)
      lod0: new THREE.MeshStandardMaterial({
        ...baseProps,
        color: enableHeightGradient ? "#ffffff" : "#ff0000", // Red or white for vertex colors
        map: useHeightmapAsTexture ? heightMap : null,
      }),
      // LOD 1 - Medium Detail (Yellow)
      lod1: new THREE.MeshStandardMaterial({
        ...baseProps,
        color: enableHeightGradient ? "#ffffff" : "#ffff00", // Yellow or white for vertex colors
        map: useHeightmapAsTexture ? heightMap : null,
      }),
      // LOD 2 - Low Detail (Green)
      lod2: new THREE.MeshStandardMaterial({
        ...baseProps,
        color: enableHeightGradient ? "#ffffff" : "#00ff00", // Green or white for vertex colors
        map: useHeightmapAsTexture ? heightMap : null,
      }),
      // LOD 3 - Lowest Detail (Blue)
      lod3: new THREE.MeshStandardMaterial({
        ...baseProps,
        color: enableHeightGradient ? "#ffffff" : "#0000ff", // Blue or white for vertex colors
        map: useHeightmapAsTexture ? heightMap : null,
      }),
    };
  }, [
    heightMap,
    useHeightmapAsTexture,
    roughness,
    metalness,
    showWireframe,
    enableHeightGradient,
  ]);

  // Calculate peak offset for centering terrain at Y=0
  const peakOffset = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = heightMap.image.width;
    canvas.height = heightMap.image.height;
    ctx.drawImage(heightMap.image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Find min and max heights
    let minHeight = 1;
    let maxHeight = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const pixelIndex = (y * canvas.width + x) * 4;
        const heightValue = imageData.data[pixelIndex] / 255;
        if (heightValue < minHeight) minHeight = heightValue;
        if (heightValue > maxHeight) maxHeight = heightValue;
      }
    }
    const heightRange = maxHeight - minHeight;

    // Find max height at center region
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    let maxCenterHeight = 0;

    for (let dx = -centerRegionSize; dx <= centerRegionSize; dx++) {
      for (let dy = -centerRegionSize; dy <= centerRegionSize; dy++) {
        const x = Math.max(0, Math.min(canvas.width - 1, centerX + dx));
        const y = Math.max(0, Math.min(canvas.height - 1, centerY + dy));
        const pixelIndex = (y * canvas.width + x) * 4;
        const height = imageData.data[pixelIndex] / 255;
        if (height > maxCenterHeight) {
          maxCenterHeight = height;
        }
      }
    }

    // Calculate offset to place center peak at Y=0
    const normalizedMaxCenterHeight =
      (maxCenterHeight - minHeight) / heightRange;
    return -(normalizedMaxCenterHeight * displacementScale);
  }, [heightMap, displacementScale, centerRegionSize]);

  // Create heightfield data for physics collider
  const heightfieldData = useMemo(() => {
    // Get the heightmap image data
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = heightMap.image.width;
    canvas.height = heightMap.image.height;
    ctx.drawImage(heightMap.image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Find min and max for normalization
    let minHeight = 1;
    let maxHeight = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const pixelIndex = (y * canvas.width + x) * 4;
        const heightValue = imageData.data[pixelIndex] / 255;
        if (heightValue < minHeight) minHeight = heightValue;
        if (heightValue > maxHeight) maxHeight = heightValue;
      }
    }
    const heightRange = maxHeight - minHeight;

    // Create heightfield data array
    const heights: number[] = [];
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const heightValue = imageData.data[pixelIndex] / 255;

        // Normalize and apply displacement with peak offset
        const normalizedHeight =
          heightRange > 0 ? (heightValue - minHeight) / heightRange : 0;
        heights.push(normalizedHeight * displacementScale + peakOffset);
      }
    }

    return {
      heights,
      width,
      height,
    };
  }, [heightMap, displacementScale, peakOffset]);

  // Create heightmap lookup function for grass and other components
  const heightmapLookup = useMemo(() => {
    if (!heightfieldData) return null;

    const { heights, width, height } = heightfieldData;

    return (x: number, z: number) => {
      // Convert world coordinates to heightmap coordinates
      // Map from world space (-worldSize/2 to worldSize/2) to heightmap space (0 to width/height)
      const normalizedX = (x + worldSize / 2) / worldSize;
      const normalizedZ = (z + worldSize / 2) / worldSize;

      // Clamp to valid range
      const clampedX = Math.max(0, Math.min(1, normalizedX));
      const clampedZ = Math.max(0, Math.min(1, normalizedZ));

      // Convert to pixel coordinates
      const pixelX = Math.floor(clampedX * (width - 1));
      const pixelZ = Math.floor(clampedZ * (height - 1));

      // Get height value from heightfield data
      const index = pixelZ * width + pixelX;
      return heights[index] || 0;
    };
  }, [heightfieldData, worldSize]);

  // Notify parent component when heightmap lookup is ready
  useEffect(() => {
    if (heightmapLookup && onHeightmapReady) {
      onHeightmapReady(heightmapLookup);
    }
  }, [heightmapLookup, onHeightmapReady]);

  // Track camera distance for debugging
  useFrame(() => {
    if (enableLOD && showLODInfo) {
      const cameraPosition = camera.position;
      const distance2D = Math.sqrt(
        cameraPosition.x * cameraPosition.x +
          cameraPosition.z * cameraPosition.z
      );
      setCameraDistance(distance2D);
    }
  });

  // Create physics geometry (always high detail for accurate collision)
  const physicsGeometry = useMemo(() => {
    return createTerrainGeometry(segmentCount);
  }, [
    worldSize,
    segmentCount,
    heightMap,
    displacementScale,
    enableHeightGradient,
    lowHeightColor,
    midHeightColor,
    highHeightColor,
    lowHeightThreshold,
    highHeightThreshold,
    peakOffset,
  ]);

  // Single large terrain mesh with LOD - Using drei Detail component
  const singleTerrain = useMemo(() => {
    console.log(
      `🗻 Zelda Terrain 2 with LOD: ${worldSize}x${worldSize} (${
        enableLOD ? "LOD enabled" : "LOD disabled"
      }) ${showLODColors ? "🎨 Debug colors ON" : "🎨 Debug colors OFF"}`
    );

    if (enableLOD) {
      console.log(
        `📏 LOD Distances: LOD1=${lodDistance1}, LOD2=${lodDistance2}, LOD3=${lodDistance3}`
      );
      console.log(
        `🔢 LOD Segments: LOD0=${segmentCount}, LOD1=${lodSegment1}, LOD2=${lodSegment2}, LOD3=${lodSegment3}`
      );
    }

    if (!enableLOD) {
      // No LOD - single geometry with trimesh physics
      return (
        <RigidBody type="fixed" colliders="trimesh" friction={1}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, terrainHeight, 0]}
            material={terrainMaterial}
            geometry={physicsGeometry}
            receiveShadow
            castShadow={false}
          />
        </RigidBody>
      );
    }

    // With LOD - separate physics and visual meshes
    return (
      <>
        {/* Physics collider - always high detail trimesh */}
        <RigidBody type="fixed" colliders="trimesh" friction={1}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, terrainHeight, 0]}
            geometry={physicsGeometry}
            visible={false} // Hide physics mesh
          />
        </RigidBody>

        {/* Tiled Terrain LOD System - Like your grass system */}
        <group position={[0, terrainHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <TiledTerrainLOD
            worldSize={worldSize}
            segmentCount={segmentCount}
            lodSegment1={lodSegment1}
            lodSegment2={lodSegment2}
            lodSegment3={lodSegment3}
            lodDistance1={lodDistance1}
            lodDistance2={lodDistance2}
            lodDistance3={lodDistance3}
            terrainMaterial={terrainMaterial}
            lodMaterials={lodMaterials}
            showLODColors={showLODColors}
            createTerrainGeometry={createTerrainGeometry}
            camera={camera}
            showLODInfo={showLODInfo}
          />
        </group>
      </>
    );
  }, [
    worldSize,
    segmentCount,
    heightMap,
    displacementScale,
    terrainHeight,
    terrainMaterial,
    lodMaterials,
    showLODColors,
    enableLOD,
    lodDistance1,
    lodDistance2,
    lodDistance3,
    lodSegment1,
    lodSegment2,
    lodSegment3,
    physicsGeometry,
  ]);

  return <group>{singleTerrain}</group>;
};

export default ZeldaTerrain2;
