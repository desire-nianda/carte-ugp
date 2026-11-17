/* =========================================================
   DONNÉES DE LA CARTE — Provinces de la RDC + sites
   ---------------------------------------------------------
   Le tracé des provinces vient du fond de carte amCharts
   (am5geodata_congoDRHigh). Ici : la liste des provinces,
   les catégories et les sites (coordonnées lon/lat).
   ========================================================= */

/* Provinces : clé interne, nom affiché, code ISO 3166-2 (utilisé par amCharts) */
const PROVINCES = [
  { id:"kongo-central",  name:"Kongo Central",  iso:"CD-BC" },
  { id:"kinshasa",       name:"Kinshasa",       iso:"CD-KN" },
  { id:"kwango",         name:"Kwango",         iso:"CD-KG" },
  { id:"kwilu",          name:"Kwilu",          iso:"CD-KL" },
  { id:"mai-ndombe",     name:"Mai-Ndombe",     iso:"CD-MN" },
  { id:"equateur",       name:"Équateur",       iso:"CD-EQ" },
  { id:"sud-ubangi",     name:"Sud-Ubangi",     iso:"CD-SU" },
  { id:"nord-ubangi",    name:"Nord-Ubangi",    iso:"CD-NU" },
  { id:"mongala",        name:"Mongala",        iso:"CD-MO" },
  { id:"tshuapa",        name:"Tshuapa",        iso:"CD-TU" },
  { id:"tshopo",         name:"Tshopo",         iso:"CD-TO" },
  { id:"bas-uele",       name:"Bas-Uélé",       iso:"CD-BU" },
  { id:"haut-uele",      name:"Haut-Uélé",      iso:"CD-HU" },
  { id:"ituri",          name:"Ituri",          iso:"CD-IT" },
  { id:"nord-kivu",      name:"Nord-Kivu",      iso:"CD-NK" },
  { id:"sud-kivu",       name:"Sud-Kivu",       iso:"CD-SK" },
  { id:"maniema",        name:"Maniema",        iso:"CD-MA" },
  { id:"sankuru",        name:"Sankuru",        iso:"CD-SA" },
  { id:"kasai",          name:"Kasaï",          iso:"CD-KS" },
  { id:"kasai-central",  name:"Kasaï Central",  iso:"CD-KC" },
  { id:"kasai-oriental", name:"Kasaï Oriental", iso:"CD-KE" },
  { id:"lomami",         name:"Lomami",         iso:"CD-LO" },
  { id:"tanganyika",     name:"Tanganyika",     iso:"CD-TA" },
  { id:"haut-lomami",    name:"Haut-Lomami",    iso:"CD-HL" },
  { id:"lualaba",        name:"Lualaba",        iso:"CD-LU" },
  { id:"haut-katanga",   name:"Haut-Katanga",   iso:"CD-HK" }
];

/* Catégories de sites (légende) */
const CATEGORIES = {
  "09p": { label:"Plateformes logistiques douanières", color:"#5b9bd5" },
  "10b": { label:"Bâtiments administratifs",           color:"#9c1f7f" },
  "10e": { label:"Entrepôts douaniers",                 color:"#68a93b" },
  "30b": { label:"Bureaux & postes frontaliers",        color:"#d2463b" },
  "60s": { label:"Concessions à clôturer",              color:"#e2b33c" }
};

/* Sites par province : [nom, catégorie, longitude, latitude, indicatif?]
   indicatif = true → position approximative, à confirmer (lieu non localisé avec certitude). */
