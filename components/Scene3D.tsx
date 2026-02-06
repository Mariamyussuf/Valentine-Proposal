import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Sparkles, Float, Torus, Sphere } from '@react-three/drei';
import FloatingHeart from './FloatingHeart';
import * as THREE from 'three';

// --- Confetti Component (Heart Shaped) ---
const Confetti = ({ count = 400 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Heart Shape Definition
  const heartShape = useMemo(() => {
    const x = 0, y = 0;
    const shape = new THREE.Shape();
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
    shape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
    shape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
    shape.bezierCurveTo(x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return shape;
  }, []);

  // Use ShapeGeometry for the confetti
  const geometry = useMemo(() => new THREE.ShapeGeometry(heartShape), [heartShape]);

  // Confetti data
  const particles = useMemo(() => {
    // Deep, Muted Merlot Palette
    const colors = [
        '#881337', // Merlot (Requested)
        '#9f1239', // Rose 800
        '#be123c', // Rose 700
        '#4c0519', // Rose 950 (Deep Burgundy)
        '#fda4af'  // Rose 300 (Muted Pink for contrast, not neon)
    ];
    return new Array(count).fill(0).map(() => {
      const scale = Math.random() * 0.4 + 0.2; // Slightly larger for visibility
      return {
        position: new THREE.Vector3((Math.random() - 0.5) * 25, Math.random() * 15 + 5, (Math.random() - 0.5) * 15),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, -Math.random() * 0.08 - 0.04, (Math.random() - 0.5) * 0.05),
        rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        rotationSpeed: new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1),
        color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        scale: new THREE.Vector3(scale, scale, 1) 
      };
    });
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      // Update position
      particle.position.add(particle.velocity);
      
      // Update rotation
      particle.rotation.x += particle.rotationSpeed.x;
      particle.rotation.y += particle.rotationSpeed.y;
      particle.rotation.z += particle.rotationSpeed.z;

      // Reset if below view
      if (particle.position.y < -10) {
        particle.position.set((Math.random() - 0.5) * 20, 15, (Math.random() - 0.5) * 10);
        particle.velocity.set((Math.random() - 0.5) * 0.05, -Math.random() * 0.08 - 0.04, (Math.random() - 0.5) * 0.05);
      }

      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.rotation.x, particle.rotation.y, particle.rotation.z);
      dummy.scale.copy(particle.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, particle.color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <meshStandardMaterial side={THREE.DoubleSide} vertexColors roughness={0.4} metalness={0.6} />
    </instancedMesh>
  );
};


const DynamicRings = ({ intensity }: { intensity: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Constant slow rotation
      groupRef.current.rotation.y += delta * 0.05;
      
      // Wobble effect
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.1;

      // Intensity reaction
      if (intensity > 0) {
         // accelerate rotation
         groupRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Large Metallic Ring */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Torus args={[4.5, 0.01, 64, 100]} rotation={[Math.PI / 2.3, 0, 0]}>
            <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={1} transparent opacity={0.3} />
        </Torus>
      </Float>

      {/* Decorative Wireframe Ring - Darker, subtler */}
      <Float speed={3} rotationIntensity={0.4} floatIntensity={0.3}>
         <Torus args={[3.8, 0.03, 16, 100]} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
            <meshStandardMaterial color="#6366f1" wireframe opacity={0.1} transparent />
         </Torus>
      </Float>
      
      {/* Inner Energy Ring (only visible on high intensity) */}
      {intensity > 0 && (
        <Float speed={5} rotationIntensity={1} floatIntensity={0}>
            <Torus args={[2.5, 0.02, 32, 100]} rotation={[-Math.PI / 4, 0, 0]}>
                <meshStandardMaterial color="#881337" emissive="#881337" emissiveIntensity={2} />
            </Torus>
        </Float>
      )}
    </group>
  );
};

const EnhancedParticles = ({ intensity }: { intensity: number }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = -state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {/* Ambient Background Dust - Cool Blue/White */}
      <Sparkles 
        count={300} 
        scale={15} 
        size={2} 
        speed={0.2} 
        opacity={0.3} 
        color="#c7d2fe" 
      />
      
      {/* Active Magical Stream */}
      {intensity > 0 && (
         <>
            <Sparkles 
                count={200} 
                scale={10} 
                size={4} 
                speed={0.8} 
                opacity={0.6} 
                color="#fda4af" // Rose gold
                noise={0.2} 
            />
         </>
      )}
    </group>
  );
};

const ResponsiveCamera = () => {
   const { camera } = useThree();
   useEffect(() => {
     const handleResize = () => {
        // Increase distance on smaller screens (mobile) to keep scene in view
        camera.position.z = window.innerWidth < 768 ? 14 : 8;
        camera.updateProjectionMatrix();
     };
     window.addEventListener('resize', handleResize);
     // Call once to set initial state
     handleResize();
     return () => window.removeEventListener('resize', handleResize);
   }, [camera]);
   return null;
};

interface Scene3DProps {
  intensity: number;
  isSuccess: boolean;
}

const Scene3D: React.FC<Scene3DProps> = ({ intensity, isSuccess }) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true }}>
        <ResponsiveCamera />
        {/* Deep space fog */}
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 5, 20]} />
        
        <ambientLight intensity={0.2} />
        
        {/* Cinematic Lighting: Blue rim, Warm key */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" /> {/* Indigo Rim */}
        <spotLight position={[-10, -5, -10]} angle={0.3} intensity={2} color="#4f46e5" /> {/* Deep Blue */}
        <pointLight position={[0, 0, 5]} intensity={0.8} color="#fda4af" /> {/* Soft Rose fill */}
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        
        <group position={[0, -0.5, 0]}>
            <DynamicRings intensity={intensity} />
            
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                {/* Main Heart - Deep Ruby Metallic (Merlot) */}
                <FloatingHeart color="#881337" scale={1.8} />
            </Float>
        </group>

        <EnhancedParticles intensity={intensity} />
        
        {/* Confetti Explosion on Success */}
        {isSuccess && <Confetti count={600} />}

        {/* Floating secondary elements */}
        {intensity > 0 && (
            <>
                <Float speed={3} rotationIntensity={2} floatIntensity={2} position={[-4, 3, -2]}>
                    <Sphere args={[0.2, 32, 32]}>
                        <meshStandardMaterial color="#e2e8f0" roughness={0} metalness={1} />
                    </Sphere>
                </Float>
                <Float speed={4} rotationIntensity={1.5} floatIntensity={1} position={[4, -2, -3]}>
                    <FloatingHeart color="#4c0519" scale={0.5} />
                </Float>
            </>
        )}
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={intensity > 0 ? 0.8 : 0.3} />
      </Canvas>
    </div>
  );
};

export default Scene3D;