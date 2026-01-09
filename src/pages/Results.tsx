import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
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
  passengers?: number;
  total_budget?: number;
  itinerary?: ItineraryDay[];
  hotels_by_city?: HotelsByCity[];
  cost_breakdown?: CostBreakdown;
}

/* ---------------- JSON EXTRACTION ---------------- */

function stripJson(str: string) {
  return str
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

function deepParse(input: any): any {
  if (typeof input === "string") {
    try {
      return JSON.parse(stripJson(input));
    } catch {
      try {
        return JSON.parse(JSON.parse(stripJson(input)));
      } catch {
        return input;
      }
    }
  }
  return input;
}

function extractItinerary(root: any): FullItinerary | null {
  root = deepParse(root);

  // Perplexity format
  if (root?.choices?.[0]?.message?.content) {
    return extractItinerary(root.choices[0].message.content);
  }

  // n8n format
  if (Array.isArray(root)) {
    for (const item of root) {
      const found = extractItinerary(item);
      if (found) return found;
    }
  }

  if (root?.itinerary || root?.hotels_by_city) {
    return root;
  }

  if (typeof root === "object") {
    for (const k in root) {
      const found = extractItinerary(root[k]);
      if (found) return found;
    }
  }

  return null;
}

/* ---------------- COMPONENT ---------------- */

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<FullItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cityIndex, setCityIndex] = useState(0);
  const [selectedHotels, setSelectedHotels] = useState<Record<string, SelectedHotel>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const raw =
      (location.state as any)?.generatedItinerary ||
      sessionStorage.getItem("generatedItinerary") ||
      localStorage.getItem("generatedItinerary");

    if (!raw) {
      setError("No itinerary found");
      return;
    }

    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const extracted = extractItinerary(parsed);

      if (!extracted) {
        setError("Itinerary data could not be extracted.");
      } else {
        setData(extracted);
      }
    } catch {
      setError("Invalid data from server.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 space-y-4 text-center">
            <p>{error}</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) return null;

  const passengers = data.passengers || 1;
  const cities = data.hotels_by_city || [];
  const city = cities[cityIndex];

  const travel =
    (data.cost_breakdown?.source_to_destination_travel?.total_cost || 0) +
    (data.cost_breakdown?.return_travel?.total_cost || 0);

  const hotelCost = Object.values(selectedHotels).reduce((s, h) => s + h.total_cost, 0);
  const total = travel + hotelCost;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container max-w-6xl py-10 space-y-10">

        <h1 className="text-4xl font-bold text-center">{data.trip_name}</h1>

        {/* Itinerary */}
        {data.itinerary?.map((d, i) => (
          <Card key={i} className="p-4">
            <h3 className="font-bold">Day {d.day} – {d.theme}</h3>
            <p><b>Morning:</b> {d.morning}</p>
            <p><b>Afternoon:</b> {d.afternoon}</p>
            <p><b>Evening:</b> {d.evening}</p>
          </Card>
        ))}

        {/* Hotel selection */}
        {!done && city && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Choose hotel for {city.city}</h2>

            {city.hotels.map(h => {
              const rooms = Math.ceil(passengers / h.room_capacity);
              const cost = rooms * h.cost_per_room_per_night * city.nights;

              return (
                <Card
                  key={h.hotel_id}
                  onClick={() =>
                    setSelectedHotels({
                      ...selectedHotels,
                      [city.city]: {
                        ...h,
                        city: city.city,
                        nights: city.nights,
                        rooms,
                        total_cost: cost,
                      },
                    })
                  }
                  className="p-4 cursor-pointer"
                >
                  <p className="font-bold">{h.hotel_name}</p>
                  <p>Total: ₹{cost}</p>
                </Card>
              );
            })}

            <Button
              onClick={() => {
                if (cityIndex === cities.length - 1) setDone(true);
                else setCityIndex(cityIndex + 1);
              }}
            >
              Next
            </Button>
          </section>
        )}

        {/* Final cost */}
        {done && (
          <Card className="p-6 text-xl font-bold">
            Total Trip Cost: ₹{total}
          </Card>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Results;
