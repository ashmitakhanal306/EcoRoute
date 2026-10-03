/**
 * /shared/wasteKnowledge.js
 * Comprehensive Indian Municipal Waste Segregation Knowledge Base (SWM Rules 2016)
 * Features 45+ items with English & Hindi/Hinglish synonyms, bin mapping, and disposal guidelines.
 */

export const BINS = {
  green: {
    color: 'green',
    label: 'Green Bin',
    category: 'Wet / Organic Waste (गीला कचरा)',
    bg: '#dcfce7',
    text: '#166534',
    border: '#86efac',
    icon: '🍏',
    description: 'Biodegradable kitchen and garden waste suitable for composting and biomethanation.'
  },
  blue: {
    color: 'blue',
    label: 'Blue Bin',
    category: 'Dry / Recyclable Waste (सूखा कचरा)',
    bg: '#dbeafe',
    text: '#1e40af',
    border: '#93c5fd',
    icon: '📦',
    description: 'Non-biodegradable, clean and dry recyclable materials like paper, plastic, metal & glass.'
  },
  red: {
    color: 'red',
    label: 'Red Bin',
    category: 'Domestic Hazardous / E-Waste (खतरनाक कचरा)',
    bg: '#fee2e2',
    text: '#991b1b',
    border: '#fca5a5',
    icon: '⚠️',
    description: 'Toxic, corrosive, medicinal, chemical or electronic items requiring specialized processing.'
  },
  black: {
    color: 'black',
    label: 'Black Bin',
    category: 'Sanitary & Reject Waste (सैनेटरी कचरा)',
    bg: '#f1f5f9',
    text: '#0f172a',
    border: '#cbd5e1',
    icon: '🩹',
    description: 'Infectious or non-recyclable sanitary items that must be incinerated safely.'
  }
};

