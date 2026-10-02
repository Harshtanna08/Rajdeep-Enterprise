// Default Inventory, Store Details, and Configuration for Rajdeep Enterprise

export const STORE_INFO = {
    name: "Rajdeep Enterprise",
    tagline: "Premium Consumer Electronics & Home Appliances",
    phone: "+91 82642 76734",
    altPhone: "+91 82642 76734",
    whatsapp: "918264276734",
    email: "rajdeepenterprise200@gmail.com",
    instagram: "rajdeep_enterprise_2001",
    instagramUrl: "https://www.instagram.com/rajdeep_enterprise_2001",
    address: "Shop No. 01, Baroi Road, near VI Mini Store, Rushbha Nagar, Mundra, Gujarat 370421.",
    timings: "9:00 AM - 9:00 PM (All 7 Days Open)",
    established: "2015",
    logo: "assets/images/Logo.jpeg",
    city: "Mundra, Gujarat"
};

export const CATEGORIES = [
    { id: "all", name: "All Products", icon: "grid", shortName: "All" },
    { id: "ac", name: "Air Conditioners", icon: "wind", shortName: "AC" },
    { id: "refrigerator", name: "Refrigerators", icon: "snowflake", shortName: "Freeze" },
    { id: "washing-machine", name: "Washing Machines", icon: "disc", shortName: "Washing Machine" },
    { id: "tv", name: "Smart TVs", icon: "tv", shortName: "TV" },
    { id: "sound-system", name: "Sound Systems", icon: "volume-2", shortName: "Sound System" }
];

export const PRESET_IMAGES = [
    { label: "Default AC Photo", url: "assets/images/ac.jpg", category: "ac" },
    { label: "Default Refrigerator Photo", url: "assets/images/refrigerator.jpg", category: "refrigerator" },
    { label: "Default Washing Machine Photo", url: "assets/images/washing-machine.jpg", category: "washing-machine" },
    { label: "Default Smart TV Photo", url: "assets/images/tv.jpg", category: "tv" },
    { label: "Default Sound System Photo", url: "assets/images/sound-system.jpg", category: "sound-system" }
];

