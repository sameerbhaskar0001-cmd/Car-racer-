import * as THREE from 'three';

/**
 * 3 AI Rival Racers Controller with Adaptive Rubber-Banding, Lane Overtaking,
 * 3D Micro-Kart Visuals, Continuous Distance Ranking, and Vehicle-to-Vehicle Collisions.
 * Zero per-frame GC heap allocations.
 */
export function createRivalRacersController(splineData, scene) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'RivalRacersRoot';
  scene.add(rootGroup);

  const samples = splineData.samples;
  const N = samples.length;
  const totalLength = splineData.total_length_m || 3.8371;

  // Pre-allocated scratch vectors for zero-GC spline interpolation
  const _p0 = new THREE.Vector3();
  const _p1 = new THREE.Vector3();
  const _r0 = new THREE.Vector3();
  const _r1 = new THREE.Vector3();
  const _n0 = new THREE.Vector3();
  const _n1 = new THREE.Vector3();
  const _t0 = new THREE.Vector3();
  const _t1 = new THREE.Vector3();
  const _sampleFrame = {
    pos: new THREE.Vector3(),
    right: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
  };

  function samplePoint(sVal, out = _sampleFrame) {
    const wrappedS = ((sVal % totalLength) + totalLength) % totalLength;
    let lo = 0;
    let hi = N - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (samples[mid].arc_length_m <= wrappedS) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    const s0 = samples[lo];
    const s1 = samples[(lo + 1) % N];
    const segLen = Math.max(
      1e-5,
      (lo + 1 === N ? totalLength : s1.arc_length_m) - s0.arc_length_m
    );
    const alpha = THREE.MathUtils.clamp((wrappedS - s0.arc_length_m) / segLen, 0, 1);

    out.pos.copy(_p0.fromArray(s0.position)).lerp(_p1.fromArray(s1.position), alpha);
    out.right
      .copy(_r0.fromArray(s0.right))
      .lerp(_r1.fromArray(s1.right), alpha)
      .normalize();
    out.normal
      .copy(_n0.fromArray(s0.normal))
      .lerp(_n1.fromArray(s1.normal), alpha)
      .normalize();
    out.tangent
      .copy(_t0.fromArray(s0.tangent))
      .lerp(_t1.fromArray(s1.tangent), alpha)
      .normalize();
    return out;
  }

  // -------------------------------------------------------------------------
  // BUILD 3 DISTINCT AI OPPONENT KARTS (Scaled at 0.52x to match 0.56x Player Car)
  // -------------------------------------------------------------------------
  const RIVAL_CONFIGS = [
    {
      id: 'bot_blaze',
      name: 'Blaze Bolt',
      color: '#ff1e26',
      accentColor: '#ffaa00',
      startGridOffset: -0.018, // Grid position #2
      laneOffset: -0.0038,
      baseSpeed: 0.184,
      personality: 'aggressive',
    },
    {
      id: 'bot_viper',
      name: 'Viper GT',
      color: '#10b981',
      accentColor: '#00e5ff',
      startGridOffset: -0.036, // Grid position #3
      laneOffset: 0.0038,
      baseSpeed: 0.18,
      personality: 'cornering',
    },
    {
      id: 'bot_phantom',
      name: 'Phantom 87',
      color: '#8b5cf6',
      accentColor: '#f43f5e',
      startGridOffset: -0.054, // Grid position #4
      laneOffset: -0.0015,
      baseSpeed: 0.188,
      personality: 'speed',
    },
  ];

  // Shared rival sub-geometries to minimize draw overhead
  const floorGeo = new THREE.BoxGeometry(0.008, 0.001, 0.015);
  const noseGeo = new THREE.BoxGeometry(0.0084, 0.0022, 0.0044);
  const podGeo = new THREE.BoxGeometry(0.0024, 0.0024, 0.0076);
  const helmetGeo = new THREE.SphereGeometry(0.0021, 14, 10);
  const wingGeo = new THREE.BoxGeometry(0.011, 0.0008, 0.0026);
  const wheelGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.0018, 12);
  wheelGeo.rotateZ(Math.PI / 2);

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x12141a,
    roughness: 0.6,
    metalness: 0.3,
  });
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c10,
    roughness: 0.8,
    metalness: 0.1,
  });

  function buildRivalMesh(colorHex, accentHex) {
    const kart = new THREE.Group();
    kart.scale.setScalar(0.52);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: new THREE.Color(colorHex).multiplyScalar(0.18),
      roughness: 0.22,
      metalness: 0.45,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: accentHex,
      emissive: new THREE.Color(accentHex).multiplyScalar(0.22),
      roughness: 0.25,
      metalness: 0.5,
    });

    const floor = new THREE.Mesh(floorGeo, darkMat);
    floor.position.y = 0.0014;
    kart.add(floor);

    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.0023, 0.0066);
    nose.rotation.x = 0.2;
    kart.add(nose);

    for (const sx of [-0.0044, 0.0044]) {
      const pod = new THREE.Mesh(podGeo, bodyMat);
      pod.position.set(sx, 0.0024, -0.0004);
      kart.add(pod);
    }

    const helmet = new THREE.Mesh(helmetGeo, accentMat);
    helmet.position.set(0, 0.0076, -0.0004);
    kart.add(helmet);

    const wing = new THREE.Mesh(wingGeo, accentMat);
    wing.position.set(0, 0.0072, -0.0076);
    kart.add(wing);

    const wheels = [];
    for (const [wx, wz] of [
      [-0.0056, 0.0054],
      [0.0056, 0.0054],
      [-0.0058, -0.0054],
      [0.0058, -0.0054],
    ]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.002, wz);
      kart.add(w);
      wheels.push(w);
    }

    return { kart, wheels };
  }

  const startFinishArc = samples[Math.min(646, N - 1)].arc_length_m;
  const gridStartBase = (startFinishArc - 0.025 + totalLength) % totalLength;

  const rivals = RIVAL_CONFIGS.map((cfg, idx) => {
    const { kart, wheels } = buildRivalMesh(cfg.color, cfg.accentColor);
    rootGroup.add(kart);

    const initS = (gridStartBase + cfg.startGridOffset + totalLength) % totalLength;

    return {
      id: cfg.id,
      name: cfg.name,
      color: cfg.color,
      mesh: kart,
      wheels,
      s: initS,
      totalDistanceTraveled: cfg.startGridOffset, // Continuous distance from start grid!
      lateralOffset: cfg.laneOffset,
      targetLane: cfg.laneOffset,
      speed: 0.0,
      baseSpeed: cfg.baseSpeed,
      personality: cfg.personality,
      headingYaw: 0.0,
      lapCount: 1,
      spinoutTimer: 0.0,
      bumpCooldown: 0.0,
      hopVel: 0.0,
      hopHeight: 0.0,
      heldItem: null,
      itemCooldown: 4.5 + idx * 1.5,
      position: new THREE.Vector3(),
      rank: idx + 2,
    };
  });

  // Reusable scratch vectors & ranking array
  const _left = new THREE.Vector3();
  const _rotMat = new THREE.Matrix4();
  const _baseQuat = new THREE.Quaternion();
  const _yawQuat = new THREE.Quaternion();
  const _LANES = [-0.0044, 0.0, 0.0044];
  const _rankEntries = [
    { isPlayer: true, dist: 0, rival: null },
    { isPlayer: false, dist: 0, rival: rivals[0] },
    { isPlayer: false, dist: 0, rival: rivals[1] },
    { isPlayer: false, dist: 0, rival: rivals[2] },
  ];

  /**
   * Computes exact player rank (1..4) from continuous totalDistanceTraveled
   */
  function getPlayerRank(playerState) {
    const playerDist = playerState.totalDistanceTraveled ?? 0.0;
    _rankEntries[0].isPlayer = true;
    _rankEntries[0].dist = playerDist;
    _rankEntries[0].rival = null;

    for (let i = 0; i < rivals.length; i++) {
      _rankEntries[i + 1].isPlayer = false;
      _rankEntries[i + 1].dist = rivals[i].totalDistanceTraveled;
      _rankEntries[i + 1].rival = rivals[i];
    }

    _rankEntries.sort((a, b) => b.dist - a.dist);

    let playerRank = 1;
    for (let i = 0; i < _rankEntries.length; i++) {
      const entry = _rankEntries[i];
      if (entry.isPlayer) {
        playerRank = i + 1;
      } else if (entry.rival) {
        entry.rival.rank = i + 1;
      }
    }
    return playerRank;
  }

  /**
   * Updates all 3 AI rivals with rubber-banded movement, lane changes, and collisions
   */
  function update(dt, playerState, _powerupManager, audioSynth) {
    const isRacing = !playerState.countdownLocked && !playerState.raceFinished;
    const playerDist = playerState.totalDistanceTraveled ?? 0.0;

    for (let idx = 0; idx < rivals.length; idx++) {
      const rival = rivals[idx];

      if (rival.bumpCooldown > 0) {
        rival.bumpCooldown = Math.max(0.0, rival.bumpCooldown - dt);
      }

      if (rival.hopHeight > 0 || rival.hopVel !== 0) {
        rival.hopHeight += rival.hopVel * dt;
        rival.hopVel -= 0.18 * dt;
        if (rival.hopHeight <= 0) {
          rival.hopHeight = 0;
          rival.hopVel = 0;
        }
      }

      if (isRacing) {
        if (rival.spinoutTimer > 0) {
          rival.spinoutTimer -= dt;
          rival.headingYaw += dt * 12.0;
          rival.speed = Math.max(0.02, rival.speed * 0.94);
        } else {
          // Exact continuous distance comparison against player
          const distToPlayer = playerDist - rival.totalDistanceTraveled;
          let targetSpeed = rival.baseSpeed;

          if (distToPlayer > 0.12) {
            // Player is well ahead -> AI rubber-bands up
            targetSpeed = rival.baseSpeed * 1.12;
          } else if (distToPlayer < -0.10) {
            // AI is ahead -> AI eases slightly so player can catch up and battle
            targetSpeed = rival.baseSpeed * 0.89;
          }

          rival.speed = THREE.MathUtils.lerp(rival.speed, targetSpeed, dt * 1.8);
          rival.headingYaw = THREE.MathUtils.lerp(rival.headingYaw, 0.0, dt * 6.0);
        }

        const stepDist = rival.speed * dt;
        rival.totalDistanceTraveled += stepDist;
        rival.s = ((gridStartBase + rival.totalDistanceTraveled) % totalLength + totalLength) % totalLength;
        rival.lapCount = Math.min(
          3,
          Math.floor(Math.max(0, rival.totalDistanceTraveled) / totalLength) + 1
        );

        // Dynamic Lane Selection & Overtaking
        if (Math.random() < 0.012) {
          rival.targetLane = _LANES[Math.floor(Math.random() * _LANES.length)];
        }
        rival.lateralOffset = THREE.MathUtils.lerp(
          rival.lateralOffset,
          rival.targetLane,
          dt * 1.8
        );

        // AI Powerup Triggering
        rival.itemCooldown -= dt;
        if (rival.heldItem && rival.itemCooldown <= 0 && rival.spinoutTimer <= 0) {
          rival.itemCooldown = 6.5 + Math.random() * 4.5;
          if (rival.heldItem === 'ROCKET' || rival.heldItem === 'HYPER_NITRO') {
            rival.speed *= 1.24;
          }
          rival.heldItem = null;
        }
      } else {
        rival.speed = 0.0;
      }

      // Update 3D World Transform on the track spline
      const frame = samplePoint(rival.s);
      rival.position
        .copy(frame.pos)
        .addScaledVector(frame.right, rival.lateralOffset)
        .addScaledVector(frame.normal, 0.0003 + rival.hopHeight);

      rival.mesh.position.copy(rival.position);

      _left.crossVectors(frame.normal, frame.tangent).normalize();
      _rotMat.makeBasis(_left, frame.normal, frame.tangent);
      _baseQuat.setFromRotationMatrix(_rotMat);
      _yawQuat.setFromAxisAngle(frame.normal, rival.headingYaw);
      rival.mesh.quaternion.copy(_yawQuat.multiply(_baseQuat));

      // Spin wheels around local X
      const spinDelta = (rival.speed / 0.002) * dt;
      for (let wIdx = 0; wIdx < rival.wheels.length; wIdx++) {
        rival.wheels[wIdx].rotation.x += spinDelta;
      }

      // Vehicle-to-Vehicle Collision: Player vs Rival (with 0.45s cooldown to prevent audio/speed spam)
      if (isRacing && rival.bumpCooldown <= 0) {
        const dSpline = Math.abs(
          ((playerState.s - rival.s + totalLength * 0.5) % totalLength) - totalLength * 0.5
        );
        const dLat = Math.abs(playerState.lateralOffset - rival.lateralOffset);
        if (dSpline < 0.0095 && dLat < 0.0046) {
          rival.bumpCooldown = 0.45;
          const latDelta = playerState.lateralOffset - rival.lateralOffset;
          const pushDir = Math.sign(latDelta) || (idx % 2 === 0 ? 1 : -1);

          playerState.lateralOffset = THREE.MathUtils.clamp(
            playerState.lateralOffset + pushDir * 0.0022,
            -0.0084,
            0.0084
          );
          rival.lateralOffset = THREE.MathUtils.clamp(
            rival.lateralOffset - pushDir * 0.0022,
            -0.0084,
            0.0084
          );

          playerState.speed *= 0.94;
          rival.speed *= 0.92;

          if (audioSynth && audioSynth.playRailImpact) {
            audioSynth.playRailImpact(0.45);
          }
        }
      }
    }

    return getPlayerRank(playerState);
  }

  function reset() {
    for (let idx = 0; idx < rivals.length; idx++) {
      const rival = rivals[idx];
      const cfg = RIVAL_CONFIGS[idx];
      rival.totalDistanceTraveled = cfg.startGridOffset;
      rival.s = (gridStartBase + cfg.startGridOffset + totalLength) % totalLength;
      rival.lateralOffset = cfg.laneOffset;
      rival.targetLane = cfg.laneOffset;
      rival.speed = 0.0;
      rival.headingYaw = 0.0;
      rival.lapCount = 1;
      rival.spinoutTimer = 0.0;
      rival.bumpCooldown = 0.0;
      rival.hopHeight = 0.0;
      rival.hopVel = 0.0;
      rival.heldItem = null;
      rival.rank = idx + 2;

      const frame = samplePoint(rival.s);
      rival.position
        .copy(frame.pos)
        .addScaledVector(frame.right, rival.lateralOffset)
        .addScaledVector(frame.normal, 0.0003);
      rival.mesh.position.copy(rival.position);

      _left.crossVectors(frame.normal, frame.tangent).normalize();
      _rotMat.makeBasis(_left, frame.normal, frame.tangent);
      rival.mesh.quaternion.setFromRotationMatrix(_rotMat);
    }
  }

  return {
    rootGroup,
    rivals,
    update,
    reset,
    getPlayerRank,
    getRivalsData: () =>
      rivals.map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        rank: r.rank,
        speedKmh: Math.round(Math.abs(r.speed) * 102.35 * 3.6),
        position: [r.position.x, r.position.y, r.position.z],
      })),
  };
}
