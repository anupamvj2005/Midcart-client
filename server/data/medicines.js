const FORM_IMAGES = {
  tablet: "https://img.icons8.com/color/512/pill.png",
  capsule: "https://img.icons8.com/color/512/pills.png",
  syrup: "https://img.icons8.com/color/512/syrup.png",
  cream: "https://img.icons8.com/color/512/ointment.png",
  gel: "https://img.icons8.com/color/512/tube.png",
  drops: "https://img.icons8.com/color/512/eye-drops.png",
  injection: "https://img.icons8.com/color/512/syringe.png",
  powder: "https://img.icons8.com/color/512/powder.png"
};

const rawMedicines = [
  // Fever & Cold
  {
    name: "Paracetamol", brand: "Crocin 500mg", category: "Fever & Cold", dosage: "500mg", form: "tablet",
    price: { mrp: 55, selling: 50 }, stock: { quantity: 150 },
    description: "Used for fever and mild pain relief", isBestSelling: true
  },
  {
    name: "Cetirizine", brand: "Zyrtec 10mg", category: "Fever & Cold", dosage: "10mg", form: "tablet",
    price: { mrp: 65, selling: 60 }, stock: { quantity: 120 },
    description: "Allergy and cold relief"
  },
  {
    name: "Dextromethorphan", brand: "Benadryl DR", category: "Fever & Cold", dosage: "100ml", form: "syrup",
    price: { mrp: 130, selling: 115 }, stock: { quantity: 85 },
    description: "Cough syrup for dry cough", isBestSelling: true
  },
  {
    name: "Levocetirizine", brand: "Xyzal 5mg", category: "Fever & Cold", dosage: "5mg", form: "tablet",
    price: { mrp: 80, selling: 75 }, stock: { quantity: 100 },
    description: "Antihistamine for severe cold"
  },

  // Diabetes
  {
    name: "Metformin", brand: "Glycomet 500SR", category: "Diabetes", dosage: "500mg", form: "tablet",
    price: { mrp: 140, selling: 120 }, stock: { quantity: 90 },
    description: "Blood sugar control", isBestSelling: true
  },
  {
    name: "Glimepiride", brand: "Amaryl 1mg", category: "Diabetes", dosage: "1mg", form: "tablet",
    price: { mrp: 160, selling: 145 }, stock: { quantity: 60 },
    description: "Maintains optimal insulin levels"
  },
  {
    name: "Sitagliptin", brand: "Januvia 100mg", category: "Diabetes", dosage: "100mg", form: "tablet",
    price: { mrp: 350, selling: 320 }, stock: { quantity: 45 },
    description: "Advanced diabetes care"
  },
  {
    name: "Insulin Glargine", brand: "Lantus 100IU", category: "Diabetes", dosage: "100IU/ml", form: "injection",
    price: { mrp: 850, selling: 800 }, stock: { quantity: 20 },
    description: "Long-acting insulin pen", isBestSelling: true
  },

  // Heart Care
  {
    name: "Atorvastatin", brand: "Lipitor 20mg", category: "Heart Care", dosage: "20mg", form: "tablet",
    price: { mrp: 210, selling: 190 }, stock: { quantity: 80 },
    description: "Cholesterol reducing statin", isBestSelling: true
  },
  {
    name: "Amlodipine", brand: "Amlokind 5mg", category: "Heart Care", dosage: "5mg", form: "tablet",
    price: { mrp: 60, selling: 45 }, stock: { quantity: 120 },
    description: "Blood pressure regulation"
  },
  {
    name: "Rosuvastatin", brand: "Crestor 10mg", category: "Heart Care", dosage: "10mg", form: "tablet",
    price: { mrp: 300, selling: 265 }, stock: { quantity: 50 },
    description: "High-efficacy lipid control"
  },
  {
    name: "Aspirin", brand: "Ecosprin 75mg", category: "Heart Care", dosage: "75mg", form: "tablet",
    price: { mrp: 25, selling: 20 }, stock: { quantity: 200 },
    description: "Blood thinner to prevent clots", isBestSelling: true
  },

  // Vitamins
  {
    name: "Vitamin C", brand: "Limcee 500mg", category: "Vitamins", dosage: "500mg", form: "tablet",
    price: { mrp: 40, selling: 35 }, stock: { quantity: 250 },
    description: "Immunity booster chewables", isBestSelling: true
  },
  {
    name: "Multivitamin", brand: "Becosules Z", category: "Vitamins", dosage: "1 capsule", form: "capsule",
    price: { mrp: 55, selling: 48 }, stock: { quantity: 180 },
    description: "Daily vitamin complex"
  },
  {
    name: "Vitamin D3", brand: "UPRISE-D3 60K", category: "Vitamins", dosage: "60000 IU", form: "capsule",
    price: { mrp: 220, selling: 200 }, stock: { quantity: 70 },
    description: "Bone strength supplement", isBestSelling: true
  },
  {
    name: "Calcium", brand: "Shelcal 500mg", category: "Vitamins", dosage: "500mg", form: "tablet",
    price: { mrp: 130, selling: 110 }, stock: { quantity: 160 },
    description: "Calcium and D3 combo"
  },

  // Antibiotics
  {
    name: "Amoxicillin", brand: "Augmentin 625 Duo", category: "Antibiotics", dosage: "625mg", form: "capsule",
    price: { mrp: 210, selling: 195 }, stock: { quantity: 110 },
    description: "Broad-spectrum antibiotic", isBestSelling: true
  },
  {
    name: "Azithromycin", brand: "Azee 500mg", category: "Antibiotics", dosage: "500mg", form: "tablet",
    price: { mrp: 130, selling: 118 }, stock: { quantity: 140 },
    description: "Respiratory tract infection antibiotic", isBestSelling: true
  },
  {
    name: "Ciprofloxacin", brand: "Ciplox 500mg", category: "Antibiotics", dosage: "500mg", form: "tablet",
    price: { mrp: 50, selling: 42 }, stock: { quantity: 90 },
    description: "Potent bacterial infection fighter"
  },
  {
    name: "Cefixime", brand: "Zifi 200mg", category: "Antibiotics", dosage: "200mg", form: "tablet",
    price: { mrp: 110, selling: 95 }, stock: { quantity: 85 },
    description: "Third-generation cephalosporin"
  },

  // Pain Relief
  {
    name: "Ibuprofen", brand: "Brufen 400mg", category: "Pain Relief", dosage: "400mg", form: "tablet",
    price: { mrp: 30, selling: 25 }, stock: { quantity: 180 },
    description: "Rapid pain reduction", isBestSelling: true
  },
  {
    name: "Diclofenac", brand: "Voveran SR 100", category: "Pain Relief", dosage: "100mg", form: "tablet",
    price: { mrp: 140, selling: 125 }, stock: { quantity: 130 },
    description: "Joint and muscle pain tablet"
  },
  {
    name: "Aceclofenac", brand: "Zerodol-SP", category: "Pain Relief", dosage: "100mg+325mg", form: "tablet",
    price: { mrp: 120, selling: 105 }, stock: { quantity: 110 },
    description: "Sprain and inflammation relief"
  },
  {
    name: "Tramadol", brand: "Ultracet", category: "Pain Relief", dosage: "37.5mg+325mg", form: "tablet",
    price: { mrp: 280, selling: 250 }, stock: { quantity: 40 },
    description: "Severe pain management", isBestSelling: true
  },

  // Skin Care
  {
    name: "Aloe Vera Extract", brand: "Patanjali Aloe Gel", category: "Skin Care", dosage: "150ml", form: "gel",
    price: { mrp: 110, selling: 99 }, stock: { quantity: 160 },
    description: "Soothing natural skin gel", isBestSelling: true
  },
  {
    name: "Miconazole", brand: "Candid-B", category: "Skin Care", dosage: "20g", form: "cream",
    price: { mrp: 155, selling: 140 }, stock: { quantity: 95 },
    description: "Antifungal skin treatment"
  },
  {
    name: "Adapalene", brand: "Adaferin", category: "Skin Care", dosage: "15g", form: "gel",
    price: { mrp: 300, selling: 275 }, stock: { quantity: 65 },
    description: "Dermatologist prescribed acne gel"
  },
  {
    name: "Salicylic Acid", brand: "Saslic DS", category: "Skin Care", dosage: "100ml", form: "syrup",
    price: { mrp: 450, selling: 410 }, stock: { quantity: 50 },
    description: "Foaming face wash for clear skin", isBestSelling: true
  },

  // Digestive
  {
    name: "Omeprazole", brand: "Omez 20mg", category: "Digestive", dosage: "20mg", form: "capsule",
    price: { mrp: 65, selling: 55 }, stock: { quantity: 200 },
    description: "Acidity and reflux control", isBestSelling: true
  },
  {
    name: "Pantoprazole", brand: "Pan 40", category: "Digestive", dosage: "40mg", form: "tablet",
    price: { mrp: 150, selling: 135 }, stock: { quantity: 150 },
    description: "Gastric ulcer prevention"
  },
  {
    name: "Domperidone", brand: "Domstal 10mg", category: "Digestive", dosage: "10mg", form: "tablet",
    price: { mrp: 45, selling: 38 }, stock: { quantity: 130 },
    description: "Anti-nausea medication"
  },
  {
    name: "Antacid", brand: "Digene Gel", category: "Digestive", dosage: "200ml", form: "syrup",
    price: { mrp: 180, selling: 160 }, stock: { quantity: 80 },
    description: "Mint flavored fast acidity relief", isBestSelling: true
  },

  // Eye & Ear
  {
    name: "Carboxymethylcellulose", brand: "Refresh Tears", category: "Eye & Ear", dosage: "10ml", form: "drops",
    price: { mrp: 160, selling: 145 }, stock: { quantity: 110 },
    description: "Lubricating eye drops", isBestSelling: true
  },
  {
    name: "Moxifloxacin", brand: "Vigamox", category: "Eye & Ear", dosage: "5ml", form: "drops",
    price: { mrp: 350, selling: 320 }, stock: { quantity: 40 },
    description: "Antibiotic eye drops"
  },
  {
    name: "Clotrimazole Ear", brand: "Candibiotic", category: "Eye & Ear", dosage: "5ml", form: "drops",
    price: { mrp: 120, selling: 105 }, stock: { quantity: 70 },
    description: "Ear infection drops", isBestSelling: true
  },
  {
    name: "Nepafenac", brand: "Nevanac 0.1%", category: "Eye & Ear", dosage: "5ml", form: "drops",
    price: { mrp: 450, selling: 410 }, stock: { quantity: 30 },
    description: "Anti-inflammatory eye drops"
  }
];

const medicines = rawMedicines.map(med => ({
  ...med,
  image: FORM_IMAGES[med.form] || FORM_IMAGES.tablet,
  images: [{ url: FORM_IMAGES[med.form] || FORM_IMAGES.tablet }]
}));

module.exports = medicines;