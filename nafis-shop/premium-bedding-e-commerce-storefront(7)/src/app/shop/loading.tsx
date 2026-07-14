export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-[3px] border-[#7A8E72] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-stone-500">در حال بارگذاری محصولات...</p>
      </div>
    </div>
  );
}
