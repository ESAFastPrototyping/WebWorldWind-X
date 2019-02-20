import WorldWind from '@nasaworldwind/worldwind';
import CyclicPickController from '../src/util/CyclicPickController';
import LayerManager from './LayerManager';

WorldWind.configuration.baseUrl = window.location.pathname.replace('CyclicPickExample.html', '');
WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

var wwd = new WorldWind.WorldWindow("canvasOne");
wwd.deepPicking = true;

var meshLayer = new WorldWind.RenderableLayer('Highlightable circles');

var altitude1 = 100e3,
    altitude2 = altitude1 * 2,
    altitude3 = altitude1 * 3,
    numRadialPositions = 40,
    mesh1Positions = [],
    mesh2Positions = [],
    mesh3Positions = [],
    meshIndices = [],
    outlineIndices = [],
    texCoords = [],
    meshRadius = 5; // degrees

// Create the mesh's positions, which are the center point of a circle followed by points on the circle.

mesh1Positions.push(new WorldWind.Position(35, -115, altitude1)); // the mesh center
mesh2Positions.push(new WorldWind.Position(35, -115, altitude2)); // the mesh center
mesh3Positions.push(new WorldWind.Position(35, -115, altitude3)); // the mesh center
texCoords.push(new WorldWind.Vec2(0.5, 0.5));

for (var angle = 0; angle < 360; angle += 360 / numRadialPositions) {
    var angleRadians = angle * WorldWind.Angle.DEGREES_TO_RADIANS,
        lat = mesh1Positions[0].latitude + Math.sin(angleRadians) * meshRadius,
        lon = mesh1Positions[0].longitude + Math.cos(angleRadians) * meshRadius,
        t = 0.5 * (1 + Math.sin(angleRadians)),
        s = 0.5 * (1 + Math.cos(angleRadians));

    mesh1Positions.push(new WorldWind.Position(lat, lon, altitude1));
    mesh2Positions.push(new WorldWind.Position(lat, lon, altitude2));
    mesh3Positions.push(new WorldWind.Position(lat, lon, altitude3));
    texCoords.push(new WorldWind.Vec2(s, t));
}

// Create the mesh indices.
for (var i = 1; i < numRadialPositions; i++) {
    meshIndices.push(0);
    meshIndices.push(i);
    meshIndices.push(i + 1);
}
// Close the circle.
meshIndices.push(0);
meshIndices.push(numRadialPositions);
meshIndices.push(1);

// Create the outline indices.
for (var j = 1; j <= numRadialPositions; j++) {
    outlineIndices.push(j);
}
// Close the outline.
outlineIndices.push(1);

// Create the mesh's attributes. Light this mesh.
var meshAttributes = new WorldWind.ShapeAttributes(null);
meshAttributes.outlineColor = WorldWind.Color.BLUE;
meshAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.7);
meshAttributes.imageSource = "../images/400x230-splash-nww.png";
meshAttributes.applyLighting = true;

// Create the mesh's highlight attributes.
var highlightAttributes = new WorldWind.ShapeAttributes(meshAttributes);
highlightAttributes.outlineColor = WorldWind.Color.RED;
highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 1);
highlightAttributes.applyLighting = false;

// Create the mesh.
var mesh = new WorldWind.TriangleMesh(mesh1Positions, meshIndices, meshAttributes);
mesh.textureCoordinates = texCoords;
mesh.outlineIndices = outlineIndices;
mesh.highlightAttributes = highlightAttributes;

var mesh2Attributes = new WorldWind.ShapeAttributes(meshAttributes);
mesh2Attributes.interiorColor = new WorldWind.Color(1, 0, 0, 0.7);
var mesh2 = new WorldWind.TriangleMesh(mesh2Positions, meshIndices, mesh2Attributes);
mesh2.textureCoordinates = texCoords;
mesh2.outlineIndices = outlineIndices;
mesh2.highlightAttributes = highlightAttributes;

var mesh3Attributes = new WorldWind.ShapeAttributes(meshAttributes);
mesh3Attributes.interiorColor = new WorldWind.Color(0, 1, 0, 0.7);
var mesh3 = new WorldWind.TriangleMesh(mesh3Positions, meshIndices, mesh3Attributes);
mesh3.textureCoordinates = texCoords;
mesh3.outlineIndices = outlineIndices;
mesh3.highlightAttributes = highlightAttributes;

meshLayer.addRenderable(mesh);
meshLayer.addRenderable(mesh2);
meshLayer.addRenderable(mesh3);

var layers = [
    {layer: new WorldWind.BMNGLayer(), enabled: true},
    {layer: meshLayer, enabled: true},
    {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
    {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
];

for (var l = 0; l < layers.length; l++) {
    layers[l].layer.enabled = layers[l].enabled;
    layers[l].layer.zIndex = layers[l].zIndex;
    wwd.addLayer(layers[l].layer);
}

var events = ['click', 'touchstart'];
new CyclicPickController(wwd, events, onPickDone);
new LayerManager(wwd);

function onPickDone(renderables) {
    console.log(renderables);
}

document.querySelector('#searchText').blur();