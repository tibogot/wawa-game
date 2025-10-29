import { useRef, useState, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import CSM from "three-csm";

THREE.CSM = CSM;

export function Csm({
  children,
  cascades = 4,
  shadowMapSize = 1024,
  lightDirection = [10, 10, 5],
  ...props
}) {
  const ref = useRef();
  const { scene: parent, camera } = useThree();
  const [csm] = useState(
    () =>
      new THREE.CSM({
        camera,
        parent,
        maxFar: camera.far,
        maxFar: 250,
        cascades: 3,
        shadowMapSize: 2048,
        lightDirection: new THREE.Vector3(1, -1, 1).normalize(),
        lightFar: 5000,
        lightNear: 1,
        shadowBias: 0,
      })
  );

  /*useLayoutEffect(() => {
    // How to update props in CSM ???
    Object.assign(csm, {
      cascades,
      shadowMapSize,
      lightDirection: new THREE.Vector3(...lightDirection).normalize()
    })
  }, [cascades, shadowMapSize, ...lightDirection])*/

  useLayoutEffect(() => {
    ref.current.traverse((obj) => {
      if (obj.material) csm.setupMaterial(obj.material);
    });
  });
  useFrame(() => {
    csm.update(camera.matrix);
  });
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}
