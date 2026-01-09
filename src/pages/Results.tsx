import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Train, Hotel, Check, ChevronRight, IndianRupee } from "lucide-react";

/* ---------------- TYPES ---------------- */

interface HotelOption {
  hotel_id: string;
  hotel_name: string;
  room_capacity: number;
  cost_per_room_per_night: number;
}

interface CityBlock {
  city: string;
  nights: number;
  attractions: string[];
  hotels: HotelOption[];
}

interface Transport {
  outbound: { mode: string; from: string; to: string; cost_per_person: number };
  return: { mode: string; from: string; to: string; cost_per_person: number };
}

interface ResearchData {
  cities: CityBlock[];
  transport: Transport;
}

interface ItineraryDay {
  day: number;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
}

interface ItineraryData {
  trip_name: string;
  itinerary: ItineraryDay[];
}

interface SelectedHotel extends HotelOption {
  city: string;
  nights: number;
  rooms: number;
  total_cost: number;
}

/* ---------------- COMPONENT ---------------- */

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [research, setResearch] = useState<ResearchData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [selectedHotels, setSelectedHotels] = useState<Record<string, SelectedHotel>>({});
  const [loadingItinerary, setLoadingItinerary] = useState(false);

  const userData = JSON.parse(localStorage.getItem("tripInput") || "{}");
  const passengers = userData.passengers || 1;
  const totalBudget = userData.total_budget || 0;

  /* ---------------- Load Research Data ---------------- */

  useEffect(() => {
    const raw = localStorage.getItem("researchData");
    if (!raw) return;

    setResearch(JSON.parse(raw));
  }, []);

  if (!research) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading research data...</p>
      </div>
    );
  }

  const cities = research.cities;
  const currentCity = cities[currentCityIndex];

  /* ---------------- Calculations ---------------- */

  const travelCost =
    (research.transport.outbound.cost_per_person +
      research.transport.return.cost_per_person) *
    passengers;

  const hotelTotal = Object.values(selectedHotels).reduce((sum, h) => sum + h.total_cost, 0);

  const grandTotal = travelCost + hotelTotal;

  /* ---------------- Handlers ---------------- */

  const selectHotel = (hotel: HotelOption) => {
    const rooms = Math.ceil(passengers / hotel.room_capacity);
    const total = rooms * hotel.cost_per_room_per_night * currentCity.nights;

    setSelectedHotels((prev) => ({
      ...prev,
      [currentCity.city]: {
        ...hotel,
        city: currentCity.city,
        nights: currentCity.nights,
        rooms,
        total_cost: total,
      },
    }));
  };

  const nextCity = () => {
    if (currentCityIndex < cities.length - 1) {
      setCurrentCityIndex(currentCityIndex + 1);
    } else {
      generateItinerary();
    }
  };

  const generateItinerary = async () => {
    setLoadingItinerary(true);

    const res = await fetch("/api/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userData,
        selected_hotels: Object.values(selectedHotels),
      }),
    });

    const data = await res.json();
    setItinerary(data);
    setLoadingItinerary(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-5xl py-8 space-y-8">

        {/* Travel Cost */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2">Travel Tickets</h2>
          <p>
            {research.transport.outbound.mode.toUpperCase()} {research.transport.outbound.from} →{" "}
            {research.transport.outbound.to} — ₹
            {research.transport.outbound.cost_per_person} × {passengers}
          </p>
          <p>
            Return — ₹{research.transport.return.cost_per_person} × {passengers}
          </p>
          <p className="font-bold mt-2">Total: ₹{travelCost.toLocaleString()}</p>
        </Card>

        {/* Hotel Selection */}
        {!itinerary && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Choose hotel in {currentCity.city} ({currentCity.nights} nights)
            </h2>

            <div className="grid gap-4">
              {currentCity.hotels.map((h) => {
                const rooms = Math.ceil(passengers / h.room_capacity);
                const total = rooms * h.cost_per_room_per_night * currentCity.nights;
                const selected = selectedHotels[currentCity.city]?.hotel_id === h.hotel_id;

                return (
                  <Card
                    key={h.hotel_id}
                    onClick={() => selectHotel(h)}
                    className={`p-4 cursor-pointer ${selected ? "ring-2 ring-primary" : ""}`}
                  >
                    <h3 className="font-bold">{h.hotel_name}</h3>
                    <p>
                      ₹{h.cost_per_room_per_night}/room/night • Capacity {h.room_capacity}
                    </p>
                    <p className="font-bold">Total: ₹{total.toLocaleString()}</p>
                  </Card>
                );
              })}
            </div>

            <Button
              className="mt-4"
              disabled={!selectedHotels[currentCity.city]}
              onClick={nextCity}
            >
              {currentCityIndex === cities.length - 1 ? "Generate Itinerary" : "Next City"}
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Card>
        )}

        {/* Final Summary */}
        {itinerary && (
          <>
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-2">Trip Cost</h2>
              <p>Travel: ₹{travelCost.toLocaleString()}</p>
              <p>Hotels: ₹{hotelTotal.toLocaleString()}</p>
              <p className="font-bold">Total: ₹{grandTotal.toLocaleString()}</p>
              <p className={grandTotal <= totalBudget ? "text-green-600" : "text-red-600"}>
                {grandTotal <= totalBudget
                  ? "Within budget"
                  : `Exceeds by ₹${(grandTotal - totalBudget).toLocaleString()}`}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">{itinerary.trip_name}</h2>
              {itinerary.itinerary.map((d) => (
                <div key={d.day} className="mb-4">
                  <h3 className="font-bold">Day {d.day} – {d.theme}</h3>
                  <p><b>Morning:</b> {d.morning}</p>
                  <p><b>Afternoon:</b> {d.afternoon}</p>
                  <p><b>Evening:</b> {d.evening}</p>
                </div>
              ))}
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Results;
