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

/** Collection of functions for defining a XYZ layers in a GeoMoose map.
 * 
 */

import * as util from '../../util';

/** Create the parameters for a XYZ layer.
 *
 */
function defineSource(mapSource) {
    return {
        urls: mapSource.urls
    }
}

/** Return an OpenLayers Layer for the XYZ source.
 *
 *  @param mapSource The MapSource definition from the store.
 *
 *  @returns OpenLayers Layer instance.
 */
export function createLayer(mapSource) {
    return new ol.layer.Tile({
        source: new ol.source.XYZ(defineSource(mapSource))
    });
}

/** Ensure that the XYZ parameters all match.
 */
export function updateLayer(map, layer, mapSource) {
    // pull in the open layers source
    let src = layer.getSource();
    // get the new definition
    let defn = defineSource(mapSource);

    // check to see if the list of URLs has changed.
    let urls = src.getUrls();
    let update_urls = false
    if(urls.length !== defn.urls.length) {
        update_urls = true;
    } else {
        for(let url of urls) {
            if(defn.urls.indexOf(url) < 0) {
                update_urls = true;
            }
        }
    }
    if(update_urls) {
        src.setUrls(defn.urls);
    }
}
    
