import { test, expect } from "playwright-test-coverage"

test('purchase with login', async ({ page }) => {
  await setUpServiceMock(page)

  await page.goto('/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('login then logout', async ({ page }) => {
  await setUpServiceMock(page)

  await page.goto('/');

  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();

  // Go To Account Page

  await page.getByRole('link', { name: 'KC' }).click();
  await page.waitForURL('http://localhost:5173/diner-dashboard')
  await expect(page.getByRole('main')).toContainText('Kai Chen');
  await expect(page.getByRole('main')).toContainText('d@jwt.com');


  // Log Out
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.waitForURL('http://localhost:5173/');

  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
});

test('View About Page', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('main')).toContainText('The secret sauce');
  await expect(page.getByRole('main')).toContainText('At JWT Pizza, our employees are more than just pizza makers.');
  await page.getByRole('link', { name: 'home' }).click();
  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
})

test('View 404 Page', async ({ page }) => {
  await page.goto('/');
  await page.goto('thispagedefinitelydoesntexist');

  await expect(page.getByRole('heading')).toContainText('Oops');
  await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor. Please try another page.');
})

test('Register New User', async ({ page }) => {
  await setUpServiceMock(page)

  await page.goto('/');

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Full name').click();
  await page.getByPlaceholder('Full name').fill('Berry McCringle');
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('berry@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
  await expect(page.getByLabel('Global')).toContainText('BM');
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
})

test('Check Out Docs and History pages', async ({ page }) => {
  await setUpServiceMock(page)

  await page.goto('/docs/factory')
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');

  await page.goto('/history')
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
  await expect(page.getByRole('main')).toContainText('However, it was the Romans who truly popularized pizza');
})

test('admin functionality', async ({ page }) => {
  await setUpServiceMock(page)

  await page.goto('/')

  // Franchise Base Page
  await page.goto('/franchise-dashboard')
  await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
  await expect(page.getByRole('main')).toContainText('Unleash Your Potential');
  await page.getByRole('link', { name: 'login', exact: true }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();

  // Admin Page First Visit
  await expect(page.locator('#navbar-dark')).toContainText('Admin');
  await page.goto('/admin-dashboard');
  await page.waitForTimeout(500);
  await page.reload();

  await expect(page.getByRole('heading')).toContainText('Mama Ricci\'s kitchen');
  await expect(page.getByRole('main')).toContainText('Keep the dough rolling and the franchises signing up.');

  // Close a Store
  await expect(page.getByRole('table')).toContainText('Close');
  await page.getByRole('row', { name: 'Spanish Fork 100 ₿ Close' }).getByRole('button').click();
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the PizzaCorp store Spanish Fork ?');
  await page.getByRole('button', { name: 'Close' }).click();

  // Close a Franchise
  await page.goto('/admin-dashboard');
  await page.getByRole('row', { name: 'PizzaCorp Close' }).getByRole('button').click();
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the PizzaCorp franchise?');
  await page.getByRole('button', { name: 'Close' }).click();
});


// -------------------- Helper Functions --------------------

async function setUpServiceMock(page) {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi', totalRevenue: 100 },
          { id: 5, name: 'Springville', totalRevenue: 100 },
          { id: 6, name: 'American Fork', totalRevenue: 100 },
        ],
        admins: []
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork', totalRevenue: 100 }], admins: [] },
      // { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('/.*\/api\/franchise\/(.+)/', async (route) => {
    const userFranchiseRes = [{ id: 2, name: 'pizzaPocket', admins: [{ id: 4, name: 'pizza franchisee', email: 'f@jwt.com' }], stores: [{ id: 4, name: 'SLC', totalRevenue: 0 }] }]
    const userId = route.request().url().split('/').pop();

    userFranchiseRes[0].id = userId;
    await route.fulfill({ json: userFranchiseRes });
  })

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };

    const logoutRes = { message: 'logout successful' };

    const registerRes = {
      user: {
        name: "Berry McCringle",
        email: "berry@jwt.com",
        roles: [
          {
            role: "diner"
          }
        ],
        id: 308
      },
      token: "fedcba"
    };

    const requestType = route.request().method();
    if (requestType === 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else if (requestType === 'DELETE') {
      await route.fulfill({ json: logoutRes })
    } else if (requestType === 'POST') {
      await route.fulfill({ json: registerRes })
    }
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    const allOrdersRes = {
      dinerId: 4,
      orders: [
        {
          id: 1,
          franchiseId: 1,
          storeId: 1,
          date: '2024-06-05T05:14:40.000Z',
          items: [
            {
              id: 1,
              menuId: 1,
              description: 'Veggie',
              price: 0.05
            }
          ]
        },
        {
          items: [
            { menuId: 1, description: 'Veggie', price: 0.0038 },
            { menuId: 2, description: 'Pepperoni', price: 0.0042 },
          ],
          storeId: '4',
          franchiseId: 2,
          date: '2024-06-05T0:14:40.000Z',
          id: 23,
        },
      ],
      page: 1
    }

    if (route.request().method() === 'POST') {
      expect(route.request().postDataJSON()).toMatchObject(orderReq);
      await route.fulfill({ json: orderRes });
    } else if (route.request().method() === 'GET') {
      expect(await route.request().headerValue('Authorization')).toEqual('Bearer abcdef')
      await route.fulfill({ json: allOrdersRes });
    }
  });


  await page.route('https://pizza-factory.cs329.click/api/docs', async ( route ) => {
    const docsRes = {
      message: "welcome to JWT Pizza Factory",
      version: "20240518.154317",
      endpoints: [
        {
          method: "POST",
          path: "/api/order",
          requiresAuth: true,
          description: "Create a JWT pizza WITH EXTRA PIZZAZZ",
          example: "curl -X POST $host/api/order -H 'authorization: Bearer xyz' -d '{\"diner\":{\"id\":719,\"name\":\"j\",\"email\":\"j@jwt.com\"},\"order\":{\"items\":[{\"menuId\":1,\"description\":\"Veggie\",\"price\":0.0038}],\"storeId\":\"5\",\"franchiseId\":4,\"id\":278}}' -H 'Content-Type: application/json'",
          response: {
            jwt: "JWT here"
          }
        },
        {
          method: "POST",
          path: "/api/order/verify",
          requiresAuth: true,
          description: "Verifies a pizza order",
          example: "curl -X POST $host/api/order/verify -d '{\"jwt\":\"JWT here\"}' -H 'Content-Type: application/json'",
          response: {
            message: "valid",
            payload: {
              vendor: {
                id: "student-netid",
                name: "Student Name",
                created: "2024-06-01T00:00:00Z",
                validUntil: "2025-12-31T23:59:59Z"
              },
              diner: {
                name: "joe"
              },
              order: {
                pizzas: [
                  "pep",
                  "cheese"
                ]
              }
            }
          }
        },
        {
          method: "GET",
          path: "/.well-known/jwks.json",
          requiresAuth: false,
          description: "Get the JSON Web Key Set (JWKS) for independent JWT verification",
          example: "curl -X POST $host/.well-known/jwks.json",
          response: {
            keys: [
              {
                kty: "RSA",
                kid: "KID here",
                n: "Key value here",
                e: "AQAB"
              }
            ]
          }
        },
        {
          method: "POST",
          path: "/api/vendor",
          requiresAuth: true,
          description: "Add a new vendor",
          example: "curl -X POST $host/api/admin/vendor -H 'authorization: Bearer abcxyz' -H 'Content-Type:application/json' -d '{\"id\":\"byustudent27\", \"name\":\"cs student\"}'",
          response: {
            apiKey: "abcxyz",
            vendor: {
              id: "byustudent27",
              name: "cs student",
              created: "2024-06-14T16:43:23.754Z",
              validUntil: "2024-12-14T16:43:23.754Z"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/vendor/:vendorToken",
          requiresAuth: true,
          description: "Updates a vendor. Only supply the changed fields. Use null to remove a field.",
          example: "curl -X POST $host/api/admin/vendor/111111 -H 'authorization: Bearer abcxyz' -H 'Content-Type:application/json' -d '{\"chaos\":{\"type\":\"throttle\"}}'",
          response: {
            vendor: {
              id: "byustudent27",
              name: "cs student",
              website: "pizza.byucsstudent.click",
              chaos: "fail"
            }
          }
        },
        {
          method: "GET",
          path: "/api/support/:vendorToken/report/:fixCode",
          requiresAuth: false,
          description: "Report a problem",
          example: "curl -X POST $host/api/support/abcxyz/report/123",
          response: {
            message: "ticket status"
          }
        }
      ]
    }
    await route.fulfill({ json: docsRes });
  })
}
