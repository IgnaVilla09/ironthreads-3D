import { Environment as DreiEnvironment, ContactShadows } from '@react-three/drei'

export function Environment() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 8, 6]}
        intensity={0.7}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-4, 3, -5]}
        intensity={0.25}
      />
      <hemisphereLight
        args={['#f5f7fb', '#e9ebee']}
        intensity={0.2}
      />
      <DreiEnvironment
        preset="city"
        background={false}
      />
      <ContactShadows
        position={[0, 1.2, 0]}
        opacity={0.35}
        scale={40}
        blur={2}
        far={10}
      />
    </>
  )
}
