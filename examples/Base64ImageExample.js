import WorldWind from 'webworldwind-esa';

import SentinelCloudlessLayer from '../src/layer/SentinelCloudlessLayer';
import LayerManager from './LayerManager';

WorldWind.configuration.baseUrl = window.location.pathname.replace('Base64ImageExample.html', '');

const wwd = new WorldWind.WorldWindow("canvasOne");
wwd.navigator.range = 1000000;
wwd.navigator.lookAtLocation = new WorldWind.Location(50, 20);

wwd.addLayer(new SentinelCloudlessLayer());


const placemarkAttributes = new WorldWind.PlacemarkAttributes();
// The icon used was taken from the Font Awesome. The license is here: https://fontawesome.com/license
placemarkAttributes.imageSource = "data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhcyIgZGF0YS1pY29uPSJtYXAtcGluIiBjbGFzcz0ic3ZnLWlubGluZS0tZmEgZmEtbWFwLXBpbiBmYS13LTkiIHJvbGU9ImltZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjg4IDUxMiI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTEyIDMxNi45NHYxNTYuNjlsMjIuMDIgMzMuMDJjNC43NSA3LjEyIDE1LjIyIDcuMTIgMTkuOTcgMEwxNzYgNDczLjYzVjMxNi45NGMtMTAuMzkgMS45Mi0yMS4wNiAzLjA2LTMyIDMuMDZzLTIxLjYxLTEuMTQtMzItMy4wNnpNMTQ0IDBDNjQuNDcgMCAwIDY0LjQ3IDAgMTQ0czY0LjQ3IDE0NCAxNDQgMTQ0IDE0NC02NC40NyAxNDQtMTQ0UzIyMy41MyAwIDE0NCAwem0wIDc2Yy0zNy41IDAtNjggMzAuNS02OCA2OCAwIDYuNjItNS4zOCAxMi0xMiAxMnMtMTItNS4zOC0xMi0xMmMwLTUwLjczIDQxLjI4LTkyIDkyLTkyIDYuNjIgMCAxMiA1LjM4IDEyIDEycy01LjM4IDEyLTEyIDEyeiI+PC9wYXRoPjwvc3ZnPg==";

const placemarkLayer = new WorldWind.RenderableLayer("Placemark");
placemarkLayer.addRenderable(new WorldWind.Placemark(new WorldWind.Position(50, 20, 10000), true, placemarkAttributes));
wwd.addLayer(placemarkLayer);

new LayerManager(wwd);