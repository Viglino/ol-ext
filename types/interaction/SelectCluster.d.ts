import { Map as _ol_Map_ } from 'ol';
import Feature, { FeatureLike } from 'ol/Feature';
import { Vector } from 'ol/layer';
import { Style } from 'ol/style';
import { Select } from 'ol/interaction';
/**
 * @classdesc
 * Interaction for selecting vector features in a cluster.
 * It can be used as an interaction.Select.
 * When clicking on a cluster, it springs apart to reveal the features in the cluster.
 * Revealed features are selectable and you can pick the one you meant.
 * Revealed features are themselves a cluster with an attribute features that contain the original feature.
 *
 * @constructor
 * @extends {interaction.Select}
 * @param {olx.interaction.SelectOptions=} options SelectOptions.
 *  @param {style} options.featureStyle used to style the revealed features as options.style is used by the Select interaction.
 * 	@param {boolean} options.selectCluster false if you don't want to get cluster selected
 * 	@param {Number} options.PointRadius to calculate distance between the features
 * 	@param {bool} options.spiral means you want the feature to be placed on a spiral (or a circle)
 * 	@param {Number} options.circleMaxObject number of object that can be place on a circle
 * 	@param {Number} options.maxObjects number of object that can be drawn, other are hidden
 * 	@param {bool} options.animation if the cluster will animate when features spread out, default is false
 * 	@param {Number} options.animationDuration animation duration in ms, default is 500ms
 * @fires interaction.SelectEvent
 * @api stable
 */
export class SelectCluster extends Select {
    constructor(options?: {
        featureStyle: Style;
        selectCluster: boolean;
        PointRadius: number;
        spiral: boolean;
        circleMaxObject: number;
        maxObjects: number;
        animation: boolean;
        animationDuration: number;
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Clear the selection, close the cluster and remove revealed features
     * @api stable
     */
    clear(): void;
    /**
     * Get the layer for the revealed features
     * @api stable
     */
    getLayer(feature: FeatureLike): Vector;
    /**
     * Select a cluster
     * @param {Feature} a cluster feature ie. a feature with a 'features' attribute.
     * @api stable
     */
    selectCluster(a: Feature): void;
    /**
     * Animate the cluster and spread out the features
     * @param {Coordinates} the center of the cluster
     */
    animateCluster_(the: Coordinates): void;
}
