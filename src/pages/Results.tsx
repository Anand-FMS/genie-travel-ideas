import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, ChevronRight, IndianRupee } from "lucide-react";

/* ---------------- TYPES ---------------- */

interface Hotel {
  hotel_id: string;
  hotel_name: string;
  room_capacity: number;
  cost_per_room_per_night: number;
}

interface City {
  city: string;
  nights: number;
  hotels: Hotel[];
}

interface Transport {
  outbound: { mode: string; from: string; to: string; cost_per_person: number };
  return: { mode: string; from: string; to: string; cost_per_person: number };
}

interface Research {
  cities: City[];
  transport: Transport;
}

/* ---------------- COMPONENT ---------------- */

export default function Results() {
  const navigate = useNavigate();
  const [research, setResearch] = useState<Research | null>(null);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [selectedHotels, setSelectedHotels] = useState<any>({});

  const user = JSON.parse(localStorage.getItem("tripInput") || "{}");
  const passengers = user.passengers || 1;
  const budget = user.total_budget || 0;

  /* Load research */
  useEffect(() => {
    const raw = localStorage.getItem("researchData");
    if (!raw) return;
    setResearch(JSON.parse(raw));
  }, []);

  if (!research) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading research data...
      </div>
    );
  }

  const city = research.cities[currentCityIndex];

  /* Costs */
  const travelCost =
    (research.transport.outbound.cost_per_person +
      research.transport.return.cost_per_person) *
    passengers;

  const hotelTotal = Object.values(selectedHotels).reduce(
    (s: number, h: any) => s + h.total_cost,
    0
  );

  const grandTotal = travelCost + hotelTotal;

  /* Select hotel */
  const selectHotel = (hotel: Hotel) => {
    const rooms = Math.ceil(passengers / hotel.room_capacity);
    const total = rooms * hotel.cost_per_room_per_night * city.nights;

    setSelectedHotels({
      ...selectedHotels,
      [city.city]: { ...hotel, nights: city.nights, rooms, total_cost: total },
    });
  };

  const next = () => {
    if (currentCityIndex < research.cities.length - 1)
      setCurrentCityIndex(currentCityIndex + 1);
    else alert("All hotels selected. Now generate itinerary.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-4xl py-10 space-y-8">

        {/* Travel */}
        <Card className="p-5">
          <h2 className="font-bold">Flights / Trains</h2>
          <p>
            {research.transport.outbound.from} →{" "}
            {research.transport.outbound.to} : ₹
            {research.transport.outbound.cost_per_person} × {passengers}
          </p>
          <p>
            Return: ₹{research.transport.return.cost_per_person} × {passengers}
          </p>
          <p className="font-bold">₹{travelCost}</p>
        </Card>

        {/* Hotel picker */}
        <Card className="p-5">
          <h2 className="font-bold">
            Select hotel in {city.city} ({city.nights} nights)
          </h2>

          {city.hotels.map((h) => {
            const rooms = Math.ceil(passengers / h.room_capacity);
            const total = rooms * h.cost_per_room_per_night * city.nights;

            return (
              <div
                key={h.hotel_id}
                className="border p-3 mt-3 cursor-pointer"
                onClick={() => selectHotel(h)}
              >
                <h3>{h.hotel_name}</h3>
                <p>₹{h.cost_per_room_per_night} per room</p>
                <p>Total ₹{total}</p>
              </div>
            );
          })}

          <Button
            className="mt-4"
            disabled={!selectedHotels[city.city]}
            onClick={next}
          >
            Next City <ChevronRight />
          </Button>
        </Card>

        {/* Summary */}
        <Card className="p-5">
          <h2 className="font-bold flex items-center gap-2">
            <IndianRupee /> Trip Cost
          </h2>
          <p>Travel: ₹{travelCost}</p>
          <p>Hotels: ₹{hotelTotal}</p>
          <p className="font-bold">Total: ₹{grandTotal}</p>
          <p className={grandTotal <= budget ? "text-green-600" : "text-red-600"}>
            {grandTotal <= budget ? "Within Budget" : "Over Budget"}
          </p>
        </Card>

      </main>
      <Footer />
    </div>
  );
}
