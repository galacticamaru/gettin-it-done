import { expect, test, describe } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  test("should merge basic classes", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  test("should handle undefined and null values", () => {
    expect(cn("class1", undefined, "class2", null)).toBe("class1 class2");
  });

  test("should handle conditional classes", () => {
    expect(cn("class1", true && "class2", false && "class3")).toBe("class1 class2");
  });

  test("should merge tailwind classes and resolve conflicts", () => {
    expect(cn("p-4 text-red-500", "p-8")).toBe("text-red-500 p-8");
  });

  test("should handle arrays of classes", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  test("should handle objects", () => {
    expect(cn({ "class1": true, "class2": false, "class3": true })).toBe("class1 class3");
  });

  test("should handle complex mixed inputs", () => {
    expect(cn(
      "base-class",
      ["array-class", { "obj-class-true": true, "obj-class-false": false }],
      "text-sm p-2",
      "p-4"
    )).toBe("base-class array-class obj-class-true text-sm p-4");
  });
});
