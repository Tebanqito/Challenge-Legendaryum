import { LimitePoscion, PosicionMoneda } from "./types/types";

export function generarPosicion3D(limite: LimitePoscion): PosicionMoneda {
  return {
    x:
      Math.floor(Math.random() * (limite.xMax - limite.xMin + 1)) + limite.xMin,
    y:
      Math.floor(Math.random() * (limite.yMax - limite.yMin + 1)) + limite.yMin,
    z:
      Math.floor(Math.random() * (limite.zMax - limite.zMin + 1)) + limite.zMin,
  };
};

