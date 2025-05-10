export default function ColorsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">ReLinkeder Color Palette</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ColorSwatch name="Primary" hex="#E67E22" />
        <ColorSwatch name="Primary Light" hex="#FF8C3F" />
        <ColorSwatch name="Primary Dark" hex="#D35400" />
        <ColorSwatch name="Secondary" hex="#0A95FF" />
        <ColorSwatch name="Secondary Dark" hex="#005E8B" />
        <ColorSwatch name="Background" hex="#F3F2EF" />
        <ColorSwatch name="Text" hex="#191919" />
        <ColorSwatch name="Text Light" hex="#666666" />
      </div>
    </div>
  )
}

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="h-32 w-full" style={{ backgroundColor: hex }}></div>
      <div className="p-4">
        <h3 className="font-medium">{name}</h3>
        <p className="text-gray-600">{hex}</p>
      </div>
    </div>
  )
}
