// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";

// Basic setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// ==================== OPTIMIZED BRIGHTER LIGHTING ====================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.3);
mainLight.position.set(3, 5, 2);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-3, 3, -2);
scene.add(fillLight);

const pointLight = new THREE.PointLight(0xfff0e0, 0.9, 8);
pointLight.position.set(2, 3, 2);
scene.add(pointLight);

// ==================== CLOSE ISOMETRIC CAMERA ====================
camera.position.set(0.8, 0.8, 0.8);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;
controls.minPolarAngle = Math.PI / 6;
controls.maxPolarAngle = Math.PI / 1.8;

let userInteracted = false;
controls.addEventListener('start', () => {
    userInteracted = true;
    controls.autoRotate = false;
});

controls.addEventListener('end', () => {
    setTimeout(() => {
        if (userInteracted) {
            controls.autoRotate = true;
        }
    }, 3000);
});

// ==================== LOCAL MODEL LOADING WITH DRACO SUPPORT ====================
const loader = new GLTFLoader();
let model = null;

// Set up DRACO loader for compressed models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

// Local model path - assuming your files are in models/cake/
const LOCAL_MODEL_PATH = 'models/cake/scene_compressed.glb';

function setupModel(loadedModel) {
    const box = new THREE.Box3().setFromObject(loadedModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    console.log("Original model size:", size);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 1.5;
    const scale = targetSize / maxDim;
    
    loadedModel.scale.set(scale, scale, scale);
    
    box.setFromObject(loadedModel);
    const newCenter = box.getCenter(new THREE.Vector3());
    
    loadedModel.position.x = -newCenter.x;
    loadedModel.position.y = -newCenter.y;
    loadedModel.position.z = -newCenter.z;
    
    return loadedModel;
}

// Create instructions overlay
function createInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'instructions';
    instructions.textContent = '💫 Click and drag to rotate • Auto-rotates when idle';
    document.body.appendChild(instructions);
}

// Loading progress functions
function updateLoadingProgress(percent) {
    let progressBar = document.getElementById('loadingProgress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'loadingProgress';
        document.body.appendChild(progressBar);
    }
    progressBar.textContent = `Loading Birthday Cake: ${percent}%`;
    progressBar.style.display = 'block';
}

function hideLoadingProgress() {
    const progressBar = document.getElementById('loadingProgress');
    if (progressBar) {
        setTimeout(() => {
            progressBar.style.display = 'none';
        }, 1000);
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <h3>🎂 Loading Error</h3>
        <p>${message}</p>
        <small>Check if the model file exists at: ${LOCAL_MODEL_PATH}</small>
    `;
    document.body.appendChild(errorDiv);
}

// Load local model
function loadLocalModel() {
    loader.load(
        LOCAL_MODEL_PATH,
        function(gltf) {
            console.log('✅ Local model loaded successfully!');
            
            model = gltf.scene;
            setupModel(model);
            
            // Slightly more reflective materials for brighter look
            model.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        child.material.metalness = 0.1;
                        child.material.roughness = 0.6;
                        child.material.needsUpdate = true;
                    }
                }
            });
            
            scene.add(model);
            controls.target.set(0, 0, 0);
            controls.update();
            
            console.log("🎂 Your birthday cake model loaded!");
            hideLoadingProgress();
        },
        function(xhr) {
            const percent = xhr.lengthComputable ? 
                (xhr.loaded / xhr.total * 100).toFixed(2) : 
                (xhr.loaded / (10 * 1024 * 1024) * 100).toFixed(2);
            console.log(`Loading local model: ${percent}%`);
            updateLoadingProgress(percent);
        },
        function(error) {
            console.error('❌ Failed to load local model:', error);
            showErrorMessage(`Failed to load the 3D model: ${error.message}`);
            
            // Try alternative loading methods
            tryAlternativeLoading();
        }
    );
}

// Alternative loading method without Draco (in case the file isn't actually Draco compressed)
function tryAlternativeLoading() {
    console.log('Trying alternative loading without Draco...');
    
    // Create a new loader without Draco
    const fallbackLoader = new GLTFLoader();
    
    fallbackLoader.load(
        LOCAL_MODEL_PATH,
        function(gltf) {
            console.log('✅ Model loaded with fallback loader!');
            
            model = gltf.scene;
            setupModel(model);
            
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.metalness = 0.1;
                    child.material.roughness = 0.6;
                }
            });
            
            scene.add(model);
            controls.target.set(0, 0, 0);
            controls.update();
            hideLoadingProgress();
        },
        function(xhr) {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(2);
            updateLoadingProgress(percent);
        },
        function(error) {
            console.error('❌ Fallback loading also failed:', error);
            showErrorMessage(`Both loading methods failed. Please check: 
                1. File exists at ${LOCAL_MODEL_PATH}
                2. File is a valid GLB format
                3. Server allows file access`);
        }
    );
}

// ==================== ANIMATION LOOP ====================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize the application
function init() {
    createInstructions();
    updateLoadingProgress(0);
    animate();
    console.log("🚀 3D Birthday Scene initialized");
    
    // Start loading local model
    loadLocalModel();
}

// Start the application
init();