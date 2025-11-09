import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CSM as ThreeCSM } from "three/examples/jsm/csm/CSM.js";

const CSM_FLAG = "__csmPatched";

const defaultDirection = new THREE.Vector3(1, -1, 1).normalize();
const defaultColor = new THREE.Color(0xffffff);

const normalizeDirection = (direction) => {
  if (!direction) {
    return defaultDirection.clone();
  }

  if (direction instanceof THREE.Vector3) {
    if (direction.lengthSq() === 0) {
      return defaultDirection.clone();
    }
    return direction.clone().normalize();
  }

  if (Array.isArray(direction) && direction.length === 3) {
    const vec = new THREE.Vector3(direction[0], direction[1], direction[2]);
    if (vec.lengthSq() === 0) {
      return defaultDirection.clone();
    }
    return vec.normalize();
  }

  return defaultDirection.clone();
};

const toColor = (color) => {
  if (color instanceof THREE.Color) {
    return color.clone();
  }
  try {
    return new THREE.Color(color);
  } catch (error) {
    return defaultColor.clone();
  }
};

const applyCsmToScene = (scene, csm) => {
  scene.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!material) {
        return;
      }

      if (!material.userData) {
        material.userData = {};
      }

      if (material.userData[CSM_FLAG]) {
        return;
      }

      csm.setupMaterial(material);
      material.userData[CSM_FLAG] = true;
    });
  });
};

export const Csm = ({
  enabled,
  cascades = 4,
  shadowMapSize = 2048,
  shadowBias = 0,
  shadowNormalBias = 0,
  lightDirection,
  lightIntensity = 1,
  lightColor = defaultColor,
  fade = true,
  lightMargin = 200,
  maxFar,
  materialVersion,
}) => {
  const { scene, camera } = useThree();
  const csmRef = useRef(null);

  const normalizedDirection = useMemo(
    () => normalizeDirection(lightDirection),
    [lightDirection]
  );

  const colorInstance = useMemo(() => toColor(lightColor), [lightColor]);

  useEffect(() => {
    if (!enabled) {
      if (csmRef.current) {
        csmRef.current.remove();
        csmRef.current.dispose();
        csmRef.current = null;
      }
      return;
    }

    const csm = new ThreeCSM({
      camera,
      parent: scene,
      cascades,
      shadowMapSize,
      shadowBias,
      lightDirection: normalizedDirection,
      lightIntensity,
      maxFar: maxFar ?? camera.far,
      lightMargin,
    });

    csm.fade = fade;

    csm.lights.forEach((light) => {
      light.castShadow = true;
      light.intensity = lightIntensity;
      light.color.copy(colorInstance);
      light.shadow.bias = shadowBias;
      light.shadow.normalBias = shadowNormalBias;
      light.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    });

    csm.updateFrustums();
    applyCsmToScene(scene, csm);
    csmRef.current = csm;

    return () => {
      csm.remove();
      csm.dispose();
      csmRef.current = null;
    };
  }, [
    enabled,
    cascades,
    shadowMapSize,
    shadowBias,
    shadowNormalBias,
    normalizedDirection,
    lightIntensity,
    colorInstance,
    fade,
    lightMargin,
    maxFar,
    camera,
    scene,
  ]);

  useEffect(() => {
    if (!enabled || !csmRef.current) {
      return;
    }

    applyCsmToScene(scene, csmRef.current);
    csmRef.current.updateFrustums();
  }, [enabled, materialVersion, scene]);

  useFrame(() => {
    if (!enabled || !csmRef.current) {
      return;
    }

    csmRef.current.update();
  }, -1);

  return null;
};

export default Csm;
