import yaml from "js-yaml";
import { TenglvCardData } from "../types/tenglvCard";

const cardModules = import.meta.glob("/content/cards/*/items.yaml", {
  eager: true,
  as: "raw",
});

export function loadTenglvCardData(): TenglvCardData {
  const raw = cardModules["/content/cards/wuhan-tenglv-card/items.yaml"];

  if (typeof raw !== "string") {
    throw new Error("未找到腾旅卡数据");
  }

  const parsed = yaml.load(raw) as TenglvCardData | undefined;

  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error("腾旅卡数据格式错误");
  }

  return parsed;
}
