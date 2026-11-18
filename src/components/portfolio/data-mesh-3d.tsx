'use client';

import * as React from 'react';
import * as THREE from 'three';

/**
 * Static SVG fallback in restricted 3-color palette (#F7F7F5, #080808, #F20B18).
 * Rendered on mobile, low-power devices, SSR, or prefers-reduced-motion.
 * Zero JavaScript execution overhead, no WebGL context required.
 */
export function DataMeshStatic({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[420px] h-auto opacity-90 drop-shadow-[0_10px_35px_rgba(8,8,8,0.5)]"
      >
        <defs>
          <linearGradient id="barOffwhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7F7F5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F7F7F5" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="barRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F20B18" stopOpacity="1" />
            <stop offset="100%" stopColor="#F20B18" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* Isometric Grid Floor */}
        <g stroke="#F7F7F5" strokeWidth="1" strokeDasharray="3 3" opacity="0.18">
          <line x1="200" y1="180" x2="350" y2="255" />
          <line x1="200" y1="180" x2="50" y2="255" />
          <line x1="150" y1="155" x2="300" y2="230" />
          <line x1="250" y1="155" x2="100" y2="230" />
          <line x1="100" y1="230" x2="250" y2="305" />
          <line x1="300" y1="230" x2="150" y2="305" />
          <line x1="50" y1="255" x2="200" y2="330" />
          <line x1="350" y1="255" x2="200" y2="330" />
        </g>

        {/* 3D Isometric Bar 1 (Left, Off-White) */}
        <g transform="translate(100, 160)">
          <path d="M0,20 L30,5 L60,20 L30,35 Z" fill="#F7F7F5" fillOpacity="0.6" />
          <path d="M0,20 L30,35 L30,85 L0,70 Z" fill="url(#barOffwhite)" />
          <path d="M30,35 L60,20 L60,70 L30,85 Z" fill="#F7F7F5" fillOpacity="0.35" />
        </g>

        {/* 3D Isometric Bar 2 (Center, Single Red Highlight) */}
        <g transform="translate(170, 110)">
          <path d="M0,20 L30,5 L60,20 L30,35 Z" fill="#F20B18" fillOpacity="0.95" />
          <path d="M0,20 L30,35 L30,135 L0,120 Z" fill="url(#barRed)" />
          <path d="M30,35 L60,20 L60,120 L30,135 Z" fill="#F20B18" fillOpacity="0.75" />
        </g>

        {/* 3D Isometric Bar 3 (Right, Off-White) */}
        <g transform="translate(240, 140)">
          <path d="M0,20 L30,5 L60,20 L30,35 Z" fill="#F7F7F5" fillOpacity="0.75" />
          <path d="M0,20 L30,35 L30,105 L0,90 Z" fill="url(#barOffwhite)" />
          <path d="M30,35 L60,20 L60,90 L30,105 Z" fill="#F7F7F5" fillOpacity="0.4" />
        </g>

        {/* Floating Data Nodes — Off-white with single Red pulse node */}
        <circle cx="200" cy="95" r="4" fill="#F20B18" className="animate-pulse" />
        <circle cx="270" cy="125" r="3.5" fill="#F7F7F5" opacity="0.8" />
        <circle cx="130" cy="145" r="3" fill="#F7F7F5" opacity="0.6" />

        {/* Connecting Trajectory Line */}
        <path
          d="M130,145 Q 165,115 200,95 T 270,125"
          fill="none"
          stroke="#F7F7F5"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}

/**
 * Interactive lightweight Three.js 3D data visualization in restricted 3-color palette:
 * Off-White (#F7F7F5), Black (#080808), with single Red (#F20B18) highlight.
 * - Pauses automatically when out of viewport.
 * - Respects prefers-reduced-motion and falls back to static SVG on mobile / low-power.
 * - Renders non-blocking in background; zero text inside canvas.
 */
