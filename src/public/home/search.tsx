export default function SearchBar() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 grid md:grid-cols-4 gap-4">
      <input className="border rounded-lg p-3" placeholder="Where are you going?" />
      <input type="date" className="border rounded-lg p-3" />
      <input type="date" className="border rounded-lg p-3" />
      <button className="bg-primary text-white rounded-lg font-semibold">
        Search
      </button>
    </div>
  );
}
