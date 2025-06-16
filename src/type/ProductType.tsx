interface Variation {
    color: string;
    colorCode: string;
    colorImage: string;
    image: string;
}

export interface ProductType {
    id: string,
    category: string,
    type: string,
    name: string,
    gender: string,
    new: boolean,
    sale: boolean,
    rate: number,
    price: number,
    originPrice: number,
    brand: string,
    sold: number,
    quantity: number,
    quantityPurchase: number,
    sizes: Array<string>,
    variation: Variation[],
    thumbImage: Array<string>,
    images: Array<string>,
    description: string,
    action: string,
    slug: string,
    conditionPoints?: number;
    status?: string;
    averageRating?: number;
    isAvailable?: boolean;
    material?: string;
    shoulder?: number;
    width?: number;
    length?: number;
    arm?: number;
    form?: string;
    fault?: string;
}