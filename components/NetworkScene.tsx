import React, { useEffect, useRef, useState } from "react";
import type { DnsResult } from "../types";

export default function NetworkScene({
  results,
  scanning,
  reduced,
  light,
  fa,
}: {
  results: DnsResult[];
  scanning: boolean;
  reduced: boolean;
  light: boolean;
  fa: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ results, scanning, reduced, light });
  live.current = { results, scanning, reduced, light };
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el || reduced) return;
    setFallback(false);
    setReady(false);
    let cleanup = () => {};
    let disposed = false;
    import("three")
      .then((THREE) => {
        if (disposed) return;
        try {
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
          camera.position.set(0, 0, 11.5);
          const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
          renderer.setPixelRatio(
            Math.min(
              window.devicePixelRatio,
              window.innerWidth < 600 ? 1.3 : 1.75,
            ),
          );
          renderer.setClearColor(0x000000, 0);
          el.appendChild(renderer.domElement);
          const world = new THREE.Group();
          scene.add(world);
          scene.add(new THREE.AmbientLight(0xd6e5ff, 1.4));
          const keyLight = new THREE.DirectionalLight(0xc7ddff, 4);
          keyLight.position.set(-4, 5, 5);
          const rimLight = new THREE.DirectionalLight(0x4867a7, 3);
          rimLight.position.set(4, -2, 2);
          scene.add(keyLight, rimLight);
          const core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(2.12, 2),
            new THREE.MeshStandardMaterial({
              color: 0x182339,
              metalness: 0.65,
              roughness: 0.48,
              flatShading: true,
            }),
          );
          world.add(core);
          const grid = new THREE.LineSegments(
            new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.19, 3)),
            new THREE.LineBasicMaterial({
              color: 0x8aafff,
              transparent: true,
              opacity: 0.25,
            }),
          );
          world.add(grid);
          const pointGeo = new THREE.IcosahedronGeometry(2.22, 3);
          const points = new THREE.Points(
            pointGeo,
            new THREE.PointsMaterial({
              color: 0xc3d8ff,
              size: 0.025,
              transparent: true,
              opacity: 0.7,
            }),
          );
          world.add(points);
          const makeRing = (radius: number, x: number, z: number) => {
            const ring = new THREE.Mesh(
              new THREE.TorusGeometry(radius, 0.018, 6, 180),
              new THREE.MeshStandardMaterial({
                color: 0x90b6f1,
                metalness: 0.65,
                roughness: 0.35,
              }),
            );
            ring.rotation.set(x, 0.2, z);
            world.add(ring);
          };
          makeRing(2.95, 1.12, -0.36);
          makeRing(3.25, 0.6, 0.6);
          const nodes: InstanceType<typeof THREE.Mesh>[] = [];
          const nodeGeo = new THREE.SphereGeometry(0.055, 12, 8);
          for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const node = new THREE.Mesh(
              nodeGeo,
              new THREE.MeshBasicMaterial({ color: 0x6a7c98 }),
            );
            node.position.set(
              Math.cos(angle) * 2.95,
              Math.sin(angle) * 1.52,
              Math.sin(angle + 0.5) * 1.5,
            );
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(),
              node.position,
            ]);
            const line = new THREE.Line(
              lineGeo,
              new THREE.LineBasicMaterial({
                color: 0x8baee5,
                transparent: true,
                opacity: 0.09,
              }),
            );
            world.add(line, node);
            nodes.push(node);
          }
          let targetX = 0.1,
            targetY = -0.2,
            frame = 0,
            visible = true,
            last = 0;
          const move = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            targetY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.7;
            targetX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
          };
          const leave = () => {
            targetX = 0.1;
            targetY = -0.2;
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          const resize = new ResizeObserver(() => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
            camera.updateProjectionMatrix();
          });
          resize.observe(el);
          const intersection = new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
          });
          intersection.observe(el);
          const render = (time: number) => {
            frame = requestAnimationFrame(render);
            if (!visible || document.hidden) {
              last = time;
              return;
            }
            const delta = Math.min((time - last) / 1000, 0.05);
            last = time;
            const state = live.current;
            const smoothing = 1 - Math.exp(-delta * 4);
            world.rotation.y += (targetY - world.rotation.y) * smoothing;
            world.rotation.x += (targetX - world.rotation.x) * smoothing;
            grid.rotation.y += delta * (state.scanning ? 0.22 : 0.055);
            points.rotation.y = grid.rotation.y;
            (
              core.material as InstanceType<typeof THREE.MeshStandardMaterial>
            ).color.set(state.light ? 0xa8bddd : 0x182339);
            const success = state.results.filter(
              (r) => r.status === "success",
            ).length;
            nodes.forEach((n, i) => {
              (
                n.material as InstanceType<typeof THREE.MeshBasicMaterial>
              ).color.set(
                i < success
                  ? 0xb8d3ff
                  : state.scanning && Math.floor(time / 230) % 16 === i
                    ? 0xffffff
                    : 0x6882a5,
              );
              n.scale.setScalar(i < success ? 1.7 : 1);
            });
            renderer.render(scene, camera);
          };
          renderer.setSize(el.clientWidth, el.clientHeight);
          camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
          setReady(true);
          frame = requestAnimationFrame(render);
          const contextLost = (e: Event) => {
            e.preventDefault();
            setFallback(true);
            cancelAnimationFrame(frame);
          };
          renderer.domElement.addEventListener("webglcontextlost", contextLost);
          cleanup = () => {
            cancelAnimationFrame(frame);
            resize.disconnect();
            intersection.disconnect();
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
            scene.traverse((obj) => {
              const mesh = obj as InstanceType<typeof THREE.Mesh>;
              mesh.geometry?.dispose();
              if (mesh.material)
                (Array.isArray(mesh.material)
                  ? mesh.material
                  : [mesh.material]
                ).forEach((m) => m.dispose());
            });
            renderer.dispose();
            renderer.domElement.remove();
          };
        } catch {
          setFallback(true);
        }
      })
      .catch(() => setFallback(true));
    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduced]);
  return (
    <div className={`network-stage ${scanning ? "is-scanning" : ""}`}>
      <div className="network-canvas" ref={host} aria-hidden="true" />
      {!ready && !reduced && !fallback && (
        <div className="scene-placeholder" role="status">
          <span className="mini-orbit" />
          {fa ? "آماده‌کردن نمای اتصال…" : "Preparing your connection view…"}
        </div>
      )}
      {(reduced || fallback) && (
        <div className="static-network" aria-hidden="true">
          <i />
          <i />
          <i />
          <b>P</b>
        </div>
      )}
      <div className="scene-caption">
        <span className="status-dot" />
        {scanning
          ? fa
            ? "در حال شنیدن پاسخ‌ها"
            : "Listening for responses"
          : fa
            ? "هر اتصال، یک مسیر تازه"
            : "Every connection, a different route"}
      </div>
      <span className="scene-label label-top" dir="ltr">
        DNS → YOUR NETWORK
      </span>
      <span className="scene-label label-bottom" dir="ltr">
        PIMX / LIVE TOPOLOGY
      </span>
      <div className="scene-marker marker-one">
        <span />
        Cloudflare
      </div>
      <div className="scene-marker marker-two">
        <span />
        Quad9
      </div>
      <div className="scene-marker marker-three">
        <span />
        Google DNS
      </div>
    </div>
  );
}
