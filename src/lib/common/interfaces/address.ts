import {Document} from "mongoose"

interface IAddress extends Document {
  location: string;
  longitude: number;
  latitude: number;
  isCurrentLocation: boolean
}

export type { IAddress };
