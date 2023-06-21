import { LimitePoscion, PosicionMoneda, Moneda } from "./types/types";

export function generarPosicion3D(limite: LimitePoscion): PosicionMoneda {
  return {
    x:
      Math.floor(Math.random() * (limite.xMax - limite.xMin + 1)) + limite.xMin,
    y:
      Math.floor(Math.random() * (limite.yMax - limite.yMin + 1)) + limite.yMin,
    z:
      Math.floor(Math.random() * (limite.zMax - limite.zMin + 1)) + limite.zMin,
  };
}

export function corroborarPosicion3D(
  monedas: Moneda[],
  posicion: PosicionMoneda
): boolean {
  for (let index = 0; index < monedas.length; index++) {
    const isPosicion: boolean =
      monedas[index].posicion.x === posicion.x &&
      monedas[index].posicion.y === posicion.y &&
      monedas[index].posicion.z === posicion.z;

    if (isPosicion) return false;
  }

  return true;
};

export function corroborarMoneda(monedas: Moneda[], monedaId: string): boolean {
  for (let index = 0; index < monedas.length; index++) {
    if (monedas[index].id === monedaId) return true;
  }

  return false;
};