
import React, { useRef, useLayoutEffect } from "react";
import {
  Composition,
  registerRoot,
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
  cancelRender
} from "remotion";
import * as THREE from "three";

const Animation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectRef = useRef<THREE.Mesh | null>(null);
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const handleRef = useRef<number | null>(null);

  if (handleRef.current === null) {
    handleRef.current = delayRender("Initializing 3D scene");
  }

  useLayoutEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas unavailable");

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });

      renderer.setPixelRatio(1);
      renderer.setSize(width, height, false);

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        100
      );

      camera.position.z = 7;

      const geometry = new THREE.TorusKnotGeometry(
        1.2, 0.35, 180, 24
      );

      const material = new THREE.MeshStandardMaterial({
        color: 0x9b5cff,
        metalness: 0.75,
        roughness: 0.2
      });

      const object = new THREE.Mesh(geometry, material);
      scene.add(object);

      const ambient = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambient);

      const light = new THREE.PointLight(0x5b9dff, 100);
      light.position.set(3, 4, 5);
      scene.add(light);

      const ringGeometry = new THREE.TorusGeometry(
        2.1, 0.025, 12, 120
      );

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x58c7ff
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = 1.1;
      scene.add(ring);

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      objectRef.current = object;

      renderer.render(scene, camera);

      continueRender(handleRef.current!);
    } catch (error) {
      cancelRender(error);
    }

    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [width, height]);

  useLayoutEffect(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const object = objectRef.current;

    if (!renderer || !scene || !camera || !object) return;

    object.rotation.x = frame * 0.025;
    object.rotation.y = frame * 0.035;

    renderer.render(scene, camera);
  }, [frame]);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "radial-gradient(circle, #20204a, #070713)",
      overflow: "hidden"
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%"
        }}
      />
      <div style={{
        position: "absolute",
        top: 130,
        width: "100%",
        textAlign: "center",
        color: "white",
        fontSize: 64,
        fontWeight: 800,
        fontFamily: "Arial"
      }}>
        CLOUDRENDER
      </div>
      <div style={{
        position: "absolute",
        bottom: 180,
        width: "100%",
        textAlign: "center",
        color: "#9b9bff",
        fontSize: 30,
        fontFamily: "Arial"
      }}>
        REMOTE 3D ANIMATION
      </div>
    </div>
  );
};

const Root: React.FC = () => (
  <Composition
    id="Main"
    component={Animation}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
      
