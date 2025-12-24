// src/pages/Results.tsx

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

/* ✅ NEW — Return Journey */
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

  /* ✅ NEW */
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
  const location = useLocation();
  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const state = location.state as
      | { generatedItinerary?: unknown; itineraryData?: unknown }
      | null
      | undefined;

    const rawFromState = state?.generatedItinerary ?? null;

    const rawFromStorage =
      sessionStorage.getItem("generatedItinerary") ??
      localStorage.getItem("generatedItinerary");

    const raw = rawFromState ?? rawFromStorage;

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

      const looksLikeItinerary = (v: unknown): v is FullItinerary => {
        if (!v || typeof v !== "object") return false;
        const obj = v as Record<string, unknown>;
        return (
          "itinerary" in obj ||
          "trip_name" in obj ||
          "destination" in obj ||
          "source" in obj
        );
      };

      const walk = (node: unknown, depth: number): FullItinerary | null => {
        const n = parseMaybeJson(node);

        if (looksLikeItinerary(n)) return n;

        if (depth <= 0) return null;

        if (Array.isArray(n)) {
          for (const item of n) {
            const found = walk(item, depth - 1);
            if (found) return found;
          }
          return null;
        }

        if (n && typeof n === "object") {
          const obj = n as Record<string, unknown>;

          // If there's an "itinerary" key (even with trailing spaces), its value might be the actual object
          const itineraryKey = Object.keys(obj).find((k) => k.trim() === "itinerary");
          if (itineraryKey) {
            const v = parseMaybeJson(obj[itineraryKey]);
            if (looksLikeItinerary(v)) return v;
            if (Array.isArray(v)) {
              const found = walk(v, depth - 1);
              if (found) return found;
            }
          }

          // Otherwise, search any nested key (common n8n patterns: data, body, output, result)
          for (const key of Object.keys(obj)) {
            const found = walk(obj[key], depth - 1);
            if (found) return found;
          }
        }

        return null;
      };

      return walk(normalizedRoot, 5);
    };

    try {
      const root = typeof raw === "string" ? safeJsonParse(raw) ?? raw : raw;

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
  const passengers = itineraryObj.passengers ?? 1;

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
                  <p className="font-bold">
                    Total: ₹{cost.source_to_destination_travel.total_cost}
                  </p>
                </Card>
              )}

              {/* ✅ NEW Return Journey */}
              {cost.return_travel && (
                <Card className="p-6 border-2 border-dashed">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plane /> Return Journey
                  </h3>
                  <p>
                    {cost.return_travel.mode} from{" "}
                    {cost.return_travel.from} to{" "}
                    {cost.return_travel.to}
                  </p>
                  <p>
                    ₹{cost.return_travel.cost_per_person} / person
                  </p>
                  <p className="font-bold">
                    Total: ₹{cost.return_travel.total_cost}
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
                    {h.nights} nights × ₹{h.cost_per_night} = ₹{h.total_cost}
                  </p>
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


