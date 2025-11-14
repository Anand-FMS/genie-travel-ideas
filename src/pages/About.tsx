import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Globe, Sparkles, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">About TripGenie</h1>
              <p className="text-xl text-muted-foreground">
                Your AI-powered travel companion for unforgettable journeys
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 space-y-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Advanced AI technology creates personalized itineraries tailored to your preferences
                </p>
              </Card>

              <Card className="p-6 space-y-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Global Coverage</h3>
                <p className="text-muted-foreground">
                  Plan trips to destinations around the world with local insights and recommendations
                </p>
              </Card>

              <Card className="p-6 space-y-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Personalized</h3>
                <p className="text-muted-foreground">
                  Every itinerary is unique, matching your budget, interests, and travel style
                </p>
              </Card>
            </div>

            <Card className="p-8 space-y-4">
              <h2 className="text-2xl font-bold">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At TripGenie, we believe that planning your dream vacation should be as exciting as the trip itself. 
                Our AI-powered platform takes the stress out of travel planning by creating customized itineraries 
                that perfectly match your preferences, budget, and interests. Whether you're seeking adventure, 
                relaxation, culture, or culinary experiences, TripGenie crafts the perfect journey for you.
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
