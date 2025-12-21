// src/pages/ItineraryForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Heart, Calendar } from "lucide-react";

const interestsList = [
  "Adventure",
  "Beaches",
  "Food",
  "Culture",
  "History",
  "Nature",
  "Nightlife",
];

const ItineraryForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    fromDate: "",
    toDate: "",
    interests: [] as string[],
  });

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        destination: formData.destination,
        budget: formData.budget,
        start_date: formData.fromDate,
        end_date: formData.toDate,
        interests: formData.interests,
      };

      const response = await fetch(
        "https://nonformative-unsatisfied-fawn.ngrok-free.dev/webhook/tripgenie-webhook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Invalid response from server");

      const data = await response.json();

      console.log("Webhook response:", data);

      sessionStorage.setItem("itineraryData", JSON.stringify(payload));
      sessionStorage.setItem("generatedItinerary", JSON.stringify(data));

      setIsLoading(false); // ✅ IMPORTANT
      navigate("/results");
    } catch (error) {
      console.error("Error generating itinerary:", error);
      alert("Could not connect to server — check n8n.");
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto p-8 shadow-lg relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 rounded-lg flex flex-col items-center justify-center gap-6">
              <p className="text-lg font-semibold">
                Generating your personalized itinerary…
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <Label>Destination</Label>
              <Input
                value={formData.destination}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, destination: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label>Budget</Label>
              <Select
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, budget: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={formData.fromDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fromDate: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={formData.toDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, toDate: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label>Interests</Label>
              <div className="grid grid-cols-2 gap-3">
                {interestsList.map((interest) => (
                  <div key={interest} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={() =>
                        handleInterestToggle(interest)
                      }
                    />
                    <span>{interest}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              Generate Itinerary
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default ItineraryForm;

