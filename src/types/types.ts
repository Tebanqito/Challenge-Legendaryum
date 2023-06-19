export type TipoMoneda = "Dolar" | "Peso" | "Real" | "Euro";

export interface PosicionMoneda {
    x: number;
    y: number;
    z: number;
};

export interface LimitePoscion {
    xMin: number;
    xMax: number;
    yMax: number;
    yMin: number;
    zMin: number;
    zMax: number;
};

export interface Moneda {
    id: string;
    tipoMoneda: TipoMoneda;
    posicion: PosicionMoneda;
};

export interface Usuario {
    id: string;
    nombreUsuario: string;
    monedas: Moneda[];
    notificaciones: string[];
};

export interface Room {
    id: string;
    room: string;
    usuarios: Usuario[];
    monedas: Moneda[];
    limitesPosicion: LimitePoscion;
};

export interface Metaverso {
    rooms: Room[];
};