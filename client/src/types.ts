export type Category = {
    id: number
    name: string
};

export type TreeCategory = {
    category: Category
};

export type Tree = {
    id: number
    name: string
    price: number
    description: string
    impact_co2: number
    impact_o2: number
    image: string
    quantity: number
    label: string
    country: string
    height: number
    growth: string
    exposition: string
    rusticity: string
    categories: TreeCategory[]
}
