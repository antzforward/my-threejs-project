import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
export const sceneInfo = {
    name: '隐函数几何体生成器',
    description: '各种 隐函数 几何体',
    longDescription: '手动创建各种隐函数决定的几何体，也就是根据立体中的像素点来决定它是否是一个有效点。',
    category: '几何',
    order: 3,
    codeExample: `// 球体: x² + y² + z² - r² = 0
const sphere = (x, y, z, r = 1) => x*x + y*y + z*z - r*r;
// 环面: (√(x² + y²) - R)² + z² - r² = 0
const torus = (x, y, z, R = 1, r = 0.3) => {
  const d = Math.sqrt(x*x + y*y) - R;
  return d*d + z*z - r*r;
};
// 心形曲面: (x² + 9y²/4 + z² - 1)³ - x²z³ - 9y²z³/80 = 0
const heart = (x, y, z) => {
  const x2 = x*x, y2 = y*y, z2 = z*z;
  const term = x2 + 2.25*y2 + z2 - 1;
  return term*term*term - x2*z2*z - 0.1125*y2*z2*z;
};

// Goursat曲面: x⁴ + y⁴ + z⁴ - a(x² + y² + z²)² - b(x² + y² + z²) + c = 0
const goursat = (x, y, z, a = 0.0, b = 0.0, c = 1.0) => {
  const r2 = x*x + y*y + z*z;
  return x*x*x*x + y*y*y*y + z*z*z*z - a*r2*r2 - b*r2 + c;
};
// 克莱因瓶: (x² + y² + z² + 2y - 1)[(x² + y² + z² - 2y - 1)² - 8z²] + 16xz(x² + y² + z² - 2y - 1) = 0
const kleinBottle = (x, y, z) => {
  const x2 = x*x, y2 = y*y, z2 = z*z;
  const r2 = x2 + y2 + z2;
  const term1 = r2 + 2*y - 1;
  const term2 = (r2 - 2*y - 1)**2 - 8*z2;
  return term1 * term2 + 16*x*z*(r2 - 2*y - 1);
};
    `,
    controls: [
        { key: '数字键 1-5', action: '切换不同几何体' },
        { key: 'G', action: '切换线框模式' },
        { key: '鼠标拖动', action: '旋转查看几何体' }
    ],
    notes: [
        '使用隐函数构造不同的几何体',
        '用 MarchingCubes 来生成',
        '可以通过参数调整几何体细节',
        'BufferGeometry 性能更好',
        '几何体可以组合创建复杂形状'
    ]
};

