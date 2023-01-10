import { JsonKeyValue } from "../../../catalogIngestor/types";

import { isJSONMetadata } from "./helpers";

describe(isJSONMetadata, () => {
  it('should return true only if key is "metadata"', () => {
    const jsonMetadata: JsonKeyValue = {
      key: "json",
      value: {},
    };

    expect(isJSONMetadata(jsonMetadata, "not-metadata")).toBe(false);
    expect(isJSONMetadata(jsonMetadata, "metadata")).toBe(true);
  });

  it("should return false if the value is falsy", () => {
    expect(isJSONMetadata(undefined as any, "metadata")).toBe(false);
  });

  it("should return false if the value is not a object", () => {
    expect(isJSONMetadata(true as any, "metadata")).toBe(false);
  });

  it("should return false if the value does not have 'key' or 'value' keys", () => {
    expect(isJSONMetadata({} as any, "metadata")).toBe(false);
    expect(isJSONMetadata({ key: "only-key" } as any, "metadata")).toBe(false);
    expect(isJSONMetadata({ value: "only-value" } as any, "metadata")).toBe(
      false
    );
    expect(
      isJSONMetadata({ key: "both", value: ["both", true] } as any, "metadata")
    ).toBe(true);
  });

  describe("when the KeyValue value has a specific type", () => {
    function checkWithValue(value: any) {
      return isJSONMetadata(
        {
          key: "json",
          value,
        },
        "metadata"
      );
    }

    it("should return FALSE when string", () => {
      expect(checkWithValue("string")).toBe(false);
    });

    it("should return FALSE when array of strings", () => {
      expect(checkWithValue(["string", "string2"])).toBe(false);
    });

    it("should return FALSE when null", () => {
      expect(checkWithValue(null)).toBe(false);
    });

    it("should return TRUE when boolean", () => {
      expect(checkWithValue(true)).toBe(true);
    });

    it("should return TRUE when object", () => {
      expect(checkWithValue({})).toBe(true);
    });

    it("should return TRUE when array, without only strings", () => {
      expect(checkWithValue(["string", 10, false])).toBe(true);
    });
  });
});
