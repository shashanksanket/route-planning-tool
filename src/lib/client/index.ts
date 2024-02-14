import {
  sendDeleteRequest,
  sendGetRequest,
  sendPostRequest,
  sendPutRequest,
} from "@/lib/common/util/request";
import { Response, getResponse } from "@/lib/common/util/response";

import {
  CREATE_ADDRESS,
  GET_ADDRESS_LIST,
  DELETE_ADDRESS,
  PATCH_ADDREES
} from "./const";
import { IAddress } from "@/lib/common/interfaces/address";

export class Client {
  headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  };
  constructor() {}

  createAddress(
    location: string,
    longitude: number,
    latitude: number,
    isCurrentLocation: boolean
  ): Promise<Response> {
    console.log(isCurrentLocation)
    const body = { location, longitude, latitude, isCurrentLocation };
    return this.handleResponse(
      sendPostRequest(
        CREATE_ADDRESS(),
        this.getDefaultHeaders(),
        {},
        body
      )
    );
  }

  addressGetList(): Promise<Response> {
    return this.handleResponse(
      sendGetRequest(GET_ADDRESS_LIST(), this.getDefaultHeaders(), {})
    );
  }
  addressUpdate(
    id:number,
    isCurrentLocation:boolean
  ): Promise<Response> {
    return this.handleResponse(
      sendGetRequest(PATCH_ADDREES(id,isCurrentLocation), this.getDefaultHeaders(), {})
    );
  }

  addressDelete(id: number): Promise<Response> {
    const body = { id }
    return this.handleResponse(
      sendDeleteRequest(DELETE_ADDRESS(id),this.getDefaultHeaders(), {}, body)
    )
  }

  getDefaultHeaders(): any {
    return { ...this.headers };
  }

  async handleResponse(request: Promise<any>): Promise<Response> {
    try {
      const response = await request;
      return response;
    } catch (error) {
      return getResponse(null, "GEN1");
    }
  }

}
