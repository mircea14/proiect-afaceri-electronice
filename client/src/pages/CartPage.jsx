import { useEffect, useState } from "react";
import { getCart, removeCartItem, checkoutCart } from "../api/cart.routes";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  async function loadCart() {
    setLoading(true);
    const res = await getCart();
    if (res?.success) setCart(res.data);
    else toast.error(res?.message || "Eroare la incarcarea cosului");
    setLoading(false);
  }

  async function handleRemove(itemId) {
    setRemoving(itemId);
    const res = await removeCartItem(itemId);
    if (res?.success) {
      toast.success("Produs eliminat");
      setCart(res.data);
    } else toast.error(res?.message);
    setRemoving(null);
  }

  async function handleCheckout() {
    const res = await checkoutCart();
    if (res?.success) {
      toast.success("Comanda plasata cu succes!");
      loadCart();
    } else toast.error(res?.message);
  }

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">My Cart</h2>

      {!cart?.items?.length ? (
        <p className="text-gray-500">My Cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × {item.price} lei
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removing === item.id}
                  className="text-red-600 hover:underline disabled:opacity-50"
                >
                  {removing === item.id ? "..." : "Delete"}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 border-t pt-4">
            <p className="text-xl font-bold">
              Total: {cart.total.toFixed(2)} lei
            </p>

            <button
              onClick={handleCheckout}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
