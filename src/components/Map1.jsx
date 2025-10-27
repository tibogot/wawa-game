import { RigidBody } from "@react-three/rapier";
import { useRef, useMemo } from "react";
import { DynamicLeaves as DynamicLeaves3 } from "./DynamicLeaves3";
import { SimonDevGrass21 } from "./SimonDevGrass21/SimonDevGrass21";
import { useDynamicLeaves3Controls } from "./useDynamicLeaves3Controls";
import { useSimonDevGrass21Controls } from "./useSimonDevGrass21Controls";
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
    </group>
  );
};
