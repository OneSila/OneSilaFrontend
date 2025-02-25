interface Route {
  name: string;
}

export interface SubItem {
  route: Route;
  title: string;
}

export interface Item {
  title: string;
  icon: string;
  subItemsKey?: string;
  route?: Route;
  subItems?: SubItem[];
}

export interface NavSection {
  items: Item[];
  title?: string;
}

export const navSections: NavSection[] = [
    {
        items: [
            {
                title: 'products.title',
                icon: 'box',
                route: { name: 'products.products.list' }
            },
            {
                title: 'products.eanCodes.title',
                icon: 'barcode', // Assuming an appropriate icon for EAN Codes
                route: { name: 'products.eanCodes.list' }
            },
            {
                title: 'sales.priceLists.title',
                icon: 'tag',
                route: { name: 'sales.priceLists.list' }
            },
            {
                title: 'media.title',
                icon: 'photo-film',
                route: { name: 'media.files' }
            },
            {
                title: 'properties.title',
                icon: 'screwdriver-wrench',
                subItemsKey: 'properties',
                subItems: [
                    {
                        route: { name: 'properties.properties.list' },
                        title: 'properties.title',
                    },
                    {
                        route: { name: 'properties.values.list' },
                        title: 'properties.values.title',
                    },
                    {
                        route: { name: 'properties.rule.list' },
                        title: 'properties.rule.title',
                    },
                ]
            },
        ]
    }
];
