"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { useCart } from "@/context/CartContext";
import { formatPrice, toPersianDigits } from "@/lib/format";
import {
  ShoppingBag, Heart, Star, CheckCircle2, ShieldCheck, RefreshCw, Truck,
  Plus, Minus, MessageSquare, ArrowRight,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");

  const [reviewName, setReviewName] = useState("");
  const [reviewCity, setReviewCity] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) { router.push("/shop"); return; }
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          if (data.product.availableSizes?.length > 0) setSelectedSize(data.product.availableSizes[0]);
          if (data.product.availableColors?.length > 0) setSelectedColor(data.product.availableColors[0]);
        }
        if (data.reviews) setReviews(data.reviews);
        if (data.relatedProducts) setRelatedProducts(data.relatedProducts);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [slug, router]);

  const handleAddToCart = () => { if (product) addToCart(product, selectedSize, selectedColor, quantity); };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) { alert("لطفاً نام و متن دیدگاه را وارد کنید."); return; }
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: reviewName, authorCity: reviewCity, rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviews([data.review, ...reviews]);
        setReviewName(""); setReviewCity(""); setReviewComment("");
        alert("دیدگاه شما با موفقیت ثبت شد.");
      }
    } catch (err) { console.error(err); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-[#EBE4D8]">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#7A8E72] border-t-transparent rounded-full animate-spin" />
      </div>
      <Footer />
    </div>
  );

  if (!product) return null;

  const inWishlist = isInWishlist(product.slug);
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80"];

  return (
    <div className="min-h-screen flex flex-col bg-[#EBE4D8] text-[#3B3228]">
      <Header />
      <CartDrawer />
      <Toast />

      <main className="flex-1 w-full">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#EBE4D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-[11px] text-[#9CA3A0] flex items-center gap-1">
            <Link href="/" className="hover:text-[#6B4226]">صفحه اصلی</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-[#6B4226]">{product.category}</Link>
            <span>/</span>
            <span className="text-[#3B3228] font-bold truncate max-w-xs">{product.namePersian}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* MAIN PRODUCT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-5 sm:p-6 rounded-2xl shadow-xs">
            {/* IMAGE GALLERY */}
            <div className="lg:col-span-5 space-y-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F0E8] relative group">
                <img src={images[selectedImage]} alt={product.namePersian} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {product.originalPrice && (
                  <span className="absolute top-3 right-3 bg-[#6B4226] text-white font-bold text-[11px] px-2.5 py-1 rounded-lg">
                    {toPersianDigits(Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100))}٪
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                  {images.map((img: string, idx: number) => (
                    <button key={idx} onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${selectedImage === idx ? "border-[#6B4226]" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-[#9CA3A0] mb-1">
                  <span>{product.category}</span>
                  <div className="flex items-center gap-1 text-[#7A8E72]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-[#3B3228]">{toPersianDigits(product.rating)}</span>
                    <span className="text-[#9CA3A0]">({toPersianDigits(product.reviewCount)} نظر)</span>
                  </div>
                </div>

                <h1 className="text-lg sm:text-xl font-black text-[#3B3228] leading-snug">{product.namePersian}</h1>
                <p className="text-[11px] text-[#9CA3A0] mt-0.5">{product.nameEnglish}</p>

                {/* Price */}
                <div className="mt-4 flex items-center gap-3">
                  {product.originalPrice && <span className="text-sm text-[#9CA3A0] line-through">{formatPrice(product.originalPrice)}</span>}
                  <span className="text-2xl font-black text-[#6B4226]">{formatPrice(product.price)}</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mt-3">{product.shortDescription}</p>

                {/* Features */}
                {Array.isArray(product.features) && product.features.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {product.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-stone-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6B4226] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Size Selector */}
                {Array.isArray(product.availableSizes) && product.availableSizes.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-bold text-[#3B3228] block mb-1.5">سایز:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.availableSizes.map((sz: string, i: number) => (
                        <button key={i} onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedSize === sz ? "bg-[#3B3228] text-white" : "bg-[#EBE4D8] text-[#3B3228] hover:bg-[#EBE4D8]"}`}>
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector - only here on product page */}
                {Array.isArray(product.availableColors) && product.availableColors.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-bold text-[#3B3228] block mb-1.5">رنگ: <span className="font-normal text-[#9CA3A0]">{selectedColor?.name}</span></span>
                    <div className="flex flex-wrap gap-2">
                      {product.availableColors.map((col: any, i: number) => (
                        <button key={i} onClick={() => setSelectedColor(col)}
                          className={`w-7 h-7 rounded-full border-2 transition ${selectedColor?.name === col.name ? "border-[#3B3228] scale-110" : "border-stone-200 hover:scale-105"}`}
                          style={{ backgroundColor: col.hex }} title={col.name} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-[#3B3228]">تعداد:</span>
                  <div className="flex items-center bg-[#EBE4D8] rounded-lg overflow-hidden">
                    <button onClick={() => setQuantity(q => Math.min(10, q + 1))} className="p-2 hover:bg-[#EBE4D8] transition"><Plus className="w-3.5 h-3.5" /></button>
                    <span className="w-8 text-center text-xs font-black">{toPersianDigits(quantity)}</span>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:bg-[#EBE4D8] transition"><Minus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[#EBE4D8]">
                <button onClick={handleAddToCart}
                  className="flex-1 bg-[#3B3228] hover:bg-[#6B4226] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg text-sm">
                  <ShoppingBag className="w-4 h-4" /> افزودن به سبد خرید
                </button>
                <button onClick={() => toggleWishlist(product.slug)}
                  className={`p-3 rounded-xl border transition ${inWishlist ? "bg-red-50 text-[#6B4226] border-red-200" : "bg-[#EBE4D8] text-[#3B3228] border-[#EBE4D8] hover:bg-white"}`}>
                  <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-[#F5F0E8] p-2 rounded-lg"><ShieldCheck className="w-4 h-4 text-[#7A8E72] mx-auto mb-0.5" /><span className="font-bold block">ضمانت اصالت</span></div>
                <div className="bg-[#F5F0E8] p-2 rounded-lg"><RefreshCw className="w-4 h-4 text-[#7A8E72] mx-auto mb-0.5" /><span className="font-bold block">۷ روز بازگشت</span></div>
                <div className="bg-[#F5F0E8] p-2 rounded-lg"><Truck className="w-4 h-4 text-[#7A8E72] mx-auto mb-0.5" /><span className="font-bold block">ارسال فوری</span></div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-6 bg-white rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex gap-6 border-b border-[#EBE4D8] mb-5">
              {[
                { id: "desc", label: "معرفی محصول" },
                { id: "specs", label: "مشخصات فنی" },
                { id: "reviews", label: `نظرات (${toPersianDigits(reviews.length)})` },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === t.id ? "border-[#6B4226] text-[#6B4226]" : "border-transparent text-[#9CA3A0] hover:text-[#3B3228]"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "desc" && (
              <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-3 max-w-3xl">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-2xl">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="divide-y divide-[#EBE4D8] text-xs">
                    {Object.entries(product.specifications).map(([k, v], i) => (
                      <div key={i} className="grid grid-cols-3 py-2.5">
                        <span className="font-bold text-stone-500">{k}</span>
                        <span className="col-span-2 text-[#3B3228]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-stone-400">مشخصاتی درج نشده.</p>}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-stone-400 bg-[#F5F0E8] p-4 rounded-xl">اولین نفری باشید که نظر ثبت می‌کنید.</p>
                  ) : reviews.map((rev, i) => (
                    <div key={i} className="bg-[#F5F0E8] p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#3B3228]">{rev.authorName} <span className="font-normal text-[#9CA3A0]">({rev.authorCity})</span></span>
                        <div className="flex text-[#7A8E72]">{[...Array(rev.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}</div>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">«{rev.comment}»</p>
                      {rev.verifiedPurchase && <span className="flex items-center gap-1 text-[10px] text-[#6B4226] font-bold"><CheckCircle2 className="w-3 h-3" />خریدار تایید شده</span>}
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-5">
                  <form onSubmit={handlePostReview} className="bg-[#F5F0E8] p-4 rounded-xl space-y-3 sticky top-28">
                    <h4 className="font-bold text-[#3B3228] text-sm flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#7A8E72]" /> ثبت نظر جدید
                    </h4>
                    <input type="text" required value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder="نام شما"
                      className="w-full bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#7A8E72] focus:outline-none" />
                    <input type="text" value={reviewCity} onChange={e => setReviewCity(e.target.value)} placeholder="شهر (اختیاری)"
                      className="w-full bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#7A8E72] focus:outline-none" />
                    <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-[#7A8E72] focus:outline-none">
                      <option value={5}>⭐⭐⭐⭐⭐ عالی</option>
                      <option value={4}>⭐⭐⭐⭐ خوب</option>
                      <option value={3}>⭐⭐⭐ متوسط</option>
                      <option value={2}>⭐⭐ ضعیف</option>
                      <option value={1}>⭐ بد</option>
                    </select>
                    <textarea required rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="نظر خود را بنویسید..."
                      className="w-full bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#7A8E72] focus:outline-none" />
                    <button type="submit" disabled={submittingReview}
                      className="w-full bg-[#3B3228] hover:bg-[#6B4226] text-white font-bold py-2.5 rounded-lg text-xs transition disabled:opacity-50">
                      {submittingReview ? "ارسال..." : "ثبت نظر"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* RELATED */}
          {relatedProducts.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-[#3B3228]">محصولات مرتبط</h2>
                <Link href={`/shop?category=${product.categorySlug}`} className="text-[#6B4226] font-bold text-xs flex items-center gap-1 hover:underline">
                  همه <ArrowRight className="w-3 h-3 rotate-180" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {relatedProducts.map(r => <ProductCard key={r.id} product={r} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
