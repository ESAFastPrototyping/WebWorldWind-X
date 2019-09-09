import WorldWind from 'webworldwind-esa';

const {
    ColladaScene,
    Matrix,
    Renderable
} = WorldWind;

/**
 * @exports Model
 */
class Model extends Renderable {
    /**
     * Constructs model of the satellite on the given position.
     * @param model {Object} Model information. Collada information.
     * @param satellite {Object} The details about the satellite and the way it should be transformed and presented.
     * @param position {Position} The exact position of the center of the satellite.
     */
    constructor(model, satellite, position) {
        super();

        this._satellite = satellite;
        const satelliteModel = this.parse(model);
        this.draw(position, satelliteModel);
    }

    /**
     * Updates the position of the model.
     * @param position {Position} Current position of the model.
     */
    position(position) {
        this._model.position = position;
    }

    /**
     * Draws the collada model into a Collada Scene.
     * @param position {Position} Position of the satellite.
     * @param modelData Collada Model Information.
     */
    draw(position, modelData) {
        const nodesToHide = [
            'PlatformCircleAndName', 'SolarWingsCircleAndName', 'C-SarCircleAndName',
            'PlatformTextsAndArrows', 'SolarWingsTextsAndArrows', 'C-SarTextsAndArrows',

            'SolarArrayGroup', 'WingsDetailsGroup', 'Group004', 'MsiGroup', 'SatteliteGroup',

            'SatteliteDimensionsGroup', 'MWRGroup', 'SRALGroup', 'OLCIGroup', 'SLSTRGroup'
        ];
        const {
            rotations,
            translations,
            preRotations,
            scale,
            shortName,
            ignoreLocalTransforms
        } = this._satellite;

        const model = new ColladaScene(position, modelData);
        model.type = this.type;
        model.satShortName = shortName;

        model.nodesToHide = nodesToHide;
        model.hideNodes = true;
        model.useTexturePaths = false;
        model.localTransforms = ignoreLocalTransforms;
        model.scale = scale;
        model.xRotation = rotations.x;
        model.yRotation = rotations.y;
        model.zRotation = rotations.z;
        model.xTranslation = translations.x;
        model.yTranslation = translations.y;
        model.zTranslation = translations.z;
        model.preX = preRotations.x;
        model.preY = preRotations.y;
        model.preZ = preRotations.z;

        this._model = model;
        modelData = null;
    }

    /**
     * Parses the collada model and update the information relevant to the satellites.
     * @param {{ meshes:Object, root:Object, materials:{reflective:Array, diffuse:Array} }} jsonData
     * @return {Object} Collada model.
     */
    parse(jsonData) {
        const meshes = jsonData.meshes;
        const nodes = jsonData.root.children;
        const materials = jsonData.materials;

        for (let key in meshes) {
            if (meshes.hasOwnProperty(key)) {
                const buffers = meshes[key].buffers;

                for (let i = 0; i < buffers.length; i++) {
                    const vertices = buffers[i].vertices || [];
                    const normals = buffers[i].normals || [];
                    const uvs = buffers[i].uvs || [];
                    const indices = buffers[i].indices || [];

                    const eVertices = new Float32Array(vertices);
                    const eNormals = new Float32Array(normals);
                    const eUvs = new Float32Array(uvs);
                    const eIndices = new Uint16Array(indices);

                    buffers[i].vertices = eVertices;
                    buffers[i].normals = eNormals;
                    buffers[i].uvs = eUvs;
                    buffers[i].indices = eIndices;
                }
            }
        }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.mesh) {
                const worldMatrix = node.worldMatrix.slice(0);
                node.worldMatrix = Matrix.fromIdentity();
                node.worldMatrix.copy(worldMatrix);

                if (node.children.length) {
                    console.info('node has children', node);
                }
            }
        }

        for (let key in materials) {
            if (materials.hasOwnProperty(key)) {
                const material = materials[key];

                if (material.id === '_3_-_Default-material') {
                    if (material.reflective) {
                        material.reflective[0] = 0.289219;
                        material.reflective[1] = 0.713497;
                        material.reflective[2] = 0.870753;
                        material.reflective[3] = 1;
                    }
                } else if (material.id === '_1_-_Default_004-material') {
                    material.diffuse[3] = 0;
                } else if (material.id === '_1_-_Default-material') {
                    material.diffuse[3] = 0;
                } else if (material.id === 'Chrome-material') {
                    material.textures = null;
                    material.diffuse[0] = 0.3137;
                    material.diffuse[1] = 0.3137;
                    material.diffuse[2] = 0.3137;
                } else if (material.id === 'Satellite_panel-material') {
                    material.textures.reflective.mapId = 'image9';
                } else if (material.id === '_3_-_Default') {
                    material.textures.reflective.mapId = 'image4';
                } else if (material.id === '_4_-_Default-material') {
                    material.textures.reflective.mapId = 'image5';
                } else if (material.id === '_5_-_Default_002-material') {
                    material.textures.reflective.mapId = 'image6';
                } else if (material.id === '_5_-_Default-material') {
                    material.textures.reflective.mapId = 'image5';
                }
            }
        }

        return jsonData;
    }

    /**
     * @inheritDoc
     */
    render(dc) {
        if(!this._model || !this.enabled) {
            return;
        }

        this._model.render(dc);
    }
}

export default Model;