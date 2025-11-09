import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { TileMaterial } from "./TileMaterial";
import {
  TILE_DENSITY,
  TILE_REFERENCE_SCALE,
  TILE_REFERENCE_SIZE,
} from "./tileMaterialConfig";

type Map16Props = {
  scale?: number;
  position?: [number, number, number];
  onTerrainReady?: (terrain: THREE.Mesh | null) => void;
} & React.ComponentProps<"group">;

export const Map16 = forwardRef<THREE.Mesh | null, Map16Props>(
  (
    { scale = 1, position = [0, 0, 0], onTerrainReady, ...props }: Map16Props,
    ref
  ) => {
    const floorRef = useRef<THREE.Mesh | null>(null);

    const assignRefs = useCallback(
      (value: THREE.Mesh | null) => {
        floorRef.current = value;
        if (typeof ref === "function") {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      },
      [ref]
    );

    useEffect(() => {
      if (onTerrainReady) {
        onTerrainReady(floorRef.current);
      }
    }, [onTerrainReady]);

    const buildings = useMemo(
      () =>
        [
          { size: [18, 60, 14], position: [-30, 30, -20] },
          { size: [22, 75, 22], position: [25, 37.5, -25] },
          { size: [12, 45, 28], position: [-10, 22.5, 30] },
          { size: [28, 80, 18], position: [35, 40, 18] },
          { size: [16, 55, 16], position: [0, 27.5, -40] },
          { size: [14, 65, 24], position: [-45, 32.5, 20] },
          { size: [20, 90, 20], position: [10, 45, 42] },
        ] satisfies BuildingConfig[],
      []
    );

    const buildingGeometries = useMemo(() => {
      const tileSize = 1 / TILE_DENSITY;

      return buildings.map(({ size }) => {
        const width = size[0] * scale;
        const height = size[1] * scale;
        const depth = size[2] * scale;
        const geometry = new THREE.BoxGeometry(width, height, depth);

        const positionAttr = geometry.attributes
          .position as THREE.BufferAttribute;
        const normalAttr = geometry.attributes.normal as THREE.BufferAttribute;
        const uvAttr = geometry.attributes.uv as THREE.BufferAttribute;

        const positionVector = new THREE.Vector3();
        const normalVector = new THREE.Vector3();

        for (let i = 0; i < uvAttr.count; i++) {
          positionVector.fromBufferAttribute(positionAttr, i);
          normalVector.fromBufferAttribute(normalAttr, i);

          const absNormalX = Math.abs(normalVector.x);
          const absNormalY = Math.abs(normalVector.y);
          const absNormalZ = Math.abs(normalVector.z);

          if (absNormalX >= absNormalY && absNormalX >= absNormalZ) {
            const u = (positionVector.z + depth * 0.5) / tileSize;
            const v = (positionVector.y + height * 0.5) / tileSize;
            uvAttr.setXY(i, u, v);
          } else if (absNormalY >= absNormalX && absNormalY >= absNormalZ) {
            const u = (positionVector.x + width * 0.5) / tileSize;
            const v = (positionVector.z + depth * 0.5) / tileSize;
            uvAttr.setXY(i, u, v);
          } else {
            const u = (positionVector.x + width * 0.5) / tileSize;
            const v = (positionVector.y + height * 0.5) / tileSize;
            uvAttr.setXY(i, u, v);
          }
        }

        uvAttr.needsUpdate = true;
        return geometry;
      });
    }, [buildings, scale]);

    useEffect(() => {
      return () => {
        buildingGeometries.forEach((geometry) => geometry.dispose());
      };
    }, [buildingGeometries]);

    return (
      <group {...props}>
        <RigidBody
          type="fixed"
          colliders="trimesh"
          position={position}
          restitution={0}
          friction={1}
        >
          <mesh
            ref={assignRefs}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={scale}
            castShadow
            receiveShadow
          >
            <planeGeometry args={[TILE_REFERENCE_SIZE, TILE_REFERENCE_SIZE]} />
            <TileMaterial textureScale={TILE_REFERENCE_SCALE} />
          </mesh>
        </RigidBody>
        {buildings.map(({ position: buildingPosition }, index) => {
          const worldPosition: [number, number, number] = [
            position[0] + buildingPosition[0] * scale,
            position[1] + buildingPosition[1] * scale,
            position[2] + buildingPosition[2] * scale,
          ];

          return (
            <RigidBody
              key={index}
              type="fixed"
              colliders="cuboid"
              position={worldPosition}
              friction={1}
              restitution={0}
            >
              <mesh castShadow receiveShadow>
                <primitive object={buildingGeometries[index]} />
                <TileMaterial textureScale={TILE_DENSITY} />
              </mesh>
            </RigidBody>
          );
        })}
      </group>
    );
  }
);

Map16.displayName = "Map16";

type BuildingConfig = {
  size: [number, number, number];
  position: [number, number, number];
};
