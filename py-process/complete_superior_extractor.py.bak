#!/usr/bin/env python3
"""
Complete Superior Grocers PDF Circular Extraction Script
Extracts all products from both Nov 12-18 and Nov 19-25, 2024 circulars
"""
import csv

# Date references
DATES_PDF1 = "Offer valid from Nov. 12 - Nov. 18, 2024."
DATES_PDF2 = "Offer valid from Nov. 19 - Nov. 25, 2024."

# Product data structure:
# Format: (type, title, price, units, description, dates_ref, length, height, quantity)
# type: 'C' = Category, 'P' = Product
# dates_ref: 'pdf1' or 'pdf2'

PRODUCTS = [
    # ==================== PDF 1: Nov 12-18, 2024 ====================
    
    # PAGE 1 - FRONT
    ('C', 'Red Tag Specials', '', '', '', '', '', '', ''),
    ('P', 'Superior Tortillas', '3.99', '', '120 Count', 'pdf1', '3', '2', ''),
    ('P', 'Large Mangoes', '0.79', '', 'Mango Grande', 'pdf1', '3', '2', ''),
    ('P', 'Untrimmed Beef Roast or Steak', '4.99', 'lb.', 'Punta de Palomilla en Trozo o Bistec', 'pdf1', '3', '2', ''),
    ('P', 'Russet Potatoes', '1.99', '', '10 lb. bag, Bolsa de Papa Russet', 'pdf1', '3', '2', ''),
    ('P', 'Caldo de Res Pollo', '9.99', '', '32 oz', 'pdf1', '3', '2', ''),
    ('P', 'Chicken Drumsticks', '0.99', 'lb.', 'Family Pack, Piernas de Pollo', 'pdf1', '3', '2', ''),
    
    ('C', 'Specials of the Week', '', '', '', '', '', '', ''),
    ('P', 'Coca Cola Soft Drinks', '1.99', '', '2 liter', 'pdf1', '1', '1', ''),
    ('P', 'Cheetos or Fritos', '2.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Guerrero Corn Tortillas', '3.49', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Sonora Style Soft Tacos, Mission Estilo Casero, Guerrero Riquisimas Flour Tortillas', '0.99', '', '', 'pdf1', '2', '2', ''),
    ('P', '1-2-3 Vegetable Oil', '9.98', '', '48 oz', 'pdf1', '2', '2', ''),
    ('P', 'Mahatma Long Grain Rice', '4.98', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Nestle Carnation Milk', '5', '', '4 for $5', 'pdf1', '2', '2', '4'),
    ('P', "Anthony's Pasta Sauce, Anthony's Pasta", '5', '', '2 for $5', 'pdf1', '2', '2', '2'),
    ('P', 'Nescafe Clasico Coffee', '3.49', '', '7 oz', 'pdf1', '2', '2', ''),
    ('P', 'Maruchan Snacks', '2.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Los Altos Queso Fresco or Cremas', '5', '', '15 oz, 2 for $5', 'pdf1', '2', '2', '2'),
    ('P', 'Tide Simply Laundry Detergent', '8.49', '', '100-128 oz', 'pdf1', '2', '2', ''),
    ('P', 'Niagara Drinking Water', '10.99', '', '32 Pack, 2 for $10.99', 'pdf1', '2', '2', '2'),
    ('P', 'Bar S Smoked Bacon', '4.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Bud, Coors, Tecate or Miller Lite', '21.99', '', '12 Pack, 12 oz Cans', 'pdf1', '2', '2', ''),
    
    ('C', 'Saturday & Sunday Specials', '', '', '', '', '', '', ''),
    ('P', 'Fresh Pork Steak Breast', '7.99', '', 'Pechuga de Puerco Fresca', 'pdf1', '2', '2', ''),
    ('P', 'Mexico Style Beef, Punta de Pecho', '3.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Boneless Skinless Chicken Breast', '2.49', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Tropicana 100% Pure Orange Juice', '5', '', '52 oz, 4 for $5', 'pdf1', '2', '2', '4'),
    ('P', 'Tomatoes', '0.99', 'lb.', '', 'pdf1', '1', '1', ''),
    ('P', 'Green Limes', '0.79', 'lb.', '', 'pdf1', '1', '1', ''),
    ('P', 'Arizona Gala Apples', '1', '', '2 for $1', 'pdf1', '1', '1', '2'),
    ('P', 'Sunny D Citrus Punch', '2.99', '', '64 oz', 'pdf1', '2', '2', ''),
    ('P', 'Guerrero Casserole', '1.99', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Jarritos', '3', '', '1.5 liter, 2 for $3', 'pdf1', '1', '1', '2'),
    ('P', 'Nutella Hazelnut Spread', '3.49', '', '13 oz', 'pdf1', '2', '2', ''),
    ('P', 'Modelo Especial Pacifico Clara or Victoria', '14.99', '', '12 Pack', 'pdf1', '2', '2', ''),
    ('P', 'Famous Campechano or Tortillamanía', '2.99', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Mini Conchas', '5', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Pork Neck Bone', '9.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Rice & Beans', '4.99', '', '', 'pdf1', '2', '2', ''),
    
    # PAGE 2 - INTERIOR LEFT
    ('C', 'Grocery/Abarrotes', '', '', '', '', '', '', ''),
    ('P', 'Essential Everyday Premium Orange Juice', '1.29', '', '59 oz', 'pdf1', '1', '1', ''),
    ('P', 'Maruchan Instant Lunch Ramen Noodles', '0.40', '', '2.25 oz', 'pdf1', '1', '1', ''),
    ('P', 'Chase-It Crackers', '1.29', '', '7-8 oz', 'pdf1', '1', '1', ''),
    ('P', 'Nestle Abuelita Mexican Chocolate', '5.79', '', '19 oz', 'pdf1', '2', '2', ''),
    ('P', 'Nesqué, Carlos V, Chocolate Abuelita or Zucaritas', '4.99', '', 'Selected Varieties', 'pdf1', '2', '2', ''),
    ('P', 'El Comal Grande Corn Tortillas', '1.99', '', '80 count', 'pdf1', '2', '2', ''),
    ('P', 'La Banderita Flour Tortillas', '3.99', '', '20 count', 'pdf1', '2', '2', ''),
    ('P', 'Repone Suave Dish Soap', '2.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Bimbo Bread', '1.99', '', 'Select Varieties', 'pdf1', '2', '2', ''),
    ('P', 'Del Monte Vegetables', '3', '', '2 for $3', 'pdf1', '2', '2', '2'),
    ('P', 'Pillsbury Biscuits', '3', '', '2 for $3', 'pdf1', '2', '2', '2'),
    ('P', 'La Pepita Tostadas', '2.99', '', '24 count', 'pdf1', '2', '2', ''),
    ('P', 'Dawn Original Dish Soap', '2.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Viva Bath Tissue Paper Towels', '4.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Barcel Takis Kettle Potato Chips', '3.49', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Suavitel Fabric Softener', '9.98', '', '', 'pdf1', '2', '2', ''),
    
    ('C', 'Dairy & Deli', '', '', '', '', '', '', ''),
    ('P', 'Bar-S Franks', '5', '', '5 for $5', 'pdf1', '2', '2', '5'),
    ('P', 'Joseph Farms Cool Beverage', '15.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Daily Sun Orange Juice', '2.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Simply Lemonade', '2.99', '', '52 oz', 'pdf1', '2', '2', ''),
    ('P', 'Yakult Dairy Beverage', '2.99', '', '5 pack', 'pdf1', '2', '2', ''),
    ('P', 'Yoplait Yogurt', '5', '', '4 for $5', 'pdf1', '2', '2', '4'),
    ('P', 'Beer Premium Deli Ham', '4.49', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Bar S Hot Links', '2.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Cafe Bustelo Cuban Style Coffee Ground', '2.98', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Farmer John Bacon', '3', '', '2 for $3', 'pdf1', '2', '2', '2'),
    ('P', 'Lactaid Milk', '6.99', '', '96 oz', 'pdf1', '2', '2', ''),
    ('P', 'El Mexicano Arroz Con Leche', '0.90', '', '', 'pdf1', '2', '2', ''),
    
    ('C', 'Frozen/Congelados', '', '', '', '', '', '', ''),
    ('P', 'Stouffers Family Size', '16.88', '', '8 Count', 'pdf1', '2', '2', ''),
    ('P', 'Hot Pockets', '5.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Essential Everyday Vegetables', '3.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Digiorno Pizza', '6.99', '', '24.2-29 oz', 'pdf1', '2', '2', ''),
    ('P', 'De Wafelbakkers Pancakes or Waffles', '4.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'El Monterey Burritos', '5', '', '10 for $5', 'pdf1', '2', '2', '10'),
    ('P', 'Kemps Vanilla or Sunrise Cups', '6.99', '', '', 'pdf1', '2', '2', ''),
    ('P', "Dreyer's Ice Cream", '3.99', '', '', 'pdf1', '2', '2', ''),
    
    ('C', 'Beer, Wine & Liquor', '', '', '', '', '', '', ''),
    ('P', 'Quality Variety & Value! Assorted Wines', '7.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Gallo Family Vineyards', '13.99', '', '1.5 liter', 'pdf1', '2', '2', ''),
    ('P', 'Tequila Rose Strawberry Cream', '16.99', '', '750ml', 'pdf1', '2', '2', ''),
    ('P', "Buchanan's Deluxe or Canadian Club", '12.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Svedka Vodka', '12.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Modelo Especial Corona or Pacifico', '16.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Budweiser Busch or Natural Light', '16.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Sparkling Ice Drinks', '5', '', '4 for $5', 'pdf1', '2', '2', '4'),
    ('P', 'Pepsi Cola Soft Drinks', '10.99', '', '8 Pack/7.5 oz mini', 'pdf1', '2', '2', ''),
    ('P', '7-Up Soft Drink', '5.99', '', '6 Pack/16.9 oz', 'pdf1', '2', '2', ''),
    
    ('C', 'International Food Specials', '', '', '', '', '', '', ''),
    ('P', 'Best Foods Mayonnaise or Miracle Whip', '3.99', '', 'Buy 2 Save $2, Mix & Match', 'pdf1', '2', '2', ''),
    ('P', 'Knorr Products', '3.99', '', 'Buy 2 Save $2, Mix & Match', 'pdf1', '2', '2', ''),
    ('P', 'Haggi Snaps', '0.59', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Orion Choco Pie or Custard Cake', '4.49', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Orion Turtle Chips', '3.49', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Kampie Japanese Mayonnaise', '6.49', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Cafe La Llave Espresso Coffee', '5.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Perla Plantain Chips', '8.49', '', '', 'pdf1', '2', '2', ''),
    
    # PAGE 3 - INTERIOR RIGHT
    ('C', 'Fresh Cut Meats/Carnes Frescas', '', '', '', '', '', '', ''),
    ('P', 'Beef Soup, Mole de Olla', '4.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Beef Stew Meat', '6.99', 'lb.', 'Trozos de Res', 'pdf1', '2', '2', ''),
    ('P', 'Beef Bottom Round or Sirloin Tip', '4.99', 'lb.', 'Redonda o Cuete de Res', 'pdf1', '2', '2', ''),
    ('P', 'Beef Coco Pork Shoulder Roast', '6.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Stew Meat', '2.69', 'lb.', 'Trozos de Puerco', 'pdf1', '2', '2', ''),
    ('P', 'Pork Feet Patitas de Puerco', '2.69', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Rib Steak or Pork Belly', '2.99', 'lb.', 'Bistec o Cima de Paleta', 'pdf1', '2', '2', ''),
    ('P', 'Pork Adobada Seasoned', '3.49', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Pork Chops', '4.69', 'lb.', 'Chuletas de Puerco', 'pdf1', '2', '2', ''),
    ('P', 'Boneless Skinless Chicken Breast', '3.99', 'lb.', 'Pechuga de Pollo', 'pdf1', '2', '2', ''),
    ('P', 'Chicken Thighs', '3.49', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Chicken Ground or Meatloaf', '3.49', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Lean Ground Beef', '3.99', 'lb.', '', 'pdf1', '2', '2', ''),
    
    ('C', 'Fresh Seafood/Pescado y Mariscos Frescos', '', '', '', '', '', '', ''),
    ('P', 'Raw Peeled & Deveined White Shrimp', '5.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Cooked Squid Calamares', '4.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Raw Red Whole Shrimp', '6.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Lobster/Crab Pre-Sliced', '19.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Imitation Crab Meat', '2.99', 'lb.', '', 'pdf1', '2', '2', ''),
    
    ('C', 'Service Deli/Cremeria', '', '', '', '', '', '', ''),
    ('P', 'Queso Cremoso o Casero', '4.49', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Queso Fresco', '5.79', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Cotija Polvo', '5.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Queso Oaxaca', '2.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Crema Mexicana a Centro America', '2.69', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Kruse Smoked Ham', '3.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Kruse Black Forest Ham', '4.89', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Foster Farms Oven Roast Beef/Honey Turkey Ham', '4.49', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Chicken Shredded Tenders or Fillets', '5.99', 'lb.', '', 'pdf1', '2', '2', ''),
    
    ('C', 'Convenience', '', '', '', '', '', '', ''),
    ('P', 'Bar-S Corn Dogs', '7.99', '', '2.67 lb', 'pdf1', '2', '2', ''),
    ('P', 'Teriyaki Chicken Orange Chicken', '5.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Simplot Hashbrowns', '3.79', '', '44 oz', 'pdf1', '2', '2', ''),
    ('P', 'Simplot Hashbrowns', '5.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Holten Patty Value Patties', '14.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Superior Smoked Breakfast Pork Chops', '5.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Smithfield Signature Pork Chops', '6.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Chicharron Prensado', '7.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Horno del Carmelo Party Wings', '15.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Chef Merito Seasoning Marinado', '4.99', '', '', 'pdf1', '2', '2', ''),
    
    ('C', 'Hot Foods/Comidas Calientes', '', '', '', '', '', '', ''),
    ('P', 'Los Guisados #1', '22.99', '', '3 lbs. Chicken, Steak, Medium Piyote Beans, Cilantro, Onions, Salsa, Choice of 10 Corn Tortillas', 'pdf1', '3', '2', ''),
    ('P', 'Los Guisados #2 El Mixto', '20.99', '', '', 'pdf1', '3', '2', ''),
    ('P', 'Los Guisados #5 El Michoacano', '29.99', '', '', 'pdf1', '3', '2', ''),
    ('P', 'Rotisserie Chicken', '9.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Korean Style Chicken', '1.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Half Dozen Tamales', '16.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Champurrado or Atole', '3.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Flautas', '5', '', '4 pcs', 'pdf1', '2', '2', ''),
    ('P', 'Chicharron Belly', '15.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Torta Gigante', '10.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Guacamole', '7.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Daily Special - Monday Fried Chicken', '1', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Daily Special - Tuesday Flautas/Tacos de Papa', '1', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Daily Special - Wednesday Caldo Chile Relleno Combo', '6.99', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Daily Special - Thursday Birrito Con Arroz Combo', '6.99', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Daily Special - Friday Fried Tilapia', '23.99', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Daily Special - Saturday/Sunday Pork Ribs, Barbacoa, Menudo or Pozole', '6.99', '', '', 'pdf1', '1', '1', ''),
    
    # PAGE 4 - BACK
    ('C', 'Superior Savings for the Whole Family', '', '', '', '', '', '', ''),
    ('P', 'Parrot Coconut Water', '0.99', '', '17.5 oz', 'pdf1', '1', '1', ''),
    ('P', 'El Mexicano Whole Jalapenos Chipotle Peppers', '0.99', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Colgate Toothpaste', '0.99', '', '5.1-6 oz', 'pdf1', '1', '1', ''),
    ('P', 'C & H Pure Cane Sugar', '2.99', '', '4 lb', 'pdf1', '1', '1', ''),
    ('P', 'Gamesa Barra De Coco, Ricanelas, Hawaianas, Flor De Naranja', '2.99', '', '', 'pdf1', '1', '1', ''),
    ('P', 'Ducal Refried Beans', '5', '', '29 oz, 3 for $5', 'pdf1', '1', '1', '3'),
    ('P', 'Cacique Chorizo', '5', '', '9 oz, 4 for $5', 'pdf1', '1', '1', '4'),
    ('P', 'Kraft Philly Cream Cheese Brick', '5.99', '', '8 oz', 'pdf1', '1', '1', ''),
    ('P', 'Knorr Bouillon', '5.99', '', '7.9-15.9 oz', 'pdf1', '1', '1', ''),
    ('P', 'Coffeemate Creamer', '6.99', '', '32 oz', 'pdf1', '1', '1', ''),
    ('P', 'Capri Sun Variety Pack or Fruit Punch Juice Drink', '7.99', '', '10 pack', 'pdf1', '1', '1', ''),
    
    ('C', 'We Guarantee Our Freshness!', '', '', '', '', '', '', ''),
    ('P', 'Large Avocado', '5', '', '4 for $5', 'pdf1', '2', '2', '4'),
    ('P', 'Green or Red Grapes', '0.99', 'lb.', 'Uvas (Rojas o Verdes)', 'pdf1', '2', '2', ''),
    ('P', 'Seedless Watermelon', '0.25', 'lb.', 'Sandia Sin Semilla', 'pdf1', '2', '2', ''),
    ('P', 'Peeled Sugar Cane', '5', '', '16 oz, 2 for $5', 'pdf1', '2', '2', '2'),
    ('P', 'Pomegranate', '5', '', 'Granadas, 2 for $5', 'pdf1', '2', '2', '2'),
    ('P', 'Young Coconut', '3', '', '2 for $3', 'pdf1', '2', '2', '2'),
    ('P', 'Fuyu Persimmons', '1.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Castilla Squash', '1', '', 'Calabaza de Castilla, 2 for $1', 'pdf1', '2', '2', '2'),
    ('P', 'Sweet, Russet or Medium Yams', '0.99', 'lb.', '', 'pdf1', '2', '2', ''),
    ('P', 'Piloncillo', '2.19', '', '4 Pack', 'pdf1', '2', '2', ''),
    ('P', 'Ocean Spray Cranberries', '2.49', '', '12 oz', 'pdf1', '2', '2', ''),
    ('P', 'White or Red Potatoes', '0.99', 'lb.', 'Papa Blanca o Roja', 'pdf1', '2', '2', ''),
    ('P', 'Carrots', '6', '', '5 lb. Bag, Zanahorias, 2 for $6', 'pdf1', '2', '2', '2'),
    ('P', 'Green Cabbage', '0.69', 'lb.', 'Repollo Verde', 'pdf1', '2', '2', ''),
    ('P', 'Pinto Beans Bulk', '0.79', 'lb.', 'Frijoles Pinto Suelto', 'pdf1', '2', '2', ''),
    ('P', 'Bonduelle Grande Bowls', '6', '', '7.75 oz, Selected Varieties, 2 for $6', 'pdf1', '2', '2', '2'),
    ('P', 'Fruit Cocktail in Syrup', '2.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Fresh Cut Fruit Cocktails', '3.49', '', 'Selected Varieties', 'pdf1', '2', '2', ''),
    ('P', 'Packaged Corn', '3.99', '', '4 Count', 'pdf1', '2', '2', ''),
    
    ('C', 'Organics Guaranteed Fresh', '', '', '', '', '', '', ''),
    ('P', 'Organic Celery', '1.19', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Organic Diced Carrots', '1.79', '', '12 oz', 'pdf1', '2', '2', ''),
    ('P', 'Tasteful Selection Potatoes', '2.79', '', '1.5 lb', 'pdf1', '2', '2', ''),
    ('P', 'Organic Green Beans', '2.99', '', '', 'pdf1', '2', '2', ''),
    
    ('C', 'Tamaliza', '', '', '', '', '', '', ''),
    ('P', 'Superior Totopo Preparada', '1.99', '', '16 oz', 'pdf1', '2', '2', ''),
    ('P', 'Corn Husk Leaves', '6.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Banana Leaves', '1.29', '', 'Hojas de Platano', 'pdf1', '2', '2', ''),
    ('P', 'Cilantro, Mild Peppers or Jalapeno', '1.49', '', 'Mexico or Jalapeno', 'pdf1', '2', '2', ''),
    
    ('C', 'Fresh Bakery/Nuestra Panaderia', '', '', '', '', '', '', ''),
    ('P', 'Superior Chips', '5.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Superior Tortilleria or Casera', '3.49', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Superior Baguettes', '2.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Bolillos', '4.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Kings Hawaiian Rolls', '7.99', '', '12 oz', 'pdf1', '2', '2', ''),
    ('P', 'Bread Baskets', '6.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Apple, Four Seasons or Peach Pie', '10.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Superior Cheesecakes Pumpkin or Cookies & Cream', '17.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Mil Hojas Bar Cake', '14.99', '', '', 'pdf1', '2', '2', ''),
    ('P', 'Large Flan', '14.99', '', '48 oz', 'pdf1', '2', '2', ''),
    ('P', 'Tres Leches Cake', '23.99', '', '', 'pdf1', '2', '2', ''),
    
    # ==================== PDF 2: Nov 19-25, 2024 ====================
    
    # PAGE 1 - FRONT
    ('C', 'Red Tag Specials - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Russet Potatoes', '4', '', '10 lb. bag, Bolsa de Papa Russet, 2 for $4', 'pdf2', '2', '2', '2'),
    ('P', 'Boneless Skinless Chicken Breast', '0.99', 'lb.', 'Pechuga de Pollo Sin Hueso, Limit of 10 Pounds', 'pdf2', '3', '2', ''),
    ('P', 'Roma Tomatoes', '0.99', 'lb.', 'Tomate Roma', 'pdf2', '2', '2', ''),
    ('P', 'Champurrado & Tamale Combo', '3.99', '', '18 oz Cup of Champurrado', 'pdf2', '2', '2', ''),
    ('P', 'Beef Center Cut Shank', '4.99', 'lb.', 'Centro de Chamorro de Res', 'pdf2', '2', '2', ''),
    
    ('C', 'Specials of the Week - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Coca-Cola Soft Drinks', '5.99', '', '12 Pack/12 oz. Cans or 8 Pack/12 oz. Bottles', 'pdf2', '2', '2', ''),
    ('P', 'Doritos or Ruffles', '2.49', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Guerrero Corn Tortillas, Sonora Style Soft Tacos, Mission Estilo Casero, Guerrero Riquisimas or Whole Jalapenos', '0.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Mazola Cooking Oil', '3.99', '', '40 oz', 'pdf2', '2', '2', ''),
    ('P', 'C&H Pure Cane Sugar', '2.99', '', '4 lbs', 'pdf2', '2', '2', ''),
    ('P', 'Gold Medal All Purpose Flour', '5', '', '5 lbs, 2 for $5', 'pdf2', '2', '2', '2'),
    ('P', 'Essential Everyday Whole Kernel Corn', '1', '', '15.25 oz, 2 for $1', 'pdf2', '2', '2', '2'),
    ('P', 'Knorr Bouillon', '5.99', '', 'Selected Varieties', 'pdf2', '2', '2', ''),
    ('P', 'Maseca Tamal or Nixtamaseca', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'El Mexicano Queso Fresco Mexican Style Cheese or Cremas', '5', '', '2 for $5', 'pdf2', '2', '2', '2'),
    ('P', "Dreyer's Ice Cream", '3.99', '', 'Selected Varieties, 1.5 Quart', 'pdf2', '2', '2', ''),
    ('P', 'Niagara Drinking Water', '12.99', '', '32 Pack, 16.9 oz, 2 for $12.99', 'pdf2', '2', '2', '2'),
    ('P', 'Coffeemate Creamer', '6.99', '', '32 oz', 'pdf2', '2', '2', ''),
    ('P', 'Dos Equis XX, Bohemia, Heineken, Tecate, Carta Blanca or Tequila Anejo', '27.99', '', '', 'pdf2', '2', '2', ''),
    
    ('C', 'Saturday & Sunday Specials - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Pork Shoulder Steak Breast', '4.99', 'lb.', 'Bistec de Bistec', 'pdf2', '2', '2', ''),
    ('P', 'Raw Large Shrimp', '5.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Pork Ribs Boneless', '2.99', 'lb.', 'Costilla de Puerco', 'pdf2', '2', '2', ''),
    ('P', 'La Lechera Sweetened Milk', '5', '', '14 oz, 3 for $5', 'pdf2', '2', '2', '3'),
    ('P', 'White Onions', '1', '', '3 for $1', 'pdf2', '1', '1', '3'),
    ('P', 'Green Limes', '1', '', '2 for $1', 'pdf2', '1', '1', '2'),
    ('P', 'Pineapples', '0.79', 'lb.', '', 'pdf2', '1', '1', ''),
    ('P', 'Dannon Yogurt Creamix Items', '16.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Calidad Chips', '3', '', '20 count Varieties, 2 for $3', 'pdf2', '1', '1', '2'),
    ('P', 'Shasta Soft Drinks', '3.99', '', '12 Pack/12 oz. Cans', 'pdf2', '2', '2', ''),
    ('P', "Martinelli's Apple Juice, Gold Medal or Sparkling Cider", '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Modelo, Dos Equis, Corona Regular or Corona Premier', '21.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Mantecadas Regular or Chocolate', '5', '', '', 'pdf2', '1', '1', ''),
    ('P', 'Pan de Elote', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Guacamole', '7.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Kirkwood Pollo Asado Chicken', '9.99', '', '', 'pdf2', '2', '2', ''),
    
    # PAGE 2 - INTERIOR LEFT
    ('C', 'Grocery/Abarrotes - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Kraft Mac & Cheese', '0.99', '', 'Selected Varieties', 'pdf2', '1', '1', ''),
    ('P', 'Jell-O Gelatin/Pudding', '1.69', '', '', 'pdf2', '1', '1', ''),
    ('P', 'Go-Gurt Yogurt', '1.99', '', '', 'pdf2', '1', '1', ''),
    ('P', 'Cool Whip', '2.99', '', '8 oz', 'pdf2', '1', '1', ''),
    ('P', 'Heinz Tomato Ketchup', '3.49', '', '32 oz', 'pdf2', '1', '1', ''),
    ('P', 'Oscar Mayer Lunch Meats', '3.99', '', '7-9 oz', 'pdf2', '1', '1', ''),
    ('P', 'Maruchan Ramen Noodles', '1.25', '', 'Selected Varieties', 'pdf2', '2', '2', ''),
    ('P', 'Nestle Media Crema', '4.99', '', '', 'pdf2', '2', '2', ''),
    ('P', "Campbell's Cream of Mushroom/Celery", '1.49', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Jell-O Pudding Cups', '2.99', '', '4 pack', 'pdf2', '2', '2', ''),
    ('P', 'Calidad Tostadas', '5', '', '3 for $5', 'pdf2', '2', '2', '3'),
    ('P', 'Swanson Broth', '2.49', '', '32 oz', 'pdf2', '2', '2', ''),
    ('P', 'Pillsbury Cracker Stacks Cracker Pie Crust', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'La Costena Jalapenos or Beans', '3', '', '2 for $3', 'pdf2', '2', '2', '2'),
    ('P', 'Golden Boy Whole Wheat Jasmine Rice', '5.99', '', '2 lb', 'pdf2', '2', '2', ''),
    ('P', 'Nabisco Ritz Crackers', '3.49', '', '', 'pdf2', '2', '2', ''),
    ('P', 'McCormick Mayonnaise Mustard or Juice', '5.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Guerrero Corn Tortillas', '2.98', '', '30 count', 'pdf2', '2', '2', ''),
    ('P', 'Dixie Paper Plates', '3.49', '', '48 count', 'pdf2', '2', '2', ''),
    ('P', 'Jubilee Bath Tissue', '2.99', '', '4 Roll Pack', 'pdf2', '2', '2', ''),
    ('P', 'Ocean Spray Cranberries Juice', '2.99', '', '64 oz', 'pdf2', '2', '2', ''),
    ('P', 'Barcel Takis Tortilla Chips', '3.49', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Pepsi Soft Drinks', '4.99', '', '6 Pack/16.9 oz', 'pdf2', '2', '2', ''),
    ('P', '7-Up Soft Drinks', '4.99', '', '12 Pack/12 oz. Cans', 'pdf2', '2', '2', ''),
    ('P', 'Jarritos', '4', '', '1.5 liter, 3 for $4', 'pdf2', '2', '2', '3'),
    ('P', 'Electrolit Sports Drink', '4', '', '2 for $4', 'pdf2', '2', '2', '2'),
    
    ('C', 'Dairy & Deli - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Kraft Philly Cheesecake Creamery', '3.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Joseph Farms Cool Beverage', '5', '', '4 for $5', 'pdf2', '2', '2', '4'),
    ('P', 'Shredded or Block Cheese', '5', '', '2 for $5', 'pdf2', '2', '2', '2'),
    ('P', 'Joseph Farms Shredded or Block Cheese', '15.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Simply Lemonade or Daily Sun Orange Juice or Grapefruit', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Chobani Protein Yogurt Any', '5', '', '4 for $5', 'pdf2', '2', '2', '4'),
    ('P', 'Yoplait Yogurt', '4.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Superior Milk Whole or 2%', '3.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Bar S Eat & Serve Lean Sliced Ham', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Daisy Sour Cream', '5', '', '16 oz, 2 for $5', 'pdf2', '2', '2', '2'),
    ('P', 'Challenge Butter', '3.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Bade Vie Mozzarella Cream', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Bar-S Jumbo Franks', '5', '', '4 for $5', 'pdf2', '2', '2', '4'),
    ('P', 'Cacique Ranchero Cheese', '5', '', '4 for $5', 'pdf2', '2', '2', '4'),
    
    ('C', 'Frozen/Congelados - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Cacique Pancho Chorizo', '5', '', '4 for $5', 'pdf2', '2', '2', '4'),
    ('P', 'Red Baron Taquitos', '12.99', '', '20 count', 'pdf2', '2', '2', ''),
    ('P', 'Essential Everyday Vegetables', '5', '', '4 for $5', 'pdf2', '2', '2', '4'),
    ('P', 'Hot Pockets Pie Crust Shells', '7', '', '2 for $7', 'pdf2', '2', '2', '2'),
    ('P', 'Eggo Waffles', '5', '', '10.9-12.3 oz, 2 for $5', 'pdf2', '2', '2', '2'),
    ('P', 'Oreida Potatoes', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', "Marie Callender's Pies", '6.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Paletas La Reina', '7.99', '', 'Selected Varieties', 'pdf2', '2', '2', ''),
    ('P', 'Old El Paso Garlic Texas Toast', '3.79', '', '', 'pdf2', '2', '2', ''),
    
    ('C', 'Beer, Wine & Liquor - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Stella Rosa Wines', '10.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Buzzball Wine Cocktails', '19.99', '', '1.75 liter', 'pdf2', '2', '2', ''),
    ('P', 'VRC Tequila Cocktail', '2.99', '', '1.75 liter', 'pdf2', '2', '2', ''),
    ('P', 'Cabo Wabo Blanco Especial Coconut', '12.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Sutter Home White Zinfandel', '9.99', '', '1.5 liter', 'pdf2', '2', '2', ''),
    ('P', 'Sauza Hornitos Tequila, Jack Daniels or Buchanans', '15.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Coors Light Variety Pack, Bucs Hard Lemon/Hard Seltzer', '12.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Bud Light, Bud Ice or Busch Natural Light', '12.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Seagrams Tequila Sunrise or Irish Whiskey or Grey Goose Vodka', '19.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Espolon Tequila Blanco/Reposado', '39.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Dulce Vida Tequila Blanco/Reposado', '21.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Don Julio Tequila Reposado Anejo', '49.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Gran Centenario Plata Reposado', '52.99', '', '', 'pdf2', '2', '2', ''),
    ('P', "Tequila Cacho Azul Reposado, Buchanan's Red Seal or Remy Martin VSOP", '139.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Close Azul Tequila Anejo, Don Julio 1942 Tequila Anejo', '149.99', '', '', 'pdf2', '2', '2', ''),
    
    ('C', 'Buy Any 2 Save $6 Mix & Match', '', '', '', '', '', '', ''),
    ('P', 'Cazador Mezcal Joven Silver Rum', '9.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Svedka Vodka', '15.88', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Crown Royal Canadian Whisky', '16.99', '', '750ml', 'pdf2', '2', '2', ''),
    ('P', 'Johnnie Walker Black Label', '24.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Don Julio Blanco', '39.99', '', '750ml', 'pdf2', '2', '2', ''),
    
    # PAGE 3 - INTERIOR RIGHT
    ('C', 'Fresh Cut Meats/Carnes Frescas - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Beef Meat', '11.98', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Beef S Recipes Rib Roast 1st Cut', '4.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Beef Meat Top Sirloin', '6.59', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Pork Honey Comb or Tenders', '4.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Boneless Pork Loin', '3.79', 'lb.', 'Sin Hueso o Centro', 'pdf2', '2', '2', ''),
    ('P', 'Pork Cut-Up or Bread Ribs', '4.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Pork Riblets or Bread Ribs', '4.69', 'lb.', 'Costillas', 'pdf2', '2', '2', ''),
    ('P', 'Chicken Breast', '2.99', 'lb.', 'Pechuga de Pollo', 'pdf2', '2', '2', ''),
    ('P', 'Chicken Drumsticks', '0.99', 'lb.', 'Piernas Cosas', 'pdf2', '2', '2', ''),
    ('P', 'Turkey, Drums, or Necks', '2.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Tyson Chicken Good Roosters', '2.79', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Farmer John Sausage Ham Portion', '2.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Spiral Sliced Bone-In Hams', '3.79', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Foster Farms Whole Turkey', '2.19', 'lb.', '', 'pdf2', '2', '2', ''),
    
    ('C', 'Fresh Seafood - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Raw Peeled Large Shrimp', '5.49', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Whole Catfish', '3.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Whole Clean Red Tilapia', '2.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Imitation Crab Meat', '2.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Norwegian Salmon', '10.99', 'lb.', '', 'pdf2', '2', '2', ''),
    
    ('C', 'Convenience - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Los Altos Fresh Cheese', '4.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'El Mexicano Queso Menonita', '5.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'El Mexicano Queso Ranchero', '6.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Black Label Queso Fundido Cheese', '5.49', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Crema Menonita Americana', '2.69', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Rizo Meat Co.', '1.49', 'lb.', '16 oz', 'pdf2', '2', '2', ''),
    ('P', 'Rizo Mexican Chorizo', '3.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Moronga', '0.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Fud Sliced Ham', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Jumbo Foster Farms Turkey Ham', '5.99', 'lb.', '', 'pdf2', '2', '2', ''),
    
    ('C', 'Service Deli/Cremeria - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Jemnie O Ground Turkey', '12.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Kunzler Roasted Pork Racks, Bar Meatloaves or Bratwurst', '2.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Salt Pork', '8.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', "Boar's Head Bologna Corn Dogs", '7.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Hotties Party Pack', '27.99', '', '56 oz', 'pdf2', '2', '2', ''),
    ('P', 'Aurelia Party Melo', '29.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Chef Merito Seasoning, Beef & Chicken', '4.99', '', '', 'pdf2', '2', '2', ''),
    
    ('C', 'Hot Foods/Comidas Calientes - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Holiday Turkey Dinner', '89.99', '', '12-14 lbs', 'pdf2', '3', '2', ''),
    ('P', 'Holiday Turkey', '79.99', '', '17 lbs or Large Turkey', 'pdf2', '3', '2', ''),
    ('P', 'Turkey Carnitas', '7.99', '', '', 'pdf2', '2', '2', ''),
    ('P', '12 Piece Fried Chicken', '14.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Pork Ribs', '8.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Hot Wings', '10.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Potato Wedges', '4.49', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Salsas', '4.99', '', '32 oz', 'pdf2', '2', '2', ''),
    ('P', 'Rice & Beans Tray', '24.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Chicharron Botanero', '10.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Torta Gigante', '10.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Daily Special - Monday Fried Chicken', '1', '', '', 'pdf2', '1', '1', ''),
    ('P', 'Daily Special - Tuesday Quesadilla/Tacos de Papa', '1', '', '', 'pdf2', '1', '1', ''),
    ('P', 'Daily Special - Wednesday Caldo Chile Mexico Combo', '6.99', '', '', 'pdf2', '1', '1', ''),
    ('P', 'Daily Special - Thursday Birrito Con Arroz Combo', '6.99', '', '', 'pdf2', '1', '1', ''),
    ('P', 'Daily Special - Friday Fried Tilapia', '23.99', '', '', 'pdf2', '1', '1', ''),
    ('P', 'Daily Special - Saturday/Sunday Pork Ribs, Barbacoa, Menudo or Pozole', '6.99', '', '', 'pdf2', '1', '1', ''),
    
    ('C', "Juanita's Products", '', '', '', '', '', '', ''),
    ('P', "Juanita's Menudo", '3.99', '', '16 oz', 'pdf2', '1', '1', ''),
    ('P', "Juanita's Hominy", '10.99', '', '', 'pdf2', '1', '1', ''),
    ('P', "Juanita's Pozole", '5.99', '', '', 'pdf2', '1', '1', ''),
    ('P', "Juanita's Refried Beans", '7.99', '', '', 'pdf2', '1', '1', ''),
    
    # PAGE 4 - BACK
    ('C', 'Coca-Cola Products Feature', '', '', '', '', '', '', ''),
    ('P', 'Powerade Sport Drinks', '0.99', '', 'Selected Varieties, 8 Pack/20 oz', 'pdf2', '2', '2', ''),
    ('P', 'Vitamin Water', '3', '', '20 oz, 3 for $3', 'pdf2', '2', '2', '3'),
    ('P', 'Glaceau Smart Water', '4', '', '1 liter, 2 for $4', 'pdf2', '2', '2', '2'),
    ('P', 'Dasani Drinking Water', '4.99', '', '24 Pack', 'pdf2', '2', '2', ''),
    ('P', 'Fanta, Minute Maid, Soft Drinks', '5', '', 'Selected Varieties, 12 Pack/12 oz, 3 for $5', 'pdf2', '2', '2', '3'),
    ('P', 'Powerade Sport Drinks 8-Pack', '5.99', '', '8 Pack/20 oz', 'pdf2', '2', '2', ''),
    ('P', 'Coca Cola Soft Drinks, Mini', '6.49', '', '10 Pack/7.5 oz', 'pdf2', '2', '2', ''),
    ('P', 'Topo Chico Mineral Water', '12.99', '', 'Selected Varieties, 12 Pack/12 oz', 'pdf2', '2', '2', ''),
    
    ('C', 'We Guarantee Our Freshness! - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Large Avocado', '5', '', '4 for $5', 'pdf2', '2', '2', '4'),
    ('P', 'Granny Smith or Autumn Glory Apples', '0.99', 'lb.', 'Manzanas', 'pdf2', '2', '2', ''),
    ('P', 'Large Mangoes', '0.99', 'lb.', 'Mango Grande', 'pdf2', '2', '2', ''),
    ('P', 'Guava or Topocote Clamshell', '2.99', '', '16 oz', 'pdf2', '2', '2', ''),
    ('P', 'Pomegranate', '5', '', 'Granadas, 2 for $5', 'pdf2', '2', '2', '2'),
    ('P', 'Peeled Sugar Cane', '5', '', '16 oz, 2 for $5', 'pdf2', '2', '2', '2'),
    ('P', 'Ocean Spray Cranberries', '2.49', '', '12 oz', 'pdf2', '2', '2', ''),
    ('P', 'Celery', '0.99', '', 'Apio', 'pdf2', '2', '2', ''),
    ('P', 'Sweet, Russet or Medium Yams', '0.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Collard, Mustard or Turnip Greens', '5', '', '4 for $5', 'pdf2', '2', '2', '4'),
    ('P', 'Piloncillo', '2.19', '', '4 Pack', 'pdf2', '2', '2', ''),
    ('P', 'White or Red Potatoes', '0.99', 'lb.', 'Papa Blanca o Roja', 'pdf2', '2', '2', ''),
    ('P', 'Carrots', '6', '', '5 lb. Bag, Zanahorias, 2 for $6', 'pdf2', '2', '2', '2'),
    ('P', 'Green Cabbage', '0.69', 'lb.', 'Repollo Verde', 'pdf2', '2', '2', ''),
    ('P', 'Peruvian Beans Bulk', '1.29', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'French Trimmed Green Beans', '6.99', '', 'Selected Varieties', 'pdf2', '2', '2', ''),
    ('P', 'Fruit Cocktail in Syrup', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Fresh Cut Fruit Cocktails', '3.49', '', 'Selected Varieties', 'pdf2', '2', '2', ''),
    ('P', 'Packaged Corn', '3.99', '', '4 Count', 'pdf2', '2', '2', ''),
    
    ('C', 'Organics Guaranteed Fresh - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Organic Baby Carrots', '1.79', '', '1 lb', 'pdf2', '2', '2', ''),
    ('P', 'Tasteful Selection Potatoes', '2.79', '', 'Selected Varieties, 1.5 lb', 'pdf2', '2', '2', ''),
    ('P', 'Organic Crimson Apples', '2.99', 'lb.', '', 'pdf2', '2', '2', ''),
    ('P', 'Organic Brown Onions', '2.99', 'lb.', '', 'pdf2', '2', '2', ''),
    
    ('C', 'Tamaliza - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Superior Totopo Preparada', '1.99', '', '16 oz', 'pdf2', '2', '2', ''),
    ('P', 'Corn Husk Leaves', '6.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Banana Leaves', '1.29', '', 'Hojas de Platano', 'pdf2', '2', '2', ''),
    ('P', 'Cilantro, Mild Peppers or Jalapeno', '1.49', '', 'Mexico or Jalapeno', 'pdf2', '2', '2', ''),
    
    ('C', 'Fresh Bakery/Nuestra Panaderia - Week 2', '', '', '', '', '', '', ''),
    ('P', 'Superior Chips', '5.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Superior Totilada Artisan or Casera', '5.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Thanksgiving Cupcakes', '8.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Pie Elote', '6.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Pan de Leche', '2.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Bread Baskets', '6.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Ranch Rolls', '3.99', '', '24 Count', 'pdf2', '2', '2', ''),
    ('P', 'Apple or Pumpkin Pie', '4.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Fruit Tart', '19.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Chocoflan with Fresh Fruit', '15.99', '', '', 'pdf2', '2', '2', ''),
    ('P', 'Snowberry Cake', '22.99', '', '', 'pdf2', '2', '2', ''),
]

def generate_csv():
    """Generate CSV from product data"""
    output_file = '/Users/billklingensmith/Desktop/superior-stuff/superior-spreadsheet-circular-extract.csv'
    
    fieldnames = [
        'id', 'parent_Id', 'length_not_required', 'height_not_required',
        'media_size_not_required', 'card_style_not_required', 'PDF', 'icons',
        'Image (UPC/Key Word/File Name)', 'upc', 'Title (if different from UPC standard)',
        'description only', 'dates', 'Description (not required)', 'Quantity (not required)',
        'Price', 'Units (not required)', 'coupon_amount_off', 'coupon_quantity',
        'coupon_limit', 'Link (not required)', 'Category (not required)', 'End Date',
        'Video URL', 'source_file_name'
    ]
    
    rows = []
    current_id = 1000
    current_category = ''
    category_counts = {}
    pdf1_count = 0
    pdf2_count = 0
    
    for item in PRODUCTS:
        if item[0] == 'C':  # Category
            category_name = item[1]
            current_category = category_name
            category_counts[category_name] = 0
            
            row = {
                'id': current_id,
                'parent_Id': '',
                'length_not_required': '3',
                'height_not_required': '2',
                'media_size_not_required': 'full',
                'card_style_not_required': '',
                'PDF': '',
                'icons': '',
                'Image (UPC/Key Word/File Name)': '',
                'upc': '',
                'Title (if different from UPC standard)': category_name,
                'description only': '',
                'dates': '',
                'Description (not required)': '',
                'Quantity (not required)': '',
                'Price': '',
                'Units (not required)': '',
                'coupon_amount_off': '',
                'coupon_quantity': '',
                'coupon_limit': '',
                'Link (not required)': '',
                'Category (not required)': category_name,
                'End Date': '',
                'Video URL': '',
                'source_file_name': ''
            }
            rows.append(row)
            current_id += 1
            
        else:  # Product
            _, title, price, units, description, dates_ref, length, height, quantity = item
            
            # Get appropriate dates
            dates = DATES_PDF1 if dates_ref == 'pdf1' else DATES_PDF2
            
            # Build full description
            full_desc = description
            if dates:
                full_desc = f"{description} | {dates}" if description else dates
            
            row = {
                'id': current_id,
                'parent_Id': '',
                'length_not_required': length,
                'height_not_required': height,
                'media_size_not_required': 'full',
                'card_style_not_required': 'default',
                'PDF': '',
                'icons': '',
                'Image (UPC/Key Word/File Name)': '',
                'upc': '',
                'Title (if different from UPC standard)': title,
                'description only': description,
                'dates': dates,
                'Description (not required)': full_desc,
                'Quantity (not required)': quantity,
                'Price': price,
                'Units (not required)': units,
                'coupon_amount_off': '',
                'coupon_quantity': '',
                'coupon_limit': '',
                'Link (not required)': '',
                'Category (not required)': current_category,
                'End Date': '',
                'Video URL': '',
                'source_file_name': ''
            }
            rows.append(row)
            current_id += 1
            
            # Count products
            category_counts[current_category] += 1
            if dates_ref == 'pdf1':
                pdf1_count += 1
            else:
                pdf2_count += 1
    
    # Write CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    # Print summary
    print(f"\n{'='*70}")
    print(f"CSV GENERATION COMPLETE")
    print(f"{'='*70}\n")
    
    print(f"Output file: {output_file}")
    print(f"Total rows written: {len(rows)}")
    print(f"\nProduct Breakdown:")
    print(f"  PDF 1 (Nov 12-18, 2024): {pdf1_count} products")
    print(f"  PDF 2 (Nov 19-25, 2024): {pdf2_count} products")
    print(f"  Total Products: {pdf1_count + pdf2_count}")
    print(f"  Total Categories: {len(category_counts)}")
    
    print(f"\n{'='*70}")
    print("PRODUCT COUNTS BY CATEGORY:")
    print(f"{'='*70}\n")
    
    current_pdf = None
    for category, count in category_counts.items():
        # Detect PDF change
        if 'Week 2' in category and current_pdf != 'PDF 2':
            print(f"\n--- PDF 2 (Nov 19-25, 2024) ---")
            current_pdf = 'PDF 2'
        elif 'Week 2' not in category and current_pdf is None:
            print(f"--- PDF 1 (Nov 12-18, 2024) ---")
            current_pdf = 'PDF 1'
        
        print(f"  {category}: {count} products")
    
    print(f"\n{'='*70}\n")
    return len(rows)

if __name__ == '__main__':
    total_rows = generate_csv()
    print(f"✓ Successfully generated CSV with {total_rows} total rows")
