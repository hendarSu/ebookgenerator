"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Book, ChevronRight, Feather, Globe, BookOpen, ArrowRight, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { LandingNavbar } from "@/components/landing-navbar"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // If authenticated, redirect to projects
    if (isAuthenticated) {
      router.push("/projects")
    }
  }, [isAuthenticated, router])

  // Show nothing during initial SSR to avoid hydration mismatch
  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-br from-white to-sky-50 dark:from-gray-900 dark:to-sky-950"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Create and Share Knowledge with Interactive Ebooks
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
                Transform your ideas into beautiful, interactive ebooks with AI assistance. Share your expertise with
                the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                  onClick={() => router.push("/login")}
                >
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push("/explore")}>
                  Explore Ebooks
                </Button>
              </div>
            </div>
            <div className="relative hidden sm:block">
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="Ebook creation platform"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                {/* Floating stats */}
                <div className="absolute top-8 left-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col items-center">
                  <span className="text-3xl font-bold">1000+</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Authors</span>
                </div>
                <div className="absolute bottom-8 right-8 bg-sky-500/90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col items-center text-white">
                  <span className="text-3xl font-bold">5.2K</span>
                  <span className="text-sm">Ebooks Created</span>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-200 dark:bg-sky-900/30 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-50 blur-3xl"></div>
            </div>
          </div>
        </div>
        {/* Curved decorative lines */}
        <div className="absolute top-1/4 right-0 w-1/3 h-64 pointer-events-none hidden lg:block">
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-sky-100 dark:text-sky-900/20"
          >
            <path fill="currentColor" d="M40,90 Q100,20 160,90 Q100,160 40,90 Z" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Why Choose Sharebook?</h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform provides everything you need to create, publish, and share your knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mb-4">
                <Feather className="h-6 w-6 text-sky-500 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Writing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get intelligent suggestions and assistance while writing your content
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-sky-500 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create engaging ebooks with rich media, videos, and interactive elements
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-sky-500 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Sharing</h3>
              <p className="text-gray-600 dark:text-gray-300">Share your knowledge with readers around the world</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Creating and sharing your ebooks is simple with our intuitive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="relative pl-8 md:pl-0 md:text-center">
              <div className="absolute -left-4 top-0 md:left-1/2 md:-translate-x-1/2 md:-top-12 w-8 h-8 bg-sky-500 dark:bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="md:pt-4">
                <h3 className="text-xl font-semibold mb-2">Create Your Project</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Start by creating a new project and defining your ebook's structure
                </p>
              </div>
            </div>

            <div className="relative pl-8 md:pl-0 md:text-center">
              <div className="absolute -left-4 top-0 md:left-1/2 md:-translate-x-1/2 md:-top-12 w-8 h-8 bg-sky-500 dark:bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="md:pt-4">
                <h3 className="text-xl font-semibold mb-2">Write with AI Assistance</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use our AI-powered editor to write and refine your content
                </p>
              </div>
            </div>

            <div className="relative pl-8 md:pl-0 md:text-center">
              <div className="absolute -left-4 top-0 md:left-1/2 md:-translate-x-1/2 md:-top-12 w-8 h-8 bg-sky-500 dark:bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="md:pt-4">
                <h3 className="text-xl font-semibold mb-2">Publish and Share</h3>
                <p className="text-gray-600 dark:text-gray-300">Publish your ebook and share it with your audience</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button
              size="lg"
              className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
              onClick={() => router.push("/login")}
            >
              Start Creating Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of authors who have transformed their ideas into beautiful ebooks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-200 dark:bg-sky-900/30 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Author of "Digital Marketing Essentials"</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "Sharebook made it incredibly easy to transform my knowledge into a professional ebook. The AI assistant
                helped me refine my ideas and create engaging content."
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-200 dark:bg-sky-900/30 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Author of "Coding for Beginners"</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "I was able to create an interactive programming guide with code examples and explanations. My readers
                love the format and accessibility."
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-sky-200 dark:bg-sky-900/30 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Elena Rodriguez</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Author of "Sustainable Living"</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The platform's features allowed me to include videos and interactive elements that brought my
                sustainable living guide to life."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-sky-500 dark:bg-sky-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Ready to Share Your Knowledge?</h2>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Join our community of authors and start creating your ebook today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => router.push("/login")}>
              Sign Up Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              onClick={() => router.push("/explore")}
            >
              Explore Ebooks
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Book className="h-6 w-6 mr-2 text-sky-400" />
              <span className="font-bold text-lg">Sharebook</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/explore" className="text-gray-300 hover:text-white">
                Explore
              </Link>
              <a href="#" className="text-gray-300 hover:text-white">
                About
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                Terms
              </a>
              <a
                href="https://saweria.co/minipos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-rose-400 hover:text-rose-300"
              >
                <Heart className="h-4 w-4 mr-1" />
                Support
              </a>
            </div>
          </div>
          <div className="mt-6 text-center md:text-left text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Sharebook. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
