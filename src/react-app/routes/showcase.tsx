import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@/components/ui/container'
import { Heading, SubHeading } from '@/components/ui/heading'
import { EnhancedBadge } from '@/components/ui/enhanced-badge'
import { Button } from '@/components/ui/button'
import { DivideX } from '@/components/ui/divide'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MeshGradient } from '@/components/ui/mesh-gradient'

export const Route = createFileRoute('/showcase')({
  component: ShowcaseComponent,
})

function ShowcaseComponent() {
  return (
    <div className="h-full flex flex-col overflow-auto bg-background">
      {/* Hero Section with Mesh Gradient */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <MeshGradient className="absolute inset-0 opacity-30" />
        <Container className="relative flex flex-col items-center justify-center h-full px-4 pt-20 pb-10">
          <EnhancedBadge text="New Design System" />
          <Heading className="mt-4">
            Beautiful UI <br />
            <span className="text-brand">Components</span>
          </Heading>
          <SubHeading className="mx-auto mt-6 max-w-lg">
            Inspired by modern design patterns with smooth animations and elegant styling
          </SubHeading>
          <div className="mt-6 flex items-center gap-4">
            <Button>Get Started</Button>
            <Button variant="secondary">View Components</Button>
            <Button variant="brand">Try Now</Button>
          </div>
        </Container>
      </div>

      <DivideX />

      {/* Components Section */}
      <Container className="py-20 px-4">
        <div className="text-center mb-12">
          <Heading as="h2" className="text-3xl mb-4">
            Component Showcase
          </Heading>
          <SubHeading>
            Explore the available UI components from the design system
          </SubHeading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">Default</Button>
              <Button variant="secondary" className="w-full">Secondary</Button>
              <Button variant="brand" className="w-full">Brand</Button>
              <Button variant="outline" className="w-full">Outline</Button>
              <Button variant="ghost" className="w-full">Ghost</Button>
            </CardContent>
          </Card>

          {/* Button Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="sm" className="w-full">Small</Button>
              <Button size="default" className="w-full">Default</Button>
              <Button size="lg" className="w-full">Large</Button>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Heading as="h3" className="text-xl">Heading 3</Heading>
              </div>
              <div>
                <Heading as="h4" className="text-lg">Heading 4</Heading>
              </div>
              <div>
                <SubHeading className="text-left">Subheading text with secondary styling</SubHeading>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Badge</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <EnhancedBadge text="Shimmer Effect" />
              <EnhancedBadge text="Animated" />
              <EnhancedBadge text="Brand Color" />
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <div className="h-12 rounded-lg bg-brand flex items-center justify-center text-white text-xs">Brand</div>
              <div className="h-12 rounded-lg bg-charcoal-900 flex items-center justify-center text-white text-xs">Charcoal</div>
              <div className="h-12 rounded-lg bg-gray-400 flex items-center justify-center text-black text-xs">Gray</div>
            </CardContent>
          </Card>

          {/* Container Example */}
          <Card>
            <CardHeader>
              <CardTitle>Container</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Centered container with max-width constraints
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>

      <DivideX />

      {/* Footer Section */}
      <div className="border-t bg-muted py-16">
        <Container className="text-center">
          <Heading as="h2" className="text-3xl mb-4">
            Ready to build?
          </Heading>
          <SubHeading className="mb-8">
            Start using these components in your project today
          </SubHeading>
          <Button variant="brand" size="lg">
            Get Started
          </Button>
        </Container>
      </div>
    </div>
  )
}
