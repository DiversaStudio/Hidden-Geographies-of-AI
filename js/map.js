// Import data (Note: In a real deployment, you'd use ES6 modules or include data.js separately)
// For now, we'll include the data directly or load it via script tag

// Global variables
let map;
let layerGroups = {
    mineral_extraction: L.layerGroup(),
    digital_labor: L.layerGroup(),
    ai_research: L.layerGroup(),
    data_centers: L.layerGroup(),
    resource_flows: L.layerGroup(),
    labor_flows: L.layerGroup()
};

// Color scheme matching the original visualization
const colorScheme = {
    'mineral_extraction': '#d32f2f',    // Deep red - extraction/exploitation
    'digital_labor': '#1976d2',        // Blue - labor/workers
    'ai_research': '#388e3c',          // Green - research/development
    'data_centers': '#f57c00',         // Orange - infrastructure
    'environmental_impact': '#795548'   // Brown - environmental
};

// Global South countries classification
const globalSouthCountries = [
    'Democratic Republic of Congo', 'Bolivia', 'Chile', 'Myanmar', 'Indonesia',
    'India', 'Philippines', 'Kenya', 'Venezuela', 'Brazil', 'South Africa',
    'Argentina', 'Peru', 'Madagascar', 'Papua New Guinea', 'Guinea'
];

// Flow definitions for arrows
const flowDefinitions = {
    resource_flows: [
        // DRC Cobalt → Silicon Valley
        { start: [25.5, -10.7], end: [-122.1, 37.4], weight: 3, label: 'Cobalt' },
        // Lithium Triangle → Silicon Valley  
        { start: [-67.49, -20.13], end: [-122.1, 37.4], weight: 3, label: 'Lithium' },
        // Chilean Copper → Boston
        { start: [-69.1, -24.3], end: [-71.1, 42.4], weight: 2, label: 'Copper' },
        // Indonesian Nickel → Beijing
        { start: [121.3742, -2.5736], end: [116.4, 39.9], weight: 2, label: 'Nickel' },
        // Philippines Nickel → Silicon Valley
        { start: [117.4189, 8.57], end: [-122.1, 37.4], weight: 2, label: 'Nickel' },
        // Russian Nickel → London
        { start: [88.2167, 69.3333], end: [-0.1, 51.5], weight: 2, label: 'Nickel' },
        // Bayan Obo Rare Earth → Beijing
        { start: [109.9, 41.8], end: [116.4, 39.9], weight: 5, label: 'Rare Earth Hub' },
        // Bayan Obo → Silicon Valley
        { start: [109.9, 41.8], end: [-122.1, 37.4], weight: 5, label: 'Rare Earth Hub' },
        // Bayan Obo → London
        { start: [109.9, 41.8], end: [-0.1, 51.5], weight: 5, label: 'Rare Earth Hub' },
        // Myanmar Rare Earth → Beijing
        { start: [98.0, 25.0], end: [116.4, 39.9], weight: 3, label: 'Rare Earth' }
    ],
    
    labor_flows: [
        // Bangalore → Silicon Valley
        { start: [77.6, 12.97], end: [-122.1, 37.4], weight: 2, label: 'Data Annotation' },
        // Manila → Silicon Valley
        { start: [121.0, 14.6], end: [-122.1, 37.4], weight: 2, label: 'Content Moderation' },
        // Nairobi → London
        { start: [36.82, -1.29], end: [-0.1, 51.5], weight: 2, label: 'Content Moderation' },
        // São Paulo → Toronto
        { start: [-46.6, -23.5], end: [-79.4, 43.7], weight: 1, label: 'BPO Services' },
        // Cape Town → London
        { start: [18.4, -33.9], end: [-0.1, 51.5], weight: 1, label: 'BPO Services' },
        // Caracas → Silicon Valley
        { start: [-66.9, 10.5], end: [-122.1, 37.4], weight: 1, label: 'Platform Work' }
    ]
};

// Initialize the map
function initMap() {
    // Create map with a global view
    map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
    });

    // Add tile layer with academic/neutral styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add all layer groups to map
    Object.values(layerGroups).forEach(layerGroup => {
        layerGroup.addTo(map);
    });

    // Load and process data
    loadData();
    
    // Setup legend controls
    setupLegendControls();
    
    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';
}

