'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Environment, ContactShadows, Float, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

interface BookModelProps {
  isUnlocked: boolean;
  onUnlockComplete?: () => void;
}

function BookModel({ isUnlocked, onUnlockComplete }: BookModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coverRef = useRef<THREE.Group>(null);
  const lockRef = useRef<THREE.Group>(null);
  const [completeFired, setCompleteFired] = useState(false);

  // Subtle floating and open animations
  useFrame((state, delta) => {
    if (isUnlocked) {
      if (lockRef.current) {
        // Unlock click
        lockRef.current.position.x = THREE.MathUtils.lerp(lockRef.current.position.x, 2.0, 5 * delta);
        lockRef.current.rotation.y = THREE.MathUtils.lerp(lockRef.current.rotation.y, Math.PI / 4, 5 * delta);
      }
      if (coverRef.current) {
        // Swing cover open
        coverRef.current.rotation.y = THREE.MathUtils.lerp(coverRef.current.rotation.y, -Math.PI / 1.1, 4 * delta);
      }
      if (groupRef.current) {
        // Rotate book to face camera properly
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 4 * delta);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 4 * delta);
      }

      // Zoom camera into the pages
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 2.5, 3 * delta);
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 1.0, 3 * delta);

      if (!completeFired && state.camera.position.z < 3.0) {
        setCompleteFired(true);
        // Small delay to let the zoom finish smoothly before unmounting
        setTimeout(() => {
          if (onUnlockComplete) onUnlockComplete();
        }, 300);
      }

    } else {
      if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      <Float speed={2} rotationIntensity={isUnlocked ? 0 : 0.2} floatIntensity={isUnlocked ? 0 : 0.5}>
        
        {/* Back Cover Base */}
        <RoundedBox args={[3.2, 4.5, 0.15]} radius={0.02} smoothness={4} position={[0, 0, -0.15]}>
          <meshStandardMaterial color="#292524" roughness={0.7} />
        </RoundedBox>
        
        {/* Pages Edge / Interior */}
        <RoundedBox args={[3.0, 4.3, 0.35]} radius={0.02} smoothness={4} position={[0.1, 0, 0.1]}>
          <meshStandardMaterial color="#fafaf9" roughness={0.9} />
        </RoundedBox>

        {/* Front Cover Assembly (Hinged at left edge -1.6) */}
        <group ref={coverRef} position={[-1.6, 0, 0.3]}>
          {/* Front Cover Base (Offset by 1.6 to pivot around hinge) */}
          <RoundedBox args={[3.2, 4.5, 0.15]} radius={0.02} smoothness={4} position={[1.6, 0, 0]}>
            <meshStandardMaterial color="#292524" roughness={0.7} />
          </RoundedBox>
          
          {/* Binding Strap Top - attached to front cover */}
          <mesh position={[0.15, 1.2, 0.1]}>
            <boxGeometry args={[0.3, 0.35, 0.1]} />
            <meshStandardMaterial color="#44403c" roughness={0.8} />
          </mesh>

          {/* Binding Strap Bottom - attached to front cover */}
          <mesh position={[0.15, -1.2, 0.1]}>
            <boxGeometry args={[0.3, 0.35, 0.1]} />
            <meshStandardMaterial color="#44403c" roughness={0.8} />
          </mesh>
        </group>

        {/* Clasp / Lock Plate - Right Side */}
        <group ref={lockRef} position={[1.6, 0, 0.3]}>
          <mesh position={[0.1, 0, -0.1]}>
             <boxGeometry args={[0.3, 0.6, 0.4]} />
             <meshStandardMaterial color="#a8a29e" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        
        {/* Extra Binding Straps on Back */}
        <mesh position={[-1.5, 1.2, -0.1]}>
          <boxGeometry args={[0.4, 0.35, 0.2]} />
          <meshStandardMaterial color="#44403c" roughness={0.8} />
        </mesh>
        <mesh position={[-1.5, -1.2, -0.1]}>
          <boxGeometry args={[0.4, 0.35, 0.2]} />
          <meshStandardMaterial color="#44403c" roughness={0.8} />
        </mesh>

      </Float>
    </group>
  );
}

export function ThreeDiaryCover({ isUnlocked = false, onUnlockComplete }: { isUnlocked?: boolean, onUnlockComplete?: () => void }) {
  const [dpr, setDpr] = useState(1.5);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'low'>('high');

  return (
    <div className={`absolute inset-0 w-full h-full -z-10 ${isUnlocked ? '' : 'cursor-grab active:cursor-grabbing'}`}>
      <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} dpr={dpr} shadows={performanceMode === 'high'}>
        <PerformanceMonitor 
          onIncline={() => { setDpr(1.5); setPerformanceMode('high'); }} 
          onDecline={() => { setDpr(1); setPerformanceMode('low'); }} 
        />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow={performanceMode === 'high'} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Environment preset="city" />
        
        <BookModel isUnlocked={isUnlocked} onUnlockComplete={onUnlockComplete} />
        
        <ContactShadows position={[0, -2.5, 0]} opacity={isUnlocked ? 0 : 0.5} scale={10} blur={2.5} far={4} />
        
        {!isUnlocked && (
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
        )}
      </Canvas>
    </div>
  );
}