export default function setup({ scene, camera, renderer, controls }) {
    let currentGeometry = null;
    let geometries = [];
    let wireframe = false;
    let currentGeometryName = '未知';
    
    function init() {
        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(ambientLight, directionalLight);
        
        // 创建各种几何体
        createGeometries();
        showGeometry(0); // 显示第一个几何体
        
        // 添加键盘监听
        document.addEventListener('keydown', handleKeyPress);
    }
    
    
    // 球体: x² + y² + z² - r² = 0
	const sphere = (x, y, z, r = 1) => x*x + y*y + z*z - r*r;
	// 环面: (√(x² + y²) - R)² + z² - r² = 0
	const torus = (x, y, z, R = 1, r = 0.3) => {
	  const d = Math.sqrt(x*x + y*y) - R;
	  return d*d + z*z - r*r;
	};
	// 心形曲面: (x² + 9y²/4 + z² - 1)³ - x²z³ - 9y²z³/80 = 0
	const heart = (x, y, z) => {
	  const x2 = x*x, y2 = y*y, z2 = z*z;
	  const term = x2 + 2.25*y2 + z2 - 1;
	  return term*term*term - x2*z2*z - 0.1125*y2*z2*z;
	};

	// Goursat曲面: x⁴ + y⁴ + z⁴ - a(x² + y² + z²)² - b(x² + y² + z²) + c = 0
	const goursat = (x, y, z, a = 0.0, b = 0.0, c = 1.0) => {
	  const r2 = x*x + y*y + z*z;
	  return x*x*x*x + y*y*y*y + z*z*z*z - a*r2*r2 - b*r2 + c;
	};
	// 克莱因瓶: (x² + y² + z² + 2y - 1)[(x² + y² + z² - 2y - 1)² - 8z²] + 16xz(x² + y² + z² - 2y - 1) = 0
	const kleinBottle = (x, y, z) => {
	  const x2 = x*x, y2 = y*y, z2 = z*z;
	  const r2 = x2 + y2 + z2;
	  const term1 = r2 + 2*y - 1;
	  const term2 = (r2 - 2*y - 1)**2 - 8*z2;
	  return term1 * term2 + 16*x*z*(r2 - 2*y - 1);
	};
    
    function generateMesh(implicitFunction,boudingBox,mat, threshold=0.1, resolution=32)
    {
		const{min,max} = boudingBox;
		const size = new THREE.Vector3().subVectors(max, min);
		let mc = new MarchingCubes(resolution, mat, true, true);
		mc.resolution = resolution;
		mc.isolation = threshold;
		
		// 清除可能存在的元球
		mc.reset();
		// 在3D网格中采样
		for (let x = 0; x < resolution; x++) {
		  for (let y = 0; y < resolution; y++) {
			for (let z = 0; z < resolution; z++) {
			  // 计算世界坐标
			  const pos = new THREE.Vector3(
				min.x + (x / (resolution - 1)) * size.x,
				min.y + (y / (resolution - 1)) * size.y,
				min.z + (z / (resolution - 1)) * size.z
			  );
			  
			  // 计算隐函数值
			  const value = implicitFunction(pos.x, pos.y, pos.z);
			  
			  // 设置行进立方体数据
			  mc.setCell(x, y, z, value);
			}
		  }
		}
		
		// 生成几何体
		mc.update();
		return mc;
    }
    function createGeometries() {
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x3498db,
            roughness: 0.3 
        });
        // 修改材质设置为双面渲染，主要是克莱因瓶的不可定向，但是MarchingCube是定向的。
		const material2 = new THREE.MeshStandardMaterial({
			side: THREE.DoubleSide, // 双面渲染
			color: 0x3498db,
            roughness: 0.3 
		});
        const boundingBox = {
			min: new THREE.Vector3(-2, -2, -2),
			max: new THREE.Vector3(2, 2, 2)
		};
		const largbbx = {
			min: new THREE.Vector3(-12, -12, -12),
			max: new THREE.Vector3(12, 12, 12)
		}
        geometries = [
            { 
                mesh: generateMesh(sphere,boundingBox,material),
                name: '球体'
            },
            { 
                mesh: generateMesh(
                (x, y, z) => torus(x, y, z, 0.8, 0.3),
                boundingBox, 
                material),
                name: '环面'
            },
            { 
                mesh: generateMesh(heart,boundingBox, material),
                name: '心形曲面'
            },
            { 
                mesh: generateMesh(
                 (x, y, z) => goursat(x, y, z, 0, 1, -0.5), 
                largbbx, 
                material,
                0,
                64),
                name: 'Goursat曲面'
            },
            { 
                mesh: generateMesh(
                (x, y, z) => kleinBottle(x, y, z),
                largbbx, 
                material2,
                0,
                64),
                name: '克莱因瓶'
            }
        ];
    }
    
    function showGeometry(index) {
        if (currentGeometry) {
            scene.remove(currentGeometry);
        }
        
        if (geometries[index]) {
            currentGeometry = geometries[index].mesh;
            currentGeometryName = geometries[index].name;
            scene.add(currentGeometry);
            updateCustomStats();
        }
    }
    
	// 自定义统计信息方法
	function updateCustomStats() {
		const vertexCount = currentGeometry ? 
			currentGeometry.geometry.attributes.position.count : 0;
		const customStatsElement = document.getElementById('sceneCustomStats');
        
        // 如果当前场景模块提供了自定义统计信息方法
        if (customStatsElement) {
            customStatsElement.innerHTML =  `
				<div class="custom-info">
					<div class="custom-item">
						<span class="custom-label">当前几何体:</span> 
						<span class="custom-value">${currentGeometryName}</span>
					</div>
					<div class="custom-item">
						<span class="custom-label">顶点数量:</span> 
						<span class="custom-value">${vertexCount}</span>
					</div>
					<div class="custom-item">
						<span class="custom-label">线框模式:</span> 
						<span class="custom-value">${wireframe ? '开启' : '关闭'}</span>
					</div>
				</div>
			`;
        }
	}
    
    function handleKeyPress(event) {
        switch(event.key) {
            case '1': showGeometry(0); break;
            case '2': showGeometry(1); break;
            case '3': showGeometry(2); break;
            case '4': showGeometry(3); break;
            case '5': showGeometry(4); break;
            case 'g': case 'G':
                wireframe = !wireframe;
                geometries.forEach(geo => {
                    geo.mesh.material.wireframe = wireframe;
                });
                updateCustomStats();
                break;
        }
    }
    
    function update() {
        if (currentGeometry) {
            currentGeometry.rotation.x += 0.01;
            currentGeometry.rotation.y += 0.005;
        }
    }
    
    function onKeyDown(event) {
        handleKeyPress(event);
    }
    
    function destroy() {
        // 清理几何体
        geometries.forEach(geo => {
            geo.mesh.geometry.dispose();
            geo.mesh.material.dispose();
        });
        // 清理掉
        const customStatsElement = document.getElementById('sceneCustomStats');
        if (customStatsElement) {
            customStatsElement.innerHTML =  `<div class="custom-info"></div>`;
        }
        document.removeEventListener('keydown', handleKeyPress);
    }
    
    init();
    
    return {
        update,
        onKeyDown,
        destroy
    };
}