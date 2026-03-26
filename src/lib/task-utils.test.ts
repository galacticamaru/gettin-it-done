import { expect, test, describe } from "bun:test";
import { getTaskEmoji } from "./task-utils";

describe("getTaskEmoji", () => {
  test("should return 💊 for medication or medicine", () => {
    expect(getTaskEmoji("Take my medication")).toBe("💊");
    expect(getTaskEmoji("buy medicine")).toBe("💊");
  });

  test("should return 💪 for exercise or workout", () => {
    expect(getTaskEmoji("Morning exercise")).toBe("💪");
    expect(getTaskEmoji("Gym workout")).toBe("💪");
  });

  test("should return 📚 for book or read", () => {
    expect(getTaskEmoji("Read a book")).toBe("📚");
    expect(getTaskEmoji("Finish reading chapter 5")).toBe("📚");
  });

  test("should return 🛒 for shop or buy", () => {
    expect(getTaskEmoji("Go shopping")).toBe("🛒");
    expect(getTaskEmoji("buy groceries")).toBe("🛒");
  });

  test("should return 📞 for call or phone", () => {
    expect(getTaskEmoji("Call mom")).toBe("📞");
    expect(getTaskEmoji("phone interview")).toBe("📞");
  });

  test("should return 📧 for email or mail", () => {
    expect(getTaskEmoji("Send email")).toBe("📧");
    expect(getTaskEmoji("check mail")).toBe("📧");
  });

  test("should return 🧹 for clean", () => {
    expect(getTaskEmoji("Clean the house")).toBe("🧹");
  });

  test("should return 🍳 for cook or food", () => {
    expect(getTaskEmoji("Cook dinner")).toBe("🍳");
    expect(getTaskEmoji("prepare food")).toBe("🍳");
  });

  test("should return 📝 for other tasks", () => {
    expect(getTaskEmoji("Do something else")).toBe("📝");
    expect(getTaskEmoji("Coding")).toBe("📝");
  });
});