// Load and process the AI value chain data
async function loadData() {
    try {
        // In a real deployment, you'd fetch this data
        // For now, we'll use the embedded data
        const data = await getAIValueChainData();
        
        // Create markers for each site
        data.forEach(site => {
            if (site.category !== 'environmental_impact' && site.country !== 'Global') {
                createSiteMarker(site);
            }
        });
        
        // Create flow arrows
        createFlowArrows();
        
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Get marker size based on site data
function getMarkerSize(site) {
    const baseSize = 8;
    
    switch (site.category) {
        case 'mineral_extraction':
            // Size based on environmental impact score
            const envScore = site.environmental_impact_score || 5;
            const materialBonus = ['nickel', 'lithium', 'rare_earth', 'cobalt'].includes(site.subcategory) ? 3 : 0;
            return baseSize + (envScore * 1.5) + materialBonus;
            
        case 'digital_labor':
            // Size based on workforce
            if (site.workforce_size) {
                return baseSize + Math.min(site.workforce_size / 20000, 8);
            }
            return baseSize + 3;
            
        case 'ai_research':
            // Size based on wages (proxy for value concentration)
            if (site.avg_wage_usd_monthly) {
                return baseSize + Math.min(site.avg_wage_usd_monthly / 2000, 10);
            }
            return baseSize + 6;
            
        case 'data_centers':
            // Size based on capacity
            return baseSize + 5;
            
        default:
            return baseSize;
    }
}

// Create marker for individual site
function createSiteMarker(site) {
    const lat = site.latitude;
    const lng = site.longitude;
    const category = site.category;
    const color = colorScheme[category];
    const size = getMarkerSize(site);
    
    // Determine if site is in Global South
    const isGlobalSouth = globalSouthCountries.includes(site.country);
    const regionType = isGlobalSouth ? 'Global South' : 'Global North';
    
    // Create custom marker
    const marker = L.circleMarker([lat, lng], {
        radius: size,
        fillColor: color,
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    });
    
    // Create popup content
    const popupContent = createPopupContent(site, regionType);
    marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
    });
    
    // Add to appropriate layer group
    layerGroups[category].addLayer(marker);
}

// Create popup content
function createPopupContent(site, regionType) {
    const formatNumber = (num) => {
        if (!num) return 'N/A';
        return new Intl.NumberFormat().format(num);
    };
    
    const formatCurrency = (num) => {
        if (!num) return 'N/A';
        return `$${formatNumber(num)}`;
    };
    
    let content = `
        <div class="popup-header">${site.site_name}</div>
        <div class="popup-details">
            <strong>Location:</strong> ${site.country}, ${site.region}<br>
            <strong>Region Type:</strong> ${regionType}<br>
            <strong>Category:</strong> ${site.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}<br>
            <strong>Subcategory:</strong> ${site.subcategory || 'N/A'}<br>
    `;
    
    if (site.production_volume) {
        content += `<strong>Production:</strong> ${formatNumber(site.production_volume)} ${site.production_unit || ''}<br>`;
    }
    
    if (site.workforce_size) {
        content += `<strong>Workforce:</strong> ${formatNumber(site.workforce_size)} workers<br>`;
    }
    
    if (site.avg_wage_usd_monthly) {
        content += `<strong>Avg. Monthly Wage:</strong> ${formatCurrency(site.avg_wage_usd_monthly)}<br>`;
    }
    
    if (site.environmental_impact_score) {
        content += `<strong>Environmental Impact:</strong> ${site.environmental_impact_score}/10<br>`;
    }
    
    if (site.human_rights_violations && site.human_rights_violations !== 'none_reported') {
        content += `<strong>Human Rights Issues:</strong> ${site.human_rights_violations.replace(/_/g, ', ')}<br>`;
    }
    
    if (site.key_companies) {
        content += `<strong>Key Companies:</strong> ${site.key_companies}<br>`;
    }
    
    content += `<strong>Data Year:</strong> ${site.data_year}<br>`;
    content += `<strong>Source:</strong> ${site.source_authors}`;
    content += '</div>';
    
    return content;
}

