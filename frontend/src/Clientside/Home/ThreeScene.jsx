import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f1724, 0.08);

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 6);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    // Simple 'building' model: box with a plus sign plane
    const group = new THREE.Group();

    const baseGeo = new THREE.BoxGeometry(2.2, 1.6, 1.8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x6b7cff,
      metalness: 0.1,
      roughness: 0.3,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    group.add(base);

    // roof
    const roofGeo = new THREE.ConeGeometry(1.1, 0.6, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x9b5cff,
      roughness: 0.4,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 1.1;
    group.add(roof);

    // plus sign (medical) on front
    const plusMat = new THREE.MeshBasicMaterial({ color: 0xfff6c3 });
    const barGeo = new THREE.BoxGeometry(0.12, 0.6, 0.02);
    const bar1 = new THREE.Mesh(barGeo, plusMat);
    const bar2 = new THREE.Mesh(barGeo, plusMat);
    bar2.rotation.z = Math.PI / 2;
    const plus = new THREE.Group();
    plus.add(bar1);
    plus.add(bar2);
    plus.position.set(0, 0.4, 0.91);
    group.add(plus);

    // Try to load a GLB 3D logo from public/models/logo.glb
    (async () => {
      let addedModel = false;
      try {
        const { GLTFLoader } = await import(
          /* webpackChunkName: "gltf-loader" */ "three/examples/jsm/loaders/GLTFLoader"
        );
        const loader = new GLTFLoader();
        loader.load(
          "/models/logo.glb",
          (gltf) => {
            try {
              const model = gltf.scene || gltf.scenes?.[0];
              if (!model) return;
              // center and scale model
              const box = new THREE.Box3().setFromObject(model);
              const size = new THREE.Vector3();
              box.getSize(size);
              const maxDim = Math.max(size.x, size.y, size.z) || 1;
              const scale = 0.9 / maxDim; // fit into ~0.9 unit width
              model.scale.setScalar(scale);
              // center
              box.setFromObject(model);
              const center = new THREE.Vector3();
              box.getCenter(center);
              model.position.sub(center);

              model.position.set(0, 0.42, 0.915);
              model.rotation.y = Math.PI; // face camera
              group.add(model);
              addedModel = true;
              // store reference for cleanup
              group.userData._gltf = gltf;
            } catch (inner) {
              console.warn("Error adding GLTF model:", inner);
            }
          },
          undefined,
          (err) => {
            console.warn(
              "GLTF load error for /models/logo.glb:",
              err && err.message,
            );
          },
        );
      } catch (e) {
        // dynamic import failed or loader not available
        console.warn(
          "GLTF loader unavailable, falling back to texture",
          e && e.message,
        );
      }

      // if GLB not added after a short delay, fallback to plain logo texture
      setTimeout(() => {
        if (addedModel) return;
        try {
          const texLoader = new THREE.TextureLoader();
          texLoader.load(
            "/logo.png",
            (tex) => {
              tex.encoding = THREE.sRGBEncoding;
              const logoGeo = new THREE.PlaneGeometry(0.9, 0.4);
              const logoMat = new THREE.MeshBasicMaterial({
                map: tex,
                transparent: true,
              });
              const logoMesh = new THREE.Mesh(logoGeo, logoMat);
              logoMesh.position.set(0, 0.42, 0.915);
              group.add(logoMesh);
            },
            undefined,
            () => {
              // ignore
            },
          );
        } catch (err) {
          console.log("Failed to load logo texture:", err);
          // ignore
        }
      }, 600);
    })();

    // orbiting spheres for interest
    const sphereGeo = new THREE.SphereGeometry(0.12, 16, 12);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xff8a65,
      emissive: 0x220000,
      roughness: 0.4,
    });
    const spheres = [];
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(sphereGeo, sphereMat);
      const angle = (i / 3) * Math.PI * 2;
      s.position.set(Math.cos(angle) * 3, 0.8 + i * 0.1, Math.sin(angle) * 1.8);
      spheres.push(s);
      scene.add(s);
    }

    scene.add(group);

    // ground subtle
    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x081024,
      roughness: 1,
      metalness: 0,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.8;
    scene.add(plane);

    let frameId;
    let start = Date.now();

    const animate = () => {
      const t = (Date.now() - start) * 0.001;
      group.rotation.y = Math.sin(t * 0.4) * 0.25;
      group.rotation.x = Math.sin(t * 0.13) * 0.05;
      spheres.forEach((s, i) => {
        const a = t * (0.6 + i * 0.2) + i * 2.1;
        s.position.x = Math.cos(a) * (2.2 + i * 0.3);
        s.position.z = Math.sin(a) * (1.0 + i * 0.4);
        s.position.y = 0.6 + Math.sin(a * 1.3) * 0.25;
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const w = mount.clientWidth || 800;
      const h = mount.clientHeight || 400;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);
    animate();

    // cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (renderer.domElement && mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
    };
  }, []);

  const wrapperStyle = {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    opacity: 0.95,
  };

  return <div style={wrapperStyle} ref={mountRef} />;
};

export default ThreeScene;
