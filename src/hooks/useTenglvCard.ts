import { useMemo } from "react";
import { loadTenglvCardData } from "../utils/tenglvCardLoader";

export function useTenglvCard() {
  return useMemo(() => loadTenglvCardData(), []);
}
