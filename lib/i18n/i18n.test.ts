import { describe, it, expect, beforeEach } from "vitest";
import { t, getLang, setLang, LANG_KEY } from "./index";

describe("i18n — 09", () => {
  beforeEach(() => localStorage.clear());

  it("t returns correct translation", () => {
    expect(t("id", "workout")).toBe("Latihan");
    expect(t("en", "workout")).toBe("Workout");
    expect(t("id", "unknownKey")).toBe("unknownKey");
  });

  it("getLang defaults to id", () => {
    expect(getLang()).toBe("id");
  });

  it("setLang persists", () => {
    setLang("en");
    expect(localStorage.getItem(LANG_KEY)).toBe("en");
    expect(getLang()).toBe("en");
    setLang("id");
    expect(getLang()).toBe("id");
  });
});
