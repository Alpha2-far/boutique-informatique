import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppWidget from './components/WhatsAppWidget'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Categorie from './pages/Categorie'
import AdminLayout from './admin/AdminLayout'
import Login from './admin/Login'
import Categories from './admin/Categories'
import Products from './admin/Products'
import ProductForm from './admin/ProductForm'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget />
    </div>
  )
}

function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Dashboard</h1>
      <p className="text-text-muted">Bienvenue dans l'espace d'administration GQ-Store.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Link
          to="/admin/produits"
          className="bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary-700 transition-all duration-200 group"
        >
          <p className="text-sm text-text-muted">Navigation rapide</p>
          <p className="text-lg font-bold text-text-primary mt-1 group-hover:text-primary-700">Produits →</p>
        </Link>
        <Link
          to="/admin/categories"
          className="bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary-700 transition-all duration-200 group"
        >
          <p className="text-sm text-text-muted">Navigation rapide</p>
          <p className="text-lg font-bold text-text-primary mt-1 group-hover:text-primary-700">Catégories →</p>
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/boutique" element={<PublicLayout><Shop /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/produit/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/panier" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/favoris" element={<PublicLayout><Wishlist /></PublicLayout>} />
      <Route path="/categorie/:slug" element={<PublicLayout><Categorie /></PublicLayout>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="categories" element={<Categories />} />
        <Route path="produits" element={<Products />} />
        <Route path="produits/nouveau" element={<ProductForm />} />
        <Route path="produits/:id/modifier" element={<ProductForm />} />
      </Route>
    </Routes>
  )
}
