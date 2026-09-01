import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "@/context/CartContext";

function TestCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, openCart, closeCart } = useCart();
  return (
    <div>
      <span data-testid="count">{totalItems}</span>
      <span data-testid="price">{totalPrice}</span>
      <span data-testid="open">{isCartOpen ? "open" : "closed"}</span>
      <button onClick={() => addItem({ id: 1, name: "Chair", color: "Blue", size: "L", price: 500, mrp: 500, retailerPrice: 0, dealerPrice: 0, distributorPrice: 0, bulkPrice: 0, imageUrl: "/img.jpg" })}>Add Chair</button>
      <button onClick={() => addItem({ id: 2, name: "Table", color: "Red", size: "M", price: 800, mrp: 800, retailerPrice: 0, dealerPrice: 0, distributorPrice: 0, bulkPrice: 0, imageUrl: "/table.jpg" })}>Add Table</button>
      <button onClick={() => removeItem(1)}>Remove Chair</button>
      <button onClick={() => updateQuantity(2, 3)}>Update Table Qty</button>
      <button onClick={clearCart}>Clear</button>
      <button onClick={openCart}>Open Cart</button>
      <button onClick={closeCart}>Close Cart</button>
      {items.map((i) => <span key={i.id} data-testid={`item-${i.id}`}>{i.name} x{i.quantity}</span>)}
    </div>
  );
}

function renderCart() {
  return render(<CartProvider><TestCart /></CartProvider>);
}

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty cart", () => {
    renderCart();
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("price").textContent).toBe("0");
  });

  it("adds items", async () => {
    renderCart();
    await userEvent.click(screen.getByText("Add Chair"));
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("item-1").textContent).toContain("Chair x1");
  });

  it("increments quantity for existing item", async () => {
    renderCart();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Add Chair"));
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("item-1").textContent).toContain("x2");
  });

  it("calculates total price", async () => {
    renderCart();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Add Table"));
    expect(screen.getByTestId("price").textContent).toBe("1274");
  });

  it("removes items", async () => {
    renderCart();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Remove Chair"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("updates quantity", async () => {
    renderCart();
    await userEvent.click(screen.getByText("Add Table"));
    await userEvent.click(screen.getByText("Update Table Qty"));
    expect(screen.getByTestId("item-2").textContent).toContain("x3");
  });

  it("clears cart", async () => {
    renderCart();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Add Table"));
    await userEvent.click(screen.getByText("Clear"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("toggles cart open/close", async () => {
    renderCart();
    expect(screen.getByTestId("open").textContent).toBe("closed");
    await userEvent.click(screen.getByText("Open Cart"));
    expect(screen.getByTestId("open").textContent).toBe("open");
    await userEvent.click(screen.getByText("Close Cart"));
    expect(screen.getByTestId("open").textContent).toBe("closed");
  });

  it("throws when used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(React.createElement(TestCart))).toThrow("useCart must be used within a CartProvider");
    spy.mockRestore();
  });
});
