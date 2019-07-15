import { Layer } from 'ol/layer';
import { StyleLike } from 'ol/style/Style';
    export type AddressType = 'StreetAddress' | 'PositionOfInterest' | 'CadastralParcel' | 'Commune';
    export type position = 'top' | 'left' | 'bottom' | 'right';
    export interface options {
        follow?: boolean;
        align: 'top' | 'bottom-left' | 'right';
        layers: Layer[];
        style: StyleLike | undefined;
    } 
    export interface condition {
        attr: string;
        op: string;
        val: string;
    }
    export function Status(): void;

