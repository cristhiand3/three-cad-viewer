import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CombinedCamera } from './pythreejs/cameras/CombinedCamera'
import { Assembly } from './assembly.js'
import { BoundingBox } from './bbox.js'
import { Grid } from './grid.js'
import { AxesHelper } from './axes.js'
import { UI } from './ui.js'


class Viewer {

    constructor(
        dark,
        bbFactor,
        position,
        zoom,
        grid,
        axes,
        axes0,
        ortho,
        blackEdges,
        edgeColor,
        ambientIntensity,
        directIntensity,
        transparent,
        transparentOpacity,
        normalLen
    ) {
        this.dark = dark;
        this.bbFactor = bbFactor;
        this.position = position;
        this.zoom = zoom;
        this.grid = grid;
        this.axes = axes;
        this.ortho = ortho;
        this.axes0 = axes0;
        this.blackEdges = blackEdges;
        this.edgeColor = edgeColor;
        this.ambientIntensity = ambientIntensity;
        this.directIntensity = directIntensity;
        this.transparent = transparent;
        this.transparentOpacity = transparentOpacity;
        this.normalLen = normalLen;

        this.assembly = null;
        this.shapes = null;
        this.mapping = null;
        this.tree = null;
        this.geom = null;
        this.bbox = null;
        this.bb_max = 0;
        this.scene = null;
        this.gridHelper = null;
        this.axesHelper = null;
        this.camera = null;
        this.controls = null;

        // setup renderer
        const container = document.getElementById('cad_view');

        this.renderer = new THREE.WebGLRenderer({
            alpha: !dark,
            antialias: true
        });

        this.width = container.clientWidth
        this.height = container.clientHeight
        this.renderer.setSize(this.width, this.height);
        container.appendChild(this.renderer.domElement);

        this.ui = new UI(this);
    }

    setCameraPosition = (center, position0) => {
        var cameraPosition = new THREE.Vector3(...position0).normalize().multiplyScalar(6 * this.bb_max);
        cameraPosition = cameraPosition.add(new THREE.Vector3(...center));
        this.camera.position.set(...cameraPosition.toArray());
        this.camera.up = new THREE.Vector3(0, 0, 1)
    }

    setOrthoCamera = (ortho_flag) => {
        if (ortho_flag) {
            this.camera.toOrthographic()
        } else {
            this.camera.toPerspective()
        }
    }

    resize = () => {
        this.camera.setZoom(this.zoom);
    }

    // render
    animate = () => {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    dump = (assembly, ind) => {
        if (ind == undefined) {
            ind = ""
        }
        if (assembly.parts) {
            for (var part of assembly.parts) {
                dump(part, ind + "  ");
            }
        }
    }

    render = (shapes, mapping, tree) => {
        this.shapes = shapes;
        this.mapping = mapping;
        this.tree = tree;

        // render the assembly
        this.assembly = new Assembly(
            shapes.parts[0],
            this.width,
            this.height,
            this.edgeColor,
            this.transparent,
            this.transparentOpacity,
            this.normalLen
        );
        this.geom = this.assembly.render();

        var b = new THREE.Box3().setFromObject(this.geom);
        this.bbox = new BoundingBox(b.min.x, b.max.x, b.min.y, b.max.y, b.min.z, b.max.z)
        this.bb_max = this.bbox.max_dist_from_center()

        // build the scene
        this.scene = new THREE.Scene();
        this.scene.add(this.geom);

        const amb_light = new THREE.AmbientLight(0xffffff, this.ambientIntensity);
        this.scene.add(amb_light);

        for (var xpos of [-this.bb_max, this.bb_max]) {
            for (var ypos of [-this.bb_max, this.bb_max]) {
                for (var zpos of [-this.bb_max, this.bb_max]) {
                    const directionalLight = new THREE.DirectionalLight(0xffffff, this.directIntensity);
                    directionalLight.position.set(10 * xpos, 10 * ypos, 10 * zpos)
                    this.scene.add(directionalLight);
                }
            }
        }

        this.gridHelper = new Grid(this.bbox, 10, this.axes0, this.grid ? [true, true, true] : [false, false, false])
        for (var i = 0; i < 3; i++) {
            this.scene.add(this.gridHelper.gridHelper[i]);
        }

        this.axesHelper = new AxesHelper(this.bbox.center, this.gridHelper.size / 2, this.width, this.height, this.axes0, this.axes);
        this.scene.add(this.axesHelper);

        // define the camera

        this.camera = new CombinedCamera(
            this.width, this.height, 35,
            0.1, 10 * this.bbFactor * this.bb_max,
            0.1, 10 * this.bbFactor * this.bb_max
        )

        this.setOrthoCamera(true);
        this.setCameraPosition(this.bbox.center, this.position);

        this.resize()

        // define the orbit controller
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target = new THREE.Vector3(...this.bbox.center);
        this.controls.saveState();

        this.animate()
    }
}

export { Viewer }