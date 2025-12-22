// src/pages/Results.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  hotel_stays?: HotelStay[];
  local_transport?: LocalTransport[];
  food?: FoodCost;
  grand_total?: {
    per_person?: number;
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
  budget_per_person?: number;
  interests?: string[];
  itinerary?: ItineraryDay[];
  cost_breakdown?: CostBreakdown;
}

/* ---------------- COMPONENT ---------------- */

const Results = () => {
  const navigate = useNavigate();
  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const raw = sessionStorage.getItem("generatedItinerary");
    if (!raw) {
      setErrorMessage("No generated itinerary found.");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const payload = Array.isArray(parsed) ? parsed[0] : parsed;
      const data =
        payload["itinerary "] ??
        payload["itinerary"] ??
        payload;

      setItineraryObj(
        typeof data === "string" ? JSON.parse(data) : data
      );
    } catch (e) {
      setErrorMessage("Unexpected response format from server.");
    }
  }, []);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-6 text-center">
            <p>{errorMessage}</p>
            <Button onClick={() => navigate("/")}>Back</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!itineraryObj) return null;

  const days = itineraryObj.itinerary ?? [];
  const cost = itineraryObj.cost_breakdown;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-4xl space-y-10">

          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft /> Back
          </Button>

          <h1 className="text-4xl font-bold text-center">
            {itineraryObj.trip_name}
          </h1>

          {/* -------- Daily Itinerary -------- */}

          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Daily Itinerary</h2>
            {days.map((day, i) => (
              <Card key={i} className="p-6 space-y-2">
                <h3 className="text-xl font-semibold">
                  Day {day.day} – {day.theme}
                </h3>
                <p><strong>Morning:</strong> {day.morning}</p>
                <p><strong>Afternoon:</strong> {day.afternoon}</p>
                <p><strong>Evening:</strong> {day.evening}</p>
              </Card>
            ))}
          </section>

          {/* -------- COST BREAKDOWN -------- */}

          {cost && (
            <section className="space-y-8">
              <h2 className="text-3xl font-bold">Cost Breakdown</h2>

              {/* Source to Destination */}
              {cost.source_to_destination_travel && (
                <Card className="p-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plane /> Travel
                  </h3>
                  <p>
                    {cost.source_to_destination_travel.mode} from{" "}
                    {cost.source_to_destination_travel.from} to{" "}
                    {cost.source_to_destination_travel.to}
                  </p>
                  <p>
                    ₹{cost.source_to_destination_travel.cost_per_person} / person
                  </p>
                </Card>
              )}

              {/* Hotels */}
              {cost.hotel_stays?.map((h, i) => (
                <Card key={i} className="p-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Hotel /> {h.city}
                  </h3>
                  <p>{h.hotel_name}</p>
                  <p>
                    {h.nights} nights × ₹{h.cost_per_night}
                  </p>
                </Card>
              ))}

              {/* Local Transport */}
              {cost.local_transport?.map((t, i) => (
                <Card key={i} className="p-4">
                  <p>
                    <Bus /> Day {t.day}: {t.description} – ₹{t.cost}
                  </p>
                </Card>
              ))}

              {/* Food */}
              {cost.food && (
                <Card className="p-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Utensils /> Food
                  </h3>
                  <p>
                    ₹{cost.food.avg_cost_per_person_per_day} per person/day
                  </p>
                  <p>Total: ₹{cost.food.total_cost}</p>
                </Card>
              )}

              {/* Total */}
              {cost.grand_total && (
                <Card className="p-6 text-lg font-bold">
                  Total Trip Cost: ₹{cost.grand_total.overall}
                  <br />
                  Per Person: ₹{cost.grand_total.per_person}
                </Card>
              )}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;

