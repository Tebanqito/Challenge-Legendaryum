type TipoMoneda = "Dolar" | "Peso" | "Real" | "Euro";

interface PosicionMoneda {
    x: number;
    y: number;
    z: number;
}

interface Moneda {
    id: string;
    tipoMoneda: TipoMoneda;
    posicion: PosicionMoneda;
}

export interface Usuario {
    id: string;
    nombreUsuario: string;
    monedas: Moneda[];
    notificaciones: string[];
};

export interface Room {
    id: string;
    room: string;
    monedas: Moneda[];
};

export interface Metaverso {
    rooms: Room[];
};