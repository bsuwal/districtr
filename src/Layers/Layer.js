export function addBelowLabels(map, layer) {
    const layers = map.getStyle().layers;
    const firstSymbolId = getFirstSymbolID(layers);
    map.addLayer(layer, firstSymbolId);
}

function getFirstSymbolID(layers) {
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol") {
            return layers[i].id;
        }
    }
}

export default class Layer {
    constructor(map, layer, adder) {
        this.map = map;
        this.id = layer.id;
        this.sourceId = layer.source;
        this.sourceLayer = layer["source-layer"];

        this.defaultPaint = layer.paint;

        if (adder) {
            adder(map, layer);
        } else {
            map.addLayer(layer);
        }

        this.whenLoaded = this.whenLoaded.bind(this);
    }
    setFeatureState(featureID, state) {
        this.map.setFeatureState(
            {
                source: this.sourceId,
                sourceLayer: this.sourceLayer,
                id: featureID
            },
            state
        );
    }
    setPaintProperty(name, value) {
        this.map.setPaintProperty(this.id, name, value);
    }
    resetPaintProperty(name) {
        this.map.setPaintProperty(this.id, name, this.defaultPaint[name]);
    }
    getPaintProperty(name) {
        return this.map.getPaintProperty(this.id, name);
    }
    getFeatureState(featureID) {
        return this.map.getFeatureState({
            source: this.sourceId,
            sourceLayer: this.sourceLayer,
            id: featureID
        });
    }
    getAssignment(featureID) {
        return this.getFeatureState(featureID).color;
    }
    setAssignment(featureId, part) {
        this.setFeatureState(featureId, { color: part });
    }
    on(type, ...args) {
        this.map.on(type, this.id, ...args);
    }
    off(type, ...args) {
        this.map.off(type, this.id, ...args);
    }
    /**
     * Query the properties of the features of the source layer
     * @param {string or function} getter
     */
    query(getter) {
        // If it's a string key, get that property for each feature
        let queryFunction = isString(getter)
            ? feature => feature.properties[getter]
            : // Otherwise, assume it's a function of each feature
              getter;

        const features = this.map.querySourceFeatures(this.sourceId, {
            sourceLayer: this.sourceLayer
        });
        let seenIds = new Set();
        let data = [];

        for (let feature of features) {
            if (!seenIds.has(feature.id)) {
                seenIds.add(feature.id);
                data.push(queryFunction(feature));
            }
        }
        return data;
    }
    whenLoaded(f) {
        if (this.map.isSourceLoaded(this.sourceId)) {
            f();
        } else {
            this.map.once("data", () => this.whenLoaded(f));
        }
    }
}

function isString(x) {
    return typeof x === "string" || x instanceof String;
}