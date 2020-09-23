import * as L from 'leaflet';

declare module 'leaflet' {
    interface RotatingMapOptions extends MapOptions {
        rotate?: boolean;
    }

    interface Map {
        getCircumscribedBounds(): LatLngBounds;
        getBearing(): number;
        setBearing(theta: number): void;
    }

    interface Point{
        rotate(theta: number): Point;
        rotateFrom(theta: number, pivot: Point): Point;
    }

    function map(element: string | HTMLElement, options?: RotatingMapOptions): Map;
}