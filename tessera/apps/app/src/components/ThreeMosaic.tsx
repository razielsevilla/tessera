'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Instance, Instances, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { BMPMetadata } from './TesseraCell';

interface TesseraSlot {
  id: number;
  isFilled: boolean;
  metadata?: BMPMetadata;
}

interface InteractiveVoxelProps {
  position: [number, number, number];
  color: string;
  isFilled: boolean;
  height: number;
  slot: TesseraSlot;
  onClick: (id: number) => void;
}

function InteractiveVoxel({ position, color, isFilled, height, slot, onClick }: InteractiveVoxelProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  const targetHeight = isFilled ? Math.max(0.1, (height / 100) * 1.5) : 0.05;
  const currentHeight = useRef(0.05);

  useFrame((state, delta) => {
    if (ref.current) {
      currentHeight.current = THREE.MathUtils.lerp(currentHeight.current, targetHeight, delta * 5);
      const yOffset = currentHeight.current / 2;
      ref.current.position.set(position[0], position[1] + yOffset, position[2]);
      ref.current.scale.set(1, currentHeight.current, 1);
      
      if (hovered && isFilled) {
        ref.current.position.y += Math.sin(state.clock.elapsedTime * 5) * 0.05;
      }
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh 
        onClick={(e) => { e.stopPropagation(); if (isFilled) onClick(slot.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = isFilled ? 'pointer' : 'auto'; }}
        onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={hovered ? 0.5 : 0.1}
          emissive={color}
          emissiveIntensity={hovered && isFilled ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}

interface ThreeMosaicProps {
  slots: TesseraSlot[];
  onDayClick: (id: number) => void;
}

export function ThreeMosaic({ slots, onDayClick }: ThreeMosaicProps) {
  // Map moodScore (1-10) to a color
  const getColor = (metadata?: BMPMetadata) => {
    if (!metadata) return '#e7e5e4'; // empty stone color
    const hue = Math.max(0, Math.min(360, (metadata.moodScore / 10) * 120)); // Red(0) to Green(120)
    // boost saturation if social battery is high
    const sat = 50 + (metadata.socialBattery / 10) * 50; 
    return new THREE.Color(`hsl(${hue}, ${sat}%, ${metadata.frameTier >= 3 ? '60%' : '40%'})`).getHexString();
  };

  const voxels = useMemo(() => {
    const grid: React.ReactNode[] = [];
    const cols = 52;
    const rows = 7;
    const spacing = 0.9;
    
    // Center the grid
    const offsetX = (cols * spacing) / 2;
    const offsetZ = (rows * spacing) / 2;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const index = c * rows + r;
        if (index < slots.length) {
          const slot = slots[index];
          const x = c * spacing - offsetX;
          const z = r * spacing - offsetZ;
          
          grid.push(
            <InteractiveVoxel 
              key={slot.id}
              position={[x, 0, z]}
              color={`#${getColor(slot.metadata)}`}
              isFilled={slot.isFilled}
              height={slot.metadata?.productivityScore || 1}
              slot={slot}
              onClick={onDayClick}
            />
          );
        }
      }
    }
    return grid;
  }, [slots, onDayClick]);

  return (
    <div className="w-full h-[500px] bg-stone-100 dark:bg-stone-950 rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing border border-stone-200 dark:border-stone-800 shadow-inner">
      <Canvas camera={{ position: [0, 15, 30], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        
        {/* Base plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[60, 20]} />
          <meshStandardMaterial color="#292524" roughness={0.8} />
        </mesh>
        
        {voxels}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 - 0.1} // Don't go below ground
          minDistance={10}
          maxDistance={50}
        />
      </Canvas>
      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}