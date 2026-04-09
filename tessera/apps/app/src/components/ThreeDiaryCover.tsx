'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

function BookModel() {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Book Cover Base */}
        <RoundedBox args={[3.2, 4.5, 0.45]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#292524" roughness={0.7} />
        </RoundedBox>
        
        {/* Pages Edge */}
        <RoundedBox args={[3.0, 4.3, 0.47]} radius={0.02} smoothness={4} position={[0.15, 0, 0]}>
          <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
        </RoundedBox>

        {/* Binding Strap Top */}
        <mesh position={[-1.6, 1.2, 0]}>
          <boxGeometry args={[0.3, 0.35, 0.5]} />
          <meshStandardMaterial color="#44403c" roughness={0.8} />
        </mesh>

        {/* Binding Strap Bottom */}
        <mesh position={[-1.6, -1.2, 0]}>
          <boxGeometry args={[0.3, 0.35, 0.5]} />
          <meshStandardMaterial color="#44403c" roughness={0.8} />
        </mesh>

        {/* Clasp / Lock Plate */}
        <mesh position={[1.65, 0, 0]}>
          <boxGeometry args={[0.2, 0.8, 0.52]} />
          <meshStandardMaterial color="#a8a29e" metalness={0.6} roughness={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

export function ThreeDiaryCover() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Environment preset="city" />
        
        <BookModel />
        
        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 1.5} 
          minAzimuthAngle={-Math.PI / 8}
          maxAzimuthAngle={Math.PI / 8}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}