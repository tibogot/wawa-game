import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { createNoise2D } from "simplex-noise";
import alea from "alea";

// Simplex noise generator using simplex-noise library
function createNoiseGenerator(seed = 0) {
  const prng = alea(seed);
  const noise2D = createNoise2D(prng);

  // Return wrapper function that matches the interface from ProceduralTerrain3
  return (x, y) => noise2D(x, y);
}

// SHARED height calculation - Optimized for BOTW-style open world
function getTerrainHeight(
  worldX,
  worldZ,
  noiseGenerators,
  heightScale,
  terrainControls = {}
) {
  const { noise, noise2, noise3, noise4 } = noiseGenerators;

  // Extract controls with defaults
  const {
    mountainIntensity = 1.0,
    flatnessThreshold = 0.35,
    flatnessSmooth = 0.25,
    ridgeSharpness = 2.5,
    valleyDepth = 0.4,
    detailAmount = 0.18,
    biomeVariation = 0.5,
  } = terrainControls;

  // === LARGE-SCALE REGIONS - Creates distinct biomes/areas ===
  const regionFreq = 0.0006; // Lower frequency for larger regions
  const regionNoise = noise(worldX * regionFreq, worldZ * regionFreq);
  const regionNoise2 = noise2(
    worldX * regionFreq * 1.5 + 1000,
    worldZ * regionFreq * 1.5 + 1000
  );
  const regionMask = (regionNoise * 0.65 + regionNoise2 * 0.35) * 0.5 + 0.5; // 0 to 1

  // === FLAT PLAINS - Large traversable areas like Hyrule Field ===
  let flatnessFactor = 1.0;
  if (regionMask < flatnessThreshold) {
    // Smooth transition to flat - creates wide plains
    flatnessFactor =
      Math.pow(regionMask / flatnessThreshold, 1.8) * flatnessSmooth +
      (1 - flatnessSmooth);
  }

  // === RIDGED MOUNTAINS - Sharp peaks and ridges ===
  const ridgeFreq = 0.0012; // Slightly lower for smoother transitions
  let ridge1 = Math.abs(noise3(worldX * ridgeFreq, worldZ * ridgeFreq));
  ridge1 = 1 - ridge1; // Invert to create ridges
  ridge1 = Math.pow(ridge1, ridgeSharpness);

  let ridge2 = Math.abs(
    noise4(worldX * ridgeFreq * 2.3 + 2000, worldZ * ridgeFreq * 2.3 + 2000)
  );
  ridge2 = 1 - ridge2;
  ridge2 = Math.pow(ridge2, ridgeSharpness * 0.9);

  const ridgeTerrain = (ridge1 * 0.75 + ridge2 * 0.25) * mountainIntensity;

  // === BASE TERRAIN - Gentle undulating landscape ===
  const baseFreq = 0.0005; // Even gentler for BOTW-style flow
  const base1 = noise(worldX * baseFreq + 3000, worldZ * baseFreq + 3000);
  const base2 = noise2(
    worldX * baseFreq * 0.6 + 4000,
    worldZ * baseFreq * 0.6 + 4000
  );
  const baseTerrain = (base1 * 0.65 + base2 * 0.35) * 0.6;

  // === VALLEYS AND DEPRESSIONS - Negative features ===
  const valleyFreq = 0.0009;
  const valleyNoise = noise3(
    worldX * valleyFreq + 5000,
    worldZ * valleyFreq + 5000
  );
  const valleys = Math.min(0, valleyNoise * valleyDepth);

  // === ROLLING HILLS - Medium frequency undulation ===
  const hillFreq = 0.002;
  const hills =
    noise4(worldX * hillFreq + 6000, worldZ * hillFreq + 6000) * 0.25;

  // === FINE DETAIL - Surface texture ===
  const detailFreq = 0.007;
  const detail =
    noise2(worldX * detailFreq + 7000, worldZ * detailFreq + 7000) *
    detailAmount;

  // === COMBINE LAYERS ===
  // Mountain regions get ridges, flat regions stay mostly flat
  const mountainMask = Math.pow(
    Math.max(0, regionMask - flatnessThreshold),
    1.3
  );
  const mountainHeight = ridgeTerrain * mountainMask;

  // Add biome variation for more interesting terrain
  const biomeVar =
    noise4(worldX * 0.0004 + 8000, worldZ * 0.0004 + 8000) *
    biomeVariation *
    0.3;

  let height =
    baseTerrain +
    mountainHeight +
    valleys +
    hills +
    detail * flatnessFactor +
    biomeVar;

  // Apply flatness factor to reduce all variation in flat areas
  height = height * flatnessFactor;

  const finalHeight = height * heightScale;

  // Safety check - clamp height to prevent rendering issues
  if (!isFinite(finalHeight) || Math.abs(finalHeight) > 10000) {
    return 0;
  }

  return finalHeight;
}

