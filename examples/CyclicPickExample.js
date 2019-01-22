import WorldWind from '@nasaworldwind/worldwind';
import CyclicPickController from '../src/util/CyclicPickController';
import LayerManager from './LayerManager';

function testForMobile() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

if(testForMobile()) {
    document.querySelector('#canvasOne').height = (window.innerHeight - 55);
}

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

if(!testForMobile()) {
    document.querySelector('#canvasOne').height = (window.innerHeight - 55);
}

document.querySelector('#searchText').blur();