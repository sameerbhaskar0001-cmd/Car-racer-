import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const S64_BASE_PATH = '/models/S64Compact_v1_C';

const BODY_FILES = {
  kit1: `${S64_BASE_PATH}/Body/S64Compact_Body_1.fbx`,
  kit2: `${S64_BASE_PATH}/Body/S64Compact_Body_2.fbx`,
  kit3: `${S64_BASE_PATH}/Body/S64Compact_Body_3.fbx`,
};

const RIM_FILES = {
  rim0: {
    L: `${S64_BASE_PATH}/Rims/Rims_L.fbx`,
    R: `${S64_BASE_PATH}/Rims/Rims_R.fbx`,
  },
  rim1: {
    L: `${S64_BASE_PATH}/Rims/Rims_1_L.fbx`,
    R: `${S64_BASE_PATH}/Rims/Rims_1_R.fbx`,
  },
  rim2: {
    L: `${S64_BASE_PATH}/Rims/Rims_2_L.fbx`,
    R: `${S64_BASE_PATH}/Rims/Rims_2_R.fbx`,
  },
  rim3: {
    L: `${S64_BASE_PATH}/Rims/Rims_3_L.fbx`,
    R: `${S64_BASE_PATH}/Rims/Rims_3_R.fbx`,
  },
};

const SPOILER_FILES = {
  spoiler1: `${S64_BASE_PATH}/Spoiler/S64_Compact_Spoiler.fbx`,
  spoiler2: `${S64_BASE_PATH}/Spoiler/S64_Compact_Spoiler_2.fbx`,
};

// S64 Compact native FBX wheel well coordinates:
// Nose is +X (+176), Tail is -X (-158), Roof is +Y (+104), Left is -Z (-58), Right is +Z (+58)
const WHEEL_SLOTS = [
  { name: 'FL', x: 104.2, y: 24.0, z: -58.0, side: 'L', isFront: true },
  { name: 'FR', x: 104.2, y: 24.0, z: 58.0, side: 'R', isFront: true },
  { name: 'RL', x: -99.5, y: 24.0, z: -58.0, side: 'L', isFront: false },
  { name: 'RR', x: -99.5, y: 24.0, z: 58.0, side: 'R', isFront: false },
];