export const WASTE_DATABASE = [
  // ── GREEN BIN: WET / ORGANIC ─────────────────────────────
  {
    id: 'food_waste',
    name: 'Leftover Food & Cooked Meals',
    hindi: 'बचा हुआ खाना (Bacha hua khana / Food scraps)',
    bin: 'green',
    keywords: ['food', 'leftover', 'curry', 'rice', 'dal', 'roti', 'khana', 'cooked food', 'sabji', 'gravy', 'rasa', 'plate waste'],
    guidelines: [
      'Drain excess gravies/soups before throwing into the wet bin.',
      'Never dispose inside a non-biodegradable plastic polythene bag.',
      'Keep your wet bin lined with newspaper or a certified compostable liner.'
    ],
    explanation: 'Decomposes naturally into nutrient-rich compost within 3-4 weeks.'
  },
  {
    id: 'fruit_vegetable_peels',
    name: 'Vegetable & Fruit Peels',
    hindi: 'सब्जी और फलों के छिलके (Chilke / Sabzi ke chilke)',
    bin: 'green',
    keywords: ['peel', 'peels', 'vegetable', 'fruit', 'chilka', 'chilke', 'banana peel', 'apple', 'potato skin', 'aloo chilka', 'onion peel', 'kela', 'seb', 'bhindi', 'tomat'],
    guidelines: [
      'Rinse lightly if salty or oily; directly add to organic composting.',
      'Great for home vermicomposting pots or community bio-gas digesters.',
      'Do not mix with plastic wrappers, fruit stickers or rubber bands.'
    ],
    explanation: 'High in nitrogen and moisture, ideal for organic fertilizer.'
  },
  {
    id: 'tea_coffee_grounds',
    name: 'Tea Leaves & Coffee Grounds',
    hindi: 'चाय पत्ती और कॉफी (Chai patti / Used tea leaves)',
    bin: 'green',
    keywords: ['tea', 'chai', 'chai patti', 'tea bag', 'tea leaves', 'coffee', 'coffee grounds', 'kaapi'],
    guidelines: [
      'Rinse off milk and sugar from loose tea leaves before composting.',
      'Cut open and discard synthetic tea bag wrappers/staples in dry waste if non-paper.',
      'Excellent organic fertilizer directly for household plants like rose and money plant.'
    ],
    explanation: 'Adds natural nitrogen and acidity beneficial for soil regeneration.'
  },
  {
    id: 'eggshells',
    name: 'Eggshells',
    hindi: 'अंडे के छिलके (Ande ke chilke)',
    bin: 'green',
    keywords: ['egg', 'eggshell', 'eggshells', 'anda', 'ande', 'ande ka chilka'],
    guidelines: [
      'Crush lightly to speed up organic soil breakdown.',
      'No need to wash thoroughly, but keep wet bin covered to deter insects.',
      'Enriches soil with organic calcium carbonate.'
    ],
    explanation: 'Biodegradable calcium source perfect for municipal organic composting.'
  },
  {
    id: 'meat_bones',
    name: 'Meat Scraps, Fish Bones & Chicken Bones',
    hindi: 'हड्डियां और मीट (Haddi / Fish bones / Chicken bones)',
    bin: 'green',
    keywords: ['meat', 'bone', 'bones', 'chicken', 'fish', 'mutton', 'haddi', 'machli', 'seafood', 'pork'],
    guidelines: [
      'Wrap in paper to prevent odor and pest attraction.',
      'Avoid throwing in home vermicompost; municipal aerobic digesters process it safely.',
      'Keep wet waste tightly sealed until morning garbage truck collection.'
    ],
    explanation: 'Organic waste processed in municipal high-temperature biomethanation plants.'
  },
  {
    id: 'garden_waste',
    name: 'Leaves, Flowers & Garden Trimmings',
    hindi: 'सूखे पत्ते और पूजा के फूल (Patte / Phool / Garden waste)',
    bin: 'green',
    keywords: ['leaves', 'patte', 'phool', 'flowers', 'puja flowers', 'garden', 'grass', 'twigs', 'branches', 'shredded plants', 'mala', 'marigold'],
    guidelines: [
      'Remove all plastic threads, wires or ribbons from flower garlands (haar).',
      'Dry leaves can also be kept as "brown carbon matter" for composting.',
      'Large tree branches should be bundled separately for yard collection.'
    ],
    explanation: 'Pure carbon/nitrogen biomass that decomposes clean.'
  },
  {
    id: 'coconut_shells',
    name: 'Coconut Shells & Husk',
    hindi: 'नारियल का खोल और जटा (Nariyal chilka / Coconut shell)',
    bin: 'green',
    keywords: ['coconut', 'coconut shell', 'nariyal', 'nariyal chilka', 'husk', 'coir', 'daak'],
    guidelines: [
      'Dry husks can be added to wet waste compost as high-carbon brown material.',
      'Ensure straw or plastic spoons are removed from tender coconuts (nariyal paani).',
      'Can also be routed to eco-briquette / coir craft recycling.'
    ],
    explanation: 'Natural fibrous organic matter that biodegrades slowly.'
  },
  {
    id: 'spoiled_dairy',
    name: 'Spoiled Milk, Curd & Paneer',
    hindi: 'खराब दूध, दही, पनीर (Kharaab doodh / Dahi / Paneer)',
    bin: 'green',
    keywords: ['milk', 'curd', 'dahi', 'paneer', 'cheese', 'butter', 'doodh', 'spoiled milk', 'rotten'],
    guidelines: [
      'Pour curd/paneer solids into wet waste; avoid excessive sour liquid pooling.',
      'The milk packet pouch itself belongs strictly in the BLUE bin (rinsed & dried).',
      'Never dump dairy fat into storm drains or toilets.'
    ],
    explanation: 'Biodegradable dairy solids decompose in community anaerobic digesters.'
  },

  // ── BLUE BIN: DRY / RECYCLABLE ───────────────────────────
  {
    id: 'plastic_bottles',
    name: 'Plastic Water & Cold Drink Bottles (PET)',
    hindi: 'प्लास्टिक की बोतलें (Plastic bottle / Bisleri / Cold drink)',
    bin: 'blue',
    keywords: ['bottle', 'plastic bottle', 'pet bottle', 'bisleri', 'coke bottle', 'water bottle', 'cold drink', 'botal', 'shampoo bottle', 'oil bottle'],
    guidelines: [
      'Empty all liquid and rinse quickly to eliminate residues.',
      'Crush the bottle flat and put cap back on to save truck volume.',
      'Recycled into polyester textile fiber, ropes, and recycled PET pellets.'
    ],
    explanation: 'High-grade recyclable plastic (Grade 1 PET).'
  },
  {
    id: 'newspapers_cardboard',
    name: 'Newspapers, Paper & Cardboard Boxes',
    hindi: 'अखबार और गत्ता (Akhbaar / Raddi / Carton / Cardboard)',
    bin: 'blue',
    keywords: ['newspaper', 'paper', 'cardboard', 'carton', 'box', 'akhbar', 'raddi', 'magazine', 'book', 'notebook', 'amazon box', 'paper bag'],
    guidelines: [
      'Flatten all cardboard delivery boxes before disposal.',
      'Keep paper dry; soiled or greasy paper (like pizza boxes with oil) cannot be recycled.',
      'Remove heavy plastic packing tape and metal staples where feasible.'
    ],
    explanation: 'Recyclable into pulp for fresh paperboards, egg trays, and craft cartons.'
  },
  {
    id: 'milk_packets',
    name: 'Milk Pouches & Oil Packets',
    hindi: 'दूध की थैली (Doodh ka packet / Oil packet / Poly pouch)',
    bin: 'blue',
    keywords: ['milk packet', 'doodh packet', 'milk pouch', 'amul packet', 'mother dairy', 'oil pouch', 'theli', 'panni', 'plastic pouch'],
    guidelines: [
      'Snip only a tiny slit when opening—do not cut off tiny separate plastic corner tabs!',
      'Rinse with water and hang to dry before tossing into the dry bin.',
      'Made of low-density polyethylene (LDPE) which recyclers love when dry.'
    ],
    explanation: '100% recyclable LDPE plastic when free from rancid milk residue.'
  },
  {
    id: 'glass_bottles',
    name: 'Intact Glass Bottles & Jars',
    hindi: 'कांच की बोतल और जार (Kaanch ki botal / Jam jar)',
    bin: 'blue',
    keywords: ['glass bottle', 'jar', 'jam jar', 'sauce bottle', 'pickle jar', 'kaanch botal', 'glass jar', 'beer bottle', 'wine bottle', 'perfume bottle'],
    guidelines: [
      'Rinse inside thoroughly to remove sticky syrup, sauces, or pickle oil.',
      'Keep intact; separate metal lids or plastic caps into dry bin.',
      'Note: If glass is broken or shattered, it belongs in RED (Hazardous) wrapped safely!'
    ],
    explanation: 'Glass can be recycled indefinitely without loss in purity or strength.'
  },
  {
    id: 'metal_cans',
    name: 'Tin Cans, Aluminum Cans & Metal Foil',
    hindi: 'टिन के डिब्बे और एल्युमिनियम कैन (Tin can / Cold drink can / Metal lid)',
    bin: 'blue',
    keywords: ['can', 'tin', 'aluminum', 'metal', 'cold drink can', 'beer can', 'tin can', 'canned food', 'foil', 'silver foil', 'metal box', 'loha'],
    guidelines: [
      'Rinse sauce or food remnants so it stays odorless in storage.',
      'Clean aluminum foil can be rolled into a tight ball (minimum 5cm) for easy sorting.',
      'Metals have the highest recycling recovery value in India.'
    ],
    explanation: 'Infinitely recyclable metals that save up to 95% energy vs raw smelting.'
  },
  {
    id: 'plastic_wrappers',
    name: 'Chips Packets, Biscuit Wrappers & Multilayer Plastic (MLP)',
    hindi: 'चिप्स और बिस्किट का पैकेट (Chips packet / Kurkure / Namkeen wrapper)',
    bin: 'blue',
    keywords: ['chips', 'biscuit', 'wrapper', 'kurkure', 'lays', 'snack packet', 'namkeen wrapper', 'candy wrapper', 'chocolate wrapper', 'mlp'],
    guidelines: [
      'Dust out crumbs completely so it remains dry.',
      'Store in a dry eco-brick or dry bag with other clean plastics.',
      'Forwarded to cement kilns for co-processing and bituminous road construction.'
    ],
    explanation: 'Categorized under dry waste for RDF (Refuse Derived Fuel) and plastic roads.'
  },
  {
    id: 'tetra_paks',
    name: 'Tetra Pak Juice & Milk Cartons',
    hindi: 'टेट्रा पैक (Juice box / Frooti carton / Tetra pak)',
    bin: 'blue',
    keywords: ['tetra pak', 'tetrapak', 'juice box', 'frooti', 'real juice', 'almond milk carton', 'carton pack'],
    guidelines: [
      'Flatten the carton completely to squeeze out leftover moisture.',
      'Push the plastic straw inside the carton so it does not get lost as micro-litter.',
      'Specialized pulping mills separate the paper pulp, polyethylene, and aluminum lining.'
    ],
    explanation: 'Multilayer cartons recycled into roofing sheets, chipboards, and writing paper.'
  },
  {
    id: 'plastic_takeaway_containers',
    name: 'Plastic Takeaway Food Containers & Spoons',
    hindi: 'जोमैटो / स्विगी प्लास्टिक डिब्बा (Zomato / Swiggy plastic box)',
    bin: 'blue',
    keywords: ['zomato', 'swiggy', 'takeaway', 'plastic container', 'plastic dabba', 'plastic spoon', 'disposable box', 'dabba'],
    guidelines: [
      'Wipe off food grease and wash with a drop of soap before sorting.',
      'Keep lids paired with boxes; made of recyclable polypropylene (PP / Grade 5).',
      'Unwashed greasy containers will contaminate the entire dry paper bin.'
    ],
    explanation: 'Recyclable polypropylene (PP) when clean and dry.'
  },
  {
    id: 'clothing_textiles',
    name: 'Old Clothes, Rags & Fabric',
    hindi: 'पुराने कपड़े (Purane kapde / Cloth rags / Fabric scraps)',
    bin: 'blue',
    keywords: ['clothes', 'cloth', 'kapda', 'kapde', 'shirt', 'pants', 'towel', 'bedsheet', 'jeans', 'fabric', 'curtain'],
    guidelines: [
      'Donate usable clothes to NGOs, dry cleaners, or domestic help.',
      'Torn rags must be dry and clean before placing in the dry collection bin.',
      'Recycled into industrial wiping rags, cotton yarn, or acoustic insulation.'
    ],
    explanation: 'Dry textile waste can be downcycled or shredded into shoddy yarn.'
  },

  // ── RED BIN: DOMESTIC HAZARDOUS / E-WASTE ────────────────
  {
    id: 'broken_glass',
    name: 'Broken Glass & Shattered Mirrors',
    hindi: 'टूटा हुआ कांच (Toota kaanch / Broken mirror / Sharp glass)',
    bin: 'red',
    keywords: ['broken glass', 'kaanch', 'toota kaanch', 'glass piece', 'shattered glass', 'mirror', 'broken mirror', 'broken mug', 'crockery', 'blade', 'sharp'],
    guidelines: [
      'WRAP SAFELY in thick newspaper or a sturdy cardboard box!',
      'Label clearly: "CAUTION: BROKEN GLASS" so sanitation workers do not get injured.',
      'Never mix loose broken glass in regular dry or wet bins.'
    ],
    explanation: 'Severe puncture hazard to municipal waste handlers and ragpickers.'
  },
  {
    id: 'batteries',
    name: 'Dry Cell Batteries, Lithium & Rechargeable Cells',
    hindi: 'पुरानी बैटरियां / सेल (Old batteries / Pencil cell / Phone battery)',
    bin: 'red',
    keywords: ['battery', 'batteries', 'cell', 'duracell', 'pencil cell', 'lithium', 'aa battery', 'aaa battery', 'power bank', 'inverter battery', 'button cell'],
    guidelines: [
      'Tape both terminal ends with masking/cello tape to prevent accidental short-circuits.',
      'Keep in a dry zip-lock pouch away from heat and moisture.',
      'Hand over to designated municipal hazardous drop boxes or authorised e-waste recyclers.'
    ],
    explanation: 'Contains toxic heavy metals (Cadmium, Lead, Lithium, Mercury) that poison groundwater.'
  },
  {
    id: 'cfl_tubelights',
    name: 'CFL Bulbs, Fluorescent Tubes & LED Lights',
    hindi: 'ट्यूबलाइट और सीएफएल बल्ब (Tubelight / CFL bulb / Mercury lamp)',
    bin: 'red',
    keywords: ['cfl', 'bulb', 'tubelight', 'tube light', 'fluorescent', 'mercury lamp', 'led bulb', 'light bulb'],
    guidelines: [
      'Do not crush or break! Keep intact in original packaging or bubble wrap.',
      'CFLs contain hazardous mercury vapor which is toxic if inhaled.',
      'Hand over separately on hazardous/e-waste collection days.'
    ],
    explanation: 'Mercury and electronic ballast pose high environmental and health risks.'
  },
  {
    id: 'expired_medicines',
    name: 'Expired Medicines, Syrups & Tablets',
    hindi: 'पुरानी या एक्सपायर्ड दवाइयां (Expired dawa / Medicines / Tablets)',
    bin: 'red',
    keywords: ['medicine', 'medicines', 'dawa', 'dawakhana', 'tablet', 'capsule', 'syrup', 'expired medicine', 'cough syrup', 'ointment', 'paracetamol'],
    guidelines: [
      'Never flush down the toilet or sink—antibiotics corrupt water supplies and aquatic life.',
      'Keep tablets in original blister strips and liquid bottles tightly sealed.',
      'Deposit in pharmacy take-back boxes or municipal domestic hazardous bins.'
    ],
    explanation: 'Active pharmaceutical ingredients cause antibiotic resistance and groundwater poisoning.'
  },
  {
    id: 'paints_chemicals',
    name: 'Paint Cans, Thinners & Solvents',
    hindi: 'पेंट के डिब्बे और केमिकल (Paint can / Thinner / Varnish / Turpentine)',
    bin: 'red',
    keywords: ['paint', 'thinner', 'chemical', 'varnish', 'turpentine', 'solvent', 'primer', 'polish', 'paint can'],
    guidelines: [
      'Allow leftover paint to dry up before disposal; do not pour into sewer drains.',
      'Seal lid tightly to avoid volatile VOC gas emission.',
      'Categorized under hazardous domestic industrial waste.'
    ],
    explanation: 'Flammable and toxic chemical compounds requiring regulated hazardous incineration.'
  },
  {
    id: 'insecticides_pesticides',
    name: 'Mosquito Sprays, Rat Poison & Insecticides',
    hindi: 'कीड़े मारने की दवा (Hit spray / Baygon / Rat poison / Pest control)',
    bin: 'red',
    keywords: ['spray', 'hit', 'baygon', 'insecticide', 'pesticide', 'pest spray', 'mosquito spray', 'rat poison', 'cockroach gel', 'mortein', 'allout refill'],
    guidelines: [
      'Aerosol cans can explode under heat/pressure; do not puncture or burn.',
      'Keep out of reach of children and domestic pets.',
      'Requires disposal at hazardous municipal treatment facilities (TSDF).'
    ],
    explanation: 'Neurotoxic chemicals and pressurized canisters with explosive hazards.'
  },
  {
    id: 'electronic_cables_chargers',
    name: 'Old Chargers, USB Cables & Broken Gadgets',
    hindi: 'खराब चार्जर, तार और पुराने इलेक्ट्रॉनिक्स (Charger / Cable / E-waste)',
    bin: 'red',
    keywords: ['charger', 'cable', 'wire', 'e-waste', 'ewaste', 'phone charger', 'broken phone', 'mouse', 'keyboard', 'headphones', 'earphones'],
    guidelines: [
      'Bundle cables neatly with a rubber band or wire tie.',
      'Check if local electronics stores (like Croma, Reliance Digital) have an e-waste bin.',
      'Hand over to certified PRO (Producer Responsibility Organization) e-waste recyclers.'
    ],
    explanation: 'Contains copper, gold, toxic brominated flame retardants and heavy metals.'
  },
  {
    id: 'mercury_thermometer',
    name: 'Mercury Thermometer',
    hindi: 'पारे वाला थर्मामीटर (Mercury thermometer)',
    bin: 'red',
    keywords: ['thermometer', 'mercury', 'mercury thermometer', 'para thermometer'],
    guidelines: [
      'Handle with utmost care; if broken, do NOT vacuum or sweep with broom.',
      'Store in an airtight plastic or glass jar.',
      'Deliver immediately to a hospital biohazard or hazardous waste center.'
    ],
    explanation: 'Elemental mercury is an acute neurological toxin requiring specialized hazardous treatment.'
  },

  // ── BLACK BIN: SANITARY & REJECT WASTE ───────────────────
  {
    id: 'sanitary_pads',
    name: 'Sanitary Napkins & Menstrual Pads',
    hindi: 'सैनेटरी पैड (Sanitary pad / Napkin / Periods)',
    bin: 'black',
    keywords: ['pad', 'pads', 'sanitary pad', 'sanitary napkin', 'whisper', 'stayfree', 'menstrual', 'tampon', 'menstruation'],
    guidelines: [
      'Wrap securely in newspaper or biodegradable disposal bag provided with the pad.',
      'Mark the parcel with a visible RED DOT or RED CROSS (as per Swachh Bharat advisory).',
      'Never flush down toilets—causes catastrophic sewage blockages!'
    ],
    explanation: 'Classified as bio-medical reject waste requiring high-temperature incineration.'
  },
  {
    id: 'diapers',
    name: 'Baby & Adult Diapers',
    hindi: 'डायपर (Diaper / Baby pampers / Huggies / Adult diaper)',
    bin: 'black',
    keywords: ['diaper', 'diapers', 'pampers', 'huggies', 'baby diaper', 'adult diaper', 'nappy', 'pampas'],
    guidelines: [
      'Flush solid fecal matter into the toilet first if feasible.',
      'Roll tightly, seal with side adhesive tabs, and wrap securely in old newspaper.',
      'Mark with a red cross and deposit strictly in the BLACK sanitary bin.'
    ],
    explanation: 'Contains non-biodegradable SAP gels and human fecal pathogens.'
  },
  {
    id: 'bandages_cotton',
    name: 'Used Bandages, Cotton Swabs & Gauze',
    hindi: 'पट्टी और इस्तेमाल की हुई रुई (Bandage / Dettol cotton / Band-aid)',
    bin: 'black',
    keywords: ['bandage', 'band-aid', 'cotton', 'swab', 'gauze', 'patti', 'dettol cotton', 'blood cotton', 'earbuds'],
    guidelines: [
      'Any item with blood, pus or bodily fluids is infectious waste.',
      'Wrap in a paper packet before putting into the sanitary bin.',
      'Hand over to municipal sanitization collectors for biohazard incineration.'
    ],
    explanation: 'Potential bio-hazard and infection risk to municipal frontline workers.'
  },
  {
    id: 'condoms_wipes',
    name: 'Condoms & Wet Wipes',
    hindi: 'वेट वाइप्स (Wet wipes / Discarded wipes / Condoms)',
    bin: 'black',
    keywords: ['condom', 'condoms', 'wet wipe', 'wipes', 'tissue wipe', 'makeup wipe', 'baby wipe'],
    guidelines: [
      'Wrap discreetly in waste paper or tissue.',
      'Wet wipes contain synthetic microplastic polyester fibers—do NOT flush in WC.',
      'Dispose into the black domestic reject bin.'
    ],
    explanation: 'Non-biodegradable synthetic fibers and bodily fluids suited only for incineration.'
  },
  {
    id: 'pet_waste',
    name: 'Pet Poop & Soiled Animal Litter',
    hindi: 'कुत्ते / बिल्ली की पॉटी (Pet poop / Dog poop / Cat litter)',
    bin: 'black',
    keywords: ['pet poop', 'dog poop', 'cat poop', 'cat litter', 'animal waste', 'potty', 'tatti'],
    guidelines: [
      'Collect in paper or compostable dog-waste bag.',
      'Cat litter should never be dumped into water drains (clogs pipes).',
      'Dispose into black reject waste bin or dedicated pet waste composters.'
    ],
    explanation: 'Carries zoonotic parasites (like Toxoplasma gondii) unsuitable for vegetable compost.'
  },
  {
    id: 'razors_blades',
    name: 'Shaving Razors & Disposable Blades',
    hindi: 'शेविंग ब्लेड और रेजर (Shaving blade / Gillette razor)',
    bin: 'black',
    keywords: ['razor', 'blade', 'shaving blade', 'gillette', 'disposable razor', 'shaving razor'],
    guidelines: [
      'Put the safety cover back on, or wrap the sharp edge in thick cardboard/tape.',
      'Never toss naked blades loose into trash bags.',
      'Protects sanitation staff hands from deep cuts.'
    ],
    explanation: 'Sharp sanitary reject waste requiring puncture-proof wrapping.'
  },
  {
    id: 'dust_sweeping',
    name: 'Floor Sweeping Dust & Vacuum Debris',
    hindi: 'झाड़ू की धूल और कचरा (Jhadu ka kachra / Floor dust / Mop dirt)',
    bin: 'black',
    keywords: ['dust', 'jhadu', 'sweeping', 'kachra', 'vacuum dust', 'dirt', 'hair', 'bal', 'floor dirt'],
    guidelines: [
      'Wrap in paper to prevent dust from flying into workers eyes.',
      'Human hair should ideally be collected separately for salon hair recycling.',
      'Non-recyclable inorganic grit goes to inert landfill reject waste.'
    ],
    explanation: 'Inert non-recyclable domestic sweepings.'
  },

  // ── SPECIAL & ADDITIONAL ITEMS ───────────────────────────
  {
    id: 'pizza_box_greasy',
    name: 'Greasy Pizza Boxes (Oil-Soiled)',
    hindi: 'तेल लगा पिज्जा बॉक्स (Pizza box with oil & cheese)',
    bin: 'black',
    keywords: ['pizza box', 'greasy box', 'dominos box', 'greasy paper', 'cheesy box'],
    guidelines: [
      'If top lid is clean, tear it off and put in BLUE (Dry Recyclable).',
      'Greasy, oil-soaked bottom cannot be recycled into pulp; it goes to BLACK (Reject) or compost.',
      'Do not contaminate clean cardboard bales with oil grease.'
    ],
    explanation: 'Grease prevents paper fibers from binding during chemical pulping.'
  },
  {
    id: 'pattal_dona',
    name: 'Sal Leaf Plates & Areca Nut Plates (Pattal / Dona)',
    hindi: 'पत्तल और दोना (Pattal / Dona / Supari leaf plate)',
    bin: 'green',
    keywords: ['pattal', 'dona', 'leaf plate', 'sal patta', 'areca', 'wooden spoon', 'bamboo fork'],
    guidelines: [
      '100% natural leaf compostable—goes straight to GREEN bin.',
      'Ensure it is not plastic-laminated (shiny silver plastic pattals go to dry/reject).',
      'Breaks down in organic compost within 45 to 60 days.'
    ],
    explanation: 'Natural biodegradable organic biomass.'
  },
  {
    id: 'plastic_polythene_bags',
    name: 'Single-Use Polythene Carry Bags & Grocery Bags',
    hindi: 'प्लास्टिक की पॉलीथिन थैली (Polythene / Plastic theli / Kirana bag)',
    bin: 'blue',
    keywords: ['polythene', 'polybag', 'plastic bag', 'plastic theli', 'kirana bag', 'carry bag', 'grocery bag'],
    guidelines: [
      'Empty any dirt or food crumbs inside before disposal.',
      'Tie multiple clean bags inside one bag so they do not blow away as wind-borne litter.',
      'Sent to plastic agglomeration plants for reuse in plastic lumber and asphalt roads.'
    ],
    explanation: 'Dry low-density recyclable polymer when dry and unsoiled.'
  },
  {
    id: 'styrofoam_thermocol',
    name: 'Thermocol & Styrofoam Packaging',
    hindi: 'थर्माकोल (Thermocol / Styrofoam / Foam packaging)',
    bin: 'blue',
    keywords: ['thermocol', 'styrofoam', 'expanded polystyrene', 'eps', 'white foam', 'packaging foam'],
    guidelines: [
      'Keep dry and clean; do not break into thousands of tiny white beads!',
      'Food-soiled thermocol plates belong in reject waste.',
      'Collected for densification and conversion into moulding frames.'
    ],
    explanation: 'Expanded polystyrene (EPS) recyclable via specialized compaction.'
  },
  {
    id: 'nail_polish_acetone',
    name: 'Nail Polish Bottles & Acetone Removers',
    hindi: 'नेल पॉलिश और थिनर (Nail polish / Nail paint / Acetone)',
    bin: 'red',
    keywords: ['nail polish', 'nail paint', 'nailpolish', 'acetone', 'remover', 'cosmetic chemical'],
    guidelines: [
      'Do not pour liquid solvent down bathroom sinks or toilet bowls.',
      'Wrap small glass bottle safely before disposal.',
      'Toxic volatile organic compounds require hazardous chemical processing.'
    ],
    explanation: 'Contains hazardous solvents (nitrocellulose, acetone, toluene) harmful to ecosystems.'
  },
  {
    id: 'aluminum_foil_wrap',
    name: 'Clean Aluminum Foil & Foil Food Containers',
    hindi: 'सिल्वर फॉइल (Silver foil / Roti foil / Aluminum box)',
    bin: 'blue',
    keywords: ['foil', 'silver foil', 'aluminum foil', 'roti foil', 'foil wrap', 'foil container'],
    guidelines: [
      'Wipe off food residue and oil droplets before recycling.',
      'Roll aluminum foil into a tight ball (at least golf-ball sized) so sorting machines detect it.',
      'Clean aluminum can be melted down and recycled indefinitely.'
    ],
    explanation: 'Pure metal recycling that saves 95% of the energy needed for new aluminum.'
  },
  {
    id: 'cotton_earbuds',
    name: 'Earbuds & Cosmetic Cotton Swabs',
    hindi: 'कान साफ करने वाली बड (Earbuds / Cotton bud / Q-tips)',
    bin: 'black',
    keywords: ['earbuds', 'earbud', 'q tip', 'q tips', 'cotton bud', 'ear bud'],
    guidelines: [
      'Contains bodily wax and synthetic plastic sticks—do NOT flush down toilets.',
      'Wrap inside waste paper and place in the BLACK reject bin.',
      'Switch to bamboo-stem biodegradable cotton buds where possible.'
    ],
    explanation: 'Hygiene reject waste that clogs municipal sewage filters.'
  },
  {
    id: 'puja_flowers_incense',
    name: 'Puja Flowers, Agarbatti Ash & Dhoop Batti',
    hindi: 'पूजा के फूल और अगरबत्ती की राख (Puja flowers / Dhoop / Agarbatti ash / Raakh)',
    bin: 'green',
    keywords: ['puja', 'puja flowers', 'agarbatti', 'agarbatti ash', 'dhoop', 'raakh', 'hawan', 'hawan ash', 'chandan'],
    guidelines: [
      'Remove all plastic wrappers, ribbons, and foil packaging.',
      'Puja flowers and organic incense ash decompose into pure holy compost.',
      'Many temple municipalities have dedicated Nirmalaya organic compost pits.'
    ],
    explanation: '100% natural organic floral matter for holy vermicompost.'
  },
  {
    id: 'disposable_plastic_cutlery',
    name: 'Disposable Plastic Cutlery, Straws & Cups',
    hindi: 'प्लास्टिक के चम्मच, स्ट्रॉ और डिस्पोजेबल कप (Plastic chamach / Straw / Chai cup)',
    bin: 'blue',
    keywords: ['straw', 'straws', 'plastic spoon', 'plastic fork', 'plastic cup', 'disposable cup', 'plastic chamach'],
    guidelines: [
      'Rinse off milk, tea, or gravy residues.',
      'Place in the dry recyclables bin alongside clean plastics.',
      'Shredded and recycled into industrial utility crates or road polymers.'
    ],
    explanation: 'Dry rigid plastic that can be re-granulated into recycled pellets.'
  },
  {
    id: 'shoes_slippers',
    name: 'Broken Slippers, Chappals & Damaged Shoes',
    hindi: 'टूटी चप्पल और पुराने जूते (Tooti chappal / Hawaii chappal / Old shoes)',
    bin: 'black',
    keywords: ['chappal', 'slippers', 'shoes', 'hawaii chappal', 'juta', 'tooti chappal', 'sandals', 'rubber sole'],
    guidelines: [
      'If slightly worn, donate or give to local cobblers for re-soling.',
      'Irreparable rubber and composite soles go to BLACK reject waste.',
      'Co-processed in authorized waste-to-energy or cement kilns.'
    ],
    explanation: 'Complex multi-material composites (EVA rubber, PVC, PU glue) unsuitable for standard recycling.'
  },
  {
    id: 'bubble_wrap_air_pillows',
    name: 'Bubble Wrap & Packaging Cushion Pouches',
    hindi: 'बबल रैप (Bubble wrap / Amazon air pouch / Packing bubble)',
    bin: 'blue',
    keywords: ['bubble wrap', 'air pouch', 'bubble wrap sheet', 'packaging cushion', 'plastic wrap'],
    guidelines: [
      'Pop air bubbles and bundle neatly inside a larger dry plastic bag.',
      'Keep free from wet oil, paint, or grease.',
      'Made of LDPE (Low-Density Polyethylene) film with high recycling demand.'
    ],
    explanation: 'Dry LDPE plastic film that is pelletized into recycled plastic bags and liners.'
  },
  {
    id: 'mosquito_coil_ash',
    name: 'Mosquito Coil Residue & Repellent Mats',
    hindi: 'मच्छर मारने की कॉइल और राख (Mortein coil / Good knight mat / Coil ash)',
    bin: 'black',
    keywords: ['coil', 'mosquito coil', 'good knight mat', 'allout mat', 'kachua chaap', 'coil ash'],
    guidelines: [
      'Coil ash contains synthetic pyrethroid insecticides; do not use on edible garden plants.',
      'Collect in paper wrap and dispose into the BLACK reject bin.',
      'Used mosquito repellent mats also belong in domestic reject waste.'
    ],
    explanation: 'Residual chemical pesticides requiring safe disposal with inert domestic rejects.'
  }
];

