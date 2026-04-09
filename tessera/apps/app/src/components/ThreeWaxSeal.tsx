'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

export function ThreeWaxSeal({ onComplete }: { onComplete?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const stampRef = useRef<THREE.Group>(null);
  const waxRef = useRef<THREE.Mesh>(null);
  
  const [phase, setPhase] = useState<'descending' | 'pressing' | 'lifting' | 'done'>('descending');
  const [waxSquish, setWaxSquish] = useState(0);
  const [dpr, setDpr] = useState(1.5);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'low'>('high');

  useFrame((state, delta) => {
    if (!stampRef.current || !waxRef.current) return;

    if (phase === 'descending') {
      stampRef.current.position.y = THREE.MathUtils.lerp(stampRef.current.position.y, 0.2, 5 * delta);
      if (stampRef.current.position.y <= 0.25) {
        setPhase('pressing');
      }
    } 
    else if (phase === 'pressing') {
      stampRef.current.position.y = THREE.MathUtils.lerp(stampRef.current.position.y, 0.05, 5 * delta);
      setWaxSquish((prev) => Math.min(1, prev + 2 * delta));
      
      // Scale out wax to simulate squishing
      const squishScale = 1 + waxSquish * 0.4;
      waxRef.current.scale.set(squishScale, 1 - waxSquish * 0.5, squishScale);
      
      if (waxSquish >= 0.9) {
        setTimeout(() => setPhase('lifting'), 400); // Hold press shortly
      }
    } 
    else if (phase === 'lifting') {
      stampRef.current.position.y = THREE.MathUtils.lerp(stampRef.current.position.y, 3.0, 5 * delta);
      stampRef.current.rotation.x = THREE.MathUtils.lerp(stampRef.current.rotation.x, -0.5, 3 * delta);
      
      if (stampRef.current.position.y > 2.0) {
        setPhase('done');
        if (onComplete) onComplete();
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full h-full max-w-md max-h-[600px] relative pointer-events-none">
        <Canvas camera={{ position: [0, 2, 4], fov: 40 }} dpr={dpr} shadows={performanceMode === 'high'}>
          <PerformanceMonitor 
            onIncline={() => { setDpr(1.5); setPerformanceMode('high'); }} 
            onDecline={() => { setDpr(1); setPerformanceMode('low'); }} 
          />

          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow={performanceMode === 'high'} />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <Environment preset="city" />

          <group ref={groupRef} position={[0, -0.5, 0]}>
            {/* The Paper / Parchment Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow={performanceMode === 'high'}>
              <planeGeometry args={[10, 10]} />
              <meshStandardMaterial color="#f5f5f4" roughness={0.9} />
            </mesh>

            {/* The Hot Wax */}
            <mesh ref={waxRef} position={[0, 0.05, 0]} castShadow={performanceMode === 'high'} receiveShadow={performanceMode === 'high'}>
              <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
              <meshStandardMaterial 
                color="#991b1b" 
                roughness={phase === 'done' ? 0.3 : 0.1} // Glossy when hot, slightly rougher when drying
                metalness={0.1} 
              />
              {phase !== 'descending' && (
                {/* Embossed Logo inside wax */}
                <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.3, 0.4, 32]} />
                  <meshStandardMaterial color="#7f1d1d" roughness={0.4} />
                </mesh>
              )}
            </mesh>

            {/* The Brass Stamp Tool */}
            <group ref={stampRef} position={[0, 3, 0]}>
              {/* Stamp Head */}
              <mesh position={[0, 0.2, 0]} castShadow={performanceMode === 'high'}>
                <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
                <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.2} />
              </mesh>
              
              {/* Handle Shaft */}
              <mesh position={[0, 1.2, 0]} castShadow={performanceMode === 'high'}>
                <cylinderGeometry args={[0.15, 0.2, 1.6, 16]} />
                <meshStandardMaterial color="#451a03" roughness={0.6} />
              </mesh>

              {/* Handle Pommel */}
              <mesh position={[0, 2.1, 0]} castShadow={performanceMode === 'high'}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#451a03" roughness={0.6} />
              </mesh>
            </group>

          </group>

          <ContactShadows position={[0, -0.04, 0]} opacity={0.6} scale={5} blur={1.5} far={2} />
        </Canvas>
      </div>
    </div>
  );
}