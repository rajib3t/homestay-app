export default function PropertyCard() {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition">
      <div className="relative bg-white rounded-xl shadow hover:shadow-2xl transform hover:-translate-y-1 transition overflow-hidden">
        <div className="relative">
          <img
            src="house.jpg"
            alt="Property"
            className="w-full h-56 object-cover"
          />
          <div className="absolute top-3 left-3 bg-white/80 text-sm px-3 py-1 rounded-lg">
            Verified
          </div>
          <div className="absolute top-3 right-3 bg-yellow-500 text-white text-sm px-2 py-1 rounded-lg">
            ★ 4.9
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">Luxury Villa</h3>
              <p className="text-sm text-gray-500">Goa, India</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Per night</div>
              <div className="font-bold">₹5,200</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
