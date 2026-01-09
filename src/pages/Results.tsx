import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Plane,
  Train,
  Hotel,
  Check,
  ChevronRight,
  ChevronLeft,
  IndianRupee,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

interface ItineraryDay {
  day?: number;
  theme?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
}

interface SourceTravel {
  mode?: string;
  from?: string;
  to?: string;
  cost_per_person?: number;
  total_cost?: number;
}

interface ReturnTravel {
  mode?: string;
  from?: string;
  to?: string;
  cost_per_person?: number;
  total_cost?: number;
}

interface HotelOption {
  hotel_id: string;
  hotel_name: string;
  room_capacity: number;
  cost_per_room_per_night: number;
  star_rating?: number;
  amenities?: string[];
}

interface HotelsByCity {
  city: string;
  nights: number;
  hotels: HotelOption[];
}

interface SelectedHotel extends HotelOption {
  city: string;
  nights: number;
  rooms: number;
  total_cost: number;
}

interface CostBreakdown {
  source_to_destination_travel?: SourceTravel;
  return_travel?: ReturnTravel;
}

interface FullItinerary {
  trip_name?: string;
  source?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  passengers?: number;
  total_budget?: number;
  itinerary?: ItineraryDay[];
  hotels_by_city?: HotelsByCity[];
  cost_breakdown?: CostBreakdown;
}

/* ---------------- JSON UTILS ---------------- */

function stripJsonCodeFence(input: string) {
  return input
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function extractFullItinerary(input: any): FullItinerary | null {
  const tryParse = (v: any): any => {
    if (typeof v === "string") {
      try {
        return JSON.parse(stripJsonCodeFence(v));
      } catch {
        try {
          return JSON.parse(JSON.parse(v));
        } catch {
          return v;
        }
      }
    }
    return v;
  };

  const walk = (node: any, depth = 6): FullItinerary | null => {
    if (!node || depth === 0) return null;
    const parsed = tryParse(node);

    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed.trip_name || parsed.itinerary || parsed.hotels_by_city)
    ) {
      return parsed as FullItinerary;
    }

    if (Array.isArray(parsed)) {
      for (const v of parsed) {
        const found = walk(v, depth - 1);
        if (found) return found;
      }
    }

    if (typeof parsed === "object") {
      for (const k in parsed) {
        const found = walk(parsed[k], depth - 1);
        if (found) return found;
      }
    }

    return null;
  };

  return walk(input);
}

/* ---------------- COMPONENT ---------------- */

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [selectedHotels, setSelectedHotels] = useState<Record<string, SelectedHotel>>({});
  const [selectionComplete, setSelectionComplete] = useState(false);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const raw =
      (location.state as any)?.generatedItinerary ??
      sessionStorage.getItem("generatedItinerary") ??
      localStorage.getItem("generatedItinerary");

    if (!raw) {
      setErrorMessage("No generated itinerary found.");
      return;
    }

    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const extracted = extractFullItinerary(parsed);

      if (!extracted) {
        setErrorMessage("Itinerary data could not be extracted.");
        return;
      }

      setItineraryObj(extracted);
    } catch {
      setErrorMessage("Invalid itinerary format.");
    }
  }, [location.state]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center space-y-4">
            <p>{errorMessage}</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!itineraryObj) return null;

  const cost = itineraryObj.cost_breakdown;
  const passengers = itineraryObj.passengers || 1;
  const hotelCities = itineraryObj.hotels_by_city || [];
  const currentCity = hotelCities[currentCityIndex];

  const travelCost =
    (cost?.source_to_destination_travel?.total_cost || 0) +
    (cost?.return_travel?.total_cost || 0);

  const hotelTotalCost = Object.values(selectedHotels).reduce(
    (sum, h) => sum + h.total_cost,
    0
  );

  const grandTotal = travelCost + hotelTotalCost;
  const budget = itineraryObj.total_budget || 0;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 container max-w-6xl space-y-10">

        <h1 className="text-4xl font-bold text-center">
          {itineraryObj.trip_name}
        </h1>

        {/* ITINERARY */}
        <section className="space-y-4">
          {itineraryObj.itinerary?.map((d, i) => (
            <Card key={i} className="p-5">
              <h3 className="font-bold text-lg">
                Day {d.day}: {d.theme}
              </h3>
              <p><strong>Morning:</strong> {d.morning}</p>
              <p><strong>Afternoon:</strong> {d.afternoon}</p>
              <p><strong>Evening:</strong> {d.evening}</p>
            </Card>
          ))}
        </section>

        {/* HOTEL SELECTION */}
        {!selectionComplete && currentCity && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">
              Select Hotel – {currentCity.city}
            </h2>

            {currentCity.hotels.map((hotel) => {
              const rooms = Math.ceil(passengers / hotel.room_capacity);
              const total = rooms * hotel.cost_per_room_per_night * currentCity.nights;
              const selected = selectedHotels[currentCity.city]?.hotel_id === hotel.hotel_id;

              return (
                <Card
                  key={hotel.hotel_id}
                  onClick={() =>
                    setSelectedHotels({
                      ...selectedHotels,
                      [currentCity.city]: {
                        ...hotel,
                        city: currentCity.city,
                        nights: currentCity.nights,
                        rooms,
                        total_cost: total,
                      },
                    })
                  }
                  className={`p-5 cursor-pointer ${selected ? "ring-2 ring-primary" : ""}`}
                >
                  <h3 className="font-bold">{hotel.hotel_name}</h3>
                  <p>₹{hotel.cost_per_room_per_night} per room</p>
                  <p>Total: ₹{total}</p>
                </Card>
              );
            })}

            <Button
              onClick={() => {
                if (currentCityIndex === hotelCities.length - 1) {
                  setSelectionComplete(true);
                } else {
                  setCurrentCityIndex(currentCityIndex + 1);
                }
              }}
            >
              Next
            </Button>
          </section>
        )}

        {/* FINAL COST */}
        {selectionComplete && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Trip Cost Summary</h2>
            <p>Travel: ₹{travelCost}</p>
            <p>Hotels: ₹{hotelTotalCost}</p>
            <p className="font-bold text-xl">Total: ₹{grandTotal}</p>
            <p className={grandTotal <= budget ? "text-green-600" : "text-red-600"}>
              {grandTotal <= budget ? "Within budget" : "Exceeds budget"}
            </p>
          </Card>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Results;
