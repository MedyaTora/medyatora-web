const fs = require("fs");

const path = "app/smmtora/page.tsx";
let code = fs.readFileSync(path, "utf8");

const importLine =
  'import { getLocalizedCategory as getSharedLocalizedCategory, getLocalizedGuarantee as getSharedLocalizedGuarantee, getLocalizedQualityDescription as getSharedLocalizedQualityDescription, getLocalizedSpeed as getSharedLocalizedSpeed } from "@/lib/localized-text";\n';

if (!code.includes("@/lib/localized-text")) {
  code = code.replace('"use client";\n\n', '"use client";\n\n' + importLine);
}

function replaceFunction(source, functionName, replacement) {
  const start = source.indexOf(`function ${functionName}`);
  if (start === -1) {
    throw new Error(`${functionName} bulunamadı.`);
  }

  const braceStart = source.indexOf("{", start);
  if (braceStart === -1) {
    throw new Error(`${functionName} açılış parantezi bulunamadı.`);
  }

  let depth = 0;
  let end = -1;

  for (let i = braceStart; i < source.length; i++) {
    const char = source[i];

    if (char === "{") depth++;
    if (char === "}") depth--;

    if (depth === 0) {
      end = i + 1;
      break;
    }
  }

  if (end === -1) {
    throw new Error(`${functionName} kapanış parantezi bulunamadı.`);
  }

  return source.slice(0, start) + replacement + source.slice(end);
}

code = replaceFunction(
  code,
  "getCategoryLabel",
`function getCategoryLabel(name: string, locale: Locale) {
  return getSharedLocalizedCategory(name, locale);
}`
);

code = replaceFunction(
  code,
  "getLocalizedGuaranteeLabel",
`function getLocalizedGuaranteeLabel(label: string, locale: Locale) {
  return getSharedLocalizedGuarantee(label, locale);
}`
);

code = replaceFunction(
  code,
  "getLocalizedSpeed",
`function getLocalizedSpeed(speed: string, locale: Locale) {
  return getSharedLocalizedSpeed(speed, locale);
}`
);

code = code.replace(
`{getLocalizedServiceDescription(
                  service.subtitle,
                  selectedLocale
                )}`,
`{getSharedLocalizedQualityDescription(service.level, selectedLocale) ||
                  getLocalizedServiceDescription(
                    service.subtitle,
                    selectedLocale
                  )}`
);

code = code.replace(
`{getLocalizedServiceDescription(
              selectedService.description,
              selectedLocale
            )}`,
`{getSharedLocalizedQualityDescription(
              selectedService.level,
              selectedLocale
            ) ||
              getLocalizedServiceDescription(
                selectedService.description,
                selectedLocale
              )}`
);

fs.writeFileSync(path, code, "utf8");

console.log("SMMTora kategori, garanti, hız ve kalite açıklaması helper'a bağlandı.");
