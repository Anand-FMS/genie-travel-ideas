import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  DollarSign,
  Calendar,
  Heart,
  ArrowLeft,
  Hotel,
  Bus,
  Utensils,
  Plane
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
}

interface HotelsByCity {
  city: string;
  nights: number;
  hotels: HotelOption[];
}

interface HotelStay {
  city?: string;
  hotel_name?: string;
  nights?: number;
  cost_per_night?: number;
  total_cost?: number;
}

interface LocalTransport {
  day?: number;
  description?: string;
  cost?: number;
}

interface FoodCost {
  avg_cost_per_person_per_day?: number;
  total_days?: number;
  total_cost?: number;
}

interface CostBreakdown {
  source_to_destination_travel?: SourceTravel;
  return_travel?: ReturnTravel;
  hotel_stays?: HotelStay[];
  local_transport?: LocalTransport[];
  food?: FoodCost;
  grand_total?: {
    overall?: number;
  };
}

interface FullItinerary {
  trip_name?: string;
  source?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  passengers?: number;
  total_budget?: number;
  interests?: string[];
  itinerary?: ItineraryDay[];
  hotels_by_city?: HotelsByCity[];
  cost_breakdown?: CostBreakdown;
}

function stripJsonCodeFence(input: string) {
  return input
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function extractFullItinerary(maybe: any): FullItinerary | null {
  if (!maybe) return null;

  // n8n often returns: { "itinerary ": "{ ...json... }" }
  const direct = maybe?.["itinerary "] ?? maybe?.itinerary;
  if (typeof direct === "string") {
    try {
      const cleaned = stripJsonCodeFence(direct);
      return JSON.parse(cleaned) as FullItinerary;
    } catch {
      // Sometimes double-stringified
      try {
        const cleaned = stripJsonCodeFence(direct);
        return JSON.parse(JSON.parse(cleaned)) as FullItinerary;
      } catch {
        return null;
      }
    }
  }

  // Already the object
  if (typeof maybe === "object" && (maybe.trip_name || Array.isArray(maybe.itinerary))) {
    return maybe as FullItinerary;
  }

  return null;
}

/* ---------------- COMPONENT ---------------- */

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [selectedHotels, setSelectedHotels] = useState<Record<string, any>>({});
  const [dynamicTotal, setDynamicTotal] = useState<number | null>(null);

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
        setErrorMessage("Unexpected response format from server.");
        return;
      }

      setItineraryObj(extracted);
    } catch {
      setErrorMessage("Invalid itinerary format.");
    }
  }, [location.state]);

  const cost = itineraryObj?.cost_breakdown;

  /* ---------------- DYNAMIC TOTAL ---------------- */

  useEffect(() => {
    if (!itineraryObj) return;

    let hotelTotal = 0;
    Object.values(selectedHotels).forEach((h: any) => {
      hotelTotal += h.total_cost;
    });

    const travel =
      (cost?.source_to_destination_travel?.total_cost || 0) +
      (cost?.return_travel?.total_cost || 0);

    setDynamicTotal(hotelTotal + travel);
  }, [selectedHotels, itineraryObj]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-6">{errorMessage}</Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!itineraryObj) return null;

  const passengers = itineraryObj.passengers || 1;
  const hotelCities = itineraryObj.hotels_by_city || [];
  const currentCity = hotelCities[currentCityIndex];

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-4xl space-y-10">

          <h1 className="text-4xl font-bold text-center">{itineraryObj.trip_name}</h1>

          {/* ---------------- ITINERARY ---------------- */}
          <section className="space-y-4">
            {itineraryObj.itinerary?.map((d, i) => (
              <Card key={i} className="p-4">
                <h3 className="font-bold">Day {d.day}: {d.theme}</h3>
                <p><strong>Morning:</strong> {d.morning}</p>
                <p><strong>Afternoon:</strong> {d.afternoon}</p>
                <p><strong>Evening:</strong> {d.evening}</p>
              </Card>
            ))}
          </section>

          {/* ---------------- TRAVEL ---------------- */}
          {cost?.source_to_destination_travel && (
            <Card className="p-4">
              <Plane /> {cost.source_to_destination_travel.mode} ₹{cost.source_to_destination_travel.total_cost}
            </Card>
          )}

          {cost?.return_travel && (
            <Card className="p-4">
              <Plane /> Return ₹{cost.return_travel.total_cost}
            </Card>
          )}

          {/* ---------------- HOTEL SELECTION ---------------- */}
          {currentCity && (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-bold">
                Select Hotel for {currentCity.city} ({currentCity.nights} nights)
              </h2>

              {currentCity.hotels.map((hotel) => {
                const rooms = Math.ceil(passengers / hotel.room_capacity);
                const total = rooms * hotel.cost_per_room_per_night * currentCity.nights;

                const selected = selectedHotels[currentCity.city]?.hotel_name === hotel.hotel_name;

                return (
                  <Card
                    key={hotel.hotel_id}
                    onClick={() => {
                      setSelectedHotels((prev) => ({
                        ...prev,
                        [currentCity.city]: {
                          ...hotel,
                          rooms,
                          nights: currentCity.nights,
                          total_cost: total
                        }
                      }));
                    }}
                    className={`p-4 cursor-pointer ${selected ? "border-2 border-blue-600" : ""}`}
                  >
                    <p className="font-bold">{hotel.hotel_name}</p>
                    <p>₹{hotel.cost_per_room_per_night} per room/night</p>
                    <p>Rooms needed: {rooms}</p>
                    <p className="font-bold">Total: ₹{total}</p>
                  </Card>
                );
              })}

              <Button
                disabled={!selectedHotels[currentCity.city]}
                onClick={() => setCurrentCityIndex(i => i + 1)}
              >
                {currentCityIndex === hotelCities.length - 1 ? "Finish Selection" : "Next City"}
              </Button>
            </Card>
          )}

          {/* ---------------- FINAL COST ---------------- */}
          {dynamicTotal !== null && (
            <Card className="p-6 bg-blue-100 text-xl font-bold">
              Final Trip Cost: ₹{dynamicTotal}
            </Card>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
