export const navSections = [

    {
        items: [
            {
                title: 'contacts.title',
                icon: 'envelope',
                subItemsKey: 'contacts',
                "subItems": [
                    {
                        route: {name: 'companies.list'},
                        title: 'contacts.companies.title'
                    },
                    {
                        route: {name: 'people.list'},
                        title: 'contacts.people.title',
                    },
                ]
            },
            {
                title: 'Orders',
                icon: 'shop',
                subItemsKey: 'orders',
                "subItems": [
                    {
                        route: {name: 'dashboard'},
                        title: 'Orders'
                    },
                    // {
                    //     route: {name: 'people.list'},
                    //     title: 'People',
                    // },
                ]
            },
        ]
    },

];
