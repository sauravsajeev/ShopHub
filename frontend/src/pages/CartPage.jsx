"use client"

import { useEffect, useState } from "react"
import { cart, items } from "../api"
import { useNavigate } from "react-router-dom"

export default function CartPage() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const nav = useNavigate()
  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const res = await cart.get()
        const remote = res.data
        console.log("[v0] Cart API response:", remote) // Debug log

        const cartItemsData = remote?.items || []
        if (!Array.isArray(cartItemsData)) {
          console.error("[v0] Cart items is not an array:", cartItemsData)
          setCartItems([])
          return
        }

        console.log("[v0] Cart items data:", cartItemsData) // Debug log
        const productPromises = cartItemsData.map((r) => {
          let itemId = r.itemId

          // Handle different ObjectId formats
          if (typeof itemId === "object" && itemId !== null) {
            if (itemId._id) {
              itemId = itemId._id.toString()
            } else if (itemId.$oid) {
              itemId = itemId.$oid
            } else if (typeof itemId.toString === "function") {
              itemId = itemId.toString()
            } else if (typeof itemId.toHexString === "function") {
              itemId = itemId.toHexString()
            } else {
              console.error("[v0] Unknown ObjectId format:", itemId)
              itemId = String(itemId)
            }
          }

          console.log("[v0] Processing item ID:", itemId, "from:", r.itemId, "type:", typeof r.itemId) // Debug log
          return items.get(itemId).then((p) => ({ item: p.data, qty: r.qty }))
        })
        const products = await Promise.all(productPromises)
        setCartItems(products)
      } else {
        const local = JSON.parse(localStorage.getItem("local_cart") || "{}")
        const keys = Object.keys(local)
        const products = await Promise.all(keys.map((k) => items.get(k).then((p) => ({ item: p.data, qty: local[k] }))))
        setCartItems(products)
      }
    } catch (error) {
      console.error("Error loading cart:", error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(itemId, newQty) {
    if (newQty < 1) return

    setUpdating((prev) => ({ ...prev, [itemId]: true }))

    try {
      const token = localStorage.getItem("token")
      if (token) {
        await cart.update(itemId, newQty)
      } else {
        const local = JSON.parse(localStorage.getItem("local_cart") || "{}")
        local[itemId] = newQty
        localStorage.setItem("local_cart", JSON.stringify(local))
      }
      await load()
    } catch (error) {
      console.error("Error updating quantity:", error)
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  async function removeItem(itemId) {
    setUpdating((prev) => ({ ...prev, [itemId]: true }))

    try {
      const token = localStorage.getItem("token")
      if (token) {
        await cart.remove(itemId)
      } else {
        const local = JSON.parse(localStorage.getItem("local_cart") || "{}")
        delete local[itemId]
        localStorage.setItem("local_cart", JSON.stringify(local))
      }
      await load()
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const subtotal = cartItems.reduce((sum, ci) => sum + ci.item.price * ci.qty, 0)
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={`skeleton-${i}`} className="bg-card rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <nav className="text-sm text-muted-foreground mb-2 overflow-x-auto whitespace-nowrap">
            <span>Home</span> <span className="mx-2">/</span> <span className="text-foreground">Shopping Cart</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-muted rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Add some products to get started</p>
            <button
              onClick={() => nav("/")}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors min-h-[44px] text-base sm:text-sm"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((ci) => (
                <div
                  key={`cart-item-${ci.item._id}`}
                  className="bg-card rounded-lg p-4 sm:p-6 border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={ci.item.imageUrl || "/placeholder.svg?height=96&width=96&query=product"}
                        alt={ci.item.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-border"
                      />
                    </div>

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="font-semibold text-foreground text-base sm:text-lg mb-1 truncate">
                        {ci.item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{ci.item.description}</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground flex-wrap">
                        <span className="bg-muted px-2 py-1 rounded text-xs">{ci.item.category}</span>
                        {ci.item.brand && <span className="bg-muted px-2 py-1 rounded text-xs">{ci.item.brand}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                      <div className="text-center sm:text-right">
                        <div className="text-lg sm:text-lg font-bold text-foreground">
                          ₹{(ci.item.price * ci.qty).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">₹{ci.item.price.toLocaleString()} each</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(ci.item._id, ci.qty - 1)}
                          disabled={ci.qty <= 1 || updating[ci.item._id]}
                          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>

                        <span className="w-12 text-center font-medium text-foreground text-base sm:text-sm">
                          {updating[ci.item._id] ? "..." : ci.qty}
                        </span>

                        <button
                          onClick={() => updateQuantity(ci.item._id, ci.qty + 1)}
                          disabled={updating[ci.item._id]}
                          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(ci.item._id)}
                        disabled={updating[ci.item._id]}
                        className="text-destructive hover:text-destructive/80 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-1"
                      >
                        {updating[ci.item._id] ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="bg-card rounded-lg p-4 sm:p-6 border border-border sticky top-4">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-foreground">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-accent font-medium" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Add ₹{(500 - subtotal).toLocaleString()} more for free shipping
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button  onClick= {() => {alert("Thanks for buying")}}className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors mb-3 min-h-[44px] text-base sm:text-sm">
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => nav("/")}
                  className="w-full border border-border text-foreground py-3 rounded-lg font-medium hover:bg-muted transition-colors min-h-[44px] text-base sm:text-sm"
                >
                  Continue Shopping
                </button>

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
