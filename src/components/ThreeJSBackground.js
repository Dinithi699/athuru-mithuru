import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeJSBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating elements
    const createFloatingElement = (geometry, material, position, rotationSpeed) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.userData = { rotationSpeed };
      scene.add(mesh);
      return mesh;
    };

    // Hot air balloon basket
    const basketGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 8);
    const basketMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const basket = createFloatingElement(basketGeometry, basketMaterial, [3, 2, -5], 0.01);

    // Balloon
    const balloonGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const balloonMaterial = new THREE.MeshBasicMaterial({ color: 0xFF6B6B });
    const balloon = createFloatingElement(balloonGeometry, balloonMaterial, [3, 4, -5], 0.005);

    // Duck
    const duckGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const duckMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const duck = createFloatingElement(duckGeometry, duckMaterial, [-3, 1, -4], 0.02);

    // Kite
    const kiteGeometry = new THREE.ConeGeometry(0.3, 0.6, 4);
    const kiteMaterial = new THREE.MeshBasicMaterial({ color: 0x00CED1 });
    const kite = createFloatingElement(kiteGeometry, kiteMaterial, [-2, 4, -6], 0.03);

    // Unicorn
    const unicornGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const unicornMaterial = new THREE.MeshBasicMaterial({ color: 0xFFB6C1 });
    const unicorn = createFloatingElement(unicornGeometry, unicornMaterial, [4, -1, -3], 0.015);

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate floating elements
      scene.children.forEach(child => {
        if (child.userData.rotationSpeed) {
          child.rotation.y += child.userData.rotationSpeed;
          child.position.y += Math.sin(Date.now() * 0.001 + child.position.x) * 0.001;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};

export default ThreeJSBackground;