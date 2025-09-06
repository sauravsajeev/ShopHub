import { useState, useEffect, useCallback } from "react"
import { items, cart } from "../api"
import Notification from "../components/Notification"

export default function ProductDetail({ isOpen, onClose, productId }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [showNotif, setShowNotif] = useState(false)
  const [message, setMessage] = useState("")

  const fetchProductDetails = useCallback(async () => {
    setLoading(true)
    try {
      const response = await items.get(productId)
      setProduct(response.data)
    } catch (error) {
      console.error("Error fetching product details:", error)
      // setMessage("Added to cart")
      // setShowNotif(!showNotif)
      // alert("Failed to load product details");
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails()
    }
  }, [isOpen, productId, fetchProductDetails])

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await cart.add(product._id, quantity)
        setMessage(`Added ${quantity} item(s) to cart !`)
        setShowNotif(!showNotif)
        // alert(`Added ${quantity} item(s) to cart successfully!`)
      } else {
        const localCart = JSON.parse(localStorage.getItem("local_cart") || "{}")
        localCart[product._id] = (localCart[product._id] || 0) + quantity
        localStorage.setItem("local_cart", JSON.stringify(localCart))
        setMessage(`Added ${quantity} item(s) to local cart (will sync on login)`)
        setShowNotif(!showNotif)
        // alert(`Added ${quantity} item(s) to local cart (will sync on login)`)
      }
      onClose()
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add item to cart")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full h-full sm:max-w-4xl sm:w-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading product details...</span>
            </div>
          ) : product ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Product Image */}
              <div className="aspect-square overflow-hidden rounded-lg bg-muted order-1">
                <img
                  src={
                    product.imageUrl ||
                    `/placeholder.svg?height=500&width=500&query=${encodeURIComponent(product.title) || "/placeholder.svg"}`
                  }
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-4 sm:space-y-6 order-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground text-balance mb-2">
                    {product.title}
                  </h1>
                  {product.brand && <p className="text-base sm:text-lg text-muted-foreground">by {product.brand}</p>}
                </div>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400" : "fill-gray-200"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-base sm:text-lg font-medium">{product.rating}</span>
                    <span className="text-sm sm:text-base text-muted-foreground">({product.rating} stars)</span>
                  </div>
                )}

                {/* Price */}
                <div className="text-3xl sm:text-4xl font-bold text-primary">₹{product.price.toLocaleString()}</div>

                {/* Category and Stock */}
                <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
                  {product.category && (
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full">{product.category}</span>
                  )}
                  {product.stock !== undefined && (
                    <span
                      className={`px-3 py-1 rounded-full ${
                        product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Description</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-accent text-accent-foreground rounded-md text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <label htmlFor="quantity" className="font-medium text-base sm:text-sm">
                      Quantity:
                    </label>
                    <div className="flex items-center border border-border rounded-lg w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 sm:px-3 sm:py-2 hover:bg-muted transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        max={product.stock || 999}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-3 sm:py-2 text-center border-0 bg-transparent focus:outline-none text-base sm:text-sm"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                        className="px-4 py-3 sm:px-3 sm:py-2 hover:bg-muted transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto"
                        disabled={quantity >= (product.stock || 999)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px] text-base sm:text-sm"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={()=> {alert("Thanks fro buying")}}
                      disabled={product.stock === 0}
                      className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px] text-base sm:text-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load product details</p>
            </div>
          )}
        </div>
      </div>
      {showNotif && <Notification type="success" message={message} onClose={() => setShowNotif(false)} />}
    </div>
  )
}
