export const navSections = [

    {
        items: [
            {
                route: { name: 'dashboard' },
                title: 'Products',
                icon: 'envelope'
            },
            {
                route: { name: 'dashboard' },
                title: 'Stock',
                icon: 'envelope'
            },
        ]
    },
    {
    title: 'PROPERTIES',
    items: [
        {
            title: 'Properties',
            icon: 'envelope',
            subItemsKey: 'properties',
            "subItems": [
                {
                    route: { name: 'dashboard' },
                    title: 'Properties',
                },
                                    {
                    route: { name: 'dashboard' },
                    title: 'Properties values'
                },
                ]
            },
        ]
    },

];
