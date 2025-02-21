export interface FormType {
  type: string;
  sku: string;
  name: string;
  vatRate: {
    id: string | null;
  },
}

export interface RelatedProduct {
  id: string;
  name: string;
  type: string;
  thumbnailUrl: string;
  active: boolean;
  quantity?: string;
  inspectorStatus: number;
}

export interface BaseProduct {
  id?: string;
}

export interface Price {
  rrp: number | null;
  price: number | null;
  currency: {
    id: string | null;
  },
}

export interface ProductType {
  id: string | null;
  propertyId: string | null;
}

export interface AdditonalFormFields {
  price: Price;
  relatedProducts: RelatedProduct[];
  productType: ProductType;
}