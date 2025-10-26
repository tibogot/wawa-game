import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";

export const Map1 = ({ scale = 1, position = [0, 0, 0], ...props }) => {
  const group = useRef();

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
    </group>
  );
};
