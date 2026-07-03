#!/usr/bin/env node

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const cardPath = path.join("content", "cards", "wuhan-tenglv-card", "items.yaml");
const allowedSections = new Set(["年卡权益", "增值福利"]);
const allowedEnvironments = new Set(["indoor", "outdoor", "mixed", "unknown"]);
const allowedClassificationStatuses = new Set([
  "inferred",
  "unknown",
  "confirmed",
]);
const allowedUsageText = new Set(["不限", "待确认", "共享6次"]);

const errors = [];

function addError(message) {
  errors.push(message);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateUsageLimit(item, label) {
  if (typeof item.usageLimit === "number") {
    if (!Number.isInteger(item.usageLimit) || item.usageLimit <= 0) {
      addError(`${label}: usageLimit must be a positive integer when numeric`);
    }
    if (item.visitCount > item.usageLimit) {
      addError(`${label}: visitCount cannot exceed numeric usageLimit`);
    }
    return;
  }

  if (!allowedUsageText.has(item.usageLimit)) {
    addError(`${label}: usageLimit must be a number, 不限, 待确认, or 共享6次`);
  }
}

function validateItem(item, index, seenIds) {
  const label = `items[${index}]${isNonEmptyString(item?.id) ? ` (${item.id})` : ""}`;

  if (!isPlainObject(item)) {
    addError(`${label}: item must be an object`);
    return;
  }

  for (const key of ["id", "name", "region", "section", "benefitText", "environment", "classificationStatus"]) {
    if (!isNonEmptyString(item[key])) {
      addError(`${label}: missing required string field ${key}`);
    }
  }

  if (isNonEmptyString(item.id)) {
    if (!/^[a-z0-9-]+$/.test(item.id)) {
      addError(`${label}: id must use lowercase letters, numbers, and hyphens only`);
    }
    if (seenIds.has(item.id)) {
      addError(`${label}: duplicate id`);
    }
    seenIds.add(item.id);
  }

  if (item.marketPrice !== null && typeof item.marketPrice !== "number") {
    addError(`${label}: marketPrice must be a number or null`);
  }

  if (item.rating !== null && typeof item.rating !== "string") {
    addError(`${label}: rating must be a string or null`);
  }

  if (
    item.websiteUrl !== undefined &&
    item.websiteUrl !== null &&
    (!isNonEmptyString(item.websiteUrl) || !/^https?:\/\//.test(item.websiteUrl))
  ) {
    addError(`${label}: websiteUrl must be an http(s) URL or null`);
  }

  if (!Number.isInteger(item.visitCount) || item.visitCount < 0) {
    addError(`${label}: visitCount must be a non-negative integer`);
  }

  if (!allowedSections.has(item.section)) {
    addError(`${label}: invalid section`);
  }

  if (!allowedEnvironments.has(item.environment)) {
    addError(`${label}: invalid environment`);
  }

  if (!allowedClassificationStatuses.has(item.classificationStatus)) {
    addError(`${label}: invalid classificationStatus`);
  }

  if (item.environment === "unknown" && item.classificationStatus === "confirmed") {
    addError(`${label}: unknown environment cannot be marked confirmed`);
  }

  if (!Array.isArray(item.tags) || item.tags.some((tag) => !isNonEmptyString(tag))) {
    addError(`${label}: tags must be an array of non-empty strings`);
  }

  validateUsageLimit(item, label);
}

function main() {
  if (!fs.existsSync(cardPath)) {
    addError(`Missing card data file: ${cardPath}`);
  }

  const raw = fs.existsSync(cardPath) ? fs.readFileSync(cardPath, "utf8") : "";
  const data = raw ? yaml.load(raw) : null;

  if (!isPlainObject(data)) {
    addError("Card data must be a YAML object");
  } else {
    for (const key of ["cardId", "name", "sourceDate"]) {
      if (!isNonEmptyString(data[key])) {
        addError(`Missing required card field ${key}`);
      }
    }

    if (data.cardId !== "wuhan-tenglv-card") {
      addError("cardId must be wuhan-tenglv-card");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.sourceDate))) {
      addError("sourceDate must use YYYY-MM-DD format");
    }

    if (
      data.miniProgramShortLink !== undefined &&
      data.miniProgramShortLink !== null &&
      !isNonEmptyString(data.miniProgramShortLink)
    ) {
      addError("miniProgramShortLink must be a string or null");
    }

    if (
      data.miniProgramUrlLink !== undefined &&
      data.miniProgramUrlLink !== null &&
      (!isNonEmptyString(data.miniProgramUrlLink) ||
        !/^https?:\/\//.test(data.miniProgramUrlLink))
    ) {
      addError("miniProgramUrlLink must be an http(s) URL or null");
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      addError("items must be a non-empty array");
    } else {
      const seenIds = new Set();
      data.items.forEach((item, index) => validateItem(item, index, seenIds));
    }
  }

  if (errors.length > 0) {
    console.error("Card data validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Card data validation passed: ${data.items.length} items`);
}

main();
