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
            title: 'contacts.title',
            icon: 'envelope',
            subItemsKey: 'contacts',
                subItems: [
                    {
                        route: { name: 'contacts.companies.list' },
                        title: 'contacts.companies.title'
                    },
                    {
                        route: { name: 'contacts.people.list' },
                        title: 'contacts.people.title',
                    },
                ]
            },
            {
            title: 'products.title',
            icon: 'box',
            subItemsKey: 'products',
                subItems: [
                    {
                        route: { name: 'products.products.list' },
                        title: 'products.title'
                    },
                    // {
                    //     route: { name: 'products.hsCodes.list' },
                    //     title:  'products.hsCodes.title',
                    // },
                    {
                        route: { name: 'products.eanCodes.list' },
                        title:  'products.eanCodes.title',
                    },
                ]
            },
            {
            title: 'inventory.title',
            icon: 'warehouse',
            subItemsKey: 'inventory',
                subItems: [
                    {
                        route: { name: 'inventory.inventory.list' },
                        title:  'inventory.inventory.title',
                    },
                    {
                        route: { name: 'inventory.inventoryLocations.list' },
                        title:  'inventory.inventoryLocations.title',
                    },
                    {
                        route: { name: 'inventory.shipments.list' },
                        title:  'inventory.shipments.title',
                    },
                    {
                        route: { name: 'inventory.leadTimeSettings.list' },
                        title:  'inventory.leadTimeSettings.title',
                    },
                ]
            },
            {
            title: 'sales.title',
            icon: 'cart-shopping',
            subItemsKey: 'orders',
                subItems: [
                    {
                        route: { name: 'sales.customers.list' },
                        title: 'sales.customers.title'
                    },
                    {
                        route: { name: 'sales.orders.list' },
                        title:  'sales.orders.title',
                    },
                    {
                        route: { name: 'sales.priceLists.list' },
                        title:  'sales.priceLists.title',
                    },
                ]
            },
            {
            title: 'purchasing.title',
            icon: 'receipt',
            subItemsKey: 'purchasing',
                subItems: [
                    {
                        route: { name: 'purchasing.suppliers.list' },
                        title:  'purchasing.suppliers.title',
                    },
                {
                        route: { name: 'purchasing.products.list' },
                        title:  'purchasing.products.title',
                    },
                    {
                        route: { name: 'purchasing.orders.list' },
                        title:  'purchasing.orders.title',
                    },
                ]
            },
        {
            title: 'properties.title',
            icon: 'screwdriver-wrench',
            subItemsKey: 'properties',
                subItems: [
                    {
                        route: { name: 'properties.properties.list' },
                        title:  'properties.title',
                    },
                    {
                        route: { name: 'properties.values.list' },
                        title:  'properties.values.title',
                    },
                    {
                        route: { name: 'properties.rule.list' },
                        title:  'properties.rule.title',
                    },
                ]
            },
           {
            title: 'media.title',
            icon: 'photo-film',
            route: { name: 'media.files' }
           },
        ]
    },

];
