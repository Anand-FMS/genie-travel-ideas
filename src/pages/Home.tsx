import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ItineraryForm from "@/components/ItineraryForm";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ItineraryForm />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