// Create curved flow arrows
function createFlowArrows() {
    // Resource flows (red arrows)
    flowDefinitions.resource_flows.forEach(flow => {
        createCurvedArrow(
            flow.start, 
            flow.end, 
            colorScheme.mineral_extraction,
            flow.weight,
            layerGroups.resource_flows,
            flow.label
        );
    });
    
    // Labor flows (blue arrows)
    flowDefinitions.labor_flows.forEach(flow => {
        createCurvedArrow(
            flow.start, 
            flow.end, 
            colorScheme.digital_labor,
            flow.weight,
            layerGroups.labor_flows,
            flow.label
        );
    });
}

// Create individual curved arrow
function createCurvedArrow(start, end, color, weight, layerGroup, label) {
    const startLatLng = [start[1], start[0]]; // Note: [lat, lng] format
    const endLatLng = [end[1], end[0]];
    
    // Calculate midpoint for curve
    const midLat = (startLatLng[0] + endLatLng[0]) / 2;
    const midLng = (startLatLng[1] + endLatLng[1]) / 2;
    
    // Create curve control point (offset perpendicular to line)
    const dx = endLatLng[1] - startLatLng[1];
    const dy = endLatLng[0] - startLatLng[0];
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    // Offset for curve (20% of distance)
    const offsetFactor = 0.2;
    const perpX = -dy / distance * distance * offsetFactor;
    const perpY = dx / distance * distance * offsetFactor;
    
    const controlPoint = [midLat + perpY, midLng + perpX];
    
    // Create curved polyline using quadratic bezier approximation
    const curvePoints = createBezierCurve(startLatLng, controlPoint, endLatLng, 50);
    
    const polyline = L.polyline(curvePoints, {
        color: color,
        weight: Math.max(2, weight),
        opacity: 0.7,
        dashArray: null
    });
    
    // Add arrow head (simplified)
    const arrowHead = createArrowHead(endLatLng, startLatLng, color);
    
    // Bind popup to arrow
    const popupContent = `<strong>${label} Flow</strong><br>From: ${getLocationName(start)}<br>To: ${getLocationName(end)}`;
    polyline.bindPopup(popupContent);
    
    layerGroup.addLayer(polyline);
    if (arrowHead) layerGroup.addLayer(arrowHead);
}

// Create bezier curve points
function createBezierCurve(start, control, end, numPoints) {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const lat = Math.pow(1-t, 2) * start[0] + 2 * (1-t) * t * control[0] + Math.pow(t, 2) * end[0];
        const lng = Math.pow(1-t, 2) * start[1] + 2 * (1-t) * t * control[1] + Math.pow(t, 2) * end[1];
        points.push([lat, lng]);
    }
    return points;
}

// Create arrow head marker
function createArrowHead(endPoint, startPoint, color) {
    // Calculate arrow direction
    const angle = Math.atan2(endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]);
    
    return L.circleMarker(endPoint, {
        radius: 4,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.8
    });
}

// Get location name from coordinates (simplified)
function getLocationName(coords) {
    // This is a simplified version - in practice you'd have a lookup table
    // or reverse geocoding service
    const locations = {
        '25.5,-10.7': 'DRC (Kolwezi)',
        '-67.49,-20.13': 'Bolivia (Salar de Uyuni)',
        '-122.1,37.4': 'Silicon Valley',
        '77.6,12.97': 'Bangalore',
        '36.82,-1.29': 'Nairobi',
        '-0.1,51.5': 'London'
    };
    
    const key = `${coords[0]},${coords[1]}`;
    return locations[key] || 'Unknown Location';
}

// Setup legend controls
function setupLegendControls() {
    const legendItems = document.querySelectorAll('.legend-item');
    
    legendItems.forEach(item => {
        const checkbox = item.querySelector('.toggle-checkbox');
        const layerName = item.dataset.layer;
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                layerGroups[layerName].addTo(map);
                item.classList.remove('disabled');
            } else {
                map.removeLayer(layerGroups[layerName]);
                item.classList.add('disabled');
            }
        });
        
        // Click on legend item to toggle
        item.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    });
}

