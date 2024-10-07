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
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    const logoutRes = { message: 'logout successful' };
    const requestType = route.request().method();
    if (requestType === 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else if (requestType === 'DELETE') {
      await route.fulfill({ json: logoutRes})
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
}