function attachReadabilityRimShader(mat, cacheKey, minFloorStrength, topFillStrength, rimStrength) {
  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      vec3 kViewDir = normalize( vViewPosition );
      float kNdotV = clamp( abs( dot( normal, kViewDir ) ), 0.0, 1.0 );
      float kGrazing = pow( 1.0 - kNdotV, 2.15 );
      float kTopFill = clamp( normal.y * 0.65 + normal.z * 0.35, 0.0, 1.0 );
      vec3 minFloorRgb = diffuseColor.rgb * (${minFloorStrength.toFixed(3)} + ${topFillStrength.toFixed(3)} * kTopFill);
      vec3 rimHighlightRgb = mix(diffuseColor.rgb, vec3(1.0, 0.97, 0.92), 0.48) * (kGrazing * ${rimStrength.toFixed(3)});
      gl_FragColor.rgb = max(gl_FragColor.rgb, minFloorRgb) + rimHighlightRgb * (0.45 + 0.55 * kTopFill);
      #include <dithering_fragment>
      `
    );
  };
}

function upgradeBodyMaterials(fbxObj, kitId) {
  fbxObj.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = false;
    if (child.geometry && !child.geometry.attributes.normal) {
      child.geometry.computeVertexNormals();
    }

    const oldMats = Array.isArray(child.material) ? child.material : [child.material];
    const newMats = oldMats.map((oldMat, matIdx) => {
      const mName = (oldMat?.name || '').toLowerCase();

      if (mName.includes('headlight') || mName.includes('front_light')) {
        return new THREE.MeshStandardMaterial({
          name: 'S64_Headlights',
          color: 0xffffff,
          emissive: new THREE.Color(0xfff4d8),
          emissiveIntensity: 2.4,
          roughness: 0.08,
          metalness: 0.1,
          toneMapped: false,
        });
      }

      if (mName.includes('rear_light') || mName.includes('taillight') || mName.includes('brake')) {
        return new THREE.MeshStandardMaterial({
          name: 'S64_RearLights',
          color: 0xff0018,
          emissive: new THREE.Color(0xff0a24),
          emissiveIntensity: 1.85,
          roughness: 0.1,
          metalness: 0.15,
          toneMapped: false,
        });
      }

      if (mName.includes('glass') || mName.includes('window') || mName.includes('windshield')) {
        const glassMat = new THREE.MeshStandardMaterial({
          name: 'S64_Glass',
          color: 0x0b1524,
          emissive: new THREE.Color(0x06101e),
          emissiveIntensity: 0.22,
          roughness: 0.08,
          metalness: 0.88,
          envMapIntensity: 1.65,
        });
        attachReadabilityRimShader(glassMat, 's64_glass_v1', 0.18, 0.26, 0.32);
        return glassMat;
      }

      if (mName.includes('exhaust') || mName.includes('muffler') || mName.includes('chrome')) {
        return new THREE.MeshStandardMaterial({
          name: 'S64_Exhaust',
          color: 0xd8e2f0,
          roughness: 0.18,
          metalness: 0.92,
          envMapIntensity: 1.35,
        });
      }

      if (mName.includes('det2') || mName.includes('accent') || mName.includes('stripe')) {
        const accentHex =
          kitId === 'kit2' ? 0x0b1322 : kitId === 'kit3' ? 0xffc72c : 0xffffff;
        const det2Mat = new THREE.MeshStandardMaterial({
          name: 'S64_Det2',
          color: accentHex,
          roughness: 0.22,
          metalness: kitId === 'kit3' ? 0.88 : 0.52,
          envMapIntensity: 1.3,
        });
        attachReadabilityRimShader(det2Mat, `s64_det2_${kitId}`, 0.26, 0.32, 0.26);
        return det2Mat;
      }

      if (mName.includes('det1') || mName.includes('under') || mName.includes('trim') || mName.includes('black')) {
        const trimMat = new THREE.MeshStandardMaterial({
          name: 'S64_Trim',
          color: kitId === 'kit3' ? 0x242834 : 0x151821,
          roughness: 0.38,
          metalness: 0.5,
          envMapIntensity: 1.0,
        });
        attachReadabilityRimShader(trimMat, 's64_trim_v1', 0.18, 0.22, 0.18);
        return trimMat;
      }

      // Primary paint coat per body kit (matches 'car', 'body', or default index 0)
      const paintHex =
        kitId === 'kit2' ? 0x00e5ff : kitId === 'kit3' ? 0xffc72c : 0xff1e26;
      const pbr = new THREE.MeshStandardMaterial({
        name: `S64_CarPaint_${kitId}_${matIdx}`,
        color: paintHex,
        roughness: kitId === 'kit3' ? 0.20 : 0.15,
        metalness: kitId === 'kit2' ? 0.65 : kitId === 'kit3' ? 0.82 : 0.48,
        envMapIntensity: 1.55,
      });
      attachReadabilityRimShader(pbr, `s64_paint_${kitId}`, 0.32, 0.38, 0.32);
      return pbr;
    });

    child.material = Array.isArray(child.material) ? newMats : newMats[0];
  });
}

function upgradeRimMaterials(fbxObj, rimId, kitId) {
  fbxObj.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = false;
    if (child.geometry && !child.geometry.attributes.normal) {
      child.geometry.computeVertexNormals();
    }

    const oldMats = Array.isArray(child.material) ? child.material : [child.material];
    const newMats = oldMats.map((oldMat) => {
      const mName = (oldMat?.name || '').toLowerCase();

      if (mName.includes('tire')) {
        const tireMat = new THREE.MeshStandardMaterial({
          name: 'S64_TireRubber',
          color: 0x14171d,
          roughness: 0.76,
          metalness: 0.08,
          envMapIntensity: 0.65,
        });
        attachReadabilityRimShader(tireMat, 's64_tire_v1', 0.15, 0.2, 0.16);
        return tireMat;
      }

      if (mName.includes('disc')) {
        return new THREE.MeshStandardMaterial({
          name: 'S64_BrakeDisc',
          color: 0x525b6c,
          roughness: 0.32,
          metalness: 0.82,
        });
      }

      // Alloy rim spokes & lip
      let rimColor = 0xdce4f0;
      if (rimId === 'rim1') {
        rimColor = kitId === 'kit2' ? 0x00f0ff : 0x2a3140;
      } else if (rimId === 'rim2') {
        rimColor = 0xffc72c; // Deep dish gold
      } else if (rimId === 'rim3') {
        rimColor = kitId === 'kit2' ? 0x38bdf8 : 0xf4f6fa;
      }

      const rimMat = new THREE.MeshStandardMaterial({
        name: 'S64_RimAlloy',
        color: rimColor,
        roughness: 0.2,
        metalness: 0.88,
        envMapIntensity: 1.35,
      });
      attachReadabilityRimShader(rimMat, `s64_rim_${rimId}_${kitId}`, 0.24, 0.3, 0.24);
      return rimMat;
    });

    child.material = Array.isArray(child.material) ? newMats : newMats[0];
  });
}

function upgradeSpoilerMaterials(fbxObj, spoilerId, kitId) {
  fbxObj.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = false;
    if (child.geometry && !child.geometry.attributes.normal) {
      child.geometry.computeVertexNormals();
    }

    const wingColor =
      kitId === 'kit2'
        ? 0x00e5ff
        : kitId === 'kit3'
          ? 0xffc72c
          : spoilerId === 'spoiler2'
            ? 0x181c26
            : 0xff1e26;

    const spoilerMat = new THREE.MeshStandardMaterial({
      name: 'S64_SpoilerWing',
      color: wingColor,
      roughness: 0.2,
      metalness: 0.68,
      envMapIntensity: 1.35,
    });
    attachReadabilityRimShader(
      spoilerMat,
      `s64_spoiler_${spoilerId}_${kitId}`,
      0.26,
      0.32,
      0.26
    );
    child.material = spoilerMat;
  });
}

/**
 * Loads all 13 FBX files from S64Compact_v1_C (3 Bodies, 4 Left/Right Rim sets, 2 Spoilers)
 * and builds a complete modular 3D vehicle assembly that swaps body kits, wheels, and spoilers in real time.
 */
export async function loadS64ModularCar() {
  const loader = new FBXLoader();
  const loadFbx = (url) =>
    new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

  const [
    body1,
    body2,
    body3,
    rim0L,
    rim0R,
    rim1L,
    rim1R,
    rim2L,
    rim2R,
    rim3L,
    rim3R,
    spoiler1,
    spoiler2,
  ] = await Promise.all([
    loadFbx(BODY_FILES.kit1),
    loadFbx(BODY_FILES.kit2),
    loadFbx(BODY_FILES.kit3),
    loadFbx(RIM_FILES.rim0.L),
    loadFbx(RIM_FILES.rim0.R),
    loadFbx(RIM_FILES.rim1.L),
    loadFbx(RIM_FILES.rim1.R),
    loadFbx(RIM_FILES.rim2.L),
    loadFbx(RIM_FILES.rim2.R),
    loadFbx(RIM_FILES.rim3.L),
    loadFbx(RIM_FILES.rim3.R),
    loadFbx(SPOILER_FILES.spoiler1),
    loadFbx(SPOILER_FILES.spoiler2),
  ]);

  // Root group in kart chassis coordinates (+Z forward, +Y up, -X right)
  const carAssemblyRoot = new THREE.Group();
  carAssemblyRoot.name = 'S64CompactModularAssembly';

  // Inner group in native S64 FBX coordinates (+X forward, +Y up, +Z right)
  // Scale 0.0000565 maps 328.4 FBX length units -> 0.01855m (18.55mm), matching the 1:87 track & showroom!
  const fbxSpaceGroup = new THREE.Group();
  fbxSpaceGroup.name = 'S64FbxSpaceRoot';
  const s64Scale = 0.0000565;
  fbxSpaceGroup.scale.setScalar(s64Scale);
  // Rotate -90 deg around Y so native +X (Headlights) points along +Z (Kart Forward)
  fbxSpaceGroup.rotation.y = -Math.PI / 2;
  // Center longitudinally so front/rear overhang is balanced on the turntable and spline
  fbxSpaceGroup.position.set(0, 0.0001, -0.00035);
  carAssemblyRoot.add(fbxSpaceGroup);

  // 1. Prepare 3 Body Meshes
  const bodies = {
    kit1: body1,
    kit2: body2,
    kit3: body3,
  };
  for (const [kId, bObj] of Object.entries(bodies)) {
    upgradeBodyMaterials(bObj, kId);
    bObj.visible = kId === 'kit1';
    fbxSpaceGroup.add(bObj);
  }

  // 2. Prepare 2 Spoilers mounted on the rear trunk decklid (X = -134, Y = 75.5, Z = 0 in native FBX space)
  const spoilers = {
    spoiler1,
    spoiler2,
  };
  spoiler1.position.set(-134.0, 74.5, 0.0);
  spoiler2.position.set(-136.0, 75.0, 0.0);
  for (const [sId, sObj] of Object.entries(spoilers)) {
    upgradeSpoilerMaterials(sObj, sId, 'kit1');
    sObj.visible = false;
    fbxSpaceGroup.add(sObj);
  }

  // 3. Prepare 4 Wheel Slots (FL, FR, RL, RR), each holding all 4 Rim Variants (rim0..rim3)
  const rawRims = {
    rim0: { L: rim0L, R: rim0R },
    rim1: { L: rim1L, R: rim1R },
    rim2: { L: rim2L, R: rim2R },
    rim3: { L: rim3L, R: rim3R },
  };

  const frontSteerPivots = [];
  const wheelSpinGroups = [];
  const slotRimMeshes = {
    rim0: [],
    rim1: [],
    rim2: [],
    rim3: [],
  };

  for (const slot of WHEEL_SLOTS) {
    const steerPivot = new THREE.Group();
    steerPivot.name = `S64_WheelPivot_${slot.name}`;
    steerPivot.position.set(slot.x, slot.y, slot.z);

    const spinGroup = new THREE.Group();
    spinGroup.name = `S64_WheelSpin_${slot.name}`;
    steerPivot.add(spinGroup);

    for (const rId of ['rim0', 'rim1', 'rim2', 'rim3']) {
      const template = rawRims[rId][slot.side];
      const clonedRim = template.clone(true);
      upgradeRimMaterials(clonedRim, rId, 'kit1');
      clonedRim.visible = rId === 'rim0';
      spinGroup.add(clonedRim);
      slotRimMeshes[rId].push(clonedRim);
    }

    fbxSpaceGroup.add(steerPivot);
    wheelSpinGroups.push(spinGroup);
    if (slot.isFront) {
      frontSteerPivots.push(steerPivot);
    }
  }

  let activeBodyId = 'kit1';
  let activeRimId = 'rim0';
  let activeSpoilerId = 'spoiler0';

  function setConfiguration({ bodyId, rimId, spoilerId } = {}) {
    if (bodyId && bodies[bodyId]) {
      activeBodyId = bodyId;
    }
    if (rimId && slotRimMeshes[rimId]) {
      activeRimId = rimId;
    }
    if (spoilerId !== undefined) {
      activeSpoilerId = spoilerId;
    }

    // Toggle active body mesh
    for (const [kId, bObj] of Object.entries(bodies)) {
      bObj.visible = kId === activeBodyId;
    }

    // Toggle active rim set across all 4 wheels and tint for current kit
    for (const [rId, clones] of Object.entries(slotRimMeshes)) {
      const isVis = rId === activeRimId;
      for (const c of clones) {
        c.visible = isVis;
        if (isVis) {
          upgradeRimMaterials(c, rId, activeBodyId);
        }
      }
    }

    // Toggle active spoiler and tint for current kit
    for (const [sId, sObj] of Object.entries(spoilers)) {
      const isVis = sId === activeSpoilerId;
      sObj.visible = isVis;
      if (isVis) {
        upgradeSpoilerMaterials(sObj, sId, activeBodyId);
      }
    }
  }

  function updateWheels(dt, speed, steerAngle = 0.0) {
    // In native S64 FBX coordinates (+X forward, +Z right), forward rolling is negative rotation around Z
    const spinDelta = (speed / 0.002) * dt;
    for (const spinGrp of wheelSpinGroups) {
      spinGrp.rotation.z -= spinDelta;
    }
    const clampedSteer = THREE.MathUtils.clamp(steerAngle, -0.52, 0.52);
    for (const pivot of frontSteerPivots) {
      pivot.rotation.y = THREE.MathUtils.lerp(
        pivot.rotation.y,
        clampedSteer,
        Math.min(1, dt * 16)
      );
    }
  }

  return {
    carAssemblyRoot,
    setConfiguration,
    updateWheels,
    getActiveConfig: () => ({
      bodyId: activeBodyId,
      rimId: activeRimId,
      spoilerId: activeSpoilerId,
    }),
  };
}
