const menuData = {
    hamburguesas: {
        title: "Hamburguesas",
        icon: "🍔",
        note: "INCLUYEN PAPAS",
        items: [
            {
                id: "Completa",
                name: "COMPLETA",
                price: 6500,
                description: "Carne, lechuga, tomate, huevo, jamón y muzza"
            },
            {
                id: "Especial",
                name: "ESPECIAL",
                price: 7000,
                description: "Carne, rúcula, salsa criolla, jamón y muzza"
            },
            {
                id: "Doble More",
                name: "DOBLE MORE",
                price: 9000,
                description: "Carne x2, panceta, cebolla caramelizada, cheddar x2, huevo, jamón y muzza",
                isNew: true
            },
            {
                id: "More Pity",
                name: "MORE PITY",
                price: 8000,
                description: "Carne, panceta, salsa de ajo, huevo, jamón y muzza"
            },
            {
                id: "Blue Burger",
                name: "BLUE BURGER",
                price: 9000,
                description: "Carne, tomate, queso azul, huevo, jamón y muzza"
            },
            {
                id: "Vegetariana",
                name: "VEGETARIANA",
                price: 7500,
                description: "Medallón de lenteja, lechuga, tomate y (muzza)"
            }
        ]
    },
    pizzas: {
        title: "Pizzas",
        icon: "🍕",
        items: [
            {
                id: "Pizza Mitad y Mitad",
                name: "PIZZA MITAD Y MITAD",
                price: 0,
                displayPrice: "Elegí sabores",
                description: "¡Combiná dos sabores en una pizza! Elegí cualquier combinación",
                isSpecial: true,
                action: "openHalfHalfModal",
                buttonText: "Armar Mi Mitad & Mitad"
            },
            {
                id: "Pizza Muzza",
                name: "MUZZA",
                price: 8000,
                description: "Queso mozzarella"
            },
            {
                id: "Napolitana",
                name: "NAPOLITANA",
                price: 9000,
                description: "Elegí una versión",
                variants: [
                    "Muzza, ajo, tomate y albahaca",
                    "Muzza, jamón, ajo y tomate"
                ]
            },
            {
                id: "Pizza Calabresa",
                name: "CALABRESA",
                price: 10000,
                description: "Elegí una versión",
                variants: [
                    "Muzza y calabresa",
                    "Muzza, calabresa y roquefort"
                ]
            },
            {
                id: "Pizza Criolla",
                name: "CRIOLLA",
                price: 9500,
                description: "Muzza y salsa criolla"
            },
            {
                id: "Pizza Rúcula",
                name: "RÚCULA",
                price: 10000,
                description: "Muzza, rúcula, tomate cherry, parmesano y jamón crudo"
            },
            {
                id: "Pizza Panceta",
                name: "PANCETA",
                price: 11000,
                description: "Muzza, panceta y roquefort • Muzza, panceta y huevo",
                isNew: true
            }
        ]
    },
    sandwiches: {
        title: "Sandwiches",
        icon: "🥪",
        note: "INCLUYEN PAPAS",
        items: [
            {
                id: "Sandwich de Mila",
                name: "SANDWICH DE MILA",
                price: 10000,
                description: "Lechuga, tomate, milanesa vacuna, huevo, jamón y queso"
            },
            {
                id: "Sandwich de Mila (Pollo)",
                name: "SANDWICH DE MILA (POLLO)",
                price: 10000,
                description: "Lechuga, tomate, milanesa de pollo, huevo, jamón y queso"
            },
            {
                id: "Lomito Completo",
                name: "LOMITO COMPLETO",
                price: 11000,
                description: "Lechuga, tomate, lomito a la plancha, huevo, jamón y queso"
            },
            {
                id: "Lomito Especial",
                name: "LOMITO ESPECIAL",
                price: 12000,
                description: "Lomito a la plancha, panceta, salsa de ajo, jamón y queso",
                isNew: true
            }
        ]
    }
};
