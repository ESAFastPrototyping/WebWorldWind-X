import WorldWind from 'webworldwind-esa';

const Location = WorldWind.Location,
    Sector = WorldWind.Sector,
    WmsLayer = WorldWind.WmsLayer;

class SentinelCloudlessLayer extends WmsLayer {
    constructor(){
        super({
            service: "https://tiles.maps.eox.at/wms",
            layerNames: "s2cloudless-2018",
            title: "Sentinel Cloudless Layer",
            sector: new Sector(-90, 90, -180, 180),
            levelZeroDelta: new Location(45, 45),
            numLevels: 19,
            format: "image/jpg",
            opacity: 1,
            size: 256,
            version: "1.3.0"
        });
    }
}

export default SentinelCloudlessLayer;