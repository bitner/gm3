/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 Dan "Ducky" Little
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** Collection of handy functions
 */

export function parseBoolean(bool, def = false) {
    if(typeof(bool) == "undefined" || bool === null) { return def; }
    var boolString = new String(bool);
    if(boolString.match(/true/i)) { return true; }
    else if(boolString === '1') { return true; }
    else if(boolString.match(/on/i)) { return true; }
    return false;
}


/** Take in an XML node and return all the text
 *  contained within that node.
 *
 *  @param node  The XML node.
 *
 *  @returns Text in the node.
 */
export function getXmlTextContents(node) {
    if(node.firstChild) {
        return node.firstChild.nodeValue;
    } else if(node.text) {
        return node.text;
    } else if(node.textContent) {
        return node.textContent;
    } 

    return null; 
}


/** Parse a node from XML and return the text value.
 *
 *  Handy in this situation...
 *   <map>SOME STUFF HERE</map>
 *  Specify 'map' and 'SOME STUFF HERE' will be returned
 *  by the function.  Only the first 'tag' will be found if the
 *  xml fragment has multiple, unless 'multiple' is set to true.
 *
 *  @param xml      An XML fragment.
 *  @param tagName  The tagname to return.
 *  @param multiple Whether to return an array or the first element.
 * 
 *  @returns Value of the text in the tag, or null if not found.
 */
export function getTagContents(xml, tagName, multiple) {
    // setup the array to handle multiple
    const contents = [];

    const tags = xml.getElementsByTagName(tagName);
    for(let i = 0, ii = tags.length; i < ii; i++) {
        const tag = tags[i];
        const node_value = getXmlTextContents(tag);
        // when multiple is not true, return the first value.
        if(multiple === true) {
            contents.push(node_value);
        } else {
            return node_value;
        }
    }
    
    return contents;
}

/** Compare two objects
 * 
 *  @param objA The first object
 *  @param objB The second object
 *  @param deep Whether to go "deeper" into the object.
 *
 *  @returns boolean, true if they differ, false if they are the same.
 */
export function objectsDiffer(objA, objB, deep) {
    const a_keys = Object.keys(objA), b_keys = Object.keys(objB);

    for(const key of a_keys) {
        const b_type = typeof(objB[key]);
        switch(b_type) {
            // if the key from a does not exist in b, then they differ.
            case 'undefined':
                return true;
            // standard comparisons
            case 'string':
            case 'number':
                if(objA[key] !== objB[key]) {
                    return true;
                }
            // GO DEEP!
            case 'object':
                // typeof(null) == 'object', this
                //  prevents trying to recurse on null
                if(objB[key] == null) {
                    if(objA[key] != null) {
                        return true;
                    }
                }
                if(deep === true && objectsDiffer(objA[key], objB[key], true)) {
                    return true;
                }
            default:
                // assume the objects differ if they cannot
                //  be typed.
                return true;
        }
    }

    // The above loop ensures that all the keys
    //  in "A" match a key in "B", if "B" has any 
    //  extra keys then the objects differ.
    for(const key of b_keys) {
        if(a_keys.indexOf(key) < 0) {
            return true;
        }
    }
        
    return false;
}


/** Get the map-sources name.  Paths are "/" split
 *  and so the first component should be the map-source name.
 *
 *  @param path
 *
 *  @returns a string with the map-source's name.
 */
export function getMapSourceName(path) {
    if(path === null) { return ''; }
    return path.split('/')[0];
}

/** Get the later name, path's last "/" should be the layer name.
 *
 * @param path
 *
 * @returns a layer name
 */
export function getLayerName(path) {
    if(path === null) { return ''; }
    const c = path.split('/');
    c.shift();
    // layers can have "/" in the name, so they need
    //  rejoined after removing the map-source name.
    return c.join('/');
}

/** Properly escape and join parameters for a URL
 *
 *  @params {Object} params an object of parameters.
 *
 *  @returns {String}
 */
export function formatUrlParameters(params) {
    const formatted_params = [];
    for(const key in params) {
        const formatted_value = encodeURIComponent(params[key]);
        formatted_params.push(key + '=' + formatted_value);
    }
    return formatted_params.join('&');
}


/** Formatting options for markup-js
 *
 *  These options are centralized here so they can
 *  be included anywhere markup is used.
 *
 */
export const FORMAT_OPTIONS = {
    pipes: {
        localize: function(n) {
            return n.toLocaleString();
        }
    }
}

/** Check to see if a feature matches the given filter.
 *
 *  @param {Array} features The list of features
 *  @param {Object} filter key-value pairs of filter for the features.
 *
 *  @returns {Boolean} whether the feature matches.
 */
export function featureMatch(feature, filter) {
    let match_all = (filter.match === 'any') ? false : true;
    for(let filter_key in filter) {
        // check to see if the values match
        let v = filter[filter_key] === feature.properties[filter_key];
        // if they match, and this is an 'any' search then short-circuit
        //  and return true;
        if(v && !match_all) { return true; }
        // if this value doesn't match, and require matching all
        //  then this can short-circuit and return false;
        if(!v && match_all) { return false; }
    }

    // no false values could have been set 
    //  and reach this point with match_all
    if(match_all) {
        return true;
    }

    // no true values + match-any search could
    //  reach this point
    return false;
}