/**
 * Fuzzy / Keyword matching engine
 * Supports multi-word queries, English, Hindi terms and Hinglish.
 * @param {string} query User prompt text
 * @returns {object} { matched: boolean, item: object|null, bin: object, confidence: number }
 */
export function findWasteCategory(query) {
  if (!query || typeof query !== 'string') {
    return getDefaultFallback();
  }

  const cleanQuery = query.toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .trim();

  if (!cleanQuery) return getDefaultFallback();

  let bestMatch = null;
  let highestScore = 0;

  for (const item of WASTE_DATABASE) {
    let score = 0;

    // Check direct item name / hindi
    if (cleanQuery.includes(item.name.toLowerCase())) score += 10;
    if (item.hindi && cleanQuery.includes(item.hindi.toLowerCase())) score += 10;

    // Check keywords
    for (const kw of item.keywords) {
      const lowerKw = kw.toLowerCase();
      if (cleanQuery === lowerKw) {
        score += 8;
      } else if (cleanQuery.includes(lowerKw)) {
        // Longer matching keywords get more weight
        score += Math.min(6, lowerKw.length > 5 ? 5 : 3);
      } else {
        // Check word-by-word token overlap
        const kwTokens = lowerKw.split(/\s+/);
        const queryTokens = cleanQuery.split(/\s+/);
        for (const kt of kwTokens) {
          if (kt.length > 2 && queryTokens.includes(kt)) {
            score += 2;
          }
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Threshold check
  if (bestMatch && highestScore >= 2) {
    const binInfo = BINS[bestMatch.bin];
    return {
      matched: true,
      score: highestScore,
      item: bestMatch,
      bin: binInfo,
      bin_color: bestMatch.bin,
      bin_name: binInfo.label + ' (' + binInfo.category + ')',
      guidelines: bestMatch.guidelines,
      explanation: bestMatch.explanation,
      item_detected: bestMatch.name
    };
  }

  // Fallback category heuristic based on core roots
  if (/kachra|waste|geela|wet|sabzi|khana|leaf|fruit|peel|food/i.test(cleanQuery)) {
    return {
      matched: true,
      score: 1,
      item: null,
      bin: BINS.green,
      bin_color: 'green',
      bin_name: BINS.green.label + ' (' + BINS.green.category + ')',
      guidelines: [
        'Drain excess gravies and liquids before throwing.',
        'Use compostable liners or dispose directly without plastic bags.',
        'Keep covered to prevent pests and flies.'
      ],
      explanation: 'Wet organic items decompose into natural fertilizer.',
      item_detected: 'Organic Kitchen / Wet Waste'
    };
  }

  if (/plastic|bottle|paper|box|carton|metal|can|glass|sukha|dry|raddi/i.test(cleanQuery)) {
    return {
      matched: true,
      score: 1,
      item: null,
      bin: BINS.blue,
      bin_color: 'blue',
      bin_name: BINS.blue.label + ' (' + BINS.blue.category + ')',
      guidelines: [
        'Make sure it is clean and 100% dry before disposal.',
        'Flatten boxes and bottles to maximize storage space.',
        'Do not mix with food or wet substances.'
      ],
      explanation: 'Recyclable dry materials processed at material recovery facilities (MRF).',
      item_detected: 'Dry Recyclable Material'
    };
  }

  if (/chemical|paint|battery|bulb|tube|mercury|spray|hazard|poison|wire|cable/i.test(cleanQuery)) {
    return {
      matched: true,
      score: 1,
      item: null,
      bin: BINS.red,
      bin_color: 'red',
      bin_name: BINS.red.label + ' (' + BINS.red.category + ')',
      guidelines: [
        'Keep in original container or wrap securely in protective carton.',
        'Do not mix with household food or water runoff.',
        'Hand over during dedicated municipal hazardous collection.'
      ],
      explanation: 'Domestic hazardous items contain toxic or flammable elements.',
      item_detected: 'Hazardous / Electronic Waste'
    };
  }

  if (/pad|diaper|napkin|bandage|blood|sanitary|wipe/i.test(cleanQuery)) {
    return {
      matched: true,
      score: 1,
      item: null,
      bin: BINS.black,
      bin_color: 'black',
      bin_name: BINS.black.label + ' (' + BINS.black.category + ')',
      guidelines: [
        'Wrap securely in old newspaper.',
        'Mark the parcel with a visible RED CROSS.',
        'Never flush down the toilet.'
      ],
      explanation: 'Sanitary items require biohazard incineration for hygiene.',
      item_detected: 'Sanitary / Biohazard Reject Waste'
    };
  }

  return getDefaultFallback(query);
}

function getDefaultFallback(rawQuery) {
  return {
    matched: false,
    score: 0,
    item: null,
    bin: null,
    bin_color: null,
    bin_name: null,
    guidelines: [
      '🟢 Green Bin: Kitchen scraps, cooked food, fruit peels, leaves.',
      '🔵 Blue Bin: Clean paper, plastic bottles, boxes, metal cans.',
      '🔴 Red Bin: Batteries, glass, chemicals, paint, e-waste.',
      '⚫ Black Bin: Diapers, sanitary pads, bandages, sweepings.'
    ],
    explanation: 'I couldn\'t pinpoint the exact item "' + (rawQuery || 'that') + '". Could you tell me what material it is made of, or pick one of the quick suggestions?',
    item_detected: null
  };
}