const SITES = {
  "bas-uele": [
    ["Buta", "30b", 24.7300, 2.8000]
  ],
  "haut-uele": [
    ["Aba", "10e", 30.2330, 3.8670],
    ["Isiro", "30b", 27.6160, 2.7730]
  ],
  "ituri": [
    ["Aru", "09p", 30.8330, 2.8660],
    ["Mahagi", "10b", 30.9925, 2.3075],
    ["Direction provinciale - Ituri", "10e", 30.2420, 1.5598],
    ["Bunia", "10e", 30.2500, 1.5667],
    ["Tchomia", "10e", 30.4900, 1.4250, true],
    ["Kasenyi", "10e", 30.4300, 1.3967, true],
    ["Komanda", "30b", 29.7667, 1.3667],
    ["Fataki", "30b", 30.3900, 2.0300, true]
  ],
  "nord-kivu": [
    ["Kasindi", "09p", 29.7083, 0.0417],
    ["Mwenda", "30b", 29.7500, 0.2670, true],
    ["Butembo", "30b", 29.2911, 0.1419]
  ],
  "sud-kivu": [
    ["Baraka", "30b", 29.0939, -4.1028]
  ],
  "tanganyika": [
    ["Direction provinciale - Tanganyika", "10b", 29.1947, -5.9475],
    ["Moba", "30b", 29.7744, -7.0369]
  ],
  "haut-katanga": [
    ["Kipushi", "09p", 27.2503, -11.7608],
    ["Bitima", "09p", 27.5200, -11.6300, true],
    ["Direction provinciale - Haut-Katanga", "10b", 27.4790, -11.6640],
    ["Bitima", "10e", 27.5350, -11.6450, true],
    ["Bitima", "30b", 27.5050, -11.6450, true],
    ["Kapwarsha", "30b", 28.3500, -12.4300, true],
    ["Tshiyanga", "30b", 28.5600, -12.7500, true]
  ],
  "lualaba": [
    ["Dilolo", "09p", 22.3435, -10.6866],
    ["Shamaziamo", "10e", 25.5000, -10.6800, true],
    ["Sakabinda (Kolwezi)", "30b", 25.4500, -10.7300, true],
    ["Shamaziamo", "60s", 25.5200, -10.7000, true]
  ],
  "haut-lomami": [
    ["Kamina", "30b", 24.9906, -8.7386]
  ],
  "lomami": [
    ["Mwene-Ditu", "10e", 23.4500, -6.9833]
  ],
  "kasai-central": [
    ["Tshambata", "30b", 22.4200, -5.9000, true],
    ["Katenge Mwasi", "30b", 22.4523, -7.5793]
  ],
  "kasai": [
    ["Mafunda Kasaï", "30b", 20.3300, -7.3200, true]
  ],
  "kwango": [
    ["Kenge", "10e", 16.9031, -4.8061],
    ["Kasongo Lunda", "30b", 16.8172, -6.4744],
    ["Kenge", "60s", 16.9150, -4.8150],
    ["Kahemba", "60s", 19.0000, -7.2833],
    ["Hamukwale", "60s", 17.4000, -7.3000, true],
    ["Kasongo Lunda", "60s", 16.8290, -6.4840],
    ["Tembo", "60s", 17.2800, -7.7000, true]
  ],
  "kwilu": [
    ["Kikwit", "60s", 18.8162, -5.0410]
  ],
  "mai-ndombe": [
    ["Kwamouth", "60s", 16.2000, -3.1833]
  ],
  "kinshasa": [
    ["Siège DGDA", "10e", 15.3108, -4.3036],
    ["Centre de formation Kin-Aéro", "10b", 15.4446, -4.3858, true],
    ["Kinshasa (DGDA)", "10e", 15.3150, -4.3100, true],
    ["Hangar chauffeurs", "10e", 15.3700, -4.3700, true],
    ["Mitendi", "30b", 15.2197, -4.4583],
    ["KinAéro/Limete Funa", "60s", 15.3450, -4.3550, true],
    ["Kinkole", "60s", 15.4980, -4.3570]
  ],
  "kongo-central": [
    ["Kimpangu", "09p", 14.6000, -5.8300, true],
    ["Yema", "09p", 12.2550, -5.7450, true],
    ["Ango-Ango", "09p", 13.4417, -5.8517],
    ["Direction provinciale Kongo Central", "10b", 13.4500, -5.8167],
    ["Noqui", "30b", 13.4400, -5.8600, true],
    ["Kwilu Ngongo", "30b", 14.6825, -5.5006],
    ["Lufu", "30b", 14.2500, -5.8300, true],
    ["Mbaka Kosi", "30b", 12.5500, -5.1500, true],
    ["Ombayi", "30b", 12.6000, -5.3000, true],
    ["Sisi", "30b", 12.7000, -5.0000, true],
    ["Sakambundji", "30b", 12.8000, -4.8000, true],
    ["Matadi", "60s", 13.4833, -5.8167],
    ["Noqui", "60s", 13.4500, -5.8700, true],
    ["CURIS", "60s", 13.4700, -5.8300, true],
    ["Lufu", "60s", 14.2600, -5.8400, true],
    ["Kwilu Ngongo", "60s", 14.6950, -5.5100],
    ["Songololo", "60s", 14.0330, -5.7000],
    ["Boma", "60s", 13.0500, -5.8500],
    ["Moanda", "60s", 12.3500, -5.9333],
    ["Banana", "60s", 12.4000, -6.0117],
    ["Yatch", "60s", 13.0600, -5.8600, true],
    ["Kizenga", "60s", 13.2000, -5.6000, true],
    ["Kimpangu", "60s", 14.6100, -5.8400, true],
    ["Yema", "60s", 12.2650, -5.7550, true],
    ["Luali", "60s", 12.5500, -5.0300, true],
    ["Bukayana", "60s", 12.6500, -5.1000, true],
    ["Zombe", "60s", 12.7500, -5.2000, true],
    ["Mbuku Dingi", "60s", 12.8500, -5.4000, true],
    ["Tshela", "60s", 12.9333, -4.9667],
    ["Ndomba", "60s", 13.0000, -5.1000, true],
    ["Mpanzu Kuama", "60s", 13.1000, -5.3000, true]
  ]
};
