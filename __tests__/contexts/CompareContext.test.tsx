import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompareProvider, useCompare } from "@/context/CompareContext";

const mockItem1 = { id: 1, name: "Chair", color: "Blue", size: "L", price: 500, imageUrl: "/img.jpg", stock: 10, category: "chairs" };
const mockItem2 = { id: 2, name: "Table", color: "Red", size: "M", price: 800, imageUrl: "/table.jpg", stock: 5, category: "tables" };
const mockItem3 = { id: 3, name: "Stool", color: "Green", size: "S", price: 300, imageUrl: "/stool.jpg", stock: 8, category: "stools" };
const mockItem4 = { id: 4, name: "Cabinet", color: "White", size: "XL", price: 1500, imageUrl: "/cab.jpg", stock: 3, category: "storage" };
const mockItem5 = { id: 5, name: "Shelf", color: "Brown", size: "M", price: 900, imageUrl: "/shelf.jpg", stock: 2, category: "storage" };

let addCount = 0;
const allItems = [mockItem1, mockItem2, mockItem3, mockItem4, mockItem5];

function TestCompare() {
  const { items, toggleCompare, removeCompare, clearCompare, isComparing, compareCount } = useCompare();
  addCount = items.length;
  return (
    <div>
      <span data-testid="count">{compareCount}</span>
      <span data-testid="item1">{isComparing(1) ? "yes" : "no"}</span>
      <button onClick={() => toggleCompare(mockItem1)}>Add Chair</button>
      <button onClick={() => toggleCompare(mockItem2)}>Add Table</button>
      <button onClick={() => toggleCompare(mockItem1)}>Toggle Chair</button>
      <button onClick={() => removeCompare(1)}>Remove Chair</button>
      <button onClick={clearCompare}>Clear</button>
      {items.map((i) => <span key={i.id} data-testid={`item-${i.id}`}>{i.name}</span>)}
    </div>
  );
}

function renderCompare() {
  return render(<CompareProvider><TestCompare /></CompareProvider>);
}

describe("CompareContext", () => {
  it("starts empty", () => {
    renderCompare();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("adds items", async () => {
    renderCompare();
    await userEvent.click(screen.getByText("Add Chair"));
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("item1").textContent).toBe("yes");
  });

  it("toggles off existing item", async () => {
    renderCompare();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Toggle Chair"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("removes items", async () => {
    renderCompare();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Remove Chair"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("clears all", async () => {
    renderCompare();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Add Table"));
    await userEvent.click(screen.getByText("Clear"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("limits to 4 items", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const wrapper = ({ children }: { children: React.ReactNode }) => <CompareProvider>{children}</CompareProvider>;
    const { result } = renderHook(() => useCompare(), { wrapper });
    // Add 4 items
    for (let i = 0; i < 4; i++) {
      act(() => result.current.toggleCompare(allItems[i]));
    }
    expect(result.current.compareCount).toBe(4);
    // 5th should be blocked
    act(() => result.current.toggleCompare(allItems[4]));
    expect(result.current.compareCount).toBe(4);
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("throws when used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(React.createElement(TestCompare))).toThrow("useCompare must be used within a CompareProvider");
    spy.mockRestore();
  });
});
