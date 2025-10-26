import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import { useGlobalWind } from "./GlobalWindProvider";

interface FloatingLeavesProps {
  count?: number;
  areaSize?: number;
  spawnHeight?: number;
  leafSize?: number;
  windInfluence?: number;
  gravity?: number;
  enableLeaves?: boolean;
  useTexture?: boolean;
}

export const FloatingLeaves: React.FC<FloatingLeavesProps> = ({
  count: defaultCount = 100,
  areaSize: defaultAreaSize = 50,
  spawnHeight: defaultSpawnHeight = 20,
  leafSize: defaultLeafSize = 0.2,
  windInfluence: defaultWindInfluence = 1.0,
  gravity: defaultGravity = 0.002,
  enableLeaves: defaultEnableLeaves = false,
  useTexture: defaultUseTexture = true,
}) => {
  // Internal controls
  const {
    enabled,
    count,
    areaSize,
    spawnHeight,
    leafSize,
    windInfluence,
    gravity,
    useTexture,
  } = useControls("🍂 Floating Leaves", {
    enabled: { value: defaultEnableLeaves, label: "Enable Leaves" },
    count: {
      value: defaultCount,
      label: "Count",
      min: 10,
      max: 500,
      step: 10,
    },
    areaSize: {
      value: defaultAreaSize,
      label: "Area Size",
      min: 10,
      max: 200,
      step: 10,
    },
    spawnHeight: {
      value: defaultSpawnHeight,
      label: "Spawn Height",
      min: 5,
      max: 100,
      step: 5,
    },
    leafSize: {
      value: defaultLeafSize,
      label: "Leaf Size",
      min: 0.05,
      max: 1.0,
      step: 0.05,
    },
    windInfluence: {
      value: defaultWindInfluence,
      label: "Wind Influence",
      min: 0,
      max: 3,
      step: 0.1,
    },
    gravity: {
      value: defaultGravity,
      label: "Gravity",
      min: 0,
      max: 0.01,
      step: 0.0005,
    },
    useTexture: { value: defaultUseTexture, label: "Use Texture" },
  });
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const { windUniforms } = useGlobalWind();

  // Load leaf texture manually
  const [leafTexture, setLeafTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const texturePath = useTexture
      ? "/textures/leaf1-tiny.png"
      : "/textures/whitesquare.png";

    textureLoader.load(
      texturePath,
      (texture) => {
        // High quality texture settings
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 16;
        texture.flipY = false;
        setLeafTexture(texture);
      },
      undefined,
      (error) => {
        console.warn("Failed to load leaf texture:", error);
        // Create a fallback white texture
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 256, 256);
          const fallbackTexture = new THREE.CanvasTexture(canvas);
          fallbackTexture.minFilter = THREE.LinearMipmapLinearFilter;
          fallbackTexture.magFilter = THREE.LinearFilter;
          fallbackTexture.generateMipmaps = true;
          fallbackTexture.anisotropy = 16;
          setLeafTexture(fallbackTexture);
        }
      }
    );
  }, [useTexture]);

  // Create leaf geometry (simple plane)
  const leafGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(leafSize, leafSize);
    return geometry;
  }, [leafSize]);

  // Create leaf material
  const leafMaterial = useMemo(() => {
    // Create a fallback white texture if none loaded
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    let fallbackTexture;
    if (ctx) {
      ctx.fillStyle = "#ff6b35"; // Orange fallback color
      ctx.fillRect(0, 0, 256, 256);
      fallbackTexture = new THREE.CanvasTexture(canvas);
      fallbackTexture.minFilter = THREE.LinearMipmapLinearFilter;
      fallbackTexture.magFilter = THREE.LinearFilter;
      fallbackTexture.generateMipmaps = true;
      fallbackTexture.anisotropy = 16;
    } else {
      fallbackTexture = new THREE.TextureLoader().load(
        "/textures/whitesquare.png"
      );
    }

    return new THREE.MeshBasicMaterial({
      map: leafTexture || fallbackTexture,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      alphaTest: 0.1,
    });
  }, [leafTexture, useTexture]);

  // Update material when texture loads
  useEffect(() => {
    if (leafMaterial && leafTexture) {
      leafMaterial.map = leafTexture;
      leafMaterial.needsUpdate = true;
    }
  }, [leafMaterial, leafTexture]);

  // Initialize leaf positions and properties
  interface LeafData {
    positions: Float32Array;
    rotations: Float32Array;
    velocities: Float32Array;
    ages: Float32Array;
    maxAge: number;
  }

  const leafData = useMemo(() => {
    const data: LeafData = {
      positions: new Float32Array(count * 3),
      rotations: new Float32Array(count * 3),
      velocities: new Float32Array(count * 3),
      ages: new Float32Array(count),
      maxAge: 1000, // frames
    };

    // Initialize random positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random position in area
      data.positions[i3] = (Math.random() - 0.5) * areaSize;
      data.positions[i3 + 1] = Math.random() * spawnHeight + 5;
      data.positions[i3 + 2] = (Math.random() - 0.5) * areaSize;

      // Random rotation
      data.rotations[i3] = Math.random() * Math.PI * 2;
      data.rotations[i3 + 1] = Math.random() * Math.PI * 2;
      data.rotations[i3 + 2] = Math.random() * Math.PI * 2;

      // Random velocity
      data.velocities[i3] = (Math.random() - 0.5) * 0.01;
      data.velocities[i3 + 1] = -Math.random() * 0.005;
      data.velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // Random age
      data.ages[i] = Math.random() * data.maxAge;
    }

    return data;
  }, [count, areaSize, spawnHeight]);

  // Update leaf positions and rotations
  useFrame(() => {
    if (!instancedMeshRef.current || !enabled) return;

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update age
      leafData.ages[i]++;

      // Respawn if too old
      if (leafData.ages[i] > leafData.maxAge) {
        leafData.ages[i] = 0;
        leafData.positions[i3] = (Math.random() - 0.5) * areaSize;
        leafData.positions[i3 + 1] = spawnHeight;
        leafData.positions[i3 + 2] = (Math.random() - 0.5) * areaSize;
        leafData.velocities[i3] = (Math.random() - 0.5) * 0.01;
        leafData.velocities[i3 + 1] = -Math.random() * 0.005;
        leafData.velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
      }

      // Apply gravity
      leafData.velocities[i3 + 1] -= gravity;

      // Apply air resistance (terminal velocity)
      const terminalVelocity = 0.02;
      if (Math.abs(leafData.velocities[i3 + 1]) > terminalVelocity) {
        leafData.velocities[i3 + 1] =
          Math.sign(leafData.velocities[i3 + 1]) * terminalVelocity;
      }

      // Apply horizontal air resistance
      leafData.velocities[i3] *= 0.99;
      leafData.velocities[i3 + 2] *= 0.99;

      // Apply wind (from global wind system)
      if (windUniforms) {
        const windStrength =
          windUniforms.u_windNoiseAmplitude.value * windInfluence;
        const windSpeed = windUniforms.u_windNoiseSpeed.value;
        const time = windUniforms.u_time.value;

        // Simple wind effect
        const windX =
          Math.sin(time * windSpeed + leafData.positions[i3] * 0.1) *
          windStrength *
          0.01;
        const windZ =
          Math.cos(time * windSpeed + leafData.positions[i3 + 2] * 0.1) *
          windStrength *
          0.01;

        leafData.velocities[i3] += windX;
        leafData.velocities[i3 + 2] += windZ;
      }

      // Update position
      leafData.positions[i3] += leafData.velocities[i3];
      leafData.positions[i3 + 1] += leafData.velocities[i3 + 1];
      leafData.positions[i3 + 2] += leafData.velocities[i3 + 2];

      // Update rotation
      leafData.rotations[i3] += leafData.velocities[i3] * 10;
      leafData.rotations[i3 + 1] += leafData.velocities[i3 + 1] * 5;
      leafData.rotations[i3 + 2] += leafData.velocities[i3 + 2] * 10;

      // Set instance matrix
      position.set(
        leafData.positions[i3],
        leafData.positions[i3 + 1],
        leafData.positions[i3 + 2]
      );
      rotation.set(
        leafData.rotations[i3],
        leafData.rotations[i3 + 1],
        leafData.rotations[i3 + 2]
      );

      matrix.compose(
        position,
        new THREE.Quaternion().setFromEuler(rotation),
        new THREE.Vector3(1, 1, 1)
      );
      instancedMeshRef.current.setMatrixAt(i, matrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!enabled) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[leafGeometry, leafMaterial, count]}
      frustumCulled={false}
    />
  );
};

export default FloatingLeaves;
