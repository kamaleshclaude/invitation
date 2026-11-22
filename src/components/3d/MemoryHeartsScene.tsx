import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Image, Text, Float } from '@react-three/drei';
import { REUNION_CONFIG } from '../../config/reunionConfig';
import type { MemoryPhoto } from '../../config/reunionConfig';
import { sound } from '../../utils/soundEffects';

interface MemoryCardProps {
  photo: MemoryPhoto;
  position: [number, number, number];
  onClick: () => void;
}

export const InteractiveMemoryHeart: React.FC<MemoryCardProps> = ({ photo, position, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Extruded 3D Heart Geometry
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 1.0);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    if (!flipped) {
      // Idle float & bob
      meshRef.current.position.y = position[1] + Math.sin(t * 1.5 + position[0]) * 0.15;
      meshRef.current.rotation.y = Math.sin(t * 0.8 + position[2]) * 0.3;
      if (hovered) {
        meshRef.current.rotation.y += 0.05;
      }
    } else {
      // Flipped towards camera
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, Math.PI, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position[2] + 1.5, 0.1);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    sound.playPop();
    setFlipped(!flipped);
    onClick();
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      scale={hovered ? 1.15 : 1.0}
    >
      {/* Front: Glossy 3D Heart */}
      <group scale={[1.4, -1.4, 1.4]} rotation={[0, 0, Math.PI]}>
        <mesh position={[-0.25, -0.6, 0]}>
          <extrudeGeometry args={[heartShape, extrudeSettings]} />
          <meshPhysicalMaterial
            color="#ec4899"
            emissive="#f43f5e"
            emissiveIntensity={hovered ? 0.6 : 0.2}
            roughness={0.15}
            metalness={0.3}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </group>

      {/* Heart Center Label */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq.woff"
      >
        Tap Memory ❤️
      </Text>

      {/* Back: 3D Photo Frame showing Group Photo */}
      <group position={[0, 0, -0.1]} rotation={[0, Math.PI, 0]}>
        {/* Frame Border */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 2.0, 0.12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Nostalgic Photo */}
        <Image
          url={photo.url}
          scale={[2.2, 1.4]}
          position={[0, 0.15, 0.08]}
          transparent
        />

        {/* Photo Title & Caption */}
        <Text
          position={[0, -0.65, 0.08]}
          fontSize={0.14}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.2}
        >
          {photo.title}
        </Text>
      </group>
    </group>
  );
};

export const MemoryHeartsCanvas: React.FC<{ onPhotoSelect: (photo: MemoryPhoto) => void }> = ({ onPhotoSelect }) => {
  const photos = REUNION_CONFIG.defaultMemoryPhotos;

  return (
    <div className="w-full h-80 sm:h-96 relative">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fed7aa" />
        <pointLight position={[-10, -5, -5]} intensity={0.8} color="#f43f5e" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          {photos.map((photo, idx) => {
            // Position hearts nicely spaced across 3D hero stage
            const xOffset = (idx - (photos.length - 1) / 2) * 2.2;
            const yOffset = (idx % 2 === 0 ? 0.3 : -0.3);
            return (
              <InteractiveMemoryHeart
                key={photo.id}
                photo={photo}
                position={[xOffset, yOffset, 0]}
                onClick={() => onPhotoSelect(photo)}
              />
            );
          })}
        </Float>
      </Canvas>
    </div>
  );
};
