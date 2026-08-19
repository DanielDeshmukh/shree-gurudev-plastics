import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

function TestLanguage() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="text">{t("Hello", "नमस्ते")}</span>
      <button onClick={() => setLanguage("hi")}>Switch Hindi</button>
      <button onClick={() => setLanguage("en")}>Switch English</button>
    </div>
  );
}

function renderLang() {
  return render(<LanguageProvider><TestLanguage /></LanguageProvider>);
}

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to English", () => {
    renderLang();
    expect(screen.getByTestId("lang").textContent).toBe("en");
    expect(screen.getByTestId("text").textContent).toBe("Hello");
  });

  it("switches to Hindi", async () => {
    renderLang();
    await userEvent.click(screen.getByText("Switch Hindi"));
    expect(screen.getByTestId("lang").textContent).toBe("hi");
    expect(screen.getByTestId("text").textContent).toBe("नमस्ते");
  });

  it("switches back to English", async () => {
    renderLang();
    await userEvent.click(screen.getByText("Switch Hindi"));
    await userEvent.click(screen.getByText("Switch English"));
    expect(screen.getByTestId("lang").textContent).toBe("en");
  });

  it("persists to localStorage", async () => {
    renderLang();
    await userEvent.click(screen.getByText("Switch Hindi"));
    expect(localStorage.getItem("language")).toBe("hi");
  });

  it("throws when used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(React.createElement(TestLanguage))).toThrow("useLanguage must be used within a LanguageProvider");
    spy.mockRestore();
  });
});