// Single terrain chunk with SHADER-BASED coloring
function TerrainChunk({
  chunkX,
  chunkZ,
  chunkSize,
  segments,
  heightScale,
  noiseGenerators,
  lodLevel,
  showColorDebug,
  maxSegments,
  segmentsPerChunk,
  enableHeightGradient,
  valleyColor,
  grassColor,
  mountainColor,
  peakColor,
  heightValley,
  heightGrass,
  heightSlope,
  heightPeak,
  terrainControls,
}) {
  const meshRef = useRef();
  const heightMapRef = useRef(null);

  // Step 1: Generate base geometry (positions, indices, uvs) - NO vertex colors
  const geometry = useMemo(() => {
    const verticesPerSide = segments + 1;
    const positions = [];
    const indices = [];
    const uvs = [];

    const worldStartX = chunkX * chunkSize;
    const worldStartZ = chunkZ * chunkSize;
    const stepSize = chunkSize / segments;

    // Generate heightmap and store in ref for later use (for heightmap lookup)
    const heightMap = [];
    for (let z = 0; z <= segments; z++) {
      heightMap[z] = [];
      for (let x = 0; x <= segments; x++) {
        const worldX = worldStartX + x * stepSize;
        const worldZ = worldStartZ + z * stepSize;
        const height = getTerrainHeight(
          worldX,
          worldZ,
          noiseGenerators,
          heightScale,
          terrainControls
        );
        heightMap[z][x] = height;
      }
    }

    heightMapRef.current = heightMap;

    // Generate positions and UVs (NO vertex colors - colors come from shader)
    for (let z = 0; z <= segments; z++) {
      for (let x = 0; x <= segments; x++) {
        const height = heightMap[z][x];
        const worldX = worldStartX + x * stepSize;
        const worldZ = worldStartZ + z * stepSize;
        positions.push(worldX, worldZ, height);
        uvs.push(x / segments, z / segments);
      }
    }

    // Generate indices for triangles
    for (let z = 0; z < segments; z++) {
      for (let x = 0; x < segments; x++) {
        const a = x + z * verticesPerSide;
        const b = x + (z + 1) * verticesPerSide;
        const c = x + 1 + (z + 1) * verticesPerSide;
        const d = x + 1 + z * verticesPerSide;

        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    // NO color attribute - colors come from shader
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [
    chunkX,
    chunkZ,
    chunkSize,
    segments,
    heightScale,
    noiseGenerators,
    lodLevel,
    terrainControls,
  ]);

  // Step 2: Create material with onBeforeCompile for SHADER-BASED height coloring
  const material = useMemo(() => {
    let color = 0xffffff;
    if (showColorDebug) {
      const highThreshold = Math.floor(segmentsPerChunk * 0.8);
      const mediumThreshold = Math.floor(segmentsPerChunk * 0.4);
      if (lodLevel >= highThreshold) {
        color = 0x00ff00;
      } else if (lodLevel >= mediumThreshold) {
        color = 0xffff00;
      } else {
        color = 0xff0000;
      }
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: false,
      roughness: 0.95,
      metalness: 0.0,
      envMapIntensity: 0.3,
    });

    // Only apply shader-based coloring if height gradient is enabled
    if (enableHeightGradient && !showColorDebug) {
      material.onBeforeCompile = (shader) => {
        // Add custom uniforms for height-based coloring
        shader.uniforms.colorValley = { value: new THREE.Color(valleyColor) };
        shader.uniforms.colorGrass = { value: new THREE.Color(grassColor) };
        shader.uniforms.colorMountain = {
          value: new THREE.Color(mountainColor),
        };
        shader.uniforms.colorPeak = { value: new THREE.Color(peakColor) };
        shader.uniforms.heightValley = { value: heightValley };
        shader.uniforms.heightGrass = { value: heightGrass };
        shader.uniforms.heightSlope = { value: heightSlope };
        shader.uniforms.heightPeak = { value: heightPeak };

        // Modify vertex shader to pass world position
        shader.vertexShader = shader.vertexShader.replace(
          "#include <common>",
          `
          #include <common>
          varying vec3 vWorldPos;
          `
        );

        shader.vertexShader = shader.vertexShader.replace(
          "#include <worldpos_vertex>",
          `
          #include <worldpos_vertex>
          vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `
        );

        // Modify fragment shader to add height-based coloring
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <common>",
          `
          #include <common>
          varying vec3 vWorldPos;
          uniform vec3 colorValley;
          uniform vec3 colorGrass;
          uniform vec3 colorMountain;
          uniform vec3 colorPeak;
          uniform float heightValley;
          uniform float heightGrass;
          uniform float heightSlope;
          uniform float heightPeak;
          
          vec3 getHeightColor(float height) {
            vec3 color;
            if (height < heightGrass) {
              float t = smoothstep(heightValley, heightGrass, height);
              color = mix(colorValley, colorGrass, t);
            }
            else if (height < heightSlope) {
              float t = smoothstep(heightGrass, heightSlope, height);
              color = mix(colorGrass, colorMountain, t);
            }
            else {
              float t = smoothstep(heightSlope, heightPeak, height);
              color = mix(colorMountain, colorPeak, t);
            }
            return color;
          }
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <color_fragment>",
          `
          #include <color_fragment>
          vec3 heightColor = getHeightColor(vWorldPos.y);
          diffuseColor.rgb = heightColor;
          `
        );

        material.userData.shader = shader;
      };
    }

    return material;
  }, [
    lodLevel,
    showColorDebug,
    segmentsPerChunk,
    enableHeightGradient,
    valleyColor,
    grassColor,
    mountainColor,
    peakColor,
    heightValley,
    heightGrass,
    heightSlope,
    heightPeak,
  ]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      />
    </RigidBody>
  );
}

// Main terrain system - Optimized for BOTW-style open world with SHADER-BASED coloring
export const ProceduralTerrain5 = ({
  size = 2500,
  chunkSize = 500,
  segments = 512,
  heightScale = 85,
  seed = 24601,
  viewDistance = 1200,
  lodNear = 400,
  lodMedium = 800,
  lodFar = 1200,
  onTerrainReady,
  onHeightmapReady,
}) => {
  const {
    terrainSize,
    terrainChunkSize,
    terrainSegments,
    terrainHeightScale,
    terrainSeed,
    terrainViewDistance,
    enableViewDistanceCulling,
    enableChunks,
    enableLOD,
    showColorDebug,
    terrainLodNear,
    terrainLodMedium,
    terrainLodFar,
    enableHeightGradient,
    valleyColor,
    grassColor,
    mountainColor,
    peakColor,
    heightValley,
    heightGrass,
    heightSlope,
    heightPeak,
    mountainIntensity,
    flatnessThreshold,
    flatnessSmooth,
    ridgeSharpness,
    valleyDepth,
    detailAmount,
  } = useControls("🗻 BOTW Terrain v5 (Shader)", {
    terrainSize: {
      value: size,
      min: 500,
      max: 5000,
      step: 100,
      label: "World Size",
    },
    terrainChunkSize: {
      value: chunkSize,
      min: 100,
      max: 1000,
      step: 50,
      label: "Chunk Size",
    },
    terrainSegments: {
      value: segments,
      min: 20,
      max: 1024,
      step: 10,
      label: "Detail Segments",
    },
    terrainHeightScale: {
      value: heightScale,
      min: 10,
      max: 200,
      step: 5,
      label: "Height Scale",
    },
    terrainSeed: {
      value: seed,
      min: 0,
      max: 99999,
      step: 1,
      label: "Seed",
    },
    terrainViewDistance: {
      value: viewDistance,
      min: 500,
      max: 3000,
      step: 100,
      label: "View Distance",
    },
    enableViewDistanceCulling: {
      value: true,
      label: "Enable View Distance Culling",
    },
    enableChunks: {
      value: true,
      label: "Enable Chunks",
    },
    enableLOD: {
      value: false,
      label: "Enable LOD",
    },
    showColorDebug: {
      value: false,
      label: "Show LOD Colors",
    },
    terrainLodNear: {
      value: lodNear,
      min: 200,
      max: 1500,
      step: 50,
      label: "LOD Near",
    },
    terrainLodMedium: {
      value: lodMedium,
      min: 500,
      max: 2000,
      step: 50,
      label: "LOD Medium",
    },
    terrainLodFar: {
      value: lodFar,
      min: 1000,
      max: 3000,
      step: 50,
      label: "LOD Far",
    },
    enableHeightGradient: {
      value: true,
      label: "🎨 Enable Height Gradient (Shader)",
    },
    // BOTW-inspired color palette
    valleyColor: {
      value: "#2d5016", // Darker green for valleys
      label: "🌿 Valley Color (Low/Flat)",
    },
    grassColor: {
      value: "#4a7c3a", // Vibrant green for plains
      label: "🌾 Grass Color (Mid/Gentle)",
    },
    mountainColor: {
      value: "#6b5b3d", // Brown-gray for mountains
      label: "⛰️ Mountain Color (High)",
    },
    peakColor: {
      value: "#d4d4d4", // Light gray for peaks/snow
      label: "🏔️ Peak Color (Highest/Snow)",
    },
    heightValley: {
      value: -heightScale * 0.3,
      min: -100,
      max: 0,
      step: 1,
      label: "Valley Height (start gradient)",
    },
    heightGrass: {
      value: 0,
      min: -50,
      max: 50,
      step: 1,
      label: "Grass Height",
    },
    heightSlope: {
      value: heightScale * 0.4,
      min: 0,
      max: 200,
      step: 1,
      label: "Slope/Mountain Height",
    },
    heightPeak: {
      value: heightScale * 0.8,
      min: 50,
      max: 300,
      step: 1,
      label: "Peak Height (snow line)",
    },
    mountainIntensity: {
      value: 3.5,
      min: 0,
      max: 5,
      step: 0.1,
      label: "🏔️ Mountain Intensity",
    },
    flatnessThreshold: {
      value: 0.35,
      min: 0,
      max: 1,
      step: 0.05,
      label: "🌾 Flatness Threshold",
    },
    flatnessSmooth: {
      value: 0.25,
      min: 0,
      max: 1,
      step: 0.05,
      label: "🌾 Flatness Smoothness",
    },
    ridgeSharpness: {
      value: 2.5,
      min: 0.5,
      max: 5,
      step: 0.1,
      label: "⛰️ Ridge Sharpness",
    },
    valleyDepth: {
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.05,
      label: "🏞️ Valley Depth",
    },
    detailAmount: {
      value: 0.06,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: "✨ Detail Amount",
    },
  });

  const { camera } = useThree();
  const [visibleChunks, setVisibleChunks] = useState(new Map());
  const terrainReadyCalledRef = useRef(false);

  useEffect(() => {
    if (onTerrainReady && !terrainReadyCalledRef.current) {
      const shouldTrigger = enableChunks ? visibleChunks.size > 0 : true;
      if (shouldTrigger) {
        terrainReadyCalledRef.current = true;
        const timer = setTimeout(() => {
          const mode = enableChunks
            ? `${visibleChunks.size} chunks`
            : "single terrain";
          console.log(`✅ ProceduralTerrain5 (Shader) ready with ${mode}`);
          onTerrainReady();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [onTerrainReady, visibleChunks.size, enableChunks]);

  const chunksPerSide = Math.ceil(terrainSize / terrainChunkSize);
  const halfSize = terrainSize / 2;

  // Create simplex noise generators ONCE - shared by all chunks
  const noiseGenerators = useMemo(() => {
    return {
      noise: createNoiseGenerator(terrainSeed),
      noise2: createNoiseGenerator(terrainSeed + 1000),
      noise3: createNoiseGenerator(terrainSeed + 2000),
      noise4: createNoiseGenerator(terrainSeed + 3000),
    };
  }, [terrainSeed]);

  const terrainControls = useMemo(
    () => ({
      mountainIntensity,
      flatnessThreshold,
      flatnessSmooth,
      ridgeSharpness,
      valleyDepth,
      detailAmount,
      biomeVariation: 0.5,
    }),
    [
      mountainIntensity,
      flatnessThreshold,
      flatnessSmooth,
      ridgeSharpness,
      valleyDepth,
      detailAmount,
    ]
  );

  useEffect(() => {
    if (onHeightmapReady && noiseGenerators) {
      const heightmapLookup = (x, z) => {
        const height = getTerrainHeight(
          x,
          -z,
          noiseGenerators,
          terrainHeightScale,
          terrainControls
        );
        return height;
      };
      console.log("✅ ProceduralTerrain5 (Shader) heightmap ready");
      onHeightmapReady(heightmapLookup);
    }
  }, [noiseGenerators, terrainHeightScale, terrainControls, onHeightmapReady]);

  const segmentsPerChunk = Math.max(
    10,
    Math.floor((terrainSegments * terrainChunkSize) / terrainSize)
  );

  const getLODSegments = (distance) => {
    if (!enableLOD) return segmentsPerChunk;
    if (distance < terrainLodNear) return segmentsPerChunk;
    if (distance < terrainLodMedium) return Math.floor(segmentsPerChunk / 2);
    return Math.floor(segmentsPerChunk / 4);
  };

  useFrame(() => {
    if (!enableChunks) {
      if (visibleChunks.size > 0) {
        setVisibleChunks(new Map());
      }
      return;
    }

    const cameraPos = camera.position;
    const newVisibleChunks = new Map();

    for (let x = 0; x < chunksPerSide; x++) {
      for (let z = 0; z < chunksPerSide; z++) {
        const chunkMinX = x * terrainChunkSize - halfSize;
        const chunkMaxX = chunkMinX + terrainChunkSize;
        const chunkMinZ = z * terrainChunkSize - halfSize;
        const chunkMaxZ = chunkMinZ + terrainChunkSize;

        const nearestX = Math.max(chunkMinX, Math.min(cameraPos.x, chunkMaxX));
        const nearestZ = Math.max(chunkMinZ, Math.min(cameraPos.z, chunkMaxZ));

        const dx = cameraPos.x - nearestX;
        const dz = cameraPos.z - nearestZ;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (!enableViewDistanceCulling || distance < terrainViewDistance) {
          const lodLevel = getLODSegments(distance);
          const chunkKey = `${x},${z}`;
          newVisibleChunks.set(chunkKey, { x, z, lodLevel, distance });
        }
      }
    }

    let needsUpdate = newVisibleChunks.size !== visibleChunks.size;
    if (!needsUpdate) {
      for (const [key, value] of newVisibleChunks) {
        const old = visibleChunks.get(key);
        if (!old || old.lodLevel !== value.lodLevel) {
          needsUpdate = true;
          break;
        }
      }
    }

    if (needsUpdate) {
      setVisibleChunks(newVisibleChunks);
    }
  });

  if (!enableChunks) {
    return (
      <group>
        <TerrainChunk
          key="single-terrain"
          chunkX={-0.5}
          chunkZ={-0.5}
          chunkSize={terrainSize}
          segments={terrainSegments}
          heightScale={terrainHeightScale}
          noiseGenerators={noiseGenerators}
          lodLevel={terrainSegments}
          showColorDebug={showColorDebug}
          maxSegments={terrainSegments}
          segmentsPerChunk={terrainSegments}
          enableHeightGradient={enableHeightGradient}
          valleyColor={valleyColor}
          grassColor={grassColor}
          mountainColor={mountainColor}
          peakColor={peakColor}
          heightValley={heightValley}
          heightGrass={heightGrass}
          heightSlope={heightSlope}
          heightPeak={heightPeak}
          terrainControls={terrainControls}
        />
      </group>
    );
  }

  return (
    <group>
      {Array.from(visibleChunks.values()).map((chunkData) => {
        const { x, z, lodLevel } = chunkData;
        const chunkX = x - Math.floor(chunksPerSide / 2);
        const chunkZ = z - Math.floor(chunksPerSide / 2);
        const chunkKey = `${x},${z}`;

        return (
          <TerrainChunk
            key={`${chunkKey}`}
            chunkX={chunkX}
            chunkZ={chunkZ}
            chunkSize={terrainChunkSize}
            segments={lodLevel}
            heightScale={terrainHeightScale}
            noiseGenerators={noiseGenerators}
            lodLevel={lodLevel}
            showColorDebug={showColorDebug}
            maxSegments={terrainSegments}
            segmentsPerChunk={segmentsPerChunk}
            enableHeightGradient={enableHeightGradient}
            valleyColor={valleyColor}
            grassColor={grassColor}
            mountainColor={mountainColor}
            peakColor={peakColor}
            heightValley={heightValley}
            heightGrass={heightGrass}
            heightSlope={heightSlope}
            heightPeak={heightPeak}
            terrainControls={terrainControls}
          />
        );
      })}
    </group>
  );
};
