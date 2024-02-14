import { IAddress } from "../interfaces/address";

export type Response = {
  map(arg0: (address: import("../interfaces/address").IAddress) => google.maps.Marker): unknown;
  length: number;
  data?: any;
  code: string;
  message: string;
  metadata: any;
};

export const getResponse = (
  data: any,
  code: string,
  metadata: any = {}
) => {
  const res: Response = {
    data,
    code,
    message: APIResponse[code],
    metadata,
    length: 0,
    map: function (arg0: (address: IAddress) => google.maps.Marker): unknown {
      throw new Error("Function not implemented.");
    }
  };
  return res;
};

export const APIResponse: Record<string, string> = {
  GEN0: "OK",
  GEN1: "Error",
};
