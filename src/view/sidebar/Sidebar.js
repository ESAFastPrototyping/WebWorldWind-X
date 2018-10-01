import WorldWind from "@nasaworldwind/worldwind";

class Sidebar {
    constructor(wwd, id) {

    }

    build(id) {
        const html = `
        <div id="left-sidebar">
            <div>
        
                <div id="left-sidebar-switch" class="control"><i class="fa fa-chevron-right"></i></div>
        
                <div id="goto">
                    <div class="input-button-icon"><input type="text" id="location" placeholder="Go to…">
                        <button id="search"><i class="fa fa-search"></i></button>
                    </div>
                </div>
        
                <div class="tabs">
                    <div class="tab active" id="show-map-layers" data-content-id="map-layers">Map layers</div>
                    <div class="tab" id="show-map-projections" data-content-id="map-projection">Projections</div>
                </div>
        
                <div id="map-layers" class="-hidden">
                    <h3>Map layer</h3>
                    <div id="blue-marble" class="map-layers-map active" data-radio-group="map">
                        Blue Marble
                        <span style="background-image: url('bluemarble.png')"></span>
                    </div>
                </div>
        
                <div id="map-projection" class="hidden">
                    <h3>Projection</h3>
                </div>
            </div>
        </div>
        `;
    }
}

export default Sidebar;

/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([], function () {
    "use strict";
    var GoToLocation = function (options) {
        this.goToAnimator = options.animator;
    };

    /**
     * Set the time interval for the animation
     * @param duration {number} duration of the animation in milliseconds
     */
    GoToLocation.prototype.setTravelTime = function (duration) {
        this.goToAnimator.travelTime = duration;
    };

    /**
     *
     * @param position {Object} WorldWind.location
     * @param travelTime {number} Duration of the animation in milliseconds
     * @param callback {function} Callback function which will be triggered when the animation is finished
     */
    GoToLocation.prototype.go = function (position, travelTime, callback) {
        this.setTravelTime(travelTime);
        this.goToAnimator.goTo(position, callback);
    };

    return GoToLocation;
});

/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([], function () {
    "use strict";
    var Search = function (options) {
        this.geocoder = new WorldWind.NominatimGeocoder();
        this.goToAnimator = options.animator;
        var self = this;
        $('#search').on('click', function () {
            var locationToSearch = $('#location').val();
            self.performSearch(locationToSearch);
        });
    };

    Search.prototype.performSearch = function (queryString) {
        if (queryString) {
            var thisLayerManager = this,
                latitude, longitude;

            if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
                var tokens = queryString.split(",");
                latitude = parseFloat(tokens[0]);
                longitude = parseFloat(tokens[1]);
                thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
            } else {
                this.geocoder.lookup(queryString, function (geocoder, result) {
                    if (result.length > 0) {
                        latitude = parseFloat(result[0].lat);
                        longitude = parseFloat(result[0].lon);

                        WorldWind.Logger.log(
                            WorldWind.Logger.LEVEL_INFO, queryString + ": " + latitude + ", " + longitude);

                        thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
                    }
                });
            }
        }
    };

    return Search;
});


$("#left-sidebar").find(".tabs .tab").click(function (e) {
    if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey | e.ctrlKey)) {
        var tabElm = $(this);
        if (!tabElm.hasClass("active")) {
            var elmSiblings = tabElm.siblings();
            elmSiblings.removeClass("active");
            elmSiblings.each(function (index, sibling) {
                var siblingContentElmSelector = "#" + $(sibling).data("contentId");
                toggleShow(siblingContentElmSelector, "hide");
            });
            var contentElmSelector = "#" + $(tabElm).data("contentId");
            toggleShow(contentElmSelector, "show");
            tabElm.addClass("active");
        }
    }
});

$("#blue-marble").click(function () {
    blueMarbleLayer.enabled = true;
    openStreetMapLayer.enabled = false;
    $("#blue-marble").addClass("active");
    $("#open-street-map").removeClass("active");
});

$("#open-street-map").click(function () {
    blueMarbleLayer.enabled = false;
    openStreetMapLayer.enabled = true;
    $("#blue-marble").removeClass("active");
    $("#open-street-map").addClass("active");
});

var openStreetMapLayer = new WorldWind.OpenStreetMapImageLayer(null);
openStreetMapLayer.enabled = true;
var blueMarbleLayer = new WorldWind.BMNGLandsatLayer();
blueMarbleLayer.enabled = false;

wwd.addLayer(openStreetMapLayer);
wwd.addLayer(blueMarbleLayer);