export const INITIAL_PRODUCTS = [
    // Air Conditioners (AC)
    {
        id: "prod-ac-1",
        title: "Daikin 1.5 Ton 5 Star Inverter Split AC",
        model: "FTKM50U",
        category: "ac",
        brand: "Daikin",
        price: 38990,
        mrp: 54990,
        rating: 4.8,
        reviewsCount: 142,
        starRating: 5,
        energyStar: "5 Star BEE Rating",
        image: "assets/images/ac.jpg",
        inStock: true,
        featured: true,
        specs: [
            "Capacity: 1.5 Ton suitable for medium sized rooms (111 to 150 sq.ft)",
            "5 Star Energy Rating with high ISEER efficiency",
            "100% Copper Condenser with PM 2.5 Air Filter",
            "Triple Display (Power, Temperature & Error Code)",
            "Dew Clean Technology for auto indoor coil cleaning",
            "Warranty: 1 Year on Unit, 5 Years on PCB, 10 Years on Compressor"
        ],
        shortDesc: "Energy-efficient 5-star inverter split AC with ultra-quiet cooling and PM 2.5 air purification."
    },
    {
        id: "prod-ac-2",
        title: "LG 1.5 Ton 5 Star AI DUAL Inverter Split AC",
        model: "RS-Q19ENZE",
        category: "ac",
        brand: "LG",
        price: 42490,
        mrp: 62990,
        rating: 4.9,
        reviewsCount: 218,
        starRating: 5,
        energyStar: "5 Star Inverter",
        image: "assets/images/ac.jpg",
        inStock: true,
        featured: true,
        specs: [
            "AI Dual Inverter Compressor with Varied Speed Dual Rotary",
            "Super Convertible 6-in-1 Cooling modes",
            "Ocean Black Protection against rust and coastal corrosion",
            "EZ Clean Filter and 100% Grooved Copper Tubes",
            "Operates even at 52°C ambient high heat",
            "Warranty: 1 Year on Machine, 10 Years on Inverter Compressor"
        ],
        shortDesc: "Smart AI-powered dual inverter technology with 6-in-1 convertible cooling."
    },
    {
        id: "prod-ac-3",
        title: "Panasonic 1.0 Ton 4 Star Wi-Fi Inverter Split AC",
        model: "CS/CU-NU12YKY4W",
        category: "ac",
        brand: "Panasonic",
        price: 31990,
        mrp: 44990,
        rating: 4.7,
        reviewsCount: 94,
        starRating: 4,
        energyStar: "4 Star Smart AC",
        image: "assets/images/ac.jpg",
        inStock: true,
        featured: false,
        specs: [
            "Smart Wi-Fi connectivity with MirAIe app control",
            "Voice Control with Amazon Alexa and Google Assistant",
            "Twin Cool Inverter with PM 0.1 Air Purification Filter",
            "Shield Blu+ Anti-corrosion coating on fins",
            "Warranty: 1 Year Comprehensive, 9 Years on Compressor"
        ],
        shortDesc: "Next-gen Wi-Fi enabled smart AC with MirAIe IoT automation and air filter."
    },

    // Refrigerators (Freeze)
    {
        id: "prod-ref-1",
        title: "Samsung 653 L Side-by-Side Smart Refrigerator with Family Hub",
        model: "RS76CG8003S9",
        category: "refrigerator",
        brand: "Samsung",
        price: 84990,
        mrp: 112990,
        rating: 4.9,
        reviewsCount: 88,
        starRating: 5,
        energyStar: "AI Inverter Smart",
        image: "assets/images/refrigerator.jpg",
        inStock: true,
        featured: true,
        specs: [
            "Massive 653 Liters capacity for modern households",
            "Smart Family Hub touchscreen display with food tracking & entertainment",
            "SpaceMax Technology: Extra interior storage without increasing external size",
            "Twin Cooling Plus: 70% humidity retention keeps veggies fresh",
            "Digital Inverter Compressor with 20-year warranty certificate",
            "In-door Auto Ice & Cold Water dispenser"
        ],
        shortDesc: "Ultimate luxury side-by-side refrigerator featuring Smart Family Hub and SpaceMax."
    },
    {
        id: "prod-ref-2",
        title: "LG 343 L 3 Star Frost Free Smart Inverter Double Door Refrigerator",
        model: "GL-T382VESX",
        category: "refrigerator",
        brand: "LG",
        price: 37990,
        mrp: 49990,
        rating: 4.8,
        reviewsCount: 310,
        starRating: 3,
        energyStar: "3 Star Frost Free",
        image: "assets/images/refrigerator.jpg",
        inStock: true,
        featured: false,
        specs: [
            "Capacity: 343 Litres (Convertible 3-in-1)",
            "Door Cooling+ delivers faster & more uniform cooling across door racks",
            "Smart Diagnosis and Auto Smart Connect for home inverters",
            "Toughened Glass Shelves capable of holding up to 175 kg",
            "Warranty: 1 Year on Product, 10 Years on Smart Inverter Compressor"
        ],
        shortDesc: "Dependable frost-free double door refrigerator with Door Cooling+ uniform airflow."
    },
    {
        id: "prod-ref-3",
        title: "Whirlpool 240 L Frost-Free Multi-Door Refrigerator (Protton)",
        model: "FP 263D PROTTON",
        category: "refrigerator",
        brand: "Whirlpool",
        price: 26490,
        mrp: 35990,
        rating: 4.6,
        reviewsCount: 165,
        starRating: 4,
        energyStar: "Custom Triple Chamber",
        image: "assets/images/refrigerator.jpg",
        inStock: true,
        featured: false,
        specs: [
            "Unique 3-Door structure prevents odor mixing between food and fresh produce",
            "Active Fresh Zone with MicroBlock Technology prevents up to 99% bacterial growth",
            "Zeolite Technology preserves fruit and vegetable nutrients",
            "Air Booster system for temperature retention across shelves",
            "Warranty: 1 Year Comprehensive, 10 Years on Compressor"
        ],
        shortDesc: "Triple-door freshness marvel with dedicated vegetable drawer and odor barrier."
    },

    // Washing Machines
    {
        id: "prod-wm-1",
        title: "Bosch 8 kg 5 Star Inverter Fully-Automatic Front Load Washing Machine",
        model: "WAJ2846SIN",
        category: "washing-machine",
        brand: "Bosch",
        price: 36990,
        mrp: 48990,
        rating: 4.9,
        reviewsCount: 175,
        starRating: 5,
        energyStar: "5 Star Inverter",
        image: "assets/images/washing-machine.jpg",
        inStock: true,
        featured: true,
        specs: [
            "EcoSilence Drive brushless motor: Ultra-quiet, long-lasting performance",
            "Hygiene Care Program: Eliminates 99.9% of bacteria even at low temperatures",
            "ActiveWater Plus: Pressure sensors adjust water according to fabric load",
            "Anti-Vibration Side Panels for supreme stability during 1400 RPM spin",
            "Warranty: 2 Years Comprehensive, 12 Years Motor Warranty"
        ],
        shortDesc: "German engineered front-load washer with EcoSilence motor and fabric steam care."
    },
    {
        id: "prod-wm-2",
        title: "LG 7 kg 5 Star AI Direct Drive Front Load with Steam",
        model: "FHM1207SDW",
        category: "washing-machine",
        brand: "LG",
        price: 31490,
        mrp: 42990,
        rating: 4.8,
        reviewsCount: 240,
        starRating: 5,
        energyStar: "5 Star Smart Washer",
        image: "assets/images/washing-machine.jpg",
        inStock: true,
        featured: false,
        specs: [
            "AI DD detects weight and fabric softness to optimize drum motion",
            "Steam Wash removes 99.9% allergens like house dust mites",
            "TurboWash technology washes full load in just 59 minutes",
            "Stainless steel hygienic drum with full touch waterproof panel",
            "Warranty: 2 Years Complete, 10 Years Direct Drive Motor"
        ],
        shortDesc: "Intelligent AI fabric-care washer with deep steam cycle and whisper-quiet motor."
    },
    {
        id: "prod-wm-3",
        title: "Samsung 7 kg Inverter Fully-Automatic Top Load Washing Machine",
        model: "WA70BG4441YY",
        category: "washing-machine",
        brand: "Samsung",
        price: 16990,
        mrp: 21990,
        rating: 4.7,
        reviewsCount: 198,
        starRating: 5,
        energyStar: "5 Star Top Load",
        image: "assets/images/washing-machine.jpg",
        inStock: true,
        featured: false,
        specs: [
            "Digital Inverter Technology for 40% less energy consumption",
            "Wobble Technology: Dynamic, multi-directional washing without fabric tangle",
            "Magic Filter gathers lint, fluff and particles effectively",
            "Soft Closing Toughened Glass Lid with Child Lock protection",
            "Warranty: 3 Years Comprehensive, 20 Years Motor Warranty"
        ],
        shortDesc: "Tangle-free top loader featuring Wobble pulsator and long-life digital inverter."
    },

    // Smart TVs
    {
        id: "prod-tv-1",
        title: "Sony BRAVIA 65 inch XR Series 4K Ultra HD Smart OLED TV",
        model: "XR-65A80L",
        category: "tv",
        brand: "Sony",
        price: 149990,
        mrp: 219990,
        rating: 5.0,
        reviewsCount: 112,
        starRating: 5,
        energyStar: "OLED Master Series",
        image: "assets/images/tv.jpg",
        inStock: true,
        featured: true,
        specs: [
            "Cognitive Processor XR mimics human perception for unmatched depth & contrast",
            "OLED Contrast Pro with infinite pure blacks and vibrant billion colors",
            "Acoustic Surface Audio+: Sound radiates directly from the screen center",
            "120Hz Refresh Rate, HDMI 2.1, VRR & ALLM tailored for PS5 & premium gaming",
            "Google TV with Hands-Free Voice Search and Apple AirPlay 2",
            "Warranty: 3 Years Sony Authorized Panel & Unit Warranty"
        ],
        shortDesc: "Cinema-grade 65-inch OLED TV with Cognitive Processor XR and screen-audio resonance."
    },
    {
        id: "prod-tv-2",
        title: "Samsung 55 inch Crystal 4K Vivid Pro Ultra HD Smart TV",
        model: "55DU7700",
        category: "tv",
        brand: "Samsung",
        price: 41990,
        mrp: 64990,
        rating: 4.8,
        reviewsCount: 420,
        starRating: 5,
        energyStar: "4K UHD Smart",
        image: "assets/images/tv.jpg",
        inStock: true,
        featured: true,
        specs: [
            "Crystal Processor 4K with PurColor display engine",
            "Motion Xcelerator for fluid action clarity in sports and movies",
            "Q-Symphony: Simultaneous sound output with compatible Samsung soundbars",
            "SolarCell Remote: Eco-friendly battery-free remote charged by ambient light",
            "Built-in IoT Hub, SmartThings, and multiple voice assistants",
            "Warranty: 1 Year Comprehensive, 1 Year Additional on Display Panel"
        ],
        shortDesc: "Best-selling 55-inch Crystal 4K UHD smart television with vivid color reproduction."
    },
    {
        id: "prod-tv-3",
        title: "LG 43 inch 4K Ultra HD Smart LED TV with AI ThinQ",
        model: "43UR7500PSC",
        category: "tv",
        brand: "LG",
        price: 29990,
        mrp: 44990,
        rating: 4.7,
        reviewsCount: 280,
        starRating: 4,
        energyStar: "4K HDR10 Pro",
        image: "assets/images/tv.jpg",
        inStock: true,
        featured: false,
        specs: [
            "α5 AI Processor 4K Gen6 optimizes brightness and audio automatically",
            "webOS 23 with personalized My Profile for each family member",
            "Filmmaker Mode & HDR10 Pro preserves director's original vision",
            "Game Optimizer dashboard & HGiG HDR gaming modes",
            "Magic Remote ready with point-and-click voice navigation",
            "Warranty: 1 Year LG India Warranty"
        ],
        shortDesc: "Compact 43-inch 4K Smart TV with webOS 23 and AI ThinQ smart ecosystem."
    },

    // Sound Systems
    {
        id: "prod-sound-1",
        title: "Sony HT-S40R 600W 5.1ch Real Surround Sound Soundbar",
        model: "HT-S40R",
        category: "sound-system",
        brand: "Sony",
        price: 26990,
        mrp: 34990,
        rating: 4.9,
        reviewsCount: 350,
        starRating: 5,
        energyStar: "600W Total Power",
        image: "assets/images/sound-system.jpg",
        inStock: true,
        featured: true,
        specs: [
            "Real 5.1ch Surround Sound: 3-ch soundbar, rear speakers, and wireless subwoofer",
            "600 Watts massive room-filling cinematic output",
            "Wireless Rear Speakers: No messy cables running across your living room",
            "Dolby Digital 5.1 decoding with custom Cinema, Music and Voice modes",
            "Bluetooth 5.0, HDMI ARC, Optical input and USB playback",
            "Warranty: 1 Year Sony India Manufacturer Warranty"
        ],
        shortDesc: "True 5.1 channel wireless surround home theater with 600W thunderous bass."
    },
    {
        id: "prod-sound-2",
        title: "JBL Cinema SB190 380W 2.1 Deep Bass Dolby Atmos Soundbar",
        model: "SB190ATMOS",
        category: "sound-system",
        brand: "JBL",
        price: 19990,
        mrp: 29990,
        rating: 4.8,
        reviewsCount: 180,
        starRating: 4,
        energyStar: "Virtual Dolby Atmos",
        image: "assets/images/sound-system.jpg",
        inStock: true,
        featured: false,
        specs: [
            "Virtual Dolby Atmos 3D audio for height and spatial dimension",
            "380W Peak System Power with wireless 6.5 inch active subwoofer",
            "Dedicated Voice Clarity Button to enhance movie dialogues instantly",
            "One-cable HDMI eARC connection for high-bitrate lossless audio",
            "Warranty: 1 Year JBL Official Replacement Warranty"
        ],
        shortDesc: "Dolby Atmos enabled 2.1 soundbar with room-shaking JBL signature deep bass."
    },
    {
        id: "prod-sound-3",
        title: "Marshall Stanmore III Wireless Bluetooth Home Audio Speaker",
        model: "STANMORE3-BLK",
        category: "sound-system",
        brand: "Marshall",
        price: 37990,
        mrp: 44990,
        rating: 4.9,
        reviewsCount: 145,
        starRating: 5,
        energyStar: "80W Stereo Bi-Amp",
        image: "assets/images/sound-system.jpg",
        inStock: true,
        featured: false,
        specs: [
            "Legendary Marshall vintage rock-and-roll styling with brass analog control dials",
            "Re-engineered wider soundstage with outward angled tweeters",
            "Next-generation Bluetooth 5.2 with LE Audio and 3.5mm Aux / RCA inputs",
            "Dynamic Loudness adjusts tonal balance to keep audio crisp at every volume",
            "Warranty: 1 Year Official Replacement Warranty"
        ],
        shortDesc: "Iconic British rock heritage speaker featuring analog knobs and room-filling acoustics."
    }
];

export const INITIAL_LEADS = [
    {
        id: "lead-1",
        name: "Vikram Sharma",
        phone: "+91 98250 11223",
        email: "Mundra Port Road",
        product: "Daikin 1.5 Ton 5 Star Inverter Split AC",
        notes: "Interested in installation for 2 bedrooms. Asking about exchange offer for old AC.",
        status: "Contacted",
        date: "2026-09-28 14:32"
    },
    {
        id: "lead-2",
        name: "Pooja Patel",
        phone: "+91 97230 44556",
        email: "Rushbha Nagar, Mundra",
        product: "Samsung 653 L Side-by-Side Smart Refrigerator",
        notes: "Requested Bajaj Finserv 0% EMI calculation and delivery schedule.",
        status: "New",
        date: "2026-10-01 10:15"
    }
];
