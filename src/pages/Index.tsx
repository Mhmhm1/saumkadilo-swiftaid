
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Ambulance, ArrowRight, Clock, Cpu, Users } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 z-0"></div>
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center space-x-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium mb-6 animate-fade-in">
                <Ambulance className="h-4 w-4" />
                <span>Emergency Response Redefined</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
                Swift<span className="text-primary">Aid</span> LifeLine Dispatch System
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
                Optimizing emergency response through intelligent ambulance dispatch and patient prioritization
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
                {currentUser ? (
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link to={
                      currentUser.role === 'admin' 
                        ? '/admin' 
                        : currentUser.role === 'driver' 
                          ? '/driver' 
                          : '/dashboard'
                    }>
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link to="/register">
                        Register Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                      <Link to="/login">
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-10 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl"></div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-white/0 to-gray-50/80 dark:from-transparent dark:to-gray-900/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Key Features</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Our platform brings together technology and emergency response to save lives
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-6 rounded-xl hover-scale">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor ambulance locations in real-time and get accurate ETAs for emergency situations.
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-xl hover-scale">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Prioritization</h3>
                <p className="text-muted-foreground">
                  Smart algorithms analyze emergency details to ensure critical cases receive faster responses.
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-xl hover-scale">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Dispatch</h3>
                <p className="text-muted-foreground">
                  Efficiently assign the closest available ambulance to emergencies based on location and priority.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="glass-card p-8 rounded-xl border border-primary/20">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Emergency Response?</h2>
                <p className="text-muted-foreground mb-8">
                  Join us in our mission to reduce emergency response times and save more lives
                </p>
                <Button asChild size="lg">
                  <Link to={currentUser ? (
                    currentUser.role === 'admin' 
                      ? '/admin' 
                      : currentUser.role === 'driver' 
                        ? '/driver' 
                        : '/dashboard'
                  ) : '/register'}>
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Ambulance className="h-6 w-6 text-primary mr-2" />
              <span className="font-semibold text-xl">SwiftAid</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SwiftAid LifeLine. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
