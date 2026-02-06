import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Shape, ExtrudeGeometry } from 'three';

const FloatingHeart: React.FC<{ color: string; scale?: number; position?: [number, number, number] }> = ({ 
  color, 
  scale = 1, 
  position = [0, 0, 0] 
}) => {
  const meshRef = useRef<Mesh>(null);

  const heartShape = useMemo(() => {
    const shape = new Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.5, y + 0.5);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 2,
    bevelSize: 0.1,
    bevelThickness: 0.1,
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      // Bobbing motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      // Rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={[scale, scale, scale]} rotation={[Math.PI, 0, 0]}>
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
};

export default FloatingHeart;
