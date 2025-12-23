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
  total_budget?: number;
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
    const raw =
      sessionStorage.getItem("generatedItinerary") ??
      localStorage.getItem("generatedItinerary");
    if (!raw) {
      setErrorMessage("No generated itinerary found.");
      return;
    }

    const safeJsonParse = (input: string) => {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    };

    const stripJsonCodeFence = (input: string) => {
      const trimmed = input.trim();
      // Handles responses like: ```json\n{...}\n```
      if (trimmed.startsWith("```")) {
        return trimmed
          .replace(/^```[a-zA-Z]*\n?/, "")
          .replace(/\n?```$/, "")
          .trim();
      }
      return trimmed;
    };

    try {
      const parsed = safeJsonParse(raw);
      if (!parsed) throw new Error("Session storage is not valid JSON");

      const payload = Array.isArray(parsed)
        ? (parsed.find((item) => {
            if (!item || typeof item !== "object") return false;
            const keys = Object.keys(item as Record<string, unknown>);
            return keys.some((k) => k.trim() === "itinerary");
          }) ?? parsed[0])
        : parsed;

      if (!payload || (typeof payload !== "object" && typeof payload !== "string")) {
        throw new Error("Payload is not an object");
      }

      // n8n sometimes sends { "itinerary ": "{...}" } (note trailing space)
      const objPayload =
        typeof payload === "object" ? (payload as Record<string, unknown>) : null;

      const itineraryKey = objPayload
        ? Object.keys(objPayload).find((k) => k.trim() === "itinerary")
        : undefined;

      const maybeData = itineraryKey && objPayload ? objPayload[itineraryKey] : payload;

      // Sometimes the itinerary is stringified (and may even be wrapped in ```json fences)
      const parsedData =
        typeof maybeData === "string"
          ? safeJsonParse(stripJsonCodeFence(maybeData)) ?? maybeData
          : maybeData;

      // In some cases, we end up with a stringified JSON twice
      const finalData =
        typeof parsedData === "string"
          ? safeJsonParse(stripJsonCodeFence(parsedData))
          : parsedData;

      if (!finalData || typeof finalData !== "object") {
        throw new Error("Final itinerary data is not an object");
      }

      setItineraryObj(finalData as FullItinerary);
    } catch (e) {
      console.error("Failed to parse itinerary:", e);
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

  if (!itineraryObj) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-6 text-center">
            <p>Loading itinerary…</p>
            <Button variant="ghost" onClick={() => navigate("/")}>Back</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

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

              {/* Budget Summary */}
              <Card className="p-6 space-y-3">
                {itineraryObj.total_budget !== undefined && (
                  <p className="text-lg">
                    <strong>Total Trip Budget:</strong> ₹{itineraryObj.total_budget.toLocaleString()}
                  </p>
                )}
                {cost.grand_total && (
                  <>
                    <p className="text-lg font-bold">
                      Estimated Total Trip Cost: ₹{cost.grand_total.overall?.toLocaleString()}
                    </p>
                    <p>Per Person: ₹{cost.grand_total.per_person?.toLocaleString()}</p>
                    {itineraryObj.total_budget !== undefined && cost.grand_total.overall !== undefined && (
                      <p className={cost.grand_total.overall <= itineraryObj.total_budget ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {cost.grand_total.overall <= itineraryObj.total_budget ? "✓ Within budget" : "⚠ Exceeds budget"}
                      </p>
                    )}
                  </>
                )}
              </Card>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;

