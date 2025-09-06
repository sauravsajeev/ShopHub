"use client"

import { useEffect, useState, useCallback } from "react"
import { items, cart, auth } from "../api"
import { setAuth } from "../api"
import AdminItemForm from "../components/AdminItemForm"
import ProductDetail from "../components/ProductDetail"
import Notification from "../components/Notification"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [itemsList, setItemsList] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [availableFilters, setAvailableFilters] = useState({ categories: [], brands: [] })
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [showNotif, setShowNotif] = useState(false)
  const [message, setMessage] = useState("")
  const nav = useNavigate()
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    min_price: "",
    max_price: "",
    category: "",
    brand: "",
    min_rating: "",
    q: "",
    sort_by: "createdAt",
    sort_order: "desc",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")

    const userData = localStorage.getItem("user") ? localStorage.getItem("user") : sessionStorage.getItem("user")

    if (token && userData) {
      setAuth(token)
      setUser(JSON.parse(userData))
      checkAdminStatus()
    }
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await auth.checkAdmin()
      setIsAdmin(response.data.isAdmin)
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "" && value !== null),
      )

      const res = await items.list(cleanFilters)
      setItemsList(res.data.items || res.data)
      setPagination(res.data.pagination || {})
    } catch (error) {
      console.error("Error fetching items:", error)
      setItemsList([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadFilterOptions = useCallback(async () => {
    try {
      const res = await items.getFilters()
      setAvailableFilters(res.data)
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    loadFilterOptions()
  }, [loadFilterOptions])

  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await cart.add(item._id, 1)
        setMessage("Added to cart")
        setShowNotif(!showNotif)
        // alert("Added to cart successfully!")
      } else {
        const localCart = JSON.parse(localStorage.getItem("local_cart") || "{}")
        localCart[item._id] = (localCart[item._id] || 0) + 1
        localStorage.setItem("local_cart", JSON.stringify(localCart))
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.logout()
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.removeItem("token")
      setAuth(null)
      setUser(null)
      setIsAdmin(false)
      setMessage("Logged Out")
      setShowNotif(!showNotif)
      // alert("Logged out successfully!")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleItemCreated = (newItem) => {
    setItemsList((prev) => [newItem, ...prev])
    loadFilterOptions()
    alert("Product created successfully!")
  }

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      min_price: "",
      max_price: "",
      category: "",
      brand: "",
      min_rating: "",
      q: "",
      sort_by: "createdAt",
      sort_order: "desc",
    })
  }
  const handleProductClick = (productId) => {
    setSelectedProductId(productId)
    setShowProductModal(true)
  }

  const handleCloseProductModal = () => {
    setShowProductModal(false)
    setSelectedProductId(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <h1 className="text-xl sm:text-2xl font-bold">ShopHub</h1>
                {isAdmin && (
                  <span className="px-2 py-1 bg-accent text-accent-foreground rounded-md text-xs sm:text-sm font-medium">
                    Admin
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:hidden">
                {user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => nav("/cart")}
                      className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm"
                    >
                      Cart
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <a
                      href="/login"
                      className="px-3 py-1.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm"
                    >
                      Login
                    </a>
                    <a
                      href="/signup"
                      className="px-3 py-1.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm"
                    >
                      Sign Up
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full sm:flex-1 sm:max-w-md sm:mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.q}
                  onChange={(e) => updateFilter("q", e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm">Welcome, {user.name}</span>
                  <button
                    onClick={() => nav("/cart")}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    Cart
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <a
                    href="/login"
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container bg-white mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <aside
            className={`${
              showFilters
                ? "fixed  inset-0 z-40 bg-white backdrop-blur-sm  lg:relative lg:backdrop-blur-none "
                : "hidden"
            } lg:block lg:w-80 lg:sticky lg:top-24 lg:h-fit`}
          >
            <div
              className={`${
                showFilters ? "fixed top-100 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-lg shadow-lg overflow-y-auto"
        : ""
    } lg:bg-white lg:rounded-lg lg:shadow-sm lg:relative lg:top-auto lg:left-auto lg:right-auto lg:bottom-auto p-4 sm:p-6`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg font-semibold text-card-foreground">Filters</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear All
                  </button>
                  <button onClick={() => setShowFilters(false)} className="lg:hidden p-1 hover:bg-muted rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-medium text-card-foreground mb-3">Price Range</h3>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.min_price}
                      onChange={(e) => updateFilter("min_price", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.max_price}
                      onChange={(e) => updateFilter("max_price", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-card-foreground mb-3">Category</h3>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">All Categories</option>
                    {availableFilters.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-medium text-card-foreground mb-3">Brand</h3>
                  <select
                    value={filters.brand}
                    onChange={(e) => updateFilter("brand", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">All Brands</option>
                    {availableFilters.brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-medium text-card-foreground mb-3">Minimum Rating</h3>
                  <select
                    value={filters.min_rating}
                    onChange={(e) => updateFilter("min_rating", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-medium text-card-foreground mb-3">Sort By</h3>
                  <select
                    value={`${filters.sort_by}-${filters.sort_order}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split("-")
                      setFilters((prev) => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }))
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="title-asc">Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 h-[calc(100vh-200px)] overflow-y-auto">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </button>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  {pagination.total ? `${pagination.total} Products` : "Products"}
                </h2>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowAdminForm(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm sm:text-base"
                >
                  Add Product
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground text-sm sm:text-base">Loading products...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {itemsList.map((item) => (
                    <div
                      key={item._id}
                      className="bg-card rounded-lg shadow-sm border border-border hover:shadow-md hover:border-primary/50 transition-all duration-200 overflow-hidden group cursor-pointer"
                      onClick={() => handleProductClick(item._id)}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={
                            item.imageUrl ||
                            `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(item.title) || "/placeholder.svg"}`
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      <div className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-card-foreground line-clamp-2 text-balance text-sm sm:text-base pr-2">
                            {item.title}
                          </h3>
                          {item.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{item.rating}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <span className="text-base sm:text-lg font-bold text-primary">
                              ₹{item.price.toLocaleString()}
                            </span>
                            {item.brand && <span className="text-xs text-muted-foreground truncate">{item.brand}</span>}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              user ? addToCart(item) : nav("/login")
                            }}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring text-xs sm:text-sm flex-shrink-0"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {itemsList.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                        />
                      </svg>
                      <p className="text-base sm:text-lg">No products found</p>
                      <p className="text-sm">Try adjusting your filters or search terms</p>
                    </div>
                  </div>
                )}

                {/* {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
                    <button
                      onClick={() => updateFilter("page", Math.max(1, filters.page - 1))}
                      disabled={filters.page <= 1}
                      className="px-2 sm:px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Prev
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => updateFilter("page", page)}
                            className={`px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm ${
                              filters.page === page
                                ? "bg-primary text-primary-foreground"
                                : "border border-border hover:bg-muted"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => updateFilter("page", Math.min(pagination.pages, filters.page + 1))}
                      disabled={filters.page >= pagination.pages}
                      className="px-2 sm:px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Next
                    </button>
                  </div>
                )} */}
              </>
            )}
          </main>
        </div>
      </div>

      <AdminItemForm isOpen={showAdminForm} onClose={() => setShowAdminForm(false)} onItemCreated={handleItemCreated} />
      <ProductDetail
        isOpen={showProductModal}
        onClose={handleCloseProductModal}
        productId={selectedProductId}
        onAddToCart={addToCart}
      />
      {showNotif && <Notification type="success" message={message} onClose={() => setShowNotif(false)} />}
    </div>
  )
}