export function DataMesh3D({ className = '' }: { className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const useFallback = React.useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', callback);
      window.addEventListener('resize', callback);
      return () => {
        mq.removeEventListener('change', callback);
        window.removeEventListener('resize', callback);
      };
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768,
    () => false
  );

  React.useEffect(() => {
    if (useFallback) return;

    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isVisible = true;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.5, 6.5);
    camera.lookAt(0, 0.5, 0);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Lighting (Off-white ambient + Red point highlight + Off-white rim)
    const ambientLight = new THREE.AmbientLight(0xf7f7f5, 0.7);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xf20b18, 2.8, 20);
    redLight.position.set(1.5, 4, 1.5);
    scene.add(redLight);

    const rimLight = new THREE.PointLight(0xf7f7f5, 1.6, 20);
    rimLight.position.set(-3, 3, -2);
    scene.add(rimLight);

    // Group for entire interactive data chart assembly
    const group = new THREE.Group();
    scene.add(group);

    // Grid Floor in restricted black/off-white
    const gridHelper = new THREE.GridHelper(6, 12, 0xf20b18, 0x080808);
    gridHelper.position.y = -0.01;
    group.add(gridHelper);

    // Materials: Off-White + Single Red Highlight
    const offwhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf7f7f5,
      roughness: 0.35,
      metalness: 0.4,
      transparent: true,
      opacity: 0.75,
    });

    const offwhiteSolidMaterial = new THREE.MeshStandardMaterial({
      color: 0xf7f7f5,
      roughness: 0.25,
      metalness: 0.5,
      transparent: true,
      opacity: 0.9,
    });

    const redHighlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xf20b18,
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.95,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xf7f7f5,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });

    // Outer Bounding Cube (Subtle Holo Framing)
    const boundsGeo = new THREE.BoxGeometry(4.2, 3.2, 4.2);
    const boundsMesh = new THREE.Mesh(boundsGeo, wireframeMaterial);
    boundsMesh.position.y = 1.6;
    group.add(boundsMesh);

    // 3D Analytical Bar Chart Columns — exactly ONE single red highlight bar
    const barData = [
      { x: -1.2, z: -0.8, baseHeight: 1.4, speed: 1.1, mat: offwhiteMaterial },
      { x: -0.4, z: -0.2, baseHeight: 2.3, speed: 0.9, mat: offwhiteSolidMaterial },
      { x: 0.4, z: 0.5, baseHeight: 1.9, speed: 1.4, mat: offwhiteMaterial },
      { x: 1.2, z: -0.5, baseHeight: 2.8, speed: 0.8, mat: redHighlightMaterial }, // Single Red Highlight
      { x: 0.6, z: -1.2, baseHeight: 1.2, speed: 1.3, mat: offwhiteMaterial },
      { x: -0.9, z: 1.1, baseHeight: 1.7, speed: 1.0, mat: offwhiteSolidMaterial },
    ];

    const boxGeo = new THREE.BoxGeometry(0.5, 1, 0.5);
    const bars: { mesh: THREE.Mesh; baseHeight: number; speed: number; offset: number }[] = [];

    barData.forEach((b, i) => {
      const mesh = new THREE.Mesh(boxGeo, b.mat);
      mesh.position.set(b.x, b.baseHeight / 2, b.z);
      mesh.scale.set(1, b.baseHeight, 1);
      group.add(mesh);
      bars.push({ mesh, baseHeight: b.baseHeight, speed: b.speed, offset: i * 0.8 });
    });

    // Floating Ring in off-white
    const ringGeo = new THREE.TorusGeometry(2.4, 0.02, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf7f7f5, transparent: true, opacity: 0.22 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.8;
    ring.position.y = 1.5;
    group.add(ring);

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Pause animation when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous rotation
      group.rotation.y = elapsedTime * 0.18;

      // Breathing motion for chart bars
      bars.forEach((bar) => {
        const factor = 1 + 0.15 * Math.sin(elapsedTime * bar.speed + bar.offset);
        const currentHeight = bar.baseHeight * factor;
        bar.mesh.scale.y = currentHeight;
        bar.mesh.position.y = currentHeight / 2;
      });

      // Subtle wobble of ring
      ring.rotation.z = elapsedTime * 0.12;

      renderer?.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement.parentNode);
        }
      }
      boxGeo.dispose();
      boundsGeo.dispose();
      ringGeo.dispose();
      offwhiteMaterial.dispose();
      offwhiteSolidMaterial.dispose();
      redHighlightMaterial.dispose();
      wireframeMaterial.dispose();
      ringMat.dispose();
    };
  }, [useFallback]);

  if (useFallback) {
    return <DataMeshStatic className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320px] sm:h-[380px] flex items-center justify-center pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
