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

  const direct = maybe?.["itinerary "] ?? maybe?.itinerary;
  if (typeof direct === "string") {
    try {
      const cleaned = stripJsonCodeFence(direct);
      return JSON.parse(cleaned) as FullItinerary;
    } catch {
      try {
        const cleaned = stripJsonCodeFence(direct);
        return JSON.parse(JSON.parse(cleaned)) as FullItinerary;
      } catch {
        return null;
      }
    }
  }

  if (typeof maybe === "object" && (maybe.trip_name || Array.isArray(maybe.itinerary) || maybe.hotels_by_city)) {
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
  const [selectedHotels, setSelectedHotels] = useState<Record<string, SelectedHotel>>({});
  const [selectionComplete, setSelectionComplete] = useState(false);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const raw =
      (location.state as any)?.generatedItinerary ??
      sessionStorage.getItem("generatedItinerary") ??
      localStorage.getItem("generatedItinerary");

    if (!raw) {
      setErrorMessage("No generated itinerary found. Please generate an itinerary first.");
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

  /* ---------------- DERIVED VALUES ---------------- */

  const cost = itineraryObj?.cost_breakdown;
  const passengers = itineraryObj?.passengers || 1;
  const hotelCities = itineraryObj?.hotels_by_city || [];
  const currentCity = hotelCities[currentCityIndex];
  const totalCities = hotelCities.length;

  const travelCost =
    (cost?.source_to_destination_travel?.total_cost || 0) +
    (cost?.return_travel?.total_cost || 0);

  const hotelTotalCost = Object.values(selectedHotels).reduce(
    (sum, h) => sum + h.total_cost,
    0
  );

  const grandTotal = travelCost + hotelTotalCost;
  const totalBudget = itineraryObj?.total_budget || 0;
  const isWithinBudget = grandTotal <= totalBudget;

  /* ---------------- HANDLERS ---------------- */

  const handleSelectHotel = (hotel: HotelOption) => {
    if (!currentCity) return;

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

  const handleNextCity = () => {
    if (currentCityIndex < totalCities - 1) {
      setCurrentCityIndex((i) => i + 1);
    } else {
      setSelectionComplete(true);
    }
  };

  const handlePreviousCity = () => {
    if (currentCityIndex > 0) {
      setCurrentCityIndex((i) => i - 1);
    }
  };

  const handleEditSelection = () => {
    setSelectionComplete(false);
    setCurrentCityIndex(0);
  };

  /* ---------------- ERROR STATE ---------------- */

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 text-center space-y-4 max-w-md">
            <p className="text-lg text-muted-foreground">{errorMessage}</p>
            <Button onClick={() => navigate("/")}>
              Go to Home & Generate Itinerary
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!itineraryObj) return null;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto max-w-5xl px-4 space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {itineraryObj.trip_name || "Your Trip Itinerary"}
            </h1>
            <p className="text-muted-foreground">
              {itineraryObj.source} → {itineraryObj.destination} • {passengers} Passenger{passengers > 1 ? "s" : ""}
            </p>
          </div>

          {/* Day-wise Itinerary */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Day-by-Day Itinerary
            </h2>
            <div className="grid gap-4">
              {itineraryObj.itinerary?.map((d, i) => (
                <Card key={i} className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-primary">
                    Day {d.day}: {d.theme}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-foreground">Morning:</span>
                      <p className="text-muted-foreground">{d.morning}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Afternoon:</span>
                      <p className="text-muted-foreground">{d.afternoon}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Evening:</span>
                      <p className="text-muted-foreground">{d.evening}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Travel Costs */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              {cost?.source_to_destination_travel?.mode?.toLowerCase().includes("flight") ? (
                <Plane className="w-6 h-6 text-primary" />
              ) : (
                <Train className="w-6 h-6 text-primary" />
              )}
              Travel Costs
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {cost?.source_to_destination_travel && (
                <Card className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {cost.source_to_destination_travel.from} → {cost.source_to_destination_travel.to}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cost.source_to_destination_travel.mode} • ₹{cost.source_to_destination_travel.cost_per_person}/person
                    </p>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    ₹{cost.source_to_destination_travel.total_cost}
                  </p>
                </Card>
              )}
              {cost?.return_travel && (
                <Card className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {cost.return_travel.from} → {cost.return_travel.to}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cost.return_travel.mode} (Return) • ₹{cost.return_travel.cost_per_person}/person
                    </p>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    ₹{cost.return_travel.total_cost}
                  </p>
                </Card>
              )}
            </div>
          </section>

          {/* Hotel Selection */}
          {!selectionComplete && currentCity && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Hotel className="w-6 h-6 text-primary" />
                  Select Hotel ({currentCityIndex + 1}/{totalCities})
                </h2>
                <span className="text-sm text-muted-foreground">
                  {currentCity.city} • {currentCity.nights} night{currentCity.nights > 1 ? "s" : ""}
                </span>
              </div>

              {/* Progress indicator */}
              <div className="flex gap-2">
                {hotelCities.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      idx < currentCityIndex
                        ? "bg-primary"
                        : idx === currentCityIndex
                        ? "bg-primary/60"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Hotel options */}
              <div className="grid gap-4">
                {currentCity.hotels.map((hotel) => {
                  const rooms = Math.ceil(passengers / hotel.room_capacity);
                  const total = rooms * hotel.cost_per_room_per_night * currentCity.nights;
                  const isSelected = selectedHotels[currentCity.city]?.hotel_id === hotel.hotel_id;

                  return (
                    <Card
                      key={hotel.hotel_id}
                      onClick={() => handleSelectHotel(hotel)}
                      className={`p-5 cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-foreground">
                              {hotel.hotel_name}
                            </h3>
                            {isSelected && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>₹{hotel.cost_per_room_per_night}/room/night</span>
                            <span>Capacity: {hotel.room_capacity} guests/room</span>
                            <span>Rooms needed: {rooms}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            for {currentCity.nights} night{currentCity.nights > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousCity}
                  disabled={currentCityIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous City
                </Button>
                <Button
                  onClick={handleNextCity}
                  disabled={!selectedHotels[currentCity.city]}
                >
                  {currentCityIndex === totalCities - 1 ? "Finish Selection" : "Next City"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </section>
          )}

          {/* Selected Hotels Summary */}
          {selectionComplete && Object.keys(selectedHotels).length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Hotel className="w-6 h-6 text-primary" />
                  Selected Hotels
                </h2>
                <Button variant="outline" size="sm" onClick={handleEditSelection}>
                  Edit Selection
                </Button>
              </div>

              <div className="grid gap-4">
                {Object.values(selectedHotels).map((hotel) => (
                  <Card key={hotel.city} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{hotel.hotel_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {hotel.city} • {hotel.nights} night{hotel.nights > 1 ? "s" : ""} • {hotel.rooms} room{hotel.rooms > 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      ₹{hotel.total_cost.toLocaleString()}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Final Cost Summary */}
          {selectionComplete && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <IndianRupee className="w-6 h-6 text-primary" />
                Trip Cost Summary
              </h2>

              <Card className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">Travel (Tickets)</span>
                    <span className="font-semibold">₹{travelCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">Hotels (All Cities)</span>
                    <span className="font-semibold">₹{hotelTotalCost.toLocaleString()}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Estimated Total Cost</span>
                    <span className="text-primary">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {totalBudget > 0 && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Budget</span>
                      <span className="font-semibold">₹{totalBudget.toLocaleString()}</span>
                    </div>
                    <div
                      className={`text-center py-2 rounded-lg font-semibold ${
                        isWithinBudget
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {isWithinBudget
                        ? `✓ Within Budget (₹${(totalBudget - grandTotal).toLocaleString()} remaining)`
                        : `✗ Exceeds Budget by ₹${(grandTotal - totalBudget).toLocaleString()}`}
                    </div>
                  </div>
                )}
              </Card>
            </section>
          )}

          {/* Back to Home */}
          <div className="text-center pt-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Generate New Itinerary
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
