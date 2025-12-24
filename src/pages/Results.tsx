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

/* ✅ ADDED (return journey) */
interface ReturnTravel {
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

  /* ✅ ADDED */
  return_travel?: ReturnTravel;

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
      if (trimmed.startsWith("```")) {
        return trimmed
          .replace(/^```[a-zA-Z]*\n?/, "")
          .replace(/\n?```$/, "")
          .trim();
      }
      return trimmed;
    };

    const parseMaybeJson = (value: unknown): unknown => {
      if (typeof value !== "string") return value;
      const once = safeJsonParse(stripJsonCodeFence(value));
      if (once === null) return value;
      if (typeof once === "string") {
        const twice = safeJsonParse(stripJsonCodeFence(once));
        return twice ?? once;
      }
      return once;
    };

    const extractItineraryObject = (root: unknown): FullItinerary | null => {
      const normalizedRoot = parseMaybeJson(root);

      const candidates: unknown[] = Array.isArray(normalizedRoot)
        ? normalizedRoot
        : normalizedRoot != null
          ? [normalizedRoot]
          : [];

      for (const c of candidates) {
        const candidate = parseMaybeJson(c);

        const candidateObj =
          candidate && typeof candidate === "object"
            ? (candidate as Record<string, unknown>)
            : null;

        if (candidateObj) {
          const itineraryKey = Object.keys(candidateObj).find((k) => k.trim() === "itinerary");

          if (itineraryKey) {
            const v = parseMaybeJson(candidateObj[itineraryKey]);
            if (v && typeof v === "object") return v as FullItinerary;
          }

          if ("itinerary" in candidateObj || "trip_name" in candidateObj || "destination" in candidateObj) {
            return candidateObj as FullItinerary;
          }
        }

        if (candidate && typeof candidate === "object") {
          return candidate as FullItinerary;
        }
      }

      return null;
    };

    try {
      const parsedRaw = safeJsonParse(raw);
      const root = parsedRaw ?? raw;

      const extracted = extractItineraryObject(root);
      if (!extracted) throw new Error("Could not extract itinerary object");

      setItineraryObj(extracted);
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

              {/* Outbound */}
              {cost.source_to_destination_travel && (
                <Card className="p-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plane /> Outbound Travel
                  </h3>
                  <p>
                    {cost.source_to_destination_travel.mode} from{" "}
                    {cost.source_to_destination_travel.from} to{" "}
                    {cost.source_to_destination_travel.to}
                  </p>
                  <p>₹{cost.source_to_destination_travel.cost_per_person} per person</p>
                  <p className="font-bold">Total: ₹{cost.source_to_destination_travel.total_cost}</p>
                </Card>
              )}

              {/* Return */}
              {cost.return_travel && (
                <Card className="p-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plane /> Return Travel
                  </h3>
                  <p>
                    {cost.return_travel.mode} from{" "}
                    {cost.return_travel.from} to{" "}
                    {cost.return_travel.to}
                  </p>
                  <p>₹{cost.return_travel.cost_per_person} per person</p>
                  <p className="font-bold">Total: ₹{cost.return_travel.total_cost}</p>
                </Card>
              )}

              {/* Hotels */}
              {cost.hotel_stays?.map((h, i) => (
                <Card key={i} className="p-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Hotel /> {h.city}
                  </h3>
                  <p>{h.hotel_name}</p>
                  <p>{h.nights} nights × ₹{h.cost_per_night} = ₹{h.total_cost}</p>
                </Card>
              ))}

              {/* Food */}
              {cost.food && (
                <Card className="p-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Utensils /> Food
                  </h3>
                  <p>Total: ₹{cost.food.total_cost}</p>
                </Card>
              )}

              {/* Grand Total */}
              <Card className="p-6 text-lg font-bold">
                Grand Total: ₹{cost.grand_total?.overall}
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

