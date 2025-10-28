/**
 * FlowingLinesSimple - Direct port of the CodePen example
 * https://discourse.threejs.org/t/creating-white-breezy-effect-seeking-guidance-and-insights/55552
 */
import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FlowingLinesSimpleProps {
  enabled?: boolean;
  lineCount?: number;
  getTerrainHeight?: (x: number, z: number) => number;
}

export const FlowingLinesSimple: React.FC<FlowingLinesSimpleProps> = ({
  enabled = true,
  lineCount = 10,
  getTerrainHeight,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<any[]>([]);

  // Create gradient texture (exactly like CodePen)
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 8;
    const context = canvas.getContext("2d")!;
    const gradient = context.createLinearGradient(0, 0, 64, 0);
    gradient.addColorStop(0.0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.5, "rgba(255,255,255,128)");
    gradient.addColorStop(1.0, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 8);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Create lines (exactly like CodePen)
  useEffect(() => {
    if (!enabled || !groupRef.current) return;

    console.log("🌊 Creating lines...");

    // Clear old lines
    linesRef.current = [];
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    // Create lines
    const lines: THREE.Mesh[] = [];
    for (let i = 0; i < lineCount; i++) {
      const line = new THREE.Mesh(
        // Scale up geometry: 1x1 -> 10x5 for visibility on large terrain
        new THREE.PlaneGeometry(10, 5, 20, 1),
        new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
        })
      );

      line.frustumCulled = false; // Prevent culling

      // Store additional data on the mesh (like CodePen)
      (line as any).pos = line.geometry.getAttribute("position");
      (line as any).rnda = Math.random();
      (line as any).rndb = Math.random();
      (line as any).rndc = Math.random();
      (line as any).rndd = Math.random();

      lines.push(line);
      groupRef.current.add(line);
    }

    linesRef.current = lines;
    console.log(`✅ Created ${lines.length} lines`);
  }, [enabled, lineCount, texture]);

  // Animation loop (exactly like CodePen flowLine function)
  useFrame(({ clock }) => {
    if (!enabled || linesRef.current.length === 0) return;

    const t = clock.getElapsedTime() * 1000; // Convert to milliseconds

    for (const line of linesRef.current) {
      const time = t / 3000;
      const pos = (line as any).pos;
      const rnda = (line as any).rnda;
      const rndb = (line as any).rndb;
      const rndc = (line as any).rndc;
      const rndd = (line as any).rndd;

      // Loop through all 42 vertices (21 * 2)
      for (let i = 0; i < 42; i++) {
        const vertTime = time + (i % 21) / 60;
        // Scale up the movement area (4 -> 20) for larger terrain
        const x = 20 * Math.sin(5 * rnda * vertTime + 6 * rndb);
        const y = 20 * Math.cos(5 * rndc * vertTime + 6 * rndd);

        // Float at a fixed height instead of following terrain to avoid jitter
        // The original CodePen had smooth terrain, but real heightmaps cause jumps
        const fixedHeight = 5.0; // Float 5 units above ground
        const z =
          fixedHeight +
          0.04 * (i > 20 ? 1 : -1) * Math.cos(((i % 21) - 10) / 8);

        // Set vertex position (note: x, z, -y to match CodePen orientation)
        pos.setXYZ(i, x, z, -y);
      }

      pos.needsUpdate = true;
    }
  });

  if (!enabled) return null;

  return <group ref={groupRef} />;
};

export default FlowingLinesSimple;
