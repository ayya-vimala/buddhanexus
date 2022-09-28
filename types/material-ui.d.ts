// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonColors } from "@mui/material/styles/createPalette";

declare module "@mui/material/styles/createPalette" {
  export interface CommonColors {
    pali: string;
    sanskrit: string;
    tibetan: string;
    chinese: string;
  }
}
