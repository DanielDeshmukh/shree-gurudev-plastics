import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WishlistProvider, useWishlist } from "@/context/WishlistContext";

const product1 = { id: 1, name: "Chair", imageUrl: "/img.jpg", price: 500, color: "Blue", size: "L" };
const product2 = { id: 2, name: "Table", imageUrl: "/table.jpg", price: 800, color: "Red", size: "M" };

function TestWishlist() {
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, clearWishlist } = useWishlist();
  return (
    <div>
      <span data-testid="count">{wishlist.length}</span>
      <span data-testid="has1">{isInWishlist(1) ? "yes" : "no"}</span>
      <button onClick={() => addToWishlist(product1)}>Add Chair</button>
      <button onClick={() => removeFromWishlist(1)}>Remove Chair</button>
      <button onClick={() => toggleWishlist(product1)}>Toggle Chair</button>
      <button onClick={() => toggleWishlist(product2)}>Toggle Table</button>
      <button onClick={clearWishlist}>Clear</button>
      {wishlist.map((p) => <span key={p.id} data-testid={`p-${p.id}`}>{p.name}</span>)}
    </div>
  );
}

function renderWishlist() {
  return render(<WishlistProvider><TestWishlist /></WishlistProvider>);
}

describe("WishlistContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    renderWishlist();
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("has1").textContent).toBe("no");
  });

  it("adds to wishlist", async () => {
    renderWishlist();
    await userEvent.click(screen.getByText("Add Chair"));
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("has1").textContent).toBe("yes");
  });

  it("does not duplicate items", async () => {
    renderWishlist();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Add Chair"));
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("removes from wishlist", async () => {
    renderWishlist();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Remove Chair"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("toggles wishlist", async () => {
    renderWishlist();
    await userEvent.click(screen.getByText("Toggle Chair"));
    expect(screen.getByTestId("count").textContent).toBe("1");
    await userEvent.click(screen.getByText("Toggle Chair"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("clears wishlist", async () => {
    renderWishlist();
    await userEvent.click(screen.getByText("Add Chair"));
    await userEvent.click(screen.getByText("Toggle Table"));
    await userEvent.click(screen.getByText("Clear"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("persists to localStorage", async () => {
    renderWishlist();
    await userEvent.click(screen.getByText("Add Chair"));
    const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Chair");
  });

  it("throws when used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(React.createElement(TestWishlist))).toThrow("useWishlist must be used within a WishlistProvider");
    spy.mockRestore();
  });
});