// Embedded data (in a real deployment, this would be loaded from data.js or API)
function getAIValueChainData() {
    return Promise.resolve([
        {
            site_id: 1,
            site_name: "Tenke Fungurume Mine",
            country: "Democratic Republic of Congo",
            region: "Central Africa",
            category: "mineral_extraction",
            subcategory: "cobalt",
            latitude: -10.7,
            longitude: 26.1,
            production_volume: 28500,
            production_unit: "MT_annual",
            workforce_size: 15000,
            avg_wage_usd_monthly: 60,
            environmental_impact_score: 9,
            human_rights_violations: "child_labor",
            key_companies: "China Molybdenum",
            source_authors: "Crawford, RAID",
            data_year: 2023
        },
        {
            site_id: 2,
            site_name: "Kolwezi Mining District",
            country: "Democratic Republic of Congo",
            region: "Central Africa",
            category: "mineral_extraction",
            subcategory: "cobalt",
            latitude: -10.7,
            longitude: 25.5,
            production_volume: 84000,
            production_unit: "MT_annual_district",
            workforce_size: 40000,
            avg_wage_usd_monthly: 50,
            environmental_impact_score: 10,
            human_rights_violations: "child_labor_water_contamination",
            key_companies: "Glencore, Eurasian Resources",
            source_authors: "Crawford, Kara",
            data_year: 2024
        },
        {
            site_id: 5,
            site_name: "Salar de Uyuni",
            country: "Bolivia",
            region: "South America",
            category: "mineral_extraction",
            subcategory: "lithium",
            latitude: -20.13,
            longitude: -67.49,
            production_volume: 23000000,
            production_unit: "MT_reserves",
            workforce_size: 2000,
            avg_wage_usd_monthly: 800,
            environmental_impact_score: 7,
            human_rights_violations: "indigenous_displacement",
            key_companies: "YLB, Lilac Solutions",
            source_authors: "Harvard IRR, Human Rights Pulse",
            data_year: 2024
        },
        {
            site_id: 7,
            site_name: "Bayan Obo Mine",
            country: "China",
            region: "Asia",
            category: "mineral_extraction",
            subcategory: "rare_earth",
            latitude: 41.8,
            longitude: 109.9,
            production_volume: 45000,
            production_unit: "MT_annual",
            workforce_size: 25000,
            avg_wage_usd_monthly: 400,
            environmental_impact_score: 10,
            human_rights_violations: "radioactive_contamination",
            key_companies: "China Northern Rare Earth",
            source_authors: "Harvard IRR, IPS",
            data_year: 2024
        },
        {
            site_id: 8,
            site_name: "Myanmar Kachin State",
            country: "Myanmar",
            region: "Asia",
            category: "mineral_extraction",
            subcategory: "rare_earth",
            latitude: 25.0,
            longitude: 98.0,
            production_volume: 31000,
            production_unit: "MT_annual",
            workforce_size: 50000,
            avg_wage_usd_monthly: 150,
            environmental_impact_score: 10,
            human_rights_violations: "toxic_exposure_death",
            key_companies: "Military Junta",
            source_authors: "Global Witness",
            data_year: 2024
        },
        {
            site_id: 11,
            site_name: "Bangalore",
            country: "India",
            region: "Asia",
            category: "digital_labor",
            subcategory: "data_annotation",
            latitude: 12.97,
            longitude: 77.6,
            production_volume: null,
            production_unit: "workers",
            workforce_size: 250000,
            avg_wage_usd_monthly: 350,
            environmental_impact_score: 1,
            human_rights_violations: "platform_exploitation",
            key_companies: "Amazon, iMerit, Clickworker",
            source_authors: "Gray & Suri, Fairwork",
            data_year: 2024
        },
        {
            site_id: 12,
            site_name: "Manila",
            country: "Philippines",
            region: "Asia",
            category: "digital_labor",
            subcategory: "data_annotation",
            latitude: 14.6,
            longitude: 121.0,
            production_volume: null,
            production_unit: "workers",
            workforce_size: 150000,
            avg_wage_usd_monthly: 200,
            environmental_impact_score: 2,
            human_rights_violations: "wage_theft",
            key_companies: "Scale AI, Remotasks",
            source_authors: "Washington Post, Rest of World",
            data_year: 2024
        },
        {
            site_id: 13,
            site_name: "Nairobi",
            country: "Kenya",
            region: "Africa",
            category: "digital_labor",
            subcategory: "content_moderation",
            latitude: -1.29,
            longitude: 36.82,
            production_volume: null,
            production_unit: "workers",
            workforce_size: 40000,
            avg_wage_usd_monthly: 65,
            environmental_impact_score: 3,
            human_rights_violations: "mental_health_trauma",
            key_companies: "Sama, Meta subcontractors",
            source_authors: "CBS News, 60 Minutes",
            data_year: 2024
        },
        {
            site_id: 17,
            site_name: "Silicon Valley",
            country: "United States",
            region: "North America",
            category: "ai_research",
            subcategory: "development",
            latitude: 37.4,
            longitude: -122.1,
            production_volume: null,
            production_unit: "workers",
            workforce_size: 500000,
            avg_wage_usd_monthly: 18000,
            environmental_impact_score: 1,
            human_rights_violations: "concentration_of_power",
            key_companies: "Google, Meta, OpenAI",
            source_authors: "Stanford HAI",
            data_year: 2024
        },
        {
            site_id: 18,
            site_name: "Boston",
            country: "United States",
            region: "North America",
            category: "ai_research",
            subcategory: "development",
            latitude: 42.4,
            longitude: -71.1,
            production_volume: null,
            production_unit: "workers",
            workforce_size: 100000,
            avg_wage_usd_monthly: 16000,
            environmental_impact_score: 1,
            human_rights_violations: "research_concentration",
            key_companies: "MIT, Harvard",
            source_authors: "Federal Budget IQ",
            data_year: 2024
        },
        {
            site_id: 22,
            site_name: "London",
            country: "United Kingdom",
            region: "Europe",
            category: "ai_research",
            subcategory: "development",
            latitude: 51.5,
            longitude: -0.1,
            production_volume: null,
            production_unit: "workers",
            workforce_size: 150000,
            avg_wage_usd_monthly: 15000,
            environmental_impact_score: 1,
            human_rights_violations: "financial_center_advantage",
            key_companies: "DeepMind, Multiple startups",
            source_authors: "Alicorn",
            data_year: 2024
        },
        {
            site_id: 21,
            site_name: "Beijing",
            country: "China",
            region: "Asia",
            category: "ai_research",
            subcategory: "development",
            latitude: 39.9,
            longitude: 116.4,
            production_volume: null,
            production_unit: "workers",
            workforce_size: 300000,
            avg_wage_usd_monthly: 8000,
            environmental_impact_score: 2,
            human_rights_violations: "state_controlled_development",
            key_companies: "Baidu, Alibaba, ByteDance",
            source_authors: "Visual Capitalist",
            data_year: 2024
        },
        {
            site_id: 23,
            site_name: "Northern Virginia",
            country: "United States",
            region: "North America",
            category: "data_centers",
            subcategory: "hyperscale",
            latitude: 38.9,
            longitude: -77.4,
            production_volume: 1799,
            production_unit: "MW_capacity",
            workforce_size: 25000,
            avg_wage_usd_monthly: 8000,
            environmental_impact_score: 7,
            human_rights_violations: "energy_consumption",
            key_companies: "Amazon, Microsoft, Google",
            source_authors: "IEA",
            data_year: 2024
        },
        {
            site_id: 25,
            site_name: "Singapore",
            country: "Singapore",
            region: "Asia",
            category: "data_centers",
            subcategory: "tropical",
            latitude: 1.35,
            longitude: 103.8,
            production_volume: 800,
            production_unit: "MW_capacity",
            workforce_size: 12000,
            avg_wage_usd_monthly: 6000,
            environmental_impact_score: 7,
            human_rights_violations: "water_consumption",
            key_companies: "Multiple operators",
            source_authors: "IEA",
            data_year: 2024
        },
        // Add more sample data points as needed...
    ]);
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', initMap);