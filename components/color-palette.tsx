export default function ColorPalette() {
  const colors = [
    { name: "Primary", color: "#E67E22", textColor: "white" },
    { name: "Primary Light", color: "#FF8C3F", textColor: "white" },
    { name: "Primary Dark", color: "#D35400", textColor: "white" },
    { name: "Secondary", color: "#0A95FF", textColor: "white" },
    { name: "Secondary Dark", color: "#005E8B", textColor: "white" },
    { name: "Background", color: "#F3F2EF", textColor: "black" },
    { name: "Text", color: "#191919", textColor: "white" },
    { name: "Text Light", color: "#666666", textColor: "white" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">ReLinkeder Color Palette</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {colors.map((color) => (
          <div key={color.name} className="rounded-lg overflow-hidden shadow-md">
            <div
              className="h-24 flex items-center justify-center"
              style={{ backgroundColor: color.color, color: color.textColor }}
            >
              <span className="font-medium">{color.name}</span>
            </div>
            <div className="bg-white p-3 text-center">
              <p className="text-sm font-mono">{color.color}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
