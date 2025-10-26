import { useEffect, useRef, useCallback, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAdaptiveLODSystem } from "./AdaptiveLODSystem";
import { createOptimizedTileMesh } from "./OptimizedGrassGeometry";
import { useFrustumCullingSystem } from "./FrustumCullingSystem";

interface OptimizedGrassInstancesProps {
  highLOD: THREE.BufferGeometry;
  lowLOD: THREE.BufferGeometry;
  ultraLowLOD: THREE.BufferGeometry;
  grassMaterial: THREE.Material;
  grassScale: number;
  useFloat16: boolean;
  getGroundHeight: (x: number, z: number) => number;
  setMeshReady: (ready: boolean) => void;
  GRASS_LOD_DISTANCE: number;
  GRASS_ULTRA_LOW_DISTANCE: number;
  disableChunkRemoval?: boolean;
  enableFrustumCulling?: boolean;
  frustumCullingUpdateInterval?: number;
  debugFrustumCulling?: boolean;
  mapSize?: number; // Add map size parameter
}

export const useOptimizedGrassInstances = ({
  highLOD,
  lowLOD,
  ultraLowLOD,
  grassMaterial,
  grassScale,
  useFloat16,
  getGroundHeight,
  setMeshReady,
  GRASS_LOD_DISTANCE,
  GRASS_ULTRA_LOW_DISTANCE,
  disableChunkRemoval = false,
  enableFrustumCulling = true,
  frustumCullingUpdateInterval = 100,
  debugFrustumCulling = false,
  mapSize = 200, // Default for small maps
}: OptimizedGrassInstancesProps) => {
  const { camera } = useThree();
  const isCreatingGrassRef = useRef(false);
  const tilesRef = useRef<any[]>([]);
  const lastUpdateTimeRef = useRef(0);
  const instancedMeshRef = useRef<THREE.Group | null>(null);

  // Initialize optimization systems
  const adaptiveLOD = useAdaptiveLODSystem();
  const frustumCulling = useFrustumCullingSystem({
    enabled: enableFrustumCulling,
    updateInterval: frustumCullingUpdateInterval,
    debugMode: debugFrustumCulling,
    mapSize: mapSize, // Pass map size for adaptive culling
    areaSize: 200, // Pass grass area size
  });

  // Configuration
  const config = {
    GRASS_LOD_DISTANCE,
    GRASS_ULTRA_LOW_DISTANCE,
    TILE_SIZE: 10,
    GRASS_PER_TILE_HIGH: 2000,
    GRASS_PER_TILE_LOW: 2000,
    GRASS_PER_TILE_ULTRA_LOW: 3000,
  };

  // Main grass creation with frustum culling
  useEffect(() => {
    if (instancedMeshRef.current || isCreatingGrassRef.current) {
      return;
    }

    isCreatingGrassRef.current = true;

    const cleanup = () => {
      if (instancedMeshRef.current) {
        instancedMeshRef.current.clear();
        instancedMeshRef.current = null;
      }
      tilesRef.current = [];
      isCreatingGrassRef.current = false;
      setMeshReady(false);
    };

    try {
      const FIELD_SIZE = 200;
      const tilesPerSide = Math.ceil(FIELD_SIZE / config.TILE_SIZE);
      const totalTiles = tilesPerSide * tilesPerSide;

      // Create tile data
      const tiles: any[] = [];
      for (let x = 0; x < tilesPerSide; x++) {
        for (let z = 0; z < tilesPerSide; z++) {
          const tileX =
            (x - tilesPerSide / 2) * config.TILE_SIZE + config.TILE_SIZE / 2;
          const tileZ =
            (z - tilesPerSide / 2) * config.TILE_SIZE + config.TILE_SIZE / 2;

          tiles.push({
            x: tileX,
            z: tileZ,
            centerX: tileX,
            centerZ: tileZ,
            distanceToCamera: 0,
            currentLOD: null,
            mesh: null,
            tileSize: config.TILE_SIZE,
            lastUpdateTime: 0,
            priority: 0,
          });
        }
      }

      tilesRef.current = tiles;

      // Create group to hold all tile meshes
      const instancedMesh = new THREE.Group();
      instancedMeshRef.current = instancedMesh;

      // Get initial camera position
      const initialCameraPos = camera.position.clone();
      let visibleTiles = 0;
      let culledTiles = 0;

      // Apply frustum culling to all tiles first
      const tilesWithIds = tiles.map((tile, index) => ({
        ...tile,
        id: `tile_${index}`,
      }));

      const { visible: visibleTileIds, culled: culledTileIds } =
        frustumCulling.cullTiles(tilesWithIds);

      // Create initial meshes for visible tiles only
      tiles.forEach((tile, index) => {
        const tileId = `tile_${index}`;

        // Check frustum culling first
        const isFrustumVisible = enableFrustumCulling
          ? visibleTileIds.includes(tileId)
          : true;

        // Then check LOD visibility
        const isLODVisible =
          disableChunkRemoval || adaptiveLOD.isTileVisible(tile, camera);

        // Tile is visible only if both frustum and LOD checks pass
        const isVisible = isFrustumVisible && isLODVisible;

        if (!isVisible) {
          culledTiles++;
          return;
        }

        visibleTiles++;

        const distance = Math.sqrt(
          Math.pow(tile.centerX - initialCameraPos.x, 2) +
            Math.pow(tile.centerZ - initialCameraPos.z, 2)
        );
        tile.distanceToCamera = distance;

        // Determine initial LOD
        let lodLevel: "HIGH" | "LOW" | "ULTRA_LOW";
        let geometry: THREE.BufferGeometry;
        let grassCount: number;

        if (distance < config.GRASS_LOD_DISTANCE) {
          lodLevel = "HIGH";
          geometry = highLOD;
          grassCount = config.GRASS_PER_TILE_HIGH;
        } else if (distance < config.GRASS_ULTRA_LOW_DISTANCE) {
          lodLevel = "LOW";
          geometry = lowLOD;
          grassCount = config.GRASS_PER_TILE_LOW;
        } else {
          lodLevel = "ULTRA_LOW";
          geometry = ultraLowLOD;
          grassCount = config.GRASS_PER_TILE_ULTRA_LOW;
        }

        tile.currentLOD = lodLevel;

        // Create mesh directly (no pooling)
        const tileMesh = createOptimizedTileMesh(
          tile,
          geometry,
          grassMaterial,
          grassCount,
          grassScale,
          getGroundHeight,
          lodLevel
        );

        if (tileMesh) {
          tile.mesh = tileMesh;
          instancedMesh.add(tileMesh);
        }
      });

      isCreatingGrassRef.current = false;
      setMeshReady(true);

      console.log(
        `Grass system initialized: ${visibleTiles} visible tiles, ${culledTiles} culled tiles`
      );
    } catch (error) {
      console.error("Error initializing grass system:", error);
      cleanup();
    }
  }, [
    grassScale,
    getGroundHeight,
    GRASS_LOD_DISTANCE,
    GRASS_ULTRA_LOW_DISTANCE,
    disableChunkRemoval,
    enableFrustumCulling,
  ]);

  // Optimized LOD updates with adaptive timing
  useFrame((state) => {
    if (!instancedMeshRef.current || tilesRef.current.length === 0) {
      return;
    }

    const cameraPos = camera.position;
    const updateInterval = adaptiveLOD.getUpdateInterval(cameraPos);
    const now = Date.now();

    if (now - lastUpdateTimeRef.current < updateInterval) {
      return;
    }
    lastUpdateTimeRef.current = now;

    // Process LOD updates in batches
    const updateTile = (tile: any, newLOD: string) => {
      // Remove old mesh
      if (tile.mesh) {
        instancedMeshRef.current!.remove(tile.mesh);
        tile.mesh.dispose();
      }

      // Determine geometry and grass count for new LOD
      let geometry: THREE.BufferGeometry;
      let grassCount: number;

      if (newLOD === "HIGH") {
        geometry = highLOD;
        grassCount = config.GRASS_PER_TILE_HIGH;
      } else if (newLOD === "LOW") {
        geometry = lowLOD;
        grassCount = config.GRASS_PER_TILE_LOW;
      } else {
        geometry = ultraLowLOD;
        grassCount = config.GRASS_PER_TILE_ULTRA_LOW;
      }

      // Create new mesh directly
      const newMesh = createOptimizedTileMesh(
        tile,
        geometry,
        grassMaterial,
        grassCount,
        grassScale,
        getGroundHeight,
        newLOD as "HIGH" | "LOW" | "ULTRA_LOW"
      );

      if (newMesh) {
        tile.mesh = newMesh;
        tile.currentLOD = newLOD;
        instancedMeshRef.current!.add(newMesh);
      }
    };

    // Apply frustum culling to tiles before LOD updates
    if (enableFrustumCulling) {
      const tilesWithIds = tilesRef.current.map((tile, index) => ({
        ...tile,
        id: `tile_${index}`,
      }));

      const { visible: visibleTileIds } =
        frustumCulling.cullTiles(tilesWithIds);

      // Filter tiles to only process visible ones
      const visibleTiles = tilesRef.current.filter((tile, index) =>
        visibleTileIds.includes(`tile_${index}`)
      );

      // Process LOD updates only for visible tiles
      adaptiveLOD.processLODUpdates(
        visibleTiles,
        cameraPos,
        config,
        updateTile
      );
    } else {
      // Process LOD updates for all tiles if frustum culling is disabled
      adaptiveLOD.processLODUpdates(
        tilesRef.current,
        cameraPos,
        config,
        updateTile
      );
    }
  });

  return { instancedMeshRef };
};

export default useOptimizedGrassInstances;
