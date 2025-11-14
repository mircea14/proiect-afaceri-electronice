// client/src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { getCart, removeCartItem, checkoutCart } from "../api/cart.routes";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCart = async () => {
    setLoading(true);
    const res = await getCart();

    if (res?.success) {
      setCart(res.data);
    } else {
      toast.error(res?.message || "Could not load cart");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (itemId) => {
    setRemovingId(itemId);
    const res = await removeCartItem(itemId);

    if (res?.success) {
      toast.success("Item removed from cart");
      setCart(res.data);
    } else {
      toast.error(res?.message || "Could not remove item");
    }

    setRemovingId(null);
  };

  const handleCheckout = async () => {
    if (!cart?.items?.length) return;

    setSubmitting(true);
    const res = await checkoutCart();

    if (res?.success) {
      toast.success("Order sent successfully!");
      await loadCart();
    } else {
      toast.error(res?.message || "Could not send order");
    }

    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner />;

  const hasItems = cart?.items && cart.items.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Cart</h1>
            <p className="mt-1 text-sm text-slate-400">
              Review your selected products before sending the order.
            </p>
          </div>

          {hasItems && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Empty state */}
        {!hasItems && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
            <p className="text-lg font-semibold text-slate-100">
              Your cart is empty
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Go back to the products page and start adding items to your cart.
            </p>
          </div>
        )}

        {/* Items list */}
        {hasItems && (
          <>
            <div className="space-y-4">
              {cart.items.map((item) => {
                const lineTotal = (item.quantity * item.price).toFixed(2);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-slate-100">
                        {item.product?.name}
                      </span>
                      <span className="mt-1 text-sm text-slate-400">
                        {item.quantity} × {item.price} lei
                      </span>
                      <span className="mt-1 text-sm font-medium text-slate-100">
                        Line total: {lineTotal} lei
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={removingId === item.id}
                      className="text-sm font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {removingId === item.id ? "Removing..." : "Delete"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer summary */}
            <div className="mt-8 flex flex-col items-end gap-4 border-t border-slate-800 pt-6">
              <p className="text-lg font-semibold text-slate-100">
                Total:{" "}
                <span className="font-bold">
                  {cart.total?.toFixed(2)} lei
                </span>
              </p>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting || !hasItems}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
