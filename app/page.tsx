import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-16 flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex items-center justify-center">
          <Logo width={60} height={60} />
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-primary">Re</span>
          <span className="text-secondary">Linkeder</span>
        </h1>
        <p className="mb-8 max-w-2xl text-xl text-gray-600">
          Generate engaging relinkeder posts with AI. Boost your professional presence with content that resonates with
          your network.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button asChild size="lg" className="rounded-full hover:bg-primary-light">
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full hover:bg-primary-light">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-10 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="relinkeder-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium">1. Set Up Your Profile</h3>
              <p className="text-gray-600">
                Enter your career details, interests, and professional ideals to personalize your content.
              </p>
            </CardContent>
          </Card>
          <Card className="relinkeder-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium">2. Add Reference Links</h3>
              <p className="text-gray-600">
                Provide links to articles and resources that will help generate relevant topics for your industry.
              </p>
            </CardContent>
          </Card>
          <Card className="relinkeder-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium">3. Generate & Share</h3>
              <p className="text-gray-600">
                Get AI-generated post variations with engagement predictions, then share directly to LinkedIn.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary-light p-8  md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to elevate your LinkedIn presence?</h2>
            <p className="mb-8 text-lg">
              Join professionals who are using ReLinkeder to boost their engagement and grow their network.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full bg-white text-primary hover:bg-gray-100"
            >
              <Link href="/dashboard">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-2xl font-bold">Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relinkeder-card">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-medium">Chain of Thought</h3>
              <p className="text-gray-600">
                Our AI uses step-by-step reasoning to create more thoughtful and engaging content.
              </p>
            </CardContent>
          </Card>

          <Card className="relinkeder-card">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-medium">Topic Memory</h3>
              <p className="text-gray-600">
                We remember previously generated topics to ensure fresh content every time.
              </p>
            </CardContent>
          </Card>

          <Card className="relinkeder-card">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-medium">Multiple AI Models</h3>
              <p className="text-gray-600">
                Choose from different AI models to find the perfect fit for your content style.
              </p>
            </CardContent>
          </Card>

          <Card className="relinkeder-card">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-medium">Reference Links</h3>
              <p className="text-gray-600">
                Add links to articles and resources to generate more relevant and timely content.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
