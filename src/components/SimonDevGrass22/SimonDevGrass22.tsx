import React, { useRef, useMemo, useState } from "react";
import * as THREE from "three";

// Import all the optimized modular components
import { useOptimizedGrassGeometry } from "./OptimizedGrassGeometry";
import { useOptimizedGrassMaterial } from "./OptimizedGrassMaterial";
import { useGrassEffects } from "./GrassEffects";
import { useOptimizedGrassInstances } from "./OptimizedGrassInstances";

export const SimonDevGrass22 = ({
  areaSize = 200,
  getGroundHeight,
  grassHeight = 2.0,
  grassScale = 2.0,
  characterPosition,
  map = "map1(intro)",
  disableChunkRemoval = false,
  enableFrustumCulling = true,
  frustumCullingUpdateInterval = 100,
  debugFrustumCulling = false,
  mapSize = 200, // Add map size parameter
}) => {
  const [meshReady, setMeshReady] = useState<boolean>(false);

  // Load normal map texture
  const normalMapTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load("/textures/grass.png");
  }, []);

  // Create simple environment map for IBL (v22)
  const envMapTexture = useMemo(() => {
    const envMap = new THREE.CubeTexture();
    const size = 1;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#87CEEB"; // Sky blue
    context.fillRect(0, 0, size, size);
    envMap.images = [canvas, canvas, canvas, canvas, canvas, canvas];
    envMap.needsUpdate = true;
    envMap.mapping = THREE.CubeReflectionMapping;
    return envMap;
  }, []);

  // Create grass geometry using the optimized geometry component
  const {
    highLOD,
    lowLOD,
    ultraLowLOD,
    GRASS_LOD_DISTANCE,
    GRASS_ULTRA_LOW_DISTANCE,
  } = useOptimizedGrassGeometry({
    grassHeight,
    useFloat16: true,
  });

  // Create grass material using the optimized material component
  const { material: grassMaterial } = useOptimizedGrassMaterial({
    enableDebugShader: false,
    enableDebugVertex: false,
    enableNormalMap: true,
    normalMapTexture,
    enableBaseToTipGradient: true,
    baseColor: "#0d3303",
    tipColor: "#80801a",
    gradientShaping: 4.0,
    enableNormalBlending: false,
    terrainBlendStart: 10.0,
    terrainBlendEnd: 30.0,
    enableAmbientOcclusion: true,
    grassDensity: 1.0,
    aoStrength: 0.1,
    aoHeightPower: 1.0,
    aoDebugMode: false,
    enableWindMovement: true,
    windStrength: 1.0,
    windSpeed: 1.0,
    grassHeight,
    // Wind Noise Controls
    windNoiseScale: 1.0,
    windNoiseSpeed: 1.0,
    windNoiseAmplitude: 1.0,
    // Player Interaction
    enablePlayerInteraction: true,
    playerInteractionRadius: 3.0,
    playerInteractionStrength: 0.5,
    playerInteractionRepel: true,
    characterPosition,
    // Moonlight controls (v22 addition)
    disableMoonReflection: false,
    moonIntensity: 2.0,
    // Moon angled like v6 to show specular highlight
    moonDirection: new THREE.Vector3(-1.0, 1.0, 0.5),
    moonColor: "#ff0000",
    // Contact Shadow controls (v22 addition)
    contactShadowIntensity: 0.8,
    contactShadowRadius: 2.0,
    contactShadowBias: 0.1,
    // Subsurface Scattering controls (v22 addition)
    disableSSS: false,
    sssIntensity: 0.8,
    sssPower: 1.5,
    sssScale: 2.0,
    sssColor: "#8fbc8f",
    // Environment Map controls (v22 addition)
    enableEnvMap: false,
    envMap: envMapTexture,
    envMapIntensity: 1.0,
    roughnessBase: 0.9,
    roughnessTip: 0.1,
    fresnelPower: 3.0,
    roughnessIntensity: 1.0,
  });

  // Create instances using the optimized instances component
  const { instancedMeshRef } = useOptimizedGrassInstances({
    highLOD,
    lowLOD,
    ultraLowLOD,
    grassMaterial,
    grassScale,
    useFloat16: true,
    getGroundHeight,
    setMeshReady,
    GRASS_LOD_DISTANCE,
    GRASS_ULTRA_LOW_DISTANCE,
    disableChunkRemoval,
    enableFrustumCulling,
    frustumCullingUpdateInterval,
    debugFrustumCulling,
    mapSize, // Pass map size for adaptive culling
  });

  // Set up effects using the effects component
  useGrassEffects({
    instancedMeshRef,
    enableDebugVertex: false,
    enableWindMovement: true,
    enablePlayerInteraction: true,
    characterPosition,
    windNoiseScale: 1.0,
    windNoiseSpeed: 1.0,
    windNoiseAmplitude: 1.0,
  });

  return meshReady && instancedMeshRef.current ? (
    <primitive object={instancedMeshRef.current} />
  ) : null;
};

export default SimonDevGrass22;
