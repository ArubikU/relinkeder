import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-primary">About </span>
          <span className="text-secondary">ReLinkeder</span>
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-gray-600">
          Your ultimate AI assistant for creating professional and engaging LinkedIn content.
        </p>
      </div>

      {/* Introduction Guide */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold">Getting Started</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 text-xl font-semibold">What is ReLinkeder?</h3>
              <p className="mb-4 text-gray-600">
                ReLinkeder is a platform that uses advanced artificial intelligence to help you create
                professional, relevant LinkedIn posts with high engagement potential. Our technology
                analyzes your professional profile, interests, and industry trends to generate
                personalized content that resonates with your professional network.
              </p>
              <p className="text-gray-600">
                With ReLinkeder, you'll never run out of ideas for sharing valuable content on LinkedIn,
                saving you time and helping you maintain a consistent and professional presence on the platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 text-xl font-semibold">Key Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span> Save time by generating professional posts in seconds
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span> Increase your visibility and engagement on LinkedIn
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span> Create relevant content for your industry and audience
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span> Maintain a consistent presence with regular content
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span> Access multiple AI models for various content styles
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span> Receive engagement predictions to optimize your posts
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>      {/* How to Use ReLinkeder */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold">How to Use ReLinkeder</h2>
        
        <div className="mb-10 space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Set Up Your Professional Profile</h3>
                  <p className="mb-3 text-gray-600">
                    To get started, complete your professional profile with details about your career, industry, interests, and goals.
                    The more information you provide, the more personalized the posts we generate for you will be.
                  </p>
                  <div className="rounded-md bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">Tips for an Effective Profile:</h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-600">
                      <li>Be specific about your role and industry</li>
                      <li>Include your areas of expertise</li>
                      <li>Specify your preferred tone (professional, conversational, educational, etc.)</li>
                      <li>Mention topics relevant to your audience</li>
                      <li>Choose your preferred language for content generation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Add Reference Links</h3>
                  <p className="mb-3 text-gray-600">
                    To improve the relevance of generated content, add links to articles, blogs, news, or resources
                    related to your industry. Our system will analyze these links to identify current and relevant
                    topics for your audience.
                  </p>
                  <div className="rounded-md bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">Examples of Useful Links:</h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-600">
                      <li>Industry news articles</li>
                      <li>Relevant blog posts</li>
                      <li>Research reports and studies</li>
                      <li>Content from thought leaders in your field</li>
                      <li>Industry trends and analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Generate & Select Content</h3>
                  <p className="mb-3 text-gray-600">
                    With your profile set up and reference links added, you can begin generating posts. ReLinkeder will offer
                    you multiple variations for each topic, along with engagement predictions for each one.
                  </p>
                  <div className="rounded-md bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">Generation Process:</h4>
                    <ol className="list-inside list-decimal space-y-1 text-gray-600">
                      <li>Select your preferred AI model (Cohere, OpenAI, Mistral, DeepSeek, or Gemini)</li>
                      <li>Indicate any specific topic or focus (optional)</li>
                      <li>Add extra instructions for customization</li>
                      <li>Review the different generated variations</li>
                      <li>Edit the content as needed</li>
                      <li>Save your favorite posts for future use</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl font-bold">4</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Share on LinkedIn</h3>
                  <p className="mb-3 text-gray-600">
                    Once you've selected or edited your ideal post, you can share it directly to LinkedIn
                    from our platform, or copy it to schedule it later.
                  </p>
                  <div className="rounded-md bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">Optimize Posting Time:</h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-600">
                      <li>Post timely content quickly for maximum relevance</li>
                      <li>Schedule regular posts to maintain a consistent presence</li>
                      <li>Consider your audience's peak activity hours</li>
                      <li>Use our metrics to identify the best times to post</li>
                      <li>Analyze engagement patterns to refine your posting strategy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>      {/* Advanced Features */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold">Advanced Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Chain of Thought</h3>
              <p className="text-gray-600">
                Our AI uses a "chain of thought" model that develops ideas logically and structurally,
                creating more thoughtful and compelling content than other automated generators.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Topic Memory</h3>
              <p className="text-gray-600">
                The system remembers topics you've already posted about, avoiding repetition and ensuring that your
                content is always fresh and varied to maintain your audience's interest.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Multiple AI Models</h3>
              <p className="text-gray-600">
                Choose from different AI models including Cohere, OpenAI, Mistral, DeepSeek, and Gemini, 
                each with their own strengths and styles, to find the perfect fit for your professional voice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Engagement Predictions</h3>
              <p className="text-gray-600">
                Each generated post includes an engagement prediction based on analysis of historical data
                and interaction patterns on LinkedIn for your specific industry.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Advanced Customization</h3>
              <p className="text-gray-600">
                Adjust parameters like length, tone, formality level, and topic focus to create
                posts that perfectly align with your goals and personal brand.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Content Analytics</h3>
              <p className="text-gray-600">
                Get insights into which types of posts generate the most engagement on your profile,
                allowing you to refine your content strategy over time.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>      {/* FAQ */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Is the generated content unique?</h3>
              <p className="text-gray-600">
                Yes, all generated content is unique and personalized based on your profile, reference links, and preferences.
                Our models are designed to avoid repetition and plagiarism, ensuring that your posts are
                original and authentic.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Can I edit the generated posts?</h3>
              <p className="text-gray-600">
                Absolutely. While our system generates high-quality content, you always have the option to edit
                any post before sharing it, adding your personal touch or adjusting specific details.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">How often should I post?</h3>
              <p className="text-gray-600">
                For most professionals, 2-3 posts per week is a good balance to maintain
                visibility without overwhelming your audience. ReLinkeder allows you to generate and schedule posts in advance
                to maintain a consistent cadence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Do I need technical knowledge to use ReLinkeder?</h3>
              <p className="text-gray-600">
                No, ReLinkeder is designed to be intuitive and easy to use. No technical knowledge
                or writing experience is required. Our interface will guide you through each step of the process.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Which AI models does ReLinkeder support?</h3>
              <p className="text-gray-600">
                ReLinkeder supports multiple leading AI models including Cohere (Command, Command Light, Command R, Command R+), 
                OpenAI (GPT-3.5 Turbo, GPT-4), Mistral (Mistral 7B, Mixtral 8x7B), DeepSeek (DeepSeek Chat), and Gemini. 
                You'll need to provide your own API keys in the profile settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">What languages are supported?</h3>
              <p className="text-gray-600">
                ReLinkeder supports multiple languages for content generation. You can select your preferred language in your 
                profile settings, and the AI will generate content in that language. The interface and all features are fully 
                accessible regardless of your chosen content language.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>      {/* CTA */}
      <section>
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary-light p-8 text-center md:p-12">
          <h2 className="mb-4 text-3xl font-bold">Ready to transform your LinkedIn presence?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Join professionals who are already using ReLinkeder to increase their visibility,
            establish themselves as industry references, and generate new professional opportunities.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full border-white bg-white text-primary hover:bg-primary-light"
            >
              <Link href="/dashboard">Get Started Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white bg-white text-primary hover:bg-primary-light"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
