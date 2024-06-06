export interface FormType {
  type: string;
  sku: string;
  name: string;
  forSale: boolean;
  productionTime: number | null;
  vatRate: {
    id: string | null;
  }
}

export interface RelatedProduct {
  id: string;
  name: string;
  type: string;
  active: boolean;
  quantity?: string;
}

export interface SupplierProduct {
  id?: string;
  sku: string;
  name: string;
  quantity: number | null;
  unitPrice: number | null;
  supplier: {
    id: string | null;
  },
  unit: {
    id: string | null;
  },
}

export interface Price {
  amount: number | null;
  discountAmount: number | null;
  currency: {
    id: string | null;
  },
}
export interface AdditonalFormFields {
  price: Price;
  relatedProducts: RelatedProduct[];
  supplierProduct: SupplierProduct;
}