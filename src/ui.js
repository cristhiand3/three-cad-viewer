class UI {
    constructor(viewer) {
        this.viewer = viewer;

        this.defaultDirections = {
            "front": { "position": [1, 0, 0] },
            "rear": { "position": [-1, 0, 0] },
            "top": { "position": [0, 0, 1] },
            "bottom": { "position": [0, 0, -1] },
            "left": { "position": [0, 1, 0] },
            "right": { "position": [0, -1, 0] },
            "iso": { "position": [1, 1, 1] }
        }

        document.querySelector('.axes').addEventListener('change', this.setAxes);
        document.querySelector('.axes').checked = viewer.axes;
        document.querySelector('.grid').addEventListener('change', this.setGrid);
        document.querySelector('.grid-xy').addEventListener('change', this.setGrid);
        document.querySelector('.grid-xz').addEventListener('change', this.setGrid);
        document.querySelector('.grid-yz').addEventListener('change', this.setGrid);
        document.querySelector('.grid').checked = viewer.grid;
        document.querySelector('.grid-xy').checked = viewer.grid;
        document.querySelector('.grid-xz').checked = viewer.grid;
        document.querySelector('.grid-yz').checked = viewer.grid;
        document.querySelector('.axes0').addEventListener('change', this.setAxes0);
        document.querySelector('.axes0').checked = viewer.axes0;
        document.querySelector('.ortho').addEventListener('change', this.setOrtho);
        document.querySelector('.ortho').checked = viewer.ortho;
        document.querySelector('.reset').addEventListener('click', this.reset);
        document.querySelector('.resize').addEventListener('click', this.resize);
        document.querySelector('.transparent').addEventListener('change', this.setTransparency);
        document.querySelector('.transparent').checked = viewer.transparent;
        document.querySelector('.black_edges').addEventListener('change', this.setBlackEdges);
        document.querySelector('.black_edges').checked = viewer.black_edges;

        ["front", "rear", "top", "bottom", "left", "right", "iso"].forEach((b) => {
            document.querySelector(`.${b}`).addEventListener('click', this.setView);
        })
    }

    setAxes = (e) => {
        const flag = !!e.target.checked;
        this.viewer.axesHelper.setVisible(flag);
    }

    setGrid = (e) => {
        const action = e.target.className.split(" ")[0]
        this.viewer.gridHelper.setGrid(action);
    }

    setAxes0 = (e) => {
        const flag = !!e.target.checked;
        this.viewer.gridHelper.setCenter(flag);
        this.viewer.axesHelper.setCenter(flag);
    }

    setOrtho = (e) => {
        const flag = !!e.target.checked;
        this.viewer.setOrthoCamera(flag);
    }

    setTransparency = (e) => {
        const flag = !!e.target.checked;
        this.viewer.assembly.setTransparent(flag);
    }

    setBlackEdges = (e) => {
        const flag = !!e.target.checked;
        this.viewer.assembly.setBlackEdges(flag);
    }

    reset = () => {
        this.viewer.setCameraPosition(this.viewer.bbox.center, this.defaultDirections["iso"]["position"])
        this.viewer.camera.setZoom(this.viewer.zoom);
        this.viewer.camera.lookAt(this.viewer.bbox.center);
        this.viewer.controls.reset();
    }

    resize = () => {
        self.viewer.resize();
    }

    setView = (e) => {
        const btn = e.target.className.split(" ")[0];
        const dir = this.defaultDirections[btn]["position"]
        this.viewer.setCameraPosition(this.viewer.bbox.center, dir);
    }
}

export { UI }