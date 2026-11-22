import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Float } from '@react-three/drei';
import { REUNION_CONFIG } from '../../config/reunionConfig';

interface SchoolSceneProps {
  progress: number; // 0 (closed) to 1 (fully open / flew through)
  mouseOffset: { x: number; y: number };
}

// Procedural 3D Heart Geometry
function HeartMesh({ position, scale = 1, color = "#f43f5e", speed = 1 }: { position: [number, number, number]; scale?: number; color?: string; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

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
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    meshRef.current.rotation.y = Math.sin(t * 0.8) * 0.4;
    meshRef.current.rotation.z = Math.cos(t * 0.5) * 0.15;
    meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.25;
  });

  return (
    <mesh ref={meshRef} position={position} scale={[scale, -scale, scale]} rotation={[0, 0, Math.PI]}>
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.7} 
        emissive={color} 
        emissiveIntensity={0.25} 
      />
    </mesh>
  );
}

// Glowing Fireflies / Golden Dust
function Fireflies({ count = 35 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 8 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      col[i * 3] = 1.0; // r
      col[i * 3 + 1] = 0.8 + Math.random() * 0.2; // g
      col[i * 3 + 2] = 0.3; // b
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] += Math.sin(t + i) * 0.005;
      posArray[i * 3] += Math.cos(t * 0.5 + i) * 0.003;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main 3D Building, Pillars, Arch and Swinging Gates
export const SchoolScene: React.FC<SchoolSceneProps> = ({ progress, mouseOffset }) => {
  const { camera } = useThree();
  const leftGateRef = useRef<THREE.Group>(null);
  const rightGateRef = useRef<THREE.Group>(null);
  const goldenLightRef = useRef<THREE.PointLight>(null);

  // Camera fly-through based on progress & mouse parallax
  useFrame(() => {
    // Target camera Z moves from z=12 to z=2 as progress increases
    const targetZ = THREE.MathUtils.lerp(11, 2.5, progress);
    const targetY = THREE.MathUtils.lerp(2.2, 1.8, progress) + mouseOffset.y * 0.6;
    const targetX = mouseOffset.x * 0.8;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.lookAt(0, 2, -5);

    // Gates swing open smoothly
    const gateAngle = progress * (Math.PI * 0.48); // swing ~85 degrees outward
    if (leftGateRef.current) {
      leftGateRef.current.rotation.y = -gateAngle;
    }
    if (rightGateRef.current) {
      rightGateRef.current.rotation.y = gateAngle;
    }

    // Golden light intensity surges as gates open
    if (goldenLightRef.current) {
      goldenLightRef.current.intensity = 2 + progress * 8;
    }
  });

  return (
    <>
      {/* Warm Sunset Sky Lighting */}
      <ambientLight intensity={0.8} color="#fed7aa" />
      <directionalLight 
        position={[10, 15, 8]} 
        intensity={2.2} 
        color="#fb923c" 
        castShadow 
      />
      <directionalLight 
        position={[-8, 6, -5]} 
        intensity={1.2} 
        color="#e11d48" 
      />

      {/* Golden divine light pouring from inside school grounds */}
      <pointLight 
        ref={goldenLightRef} 
        position={[0, 2.5, -4]} 
        color="#fef08a" 
        distance={25} 
        intensity={2} 
      />

      {/* Ground Grass / Courtyard */}
      <mesh position={[0, -0.05, -5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1e2922" roughness={0.9} />
      </mesh>

      {/* Stone Paved Pathway */}
      <mesh position={[0, 0.01, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* ================= SCHOOL MAIN BUILDING FACADE ================= */}
      <group position={[0, 0, -12]}>
        {/* Main Central Block */}
        <mesh position={[0, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 8, 4]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>

        {/* Triangular Pediment / Roof Header */}
        <mesh position={[0, 9.2, 0]}>
          <coneGeometry args={[7, 2.4, 4]} />
          <meshStandardMaterial color="#b45309" roughness={0.4} />
        </mesh>

        {/* School Crest / Shield */}
        <mesh position={[0, 8.8, 2.05]}>
          <cylinderGeometry args={[0.9, 0.9, 0.15, 32]} />
          <meshStandardMaterial color="#fef08a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* School Name on Facade */}
        <Text
          position={[0, 6.8, 2.05]}
          fontSize={0.65}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#78350f"
        >
          {REUNION_CONFIG.schoolName.toUpperCase()}
        </Text>

        <Text
          position={[0, 6.0, 2.05]}
          fontSize={0.35}
          color="#fef3c7"
          anchorX="center"
          anchorY="middle"
        >
          FOUNDED FOR EXCELLENCE • REUNION 2026
        </Text>

        {/* Classical Grand Pillars */}
        {[-6, -3, 3, 6].map((x, idx) => (
          <group key={idx} position={[x, 3.5, 2.2]}>
            <mesh>
              <cylinderGeometry args={[0.4, 0.45, 7, 24]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.3} />
            </mesh>
            {/* Pillar Capital */}
            <mesh position={[0, 3.6, 0]}>
              <boxGeometry args={[1.1, 0.3, 1.1]} />
              <meshStandardMaterial color="#fef08a" />
            </mesh>
            {/* Pillar Base */}
            <mesh position={[0, -3.4, 0]}>
              <boxGeometry args={[1.2, 0.4, 1.2]} />
              <meshStandardMaterial color="#fef08a" />
            </mesh>
          </group>
        ))}

        {/* Grand Windows with glowing interior evening light */}
        {[-7, -4.5, -2, 2, 4.5, 7].map((x, idx) => (
          <mesh key={idx} position={[x, 3.8, 2.05]}>
            <planeGeometry args={[1.3, 2.4]} />
            <meshStandardMaterial 
              color="#fef08a" 
              emissive="#f59e0b" 
              emissiveIntensity={0.8} 
              roughness={0.1} 
            />
          </mesh>
        ))}

        {/* Central Grand Entrance Doors */}
        <mesh position={[0, 1.8, 2.05]}>
          <planeGeometry args={[2.8, 3.6]} />
          <meshStandardMaterial color="#451a03" roughness={0.6} />
        </mesh>
      </group>

      {/* ================= SCHOOL BOUNDARY WALL & GATEPOSTS ================= */}
      <group position={[0, 0, 3]}>
        {/* Left Stone Wall */}
        <mesh position={[-7.5, 1.5, 0]}>
          <boxGeometry args={[9, 3, 0.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Right Stone Wall */}
        <mesh position={[7.5, 1.5, 0]}>
          <boxGeometry args={[9, 3, 0.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Left Gatepost */}
        <mesh position={[-2.8, 2.2, 0]}>
          <boxGeometry args={[1.1, 4.4, 1.1]} />
          <meshStandardMaterial color="#d97706" roughness={0.4} />
        </mesh>
        <mesh position={[-2.8, 4.5, 0]}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color="#fef08a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Right Gatepost */}
        <mesh position={[2.8, 2.2, 0]}>
          <boxGeometry args={[1.1, 4.4, 1.1]} />
          <meshStandardMaterial color="#d97706" roughness={0.4} />
        </mesh>
        <mesh position={[2.8, 4.5, 0]}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color="#fef08a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Overhead Iron Arch over Gate */}
        <mesh position={[0, 4.4, 0]}>
          <boxGeometry args={[6.2, 0.25, 0.3]} />
          <meshStandardMaterial color="#fef08a" metalness={0.8} roughness={0.2} />
        </mesh>
        <Text
          position={[0, 4.8, 0]}
          fontSize={0.32}
          color="#fef08a"
          anchorX="center"
          anchorY="middle"
        >
          ★ WELCOME ALUMNI ★
        </Text>

        {/* ================= SWINGING IRON GATES ================= */}
        {/* Left Gate Hinge at x = -2.25 */}
        <group ref={leftGateRef} position={[-2.25, 1.7, 0]}>
          {/* Gate Leaf pivoted at hinge */}
          <group position={[1.1, 0, 0]}>
            {/* Outer Frame */}
            <mesh>
              <boxGeometry args={[2.2, 3.2, 0.1]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} wireframe />
            </mesh>
            {/* Iron Bars */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((bx, i) => (
              <mesh key={i} position={[bx, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 3.1, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.9} />
              </mesh>
            ))}
            {/* Golden Star Emblem on Gate */}
            <mesh position={[0, 0, 0.08]}>
              <cylinderGeometry args={[0.35, 0.35, 0.05, 5]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* Right Gate Hinge at x = 2.25 */}
        <group ref={rightGateRef} position={[2.25, 1.7, 0]}>
          {/* Gate Leaf pivoted at hinge */}
          <group position={[-1.1, 0, 0]}>
            {/* Outer Frame */}
            <mesh>
              <boxGeometry args={[2.2, 3.2, 0.1]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} wireframe />
            </mesh>
            {/* Iron Bars */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((bx, i) => (
              <mesh key={i} position={[bx, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 3.1, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.9} />
              </mesh>
            ))}
            {/* Golden Star Emblem on Gate */}
            <mesh position={[0, 0, 0.08]}>
              <cylinderGeometry args={[0.35, 0.35, 0.05, 5]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Floating 3D Hearts */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <HeartMesh position={[-3.2, 3.5, 5]} scale={0.7} color="#fb7185" speed={1.2} />
        <HeartMesh position={[3.5, 4.0, 4.5]} scale={0.85} color="#f43f5e" speed={0.9} />
        <HeartMesh position={[-1.8, 4.8, 2]} scale={0.6} color="#fda4af" speed={1.4} />
        <HeartMesh position={[2.2, 3.2, 2.5]} scale={0.75} color="#f59e0b" speed={1.1} />
        <HeartMesh position={[0, 5.2, -1]} scale={1.0} color="#e11d48" speed={0.8} />
      </Float>

      {/* Fireflies / Golden particles */}
      <Fireflies count={45} />
    </>
  );
};
