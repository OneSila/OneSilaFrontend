export interface FormType {
  type: string;
  sku: string;
  name: string;
  forSale: boolean;
  productionTime: string;
  vatRate: {
    id: string;
  }
}

export interface RelatedProducts {
  id: string;
}

export interface SupplierProduct {
  sku: string;
  name: string;
  quantity: string;
  unit_price: string;
  supplier: {
    id: string;
  },
  unit: {
    id: string;
  },
}

export interface Price {
  amount: string;
  discountAmount: string;
  currency: {
    id: string;
  },
}
export interface AdditonalFormFields {
  price: Price;
  relatedProducts: RelatedProducts[];
  supplierProduct: SupplierProduct;
}