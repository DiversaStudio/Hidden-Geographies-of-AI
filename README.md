# Hidden Geographies of AI - Interactive Map

An interactive visualization of the global AI value chain, revealing the hidden geographies that make artificial intelligence possible.

## Features

- **Interactive map** showing 49+ critical sites across the global AI value chain
- **Layer controls** to toggle different categories:
  - 🔴 Mineral Extraction (cobalt, lithium, rare earth elements, nickel, copper, tin, bauxite)
  - 🔵 Digital Labor (data annotation, content moderation, platform work, BPO services)
  - 🟢 AI Research & Development (Silicon Valley, Beijing, London, Boston, Tel Aviv, Toronto)
  - 🟠 Data Centers (hyperscale, regional, and tropical facilities)
  - 🔴 Resource Flows (curved arrows showing mineral extraction → technology development)
  - 🔵 Digital Labor Flows (curved arrows showing labor → AI centers)

- **Dynamic markers** with sizes based on environmental impact, workforce, and production volumes
- **Interactive popups** with detailed site information including:
  - Production volumes and workforce data
  - Environmental impact scores (1-10 scale)
  - Human rights violations documentation
  - Key corporate actors and sources

## GitHub Pages Deployment

### Option 1: Direct GitHub Pages

1. Create a new repository on GitHub
2. Upload all files from the `InteractiveMap` folder to the repository
3. Go to repository Settings > Pages
4. Select "Deploy from a branch" and choose "main" branch
5. Your map will be available at `https://yourusername.github.io/repository-name`

### Option 2: Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Pages
        uses: actions/configure-pages@v3
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## Local Development

1. Clone the repository
2. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

## Data Sources

Based on comprehensive research by:
- **Andrés Domínguez Hernández** - The Alan Turing Institute
- **Diana Mosquera & Francisco Gallegos** - Diversa, Quito, Ecuador

### Primary Sources:
- Academic institutions (Stanford HAI, Harvard International Review)
- Investigative journalism (Global Witness, Human Rights Watch, Rest of World)
- International organizations (IEA, EU Commission, Amnesty International)
- Industry reports and company disclosures

## Research Methodology

This visualization employs **critical cartography** and **value chain analysis** to reveal the hidden geographies that make AI possible:

1. **Multi-source data integration** from authoritative sources
2. **Systematic documentation** of environmental and social impacts
3. **Geospatial visualization** revealing patterns of extraction and value concentration
4. **Global South perspective** centering voices from the margins of AI development

## Technology Stack

- **Leaflet.js** - Interactive mapping library
- **HTML/CSS/JavaScript** - Frontend technologies
- **GitHub Pages** - Static site hosting
- **CARTO Light basemap** - Academic-style map tiles

## Contributing

We welcome:
- Additional data points from underrepresented regions
- Corrections or updates to existing data
- Alternative visualization approaches
- Critical feedback on methodology

## License

```
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/
```

Data is provided for academic research, policy analysis, and advocacy purposes.

## Contact

**Diana Mosquera & Francisco Gallegos**  
***Diversa***  
📧 hello@diversa.studio

**Andrés Domínguez Hernández**  
***The Alan Turing Institute***  
📧 andresdominguez85@gmail.com

---

*This research aims to center Global South voices in AI governance discussions, document environmental and social costs of AI development, and support advocacy for more equitable technology policies.*