/** Filter features from a list of features
 *
 *  @param {Array} features The list of features
 *  @param {Object} filter key-value pairs of filter for the features.
 *
 * @returns New list of features.
 */
export function filterFeatures(features, filter) {
    let new_features = [];

    for(let feature of features) {
        if(!featureMatch(feature, filter)) {
            new_features.push(feature);
        }
    }

    return new_features;
}

/** Update feature properties.
 *
 *  @param {Array} features The list of features
 *  @param {Object} filter key-value pairs of filter for the features.
 *  @param {Object} properties The new values for the features.
 *
 * @returns New list of features.
 */
export function changeFeatures(features, filter, properties) {
    let new_features = [];

    for(let feature of features) {
        if(featureMatch(feature, filter)) {
            let new_props = Object.assign({}, feature.properties, properties);
            new_features.push(Object.assign({}, feature, {properties: new_props}));
        } else {
            new_features.push(feature);
        }
    }

    return new_features;
}

/** Easy to stomach 'return me the version' fuction, the version
 *  is set using webpack and parses the package.json file to get it.
 *
 */
export function getVersion() {
    let v = GM_VERSION;
    return v;
}

/** Determine the extent of the features in a source.
 *  WARNING! This only works with vector sources.
 *
 * @param {MapSource} mapSource 
 *
 * @returns Array containing [minx,miny,maxx,maxy]
 */
export function getFeaturesExtent(mapSource) {
    let layer = mapSource.layers[0];

    let bounds = [null, null, null, null];

    let min = function(x, y) {
        if(x === null || y < x) { return y; }
        return x;
    };

    let max = function(x, y) {
        if(x === null || y > x) { return y; }
        return x;
    };

    let update_bounds = function(x, y) {
        bounds[0] = min(bounds[0], x);
        bounds[1] = min(bounds[1], y);
        bounds[2] = max(bounds[2], x);
        bounds[3] = max(bounds[3], y);
    };

    if(layer.features) {
        for(let feature of layer.features) {
            let geom = feature.geometry;
            if(geom.type === 'Point') {
                update_bounds(geom.coordinates[0], geom.coordinates[1]);
            } else if(geom.type === 'LineString') {
                for(let pt of geom.coordinates) {
                    update_bounds(pt[0], pt[1]);
                }
            } else if(geom.type === 'Polygon' || geom.type === 'MultiLineString') {
                for(let ring of geom.coordinates) {
                    for(let pt of ring) {
                        update_bounds(pt[0], pt[1]);
                    }
                }
            }
        }
    }

    return bounds;
}

/* Configure a set of projections useful for GeoMoose.
 *
 * At this point this will just configure the UTM zones
 * as they are used to do accurate measurement and buffers.
 *
 * @param {Proj4} p4 The Proj4 Library.
 *
 */
export function configureProjections(p4) {
    // var utm_zone = GeoMOOSE.getUtmZone(bounds.left);
    // var north = bounds.top > 0 ? 'north' : 'south';

    for(let utm_zone = 1; utm_zone <= 60; utm_zone++) {
        for(let north of ['north', 'south']) {
            // southern utm zones are 327XX, northern 326XX
            const epsg_code = 32600 + utm_zone + (north === 'north' ? 0 : 100);

            const proj_id = 'EPSG:' + epsg_code;
            const proj_alias = 'UTM' + utm_zone + (north === 'north' ? 'N' : 'S');
            // it's nice to have a formulary.
            const proj_string = '+proj=utm +zone=' + utm_zone + ' +' + north + '+datum=WGS84 +units=m +no_defs';

            // set up the standard way of calling the projection
            //  (using the EPSG Code)
            p4.defs(proj_id, proj_string);
            // add an alias, so it can be referred by 'UTM15N' for example.
            p4.defs(proj_alias, p4.defs(proj_id));
        }
    }

}

/* Determine the UTM zone for a point
 *
 * @param {Point-like} An array containing [x,y] in WGS84 or NAD83 DD
 *
 * @return UTM string (e.g. UTM15N)
 */
export function getUtmZone(pt) {
    let utm_string = 'UTM';

    // No citation provideded for this calculation,
    // it was working in the GM2.X series without a lot
    // of complaints. 
    const zone = Math.ceil((pt[0] / 6.0) + 30) + 1;

    // north zones are north of 0.
    const north = (pt[1] > 0) ? 'N' : 'S';

    // boom, string ot the user.
    return 'UTM' + zone + north;
}

const GEOJSON_FORMAT = new ol.format.GeoJSON();

export function geomToJson(geom) {
    return GEOJSON_FORMAT.writeGeometryObject(geom);
}

export function jsonToGeom(geom) {
    return GEOJSON_FORMAT.readGeometry(geom);
}

/* Converts from meters to a given units.
 *
 */
export function metersLengthToUnits(meters, units) {
    switch(units) {
        case 'ft':
            return meters * 3.28084;
        case 'mi':
            return meters / 1609.34;
        case 'km':
            return meters / 1000;
        case 'm':
        default:
            return meters;
    }
}

/* Convert Square Meters to a given units.
 *
 */
export function metersAreaToUnits(meters, units) {
    switch(units) {
        case 'ft':
            return meters / 0.092903;
        case 'mi':
            return meters / 2590000;
        case 'a':
            return meters / 4046.86;
        case 'h':
            return meters / 10000;
        case 'km':
            return meters / 1000000;
        case 'm':
        default:
            return meters;
    }
}
