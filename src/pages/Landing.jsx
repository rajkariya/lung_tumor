import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Lung Tumor Detection</h1>
        <div>
          <Link to="/login">
            <Button className="mr-4">Login</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-primary text-white">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Purpose Section */}
      <main className="flex flex-col items-center justify-center flex-grow p-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Early Detection of Lung Tumors with AI
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl leading-relaxed">
          Our platform leverages cutting-edge artificial intelligence to assist in the early detection of lung tumors, ensuring timely diagnosis and better treatment outcomes.
        </p>
      </main>
    </div>
  );
};

export default Landing;